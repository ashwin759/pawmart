from app.core.security import verify_password, hash_password
pw = "admin123"
h = hash_password(pw)
print(f"Password: {pw}")
print(f"Hash: {h}")
valid = verify_password(pw, h)
print(f"Valid: {valid}")

# Test with a specific hash format if known
try:
    # Example pbkdf2 hash from previous run
    test_h = "$pbkdf2-sha256$29000$x8g5qr0ONN6Smxzcwl/ZMWzg$e4W8L7Vd.wX6k3Yp9m5J.fQ7k.Y8j/1z7.O6I" 
    # Wait, I don't have the exact hash from the run, let's just use the one we just made
    print(f"Self-Verify: {verify_password(pw, h)}")
except Exception as e:
    print(f"Error: {e}")
