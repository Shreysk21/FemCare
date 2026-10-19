import os
import sys
from pathlib import Path
from sqlalchemy import text, inspect
from database import engine

# Ensure console supports UTF-8 on Windows
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

print("=" * 65)
print(" FemCare Database Diagnostic Tool")
print("=" * 65)

env_path = Path(__file__).resolve().parent / ".env"
raw_db_url = os.getenv("DATABASE_URL")

if not raw_db_url or not raw_db_url.strip():
    safe_path = str(env_path).encode("ascii", errors="backslashreplace").decode("ascii")
    print("STATUS: DATABASE_URL is NOT set in:")
    print(f"        {safe_path}")
    print()
    print("-> The application has fallen back to local SQLite.")
    print("-> To connect to Supabase PostgreSQL, add this line to backend/.env:")
    print("   DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres")
    print("=" * 65)

print(f"Dialect : {engine.dialect.name}")
print(f"Host    : {engine.url.host or 'Local SQLite'}")
if engine.url.port:
    print(f"Port    : {engine.url.port}")
print(f"Database: {engine.url.database or 'femcare.db'}")
print("-" * 65)

try:
    with engine.connect() as connection:
        if engine.dialect.name == "postgresql":
            result = connection.execute(
                text("SELECT current_database(), current_schema(), version()")
            )
            row = result.fetchone()
            db_name, schema_name, ver = row[0], row[1], row[2]

            print("[SUCCESS] Connected to Supabase PostgreSQL!")
            print(f"Database Name : {db_name}")
            print(f"Active Schema : {schema_name}")
            print(f"PostgreSQL Ver: {ver.split(',')[0]}")
            print("-" * 65)

            inspector = inspect(engine)
            tables = inspector.get_table_names()
            print(f"Tables Found ({len(tables)}): {', '.join(tables) if tables else 'None yet'}")

            expected_tables = ["profiles", "cycles", "cycle_flow_logs", "symptom_logs", "mood_logs", "hydration_logs"]
            missing_tables = [t for t in expected_tables if t not in tables]

            if missing_tables:
                print()
                print(f"NOTE: Missing expected tables: {missing_tables}")
                print("Run 'python seed.py' or execute 'supabase/migrations/20261010_initial_schema.sql'")
                print("in your Supabase SQL Editor to populate schema and initial data.")
            else:
                print("All essential tables are present and ready!")

        elif engine.dialect.name == "sqlite":
            result = connection.execute(text("SELECT sqlite_version()"))
            print("[INFO] Connected to Local SQLite.")
            print("SQLite Version:", result.scalar())
            print()
            print("WARNING: Supabase is currently NOT being used.")
            print("If you intend to use Supabase, configure DATABASE_URL in backend/.env.")

except Exception as error:
    print("[ERROR] Database connection failed:")
    err_str = str(error)
    print(err_str)
    print("=" * 65)
    print("Troubleshooting Guidance:")
    if "password authentication failed" in err_str:
        print(" 1. Double check your Supabase database password in backend/.env.")
        print(" 2. If your password has special characters (@, #, $, %, &, !), they must be")
        print("    URL-encoded (e.g. '@' becomes '%40').")
        print("    You can reset your database password in Supabase: Project Settings -> Database.")
    elif "could not translate host name" in err_str or "nodename nor servname" in err_str:
        print(" 1. The direct hostname 'db.[REF].supabase.co' often fails on Windows IPv4 networks.")
        print(" 2. Use the Supabase Connection Pooler URI instead:")
        print("    Format: postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres")
        print("    Find it in Supabase: Project Settings -> Database -> Connection Pooler.")
    elif "Tenant or user not found" in err_str:
        print(" 1. When using the pooler, the username must include your project reference:")
        print("    Username format: postgres.[YOUR_PROJECT_REF]")
print("=" * 65)