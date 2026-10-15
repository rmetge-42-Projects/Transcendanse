#!/usr/bin/env python3
"""Create a persistent API key in .env before Compose interpolates variables."""

import os
import re
import secrets
import tempfile
from pathlib import Path


env_file = Path(".env")
if not env_file.is_file():
    raise SystemExit("Fichier .env absent. Copiez d'abord .env.example vers .env.")

content = env_file.read_text(encoding="utf-8")
lines = content.splitlines(keepends=True)
matches = [
    re.match(r"^\s*PUBLIC_API_KEY\s*=\s*([^\s#]*)", line)
    for line in lines
]
values = [match.group(1) for match in matches if match]
if len(values) == 1 and re.fullmatch(r"[0-9a-fA-F]{64}", values[0]):
    raise SystemExit(0)

key = secrets.token_hex(32)
output = []
inserted = False
for line, match in zip(lines, matches):
    if match:
        if not inserted:
            output.append(f"PUBLIC_API_KEY={key}\n")
            inserted = True
    else:
        output.append(line)
if not inserted:
    if output and not output[-1].endswith("\n"):
        output[-1] += "\n"
    output.append(f"PUBLIC_API_KEY={key}\n")

fd, temporary = tempfile.mkstemp(prefix=".env.", dir=".")
try:
    os.fchmod(fd, 0o600)
    with os.fdopen(fd, "w", encoding="utf-8") as stream:
        stream.writelines(output)
    os.replace(temporary, env_file)
except BaseException:
    try:
        os.unlink(temporary)
    except FileNotFoundError:
        pass
    raise

print("PUBLIC_API_KEY générée et enregistrée dans .env (valeur masquée).")
