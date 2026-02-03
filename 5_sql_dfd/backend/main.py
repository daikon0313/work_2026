"""FastAPI backend for SQL DFD generation."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from parser import parse_sql, generate_dfd
from parser.dfd_generator import to_dict

app = FastAPI(
    title="SQL DFD API",
    description="API for generating Data Flow Diagrams from dbt SQL",
    version="1.0.0"
)

# CORS設定（開発時）
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SQLRequest(BaseModel):
    """SQL parse request."""
    sql: str
    separate_logic_nodes: bool = True  # JOIN/WHERE/GROUP BYを別ノードにするか


class DFDResponse(BaseModel):
    """DFD response."""
    nodes: list[dict]
    edges: list[dict]


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "SQL DFD API", "version": "1.0.0"}


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok"}


@app.post("/api/parse", response_model=DFDResponse)
async def parse_sql_endpoint(request: SQLRequest):
    """Parse SQL and generate DFD data.

    Args:
        request: SQLRequest with SQL string and options

    Returns:
        DFDResponse with nodes and edges for the diagram
    """
    if not request.sql.strip():
        raise HTTPException(status_code=400, detail="SQL cannot be empty")

    try:
        # Parse SQL
        parsed = parse_sql(request.sql)

        # Generate DFD
        dfd_data = generate_dfd(parsed, separate_logic_nodes=request.separate_logic_nodes)

        # Convert to dict
        result = to_dict(dfd_data)

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse SQL: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
