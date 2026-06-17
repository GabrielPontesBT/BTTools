#!/usr/bin/env python
"""Attach and read a SQL Server .mdf database from Python.

Requirements:
    - SQL Server, SQL Server Express, or SQL Server LocalDB installed
    - ODBC Driver 17 or 18 for SQL Server
    - Python dependencies:
        pip install pyodbc pandas

Examples:
    python read_sqlserver_mdf.py --mdf C:\data\MyDb.mdf --list-tables
    python read_sqlserver_mdf.py --mdf C:\data\MyDb.mdf --copy-to %USERPROFILE%\SqlMdf --list-tables
    python read_sqlserver_mdf.py --mdf C:\data\MyDb.mdf --table dbo.Customers
    python read_sqlserver_mdf.py --mdf C:\data\MyDb.mdf --query "select top 10 * from dbo.Customers"
    python read_sqlserver_mdf.py --mdf C:\data\MyDb.mdf --table dbo.Customers --csv customers.csv
    python read_sqlserver_mdf.py --mdf C:\data\MyDb.mdf --detach

If you have the log file too, pass it with --ldf. Without it, the script uses
FOR ATTACH_REBUILD_LOG, which works only when SQL Server can rebuild the log.
"""

from __future__ import annotations

import argparse
import re
import shutil
import sys
from pathlib import Path

try:
    import pandas as pd
    import pyodbc
except ImportError:
    print(
        "Missing dependencies.\nInstall them with: pip install pyodbc pandas",
        file=sys.stderr,
    )
    raise SystemExit(1)


DEFAULT_SERVER = r"(localdb)\MSSQLLocalDB"
DEFAULT_DRIVER = "ODBC Driver 17 for SQL Server"


def sql_literal(value: str) -> str:
    return "N'" + value.replace("'", "''") + "'"


def quote_identifier(name: str) -> str:
    return "[" + name.replace("]", "]]") + "]"


def quote_table_name(value: str) -> str:
    if not re.fullmatch(r"[A-Za-z0-9_.$\[\]]+", value):
        raise ValueError(
            "Unsafe table name. Use --query for complex table expressions."
        )

    parts = [part.strip("[]") for part in value.split(".")]
    return ".".join(quote_identifier(part) for part in parts)


def database_name_from_mdf(mdf: Path, requested_name: str | None) -> str:
    if requested_name:
        return requested_name

    cleaned = re.sub(r"[^A-Za-z0-9_]+", "_", mdf.stem).strip("_")
    return cleaned or "AttachedMdf"


def copy_database_files(mdf: Path, ldf: Path | None, copy_to: Path) -> tuple[Path, Path | None]:
    copy_to.mkdir(parents=True, exist_ok=True)

    copied_mdf = copy_to / mdf.name
    shutil.copy2(mdf, copied_mdf)

    copied_ldf = None
    if ldf:
        copied_ldf = copy_to / ldf.name
        shutil.copy2(ldf, copied_ldf)

    return copied_mdf.resolve(), copied_ldf.resolve() if copied_ldf else None


def master_connection(args: argparse.Namespace):
    connection_string = (
        f"DRIVER={{{args.driver}}};"
        f"SERVER={args.server};"
        "DATABASE=master;"
        "Trusted_Connection=yes;"
        "TrustServerCertificate=yes;"
    )
    connection = pyodbc.connect(connection_string, autocommit=True)
    return connection


def database_connection(args: argparse.Namespace, database_name: str):
    connection_string = (
        f"DRIVER={{{args.driver}}};"
        f"SERVER={args.server};"
        f"DATABASE={database_name};"
        "Trusted_Connection=yes;"
        "TrustServerCertificate=yes;"
    )
    return pyodbc.connect(connection_string)


def database_exists(connection, database_name: str) -> bool:
    row = connection.cursor().execute(
        "SELECT DB_ID(?)",
        database_name,
    ).fetchone()
    return row is not None and row[0] is not None


def attach_database(connection, database_name: str, mdf: Path, ldf: Path | None) -> None:
    db = quote_identifier(database_name)
    mdf_part = f"(FILENAME = {sql_literal(str(mdf))})"

    if ldf:
        ldf_part = f"(FILENAME = {sql_literal(str(ldf))})"
        sql = f"CREATE DATABASE {db} ON {mdf_part}, {ldf_part} FOR ATTACH"
    else:
        sql = f"CREATE DATABASE {db} ON {mdf_part} FOR ATTACH_REBUILD_LOG"

    connection.cursor().execute(sql)


def detach_database(connection, database_name: str) -> None:
    db_literal = database_name.replace("'", "''")
    connection.cursor().execute(
        f"ALTER DATABASE {quote_identifier(database_name)} SET SINGLE_USER WITH ROLLBACK IMMEDIATE"
    )
    connection.cursor().execute(f"EXEC sp_detach_db @dbname = N'{db_literal}'")


def list_tables(connection) -> pd.DataFrame:
    sql = """
        SELECT TABLE_SCHEMA AS [schema], TABLE_NAME AS [table]
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_TYPE = 'BASE TABLE'
        ORDER BY TABLE_SCHEMA, TABLE_NAME
    """
    return pd.read_sql(sql, connection)


def run_query(connection, args: argparse.Namespace) -> pd.DataFrame:
    if args.query:
        return pd.read_sql(args.query, connection)

    table = quote_table_name(args.table)
    return pd.read_sql(f"SELECT TOP ({args.rows}) * FROM {table}", connection)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Read a SQL Server MDF file.")
    parser.add_argument("--mdf", required=True, type=Path, help="Path to the .mdf file")
    parser.add_argument("--ldf", type=Path, help="Optional path to the .ldf log file")
    parser.add_argument(
        "--copy-to",
        type=Path,
        help=(
            "Copy MDF/LDF to this folder before attaching. Useful when SQL Server "
            "gets OS error 5 / access denied on the original path."
        ),
    )
    parser.add_argument("--name", help="Database name to use after attaching")
    parser.add_argument("--server", default=DEFAULT_SERVER, help=f"Default: {DEFAULT_SERVER}")
    parser.add_argument("--driver", default=DEFAULT_DRIVER, help=f"Default: {DEFAULT_DRIVER}")
    parser.add_argument("--list-tables", action="store_true", help="List tables and exit")
    parser.add_argument("--table", help="Table to preview, for example dbo.Users")
    parser.add_argument("--query", help="SQL query to run")
    parser.add_argument("--rows", type=int, default=100, help="Rows for --table preview")
    parser.add_argument("--csv", type=Path, help="Write query/table result to CSV")
    parser.add_argument("--detach", action="store_true", help="Detach database before exiting")
    return parser


def main() -> int:
    args = build_parser().parse_args()
    mdf = args.mdf.resolve()
    ldf = args.ldf.resolve() if args.ldf else None
    database_name = database_name_from_mdf(mdf, args.name)

    if not mdf.exists():
        print(f"MDF not found: {mdf}", file=sys.stderr)
        return 2

    if ldf and not ldf.exists():
        print(f"LDF not found: {ldf}", file=sys.stderr)
        return 2

    if args.copy_to:
        try:
            mdf, ldf = copy_database_files(mdf, ldf, args.copy_to.resolve())
            print(f"Copied MDF to: {mdf}")
            if ldf:
                print(f"Copied LDF to: {ldf}")
        except OSError as exc:
            print(f"Could not copy database files: {exc}", file=sys.stderr)
            return 1

    try:
        master = master_connection(args)
        if not database_exists(master, database_name):
            attach_database(master, database_name, mdf, ldf)
            print(f"Attached database: {database_name}")
        else:
            print(f"Using already attached database: {database_name}")

        with database_connection(args, database_name) as db:
            if args.list_tables:
                result = list_tables(db)
            elif args.query or args.table:
                result = run_query(db, args)
            else:
                print("Nothing to read. Use --list-tables, --table, or --query.")
                return 0

            if args.csv:
                result.to_csv(args.csv, index=False)
                print(f"CSV written: {args.csv}")
            else:
                print(result.to_string(index=False))

        if args.detach:
            detach_database(master, database_name)
            print(f"Detached database: {database_name}")

    except pyodbc.Error as exc:
        print("SQL Server error:", file=sys.stderr)
        print(exc, file=sys.stderr)
        print(
            "\nCheck that SQL Server/LocalDB is installed, the ODBC driver exists, "
            "and your Windows user has permission to read the MDF file.",
            file=sys.stderr,
        )
        if "Operating system error 5" in str(exc) or "Acceso denegado" in str(exc):
            print(
                "\nThis is a Windows file-permission problem. Try copying the MDF "
                "to a user-owned folder first, for example:\n"
                r"  python read_sqlserver_mdf.py --mdf C:\Models\BTV4CoreMarzo2026\GX_KB_BTV4CoreMarzo2026.mdf "
                r"--copy-to %USERPROFILE%\SqlMdf --list-tables",
                file=sys.stderr,
            )
        return 1
    except ValueError as exc:
        print(str(exc), file=sys.stderr)
        return 2

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
