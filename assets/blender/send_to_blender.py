"""Run an authored script through the user's local Blender MCP bridge."""
import json
import socket
import sys
from pathlib import Path

code = Path(sys.argv[1]).read_text()
with socket.create_connection(("localhost", 9876), timeout=15) as connection:
    connection.settimeout(300)
    connection.sendall(json.dumps({"type": "execute_code", "params": {"code": code}}).encode())
    data = bytearray()
    while True:
        chunk = connection.recv(65536)
        if not chunk:
            raise RuntimeError("Blender closed the connection before returning a result")
        data.extend(chunk)
        try:
            result = json.loads(data)
        except json.JSONDecodeError:
            continue
        print(json.dumps(result, indent=2))
        if result.get("status") != "success":
            sys.exit(1)
        break
