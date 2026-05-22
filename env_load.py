"""Load project .env as UTF-8 or UTF-16 (e.g. Windows Notepad 'Unicode').

Only reads a .env next to this file or in the process cwd — never walks upward,
so a UTF-16 .env in a parent folder cannot break startup.
"""
from pathlib import Path

# The library is called dotenv. from it we want load_dotenv which allows me to read it.
from dotenv import load_dotenv

# Folder where this file lives (project root when database.py imports us).
_ROOT = Path(__file__).resolve().parent


def _load_file(path: Path) -> str:
    # Notepad "Unicode" saves UTF-16 — detect BOM so load_dotenv uses the right encoding.
    head = path.read_bytes()[:2]
    if head in (b"\xff\xfe", b"\xfe\xff"):
        load_dotenv(dotenv_path=path, encoding="utf-16")
        return "utf-16"
    try:
        load_dotenv(dotenv_path=path, encoding="utf-8")
        return "utf-8"
    except UnicodeDecodeError:
        load_dotenv(dotenv_path=path, encoding="utf-16")
        return "utf-16-fallback"


def load_env() -> None:
    # Simply reads the .env file from the project root or current working directory.
    for base in (_ROOT, Path.cwd()):
        env_path = base / ".env"
        if env_path.is_file():
            _load_file(env_path)
            return
