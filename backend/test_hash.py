from app.core.security import hash_password
try:
    h = hash_password("admin123")
    print(f"Hashed: {h}")
except Exception as e:
    print(f"Error: {e}")
