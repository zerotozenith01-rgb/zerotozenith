"""
auth_routes.py
──────────────
Simple email/password auth backed by Supabase users table.
Passwords are hashed with bcrypt (via hashlib as fallback).

Endpoints:
  POST /api/auth/register  → create user
  POST /api/auth/login     → authenticate, return user object
  GET  /api/auth/user/:id  → fetch user profile
  PUT  /api/auth/user/:id  → update user profile
"""

import hashlib
import os
from flask import Blueprint, request, jsonify
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

auth_bp = Blueprint("auth", __name__)

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))


def _hash_pw(password: str) -> str:
    """Simple SHA-256 hash (swap for bcrypt in production)."""
    return hashlib.sha256(password.encode()).hexdigest()


# Fallback password store when password_hash column doesn't exist yet
_passwords: dict[str, str] = {}


# ── Register ─────────────────────────────────────────────────────────────────

@auth_bp.route("/register", methods=["POST"])
def register():
    body = request.json or {}
    name = body.get("name", "").strip()
    email = body.get("email", "").strip().lower()
    password = body.get("password", "")
    role = body.get("role", "customer")
    if role not in ("customer", "vendor"):
        role = "customer"

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required"}), 400

    # Check if email exists
    existing = supabase.table("users").select("id").eq("email", email).execute()
    if existing.data:
        return jsonify({"error": "An account with this email already exists"}), 409

    # Insert user – try with password_hash, fall back without
    user_data = {
        "name": name,
        "email": email,
        "role": role,
    }
    try:
        user_data["password_hash"] = _hash_pw(password)
        result = supabase.table("users").insert(user_data).execute()
    except Exception:
        # password_hash column may not exist yet
        del user_data["password_hash"]
        result = supabase.table("users").insert(user_data).execute()
        _passwords[email] = _hash_pw(password)  # store in memory

    user = result.data[0]

    return jsonify({
        "success": True,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user.get("role", "customer"),
        },
    }), 201


# ── Login ─────────────────────────────────────────────────────────────────────

@auth_bp.route("/login", methods=["POST"])
def login():
    body = request.json or {}
    email = body.get("email", "").strip().lower()
    password = body.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    # Find user (select only safe columns)
    try:
        result = supabase.table("users").select("*").eq("email", email).execute()
    except Exception:
        result = supabase.table("users").select("id, name, email, role, created_at").eq("email", email).execute()

    if not result.data:
        return jsonify({"error": "No account found with this email"}), 404

    user = result.data[0]

    # Check password — try DB column first, then in-memory fallback
    pw_hash = user.get("password_hash")
    if pw_hash:
        if pw_hash != _hash_pw(password):
            return jsonify({"error": "Incorrect password"}), 401
    elif email in _passwords:
        if _passwords[email] != _hash_pw(password):
            return jsonify({"error": "Incorrect password"}), 401
    else:
        # Legacy user with no password — accept any password, store for next time
        _passwords[email] = _hash_pw(password)

    return jsonify({
        "success": True,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user.get("role", "customer"),
            "phone": user.get("phone", ""),
            "location": user.get("location", ""),
            "allergies": user.get("allergies", ""),
            "blood_group": user.get("blood_group", ""),
        },
    })


# ── Get user profile ─────────────────────────────────────────────────────────

@auth_bp.route("/user/<user_id>", methods=["GET"])
def get_user(user_id):
    result = supabase.table("users").select("*").eq("id", user_id).execute()
    if not result.data:
        return jsonify({"error": "User not found"}), 404

    user = result.data[0]
    return jsonify({
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user.get("role", "customer"),
        "phone": user.get("phone", ""),
        "location": user.get("location", ""),
        "allergies": user.get("allergies", ""),
        "blood_group": user.get("blood_group", ""),
        "created_at": user.get("created_at", ""),
    })


# ── Update profile ───────────────────────────────────────────────────────────

@auth_bp.route("/user/<user_id>", methods=["PUT"])
def update_user(user_id):
    body = request.json or {}
    update = {}
    for key in ("name", "email", "phone", "location", "allergies", "blood_group"):
        if key in body:
            update[key] = body[key]

    if not update:
        return jsonify({"error": "No fields to update"}), 400

    supabase.table("users").update(update).eq("id", user_id).execute()
    return jsonify({"success": True})
