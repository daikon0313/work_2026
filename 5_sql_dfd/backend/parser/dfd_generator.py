"""DFD (Data Flow Diagram) generator from parsed SQL."""

import re
from dataclasses import dataclass, field

from .sql_parser import ParsedSQL, CTEInfo


@dataclass
class DFDNode:
    """DFD Node representation."""
    id: str
    type: str  # 'table' or 'logic'
    label: str
    columns: list[str] = field(default_factory=list)
    logic_type: str | None = None  # 'where', 'join', 'groupby'


@dataclass
class DFDEdge:
    """DFD Edge representation."""
    id: str
    source: str
    target: str
    label: str | None = None


@dataclass
class DFDData:
    """Complete DFD data."""
    nodes: list[DFDNode] = field(default_factory=list)
    edges: list[DFDEdge] = field(default_factory=list)


def generate_dfd(parsed: ParsedSQL, separate_logic_nodes: bool = True) -> DFDData:
    """Generate DFD from parsed SQL.

    Args:
        parsed: ParsedSQL object from sql_parser
        separate_logic_nodes: If True, create separate nodes for JOIN/WHERE/GROUP BY

    Returns:
        DFDData with nodes and edges
    """
    nodes: list[DFDNode] = []
    edges: list[DFDEdge] = []
    node_map: dict[str, str] = {}  # table name -> node id
    cte_names = {cte.name for cte in parsed.ctes}
    edge_counter = 0

    def get_edge_id() -> str:
        nonlocal edge_counter
        edge_counter += 1
        return f"edge-{edge_counter}"

    def is_source_table(name: str) -> bool:
        """Check if a table name is a source table (from ref/source)."""
        # Check if it's a CTE name
        if name in cte_names:
            return False
        # Check if it's in source_refs (was a placeholder)
        for placeholder, original in parsed.source_refs.items():
            if original == name:
                return True
        # Default to treating unknown tables as sources
        return True

    # Collect all source tables (from refs)
    source_tables = set()
    for cte in parsed.ctes:
        for table in cte.source_tables:
            if is_source_table(table):
                source_tables.add(table)
        for join in cte.joins:
            if is_source_table(join.right_table):
                source_tables.add(join.right_table)

    if parsed.final_select:
        for table in parsed.final_select.source_tables:
            if is_source_table(table):
                source_tables.add(table)
        for join in parsed.final_select.joins:
            if is_source_table(join.right_table):
                source_tables.add(join.right_table)

    # Create source table nodes
    for source_table in sorted(source_tables):
        node_id = f"source-{source_table}"
        node_map[source_table] = node_id
        nodes.append(DFDNode(
            id=node_id,
            type="table",
            label=source_table,
            columns=["(source)"]
        ))

    def create_cte_nodes(cte: CTEInfo, is_output: bool = False) -> str:
        """Create nodes for a CTE and return the final node ID."""
        base_id = "output" if is_output else f"cte-{cte.name}"
        current_node_id = base_id

        # Column names
        column_names = [
            col.alias or col.name for col in cte.columns
            if col.name != "*"
        ][:10]

        if not column_names and any(col.name == "*" for col in cte.columns):
            column_names = ["*"]

        if separate_logic_nodes:
            # Create separate logic nodes
            source_node_id: str | None = None

            # Check if this is a UNION CTE
            if cte.union_sources:
                # Create UNION node
                union_node_id = f"{base_id}-union"
                union_label = cte.union_type or "UNION"
                nodes.append(DFDNode(
                    id=union_node_id,
                    type="logic",
                    label=union_label,
                    logic_type="union"
                ))

                # Create edges from all union sources to UNION node
                for union_source in cte.union_sources:
                    if union_source in node_map:
                        edges.append(DFDEdge(
                            id=get_edge_id(),
                            source=node_map[union_source],
                            target=union_node_id
                        ))
                    elif union_source in cte_names:
                        edges.append(DFDEdge(
                            id=get_edge_id(),
                            source=f"cte-{union_source}",
                            target=union_node_id
                        ))

                source_node_id = union_node_id
            else:
                # Find source table connection
                for source_table in cte.source_tables:
                    if source_table in node_map:
                        source_node_id = node_map[source_table]
                    elif source_table in cte_names:
                        source_node_id = f"cte-{source_table}"

            # WHERE node
            if cte.where_conditions:
                where_node_id = f"{base_id}-where"
                # Each condition on a new line, no truncation
                where_label = "\n".join(cte.where_conditions)
                nodes.append(DFDNode(
                    id=where_node_id,
                    type="logic",
                    label=where_label,
                    logic_type="where"
                ))
                # Edge from source to WHERE
                if source_node_id:
                    edges.append(DFDEdge(
                        id=get_edge_id(),
                        source=source_node_id,
                        target=where_node_id
                    ))
                source_node_id = where_node_id

            # JOIN nodes
            for i, join in enumerate(cte.joins):
                join_node_id = f"{base_id}-join-{i}"
                # Include ON condition in the label, split by AND
                join_label = f"{join.join_type} JOIN"
                if join.on_condition:
                    # Split ON condition by AND and put each on a new line
                    conditions = re.split(r'\s+AND\s+', join.on_condition, flags=re.IGNORECASE)
                    for cond in conditions:
                        join_label += f"\n{cond.strip()}"
                nodes.append(DFDNode(
                    id=join_node_id,
                    type="logic",
                    label=join_label,
                    logic_type="join"
                ))

                # Edge from current to JOIN
                if source_node_id:
                    edges.append(DFDEdge(
                        id=get_edge_id(),
                        source=source_node_id,
                        target=join_node_id
                    ))

                # Edge from right table to JOIN (no label, condition is in the node)
                right_table = join.right_table
                if right_table in node_map:
                    edges.append(DFDEdge(
                        id=get_edge_id(),
                        source=node_map[right_table],
                        target=join_node_id
                    ))
                elif right_table in cte_names:
                    edges.append(DFDEdge(
                        id=get_edge_id(),
                        source=f"cte-{right_table}",
                        target=join_node_id
                    ))

                source_node_id = join_node_id

            # GROUP BY node
            if cte.group_by_columns:
                groupby_node_id = f"{base_id}-groupby"
                groupby_label = "GROUP BY " + ", ".join(cte.group_by_columns[:3])
                nodes.append(DFDNode(
                    id=groupby_node_id,
                    type="logic",
                    label=groupby_label,
                    logic_type="groupby"
                ))
                if source_node_id:
                    edges.append(DFDEdge(
                        id=get_edge_id(),
                        source=source_node_id,
                        target=groupby_node_id
                    ))
                source_node_id = groupby_node_id

            # Main CTE/Output node
            nodes.append(DFDNode(
                id=base_id,
                type="table",
                label="OUTPUT" if is_output else cte.name,
                columns=column_names
            ))
            node_map[cte.name] = base_id

            # Edge from last logic node to CTE
            if source_node_id and source_node_id != base_id:
                edges.append(DFDEdge(
                    id=get_edge_id(),
                    source=source_node_id,
                    target=base_id
                ))
            elif not cte.where_conditions and not cte.joins and not cte.group_by_columns and not cte.union_sources:
                # Direct connection from source tables
                for source_table in cte.source_tables:
                    src_id = node_map.get(source_table) or f"cte-{source_table}"
                    edges.append(DFDEdge(
                        id=get_edge_id(),
                        source=src_id,
                        target=base_id
                    ))

        else:
            # Original mode: everything in one node
            display_columns = list(column_names)

            if cte.where_conditions:
                display_columns.append("--- WHERE ---")
                for cond in cte.where_conditions[:5]:
                    display_columns.append(cond[:40])

            if cte.joins:
                display_columns.append("--- JOIN ---")
                for join in cte.joins:
                    display_columns.append(f"{join.join_type} {join.right_table}")
                    if join.on_condition:
                        display_columns.append(f"ON {join.on_condition[:30]}")

            if cte.group_by_columns:
                display_columns.append("--- GROUP BY ---")
                display_columns.append(", ".join(cte.group_by_columns[:5]))

            nodes.append(DFDNode(
                id=base_id,
                type="table",
                label="OUTPUT" if is_output else cte.name,
                columns=display_columns[:20]
            ))
            node_map[cte.name] = base_id

            # Create edges from sources
            for source_table in cte.source_tables:
                src_id = node_map.get(source_table) or f"cte-{source_table}"
                edges.append(DFDEdge(
                    id=get_edge_id(),
                    source=src_id,
                    target=base_id
                ))

            # Create edges from JOIN right tables
            for join in cte.joins:
                right_table = join.right_table
                if right_table in node_map:
                    edges.append(DFDEdge(
                        id=get_edge_id(),
                        source=node_map[right_table],
                        target=base_id,
                        label=f"{join.join_type} JOIN"
                    ))
                elif right_table in cte_names:
                    edges.append(DFDEdge(
                        id=get_edge_id(),
                        source=f"cte-{right_table}",
                        target=base_id,
                        label=f"{join.join_type} JOIN"
                    ))

        return current_node_id

    # Process CTEs in order
    for cte in parsed.ctes:
        create_cte_nodes(cte)

    # Process final SELECT
    if parsed.final_select:
        final = parsed.final_select
        # Check if final select is just referencing a CTE without additional logic
        is_simple_select = (
            len(final.source_tables) == 1 and
            final.source_tables[0] in cte_names and
            len(final.joins) == 0 and
            len(final.where_conditions) == 0 and
            len(final.group_by_columns) == 0
        )

        if is_simple_select:
            # Simple case: just create OUTPUT node connected to the CTE
            source_cte = final.source_tables[0]
            column_names = [
                col.alias or col.name for col in final.columns
                if col.name != "*"
            ][:10]
            if not column_names and any(col.name == "*" for col in final.columns):
                column_names = ["*"]

            nodes.append(DFDNode(
                id="output",
                type="table",
                label="OUTPUT",
                columns=column_names
            ))
            edges.append(DFDEdge(
                id=get_edge_id(),
                source=f"cte-{source_cte}",
                target="output"
            ))
        else:
            # Complex case: create full logic node structure
            create_cte_nodes(final, is_output=True)

    return DFDData(nodes=nodes, edges=edges)


def to_dict(dfd_data: DFDData) -> dict:
    """Convert DFDData to dictionary for JSON serialization."""
    return {
        "nodes": [
            {
                "id": node.id,
                "type": node.type,
                "label": node.label,
                "columns": node.columns,
                "logicType": node.logic_type
            }
            for node in dfd_data.nodes
        ],
        "edges": [
            {
                "id": edge.id,
                "source": edge.source,
                "target": edge.target,
                "label": edge.label
            }
            for edge in dfd_data.edges
        ]
    }
