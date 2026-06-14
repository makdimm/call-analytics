import sys
import json
import importlib.util

# This script is called as subprocess for password verification
# to avoid Python C extension state issues with uvicorn.

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "no action"}))
        return
    
    action = sys.argv[1]
    
    if action == "hash":
        pw = sys.argv[2]
        import argon2
        ph = argon2.PasswordHasher(time_cost=3, memory_cost=65536, parallelism=4)
        result = ph.hash(pw)
        print(json.dumps({"ok": True, "result": result}))
    
    elif action == "verify":
        h = sys.argv[2]
        pw = sys.argv[3]
        import argon2
        ph = argon2.PasswordHasher(time_cost=3, memory_cost=65536, parallelism=4)
        try:
            ph.verify(h, pw)
            print(json.dumps({"ok": True, "result": True}))
        except Exception:
            print(json.dumps({"ok": True, "result": False}))

if __name__ == "__main__":
    main()
