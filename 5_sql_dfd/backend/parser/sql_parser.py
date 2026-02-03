"""SQL Parser using sqlglot for DFD generation."""

import re
from dataclasses import dataclass, field
from typing import Optional

import sqlglot
from sqlglot import exp


@dataclass
class Column:
    """Column information."""
    name: str
    alias: Optional[str] = None
    source_table: Optional[str] = None


@dataclass
class JoinInfo:
    """JOIN information."""
    join_type: str  # LEFT, RIGHT, INNER, OUTER, CROSS, LEFT OUTER, etc.
    right_table: str
    right_table_alias: Optional[str] = None
    on_condition: str = ""


@dataclass
class CTEInfo:
    """CTE (Common Table Expression) information."""
    name: str
    source_tables: list[str] = field(default_factory=list)
    columns: list[Column] = field(default_factory=list)
    joins: list[JoinInfo] = field(default_factory=list)
    where_conditions: list[str] = field(default_factory=list)
    group_by_columns: list[str] = field(default_factory=list)
    union_sources: list[str] = field(default_factory=list)  # UNION元のテーブル/CTE名
    union_type: Optional[str] = None  # 'UNION' or 'UNION ALL'


@dataclass
class ParsedSQL:
    """Parsed SQL result."""
    ctes: list[CTEInfo] = field(default_factory=list)
    final_select: Optional[CTEInfo] = None
    source_refs: dict[str, str] = field(default_factory=dict)  # placeholder -> original ref


class SQLParser:
    """SQL Parser with Jinja2 template handling."""

    def __init__(self):
        self.ref_counter = 0
        self.source_refs: dict[str, str] = {}  # placeholder -> original ref/source

    def _replace_jinja_refs(self, sql: str) -> str:
        """Replace Jinja2 ref/source with placeholders for sqlglot parsing."""
        result = sql

        # Replace {{ ref('TABLE_NAME') }} with __REF_N__
        def replace_ref(match: re.Match) -> str:
            table_name = match.group(1)
            placeholder = f"__REF_{self.ref_counter}__"
            self.source_refs[placeholder] = table_name
            self.ref_counter += 1
            return placeholder

        result = re.sub(
            r"\{\{\s*ref\s*\(\s*['\"]([^'\"]+)['\"]\s*\)\s*\}\}",
            replace_ref,
            result
        )

        # Replace {{ source('schema', 'TABLE_NAME') }} with __REF_N__
        def replace_source(match: re.Match) -> str:
            table_name = match.group(2)
            placeholder = f"__REF_{self.ref_counter}__"
            self.source_refs[placeholder] = table_name
            self.ref_counter += 1
            return placeholder

        result = re.sub(
            r"\{\{\s*source\s*\(\s*['\"][^'\"]+['\"]\s*,\s*['\"]([^'\"]+)['\"]\s*\)\s*\}\}",
            replace_source,
            result
        )

        return result

    def _restore_table_name(self, name: str) -> tuple[str, bool]:
        """Restore original table name from placeholder.

        Returns: (table_name, is_ref)
        """
        if name.startswith("__REF_") and name.endswith("__"):
            original = self.source_refs.get(name, name)
            return original, True
        return name, False

    def _extract_columns(self, select_expr: exp.Select) -> list[Column]:
        """Extract columns from SELECT clause."""
        columns = []

        for expr in select_expr.expressions:
            if isinstance(expr, exp.Star):
                columns.append(Column(name="*"))
            elif isinstance(expr, exp.Alias):
                alias = expr.alias
                inner = expr.this
                if isinstance(inner, exp.Column):
                    columns.append(Column(
                        name=inner.name,
                        alias=alias,
                        source_table=inner.table if inner.table else None
                    ))
                else:
                    columns.append(Column(
                        name=inner.sql(),
                        alias=alias
                    ))
            elif isinstance(expr, exp.Column):
                columns.append(Column(
                    name=expr.name,
                    source_table=expr.table if expr.table else None
                ))
            else:
                columns.append(Column(name=expr.sql()))

        return columns

    def _extract_source_tables(self, select_expr: exp.Select) -> list[str]:
        """Extract source tables from FROM clause (not including JOINs)."""
        tables = []

        from_clause = select_expr.find(exp.From)
        if from_clause:
            for table_expr in from_clause.find_all(exp.Table):
                table_name, _ = self._restore_table_name(table_expr.name)
                tables.append(table_name)

        return tables

    def _extract_joins(self, select_expr: exp.Select) -> list[JoinInfo]:
        """Extract JOIN information (direct joins only, not from CTEs)."""
        joins = []

        # Use args['joins'] to get direct joins only
        join_list = select_expr.args.get('joins', []) or []

        for join in join_list:
            # Get join type
            join_type = "INNER"
            if join.side:
                join_type = join.side.upper()
            if join.kind:
                join_type = f"{join_type} {join.kind.upper()}" if join.side else join.kind.upper()

            # Get right table
            right_table = ""
            right_alias = None

            table_expr = join.find(exp.Table)
            if table_expr:
                right_table, _ = self._restore_table_name(table_expr.name)
                if table_expr.alias:
                    right_alias = table_expr.alias

            # Get ON condition using join.args
            on_condition = ""
            if "on" in join.args and join.args["on"]:
                on_condition = join.args["on"].sql()

            if right_table:
                joins.append(JoinInfo(
                    join_type=join_type.strip(),
                    right_table=right_table,
                    right_table_alias=right_alias,
                    on_condition=on_condition
                ))

        return joins

    def _extract_where_conditions(self, select_expr: exp.Select) -> list[str]:
        """Extract WHERE conditions (direct where only, not from CTEs)."""
        conditions = []

        # Use args['where'] to get direct where only
        where = select_expr.args.get('where')
        if where and where.this:
            # Split by AND
            if isinstance(where.this, exp.And):
                for condition in where.this.flatten():
                    conditions.append(condition.sql())
            else:
                conditions.append(where.this.sql())

        return conditions

    def _extract_group_by(self, select_expr: exp.Select) -> list[str]:
        """Extract GROUP BY columns (direct group by only, not from CTEs)."""
        columns = []

        # Use args['group'] to get direct group by only
        group = select_expr.args.get('group')
        if group:
            for expr in group.expressions:
                if isinstance(expr, exp.Column):
                    columns.append(expr.name)
                else:
                    columns.append(expr.sql())

        return columns

    def _parse_select(self, select_expr: exp.Select, name: str) -> CTEInfo:
        """Parse a SELECT statement into CTEInfo."""
        return CTEInfo(
            name=name,
            source_tables=self._extract_source_tables(select_expr),
            columns=self._extract_columns(select_expr),
            joins=self._extract_joins(select_expr),
            where_conditions=self._extract_where_conditions(select_expr),
            group_by_columns=self._extract_group_by(select_expr)
        )

    def _parse_union(self, union_expr: exp.Union, name: str) -> CTEInfo:
        """Parse a UNION expression into CTEInfo."""
        union_sources: list[str] = []
        columns: list[Column] = []
        union_type = "UNION ALL" if union_expr.args.get("distinct") is False else "UNION"

        # Collect all SELECT statements in the UNION
        def collect_selects(expr) -> list[exp.Select]:
            """Recursively collect all SELECT statements from UNION tree."""
            selects = []
            if isinstance(expr, exp.Union):
                # Left side
                left = expr.this
                if isinstance(left, exp.Union):
                    selects.extend(collect_selects(left))
                elif isinstance(left, exp.Select):
                    selects.append(left)
                # Right side
                right = expr.expression
                if isinstance(right, exp.Union):
                    selects.extend(collect_selects(right))
                elif isinstance(right, exp.Select):
                    selects.append(right)
            elif isinstance(expr, exp.Select):
                selects.append(expr)
            return selects

        selects = collect_selects(union_expr)

        # Extract source tables from each SELECT in the UNION
        for select in selects:
            source_tables = self._extract_source_tables(select)
            for table in source_tables:
                if table not in union_sources:
                    union_sources.append(table)

            # Get columns from first SELECT (they should all have same structure)
            if not columns:
                columns = self._extract_columns(select)

        return CTEInfo(
            name=name,
            source_tables=[],  # Empty since we use union_sources
            columns=columns,
            joins=[],
            where_conditions=[],
            group_by_columns=[],
            union_sources=union_sources,
            union_type=union_type
        )

    def parse(self, sql: str) -> ParsedSQL:
        """Parse SQL and extract structure."""
        # Reset state
        self.ref_counter = 0
        self.source_refs = {}

        # Remove dbt comments {# ... #}
        clean_sql = re.sub(r"\{#[\s\S]*?#\}", "", sql)

        # Replace Jinja2 refs with placeholders
        processed_sql = self._replace_jinja_refs(clean_sql)

        result = ParsedSQL(source_refs=self.source_refs.copy())

        try:
            # Parse SQL using sqlglot (Snowflake dialect)
            parsed = sqlglot.parse_one(processed_sql, dialect="snowflake")

            # Extract CTEs
            if parsed.find(exp.With):
                for cte in parsed.find_all(exp.CTE):
                    cte_name = cte.alias
                    if not cte_name:
                        continue

                    # Check if this CTE contains UNION
                    union_expr = cte.find(exp.Union)
                    if union_expr:
                        # This CTE is a UNION of multiple SELECTs
                        cte_info = self._parse_union(union_expr, cte_name)
                        result.ctes.append(cte_info)
                    else:
                        select_expr = cte.find(exp.Select)
                        if select_expr:
                            cte_info = self._parse_select(select_expr, cte_name)
                            result.ctes.append(cte_info)

            # Extract final SELECT (outside CTEs)
            # The main query is the direct Select under the parsed statement
            main_select = None
            if isinstance(parsed, exp.Select):
                main_select = parsed
            else:
                # Find the main SELECT that's not inside a CTE
                for select in parsed.find_all(exp.Select):
                    # Check if this select is not inside a CTE
                    parent = select.parent
                    is_in_cte = False
                    while parent:
                        if isinstance(parent, exp.CTE):
                            is_in_cte = True
                            break
                        parent = parent.parent
                    if not is_in_cte:
                        main_select = select
                        break

            if main_select:
                result.final_select = self._parse_select(main_select, "OUTPUT")

        except Exception as e:
            # If sqlglot fails, return empty result with error info
            print(f"SQL parsing error: {e}")

        return result


def parse_sql(sql: str) -> ParsedSQL:
    """Parse SQL string and return structured result."""
    parser = SQLParser()
    return parser.parse(sql)
