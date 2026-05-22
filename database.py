import psycopg2  # Import the psycopg2 library to connect to PostgreSQL database

# Environement variables are system-level setttings available to program.
import os  # Import the os library to access environment variables (.env)
import threading

# The library is called dotenv. from it we want load_dotenv which allows me to read it.
from env_load import load_env

# Reads the .env file (UTF-8 or UTF-16 if saved from Windows Notepad as "Unicode").
load_env()

# Set the DATABASE_URL variable to the value of the DATABASE_URL environment variable.
DATABASE_URL = os.getenv("DATABASE_URL")

# Each API request can run at the same time (e.g. dashboard loads convoys + drives + garage).
# A single shared cursor caused random/wrong query results, so we keep one connection+cursor
# per worker thread and still expose `database` / `cursor` to the rest of the app.
_local = threading.local()


def _connection():
    conn = getattr(_local, "conn", None)
    if conn is None or conn.closed:
        # Connect to the PostgreSQL database using the DATABASE_URL.
        conn = psycopg2.connect(DATABASE_URL)
        _local.conn = conn
        _local.cursor = None
    return conn


def _cursor():
    cur = getattr(_local, "cursor", None)
    if cur is None or cur.closed:
        # Create a cursor object to execute SQL commands everywhere else in the code.
        # Cursor is a method that is inherited from the psycopg2 library.
        cur = _connection().cursor()
        _local.cursor = cur
    return cur


class _ConnectionProxy:
    # database.commit() - Commits the current transaction.
    # database.rollback() - Rolls back the current transaction.
    def commit(self):
        return _connection().commit()

    def rollback(self):
        return _connection().rollback()

    @property
    def closed(self):
        return _connection().closed


class _CursorProxy:
    # cursor.execute() - Executes a SQL command.
    # cursor.fetchall() - Fetches all rows of a query result.
    # cursor.fetchone() - Fetches the next row of a query result.
    def execute(self, *args, **kwargs):
        return _cursor().execute(*args, **kwargs)

    def fetchone(self):
        return _cursor().fetchone()

    def fetchall(self):
        return _cursor().fetchall()


def reset_connection_state():
    """Called after each HTTP request (see app.py middleware) to end any open transaction."""
    conn = getattr(_local, "conn", None)
    if conn is None or conn.closed:
        return
    try:
        conn.rollback()
    except Exception:
        pass


# Routes still import these names — they now forward to the thread-local connection/cursor.
database = _ConnectionProxy()
cursor = _CursorProxy()
