import os
import json
import time
import datetime
import hashlib
import secrets
import urllib.request
import urllib.parse
import ipaddress
import re

USERS_FILE = "users.json"
LOGS_FILE = "login_logs.json"
SESSIONS_FILE = "sessions.json"

SESSION_TTL_SECONDS = 7 * 24 * 3600  # 7 Days
MAX_LOG_ENTRIES = 1000
RATE_LIMIT_WINDOW = 300  # 5 minutes
RATE_LIMIT_MAX_FAILURES = 5

# In-memory caches
GEO_CACHE = {}
FAILED_ATTEMPTS = {}  # ip -> list of float timestamps
SESSIONS = {}         # token -> session dict

# -------------------------------------------------------------
# 1. DATA PERSISTENCE & INITIAL SEEDING
# -------------------------------------------------------------

def init_auth_storage():
    """Initializes user storage and seeds default super admin if none exists."""
    global SESSIONS
    if not os.path.exists(USERS_FILE):
        salt, p_hash = hash_password("admin123")
        now_str = datetime.datetime.now(datetime.timezone.utc).astimezone().strftime("%d %b %Y, %I:%M %p")
        initial_users = [
            {
                "id": 1,
                "name": "Super Administrator",
                "username": "admin",
                "role": "super_admin",
                "status": "active",
                "salt": salt,
                "password_hash": p_hash,
                "created_at": now_str,
                "last_login": "Never"
            }
        ]
        save_users(initial_users)
        print("Initialized users.json with default Super Admin: 'admin' / 'admin123'")

    if not os.path.exists(LOGS_FILE):
        save_logs([])

    if os.path.exists(SESSIONS_FILE):
        try:
            with open(SESSIONS_FILE, 'r', encoding='utf-8') as f:
                saved_sessions = json.load(f)
                now = time.time()
                # Keep non-expired sessions
                SESSIONS = {k: v for k, v in saved_sessions.items() if v.get('expires_at', 0) > now}
        except Exception as e:
            print(f"Error loading sessions: {e}")
            SESSIONS = {}

def get_users():
    if os.path.exists(USERS_FILE):
        try:
            with open(USERS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return []
    return []

def save_users(users_list):
    with open(USERS_FILE, 'w', encoding='utf-8') as f:
        json.dump(users_list, f, indent=2, ensure_ascii=False)

def get_logs():
    if os.path.exists(LOGS_FILE):
        try:
            with open(LOGS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return []
    return []

def save_logs(logs_list):
    with open(LOGS_FILE, 'w', encoding='utf-8') as f:
        json.dump(logs_list[:MAX_LOG_ENTRIES], f, indent=2, ensure_ascii=False)

def save_sessions():
    try:
        with open(SESSIONS_FILE, 'w', encoding='utf-8') as f:
            json.dump(SESSIONS, f, indent=2)
    except Exception as e:
        print(f"Error persisting sessions: {e}")

# -------------------------------------------------------------
# 2. CRYPTOGRAPHY & PASSWORDS
# -------------------------------------------------------------

def hash_password(password, salt=None):
    if not salt:
        salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
    return salt, key.hex()

def verify_password(password, salt, stored_hash):
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000).hex()
    return secrets.compare_digest(key, stored_hash)

# -------------------------------------------------------------
# 3. REAL CLIENT IP, GEOLOCATION & DEVICE PARSING
# -------------------------------------------------------------


# Proxy-forwarded headers (CF-Connecting-IP, X-Forwarded-For, X-Real-IP) are
# fully client-controlled unless something in front of this process (a CDN or
# reverse proxy) strips/overwrites them before forwarding the request. Trusting
# them unconditionally lets any client spoof their IP to bypass rate-limiting
# and poison the audit log. Only honor them when explicitly deployed behind
# such a proxy, via TRUST_PROXY_HEADERS=1.
TRUST_PROXY_HEADERS = os.environ.get('TRUST_PROXY_HEADERS', '0').strip().lower() in ('1', 'true', 'yes')

def get_client_ip(headers, client_address):
    """
    Extracts the client IP. By default trusts only the direct TCP peer address.
    When TRUST_PROXY_HEADERS=1 is set (server sits behind a trusted reverse
    proxy/CDN), honors CF-Connecting-IP / X-Forwarded-For / X-Real-IP instead.
    """
    if TRUST_PROXY_HEADERS:
        cf_ip = headers.get('CF-Connecting-IP')
        if cf_ip:
            return cf_ip.strip()

        xff = headers.get('X-Forwarded-For')
        if xff:
            parts = [p.strip() for p in xff.split(',') if p.strip()]
            if parts:
                # Last entry is the one appended by the nearest trusted proxy hop;
                # earlier entries can be freely set by the client.
                return parts[-1]

        real_ip = headers.get('X-Real-IP')
        if real_ip:
            return real_ip.strip()

    if client_address and len(client_address) > 0:
        return client_address[0]

    return "127.0.0.1"

def is_private_ip(ip_str):
    try:
        ip = ipaddress.ip_address(ip_str)
        return ip.is_private or ip.is_loopback or ip.is_reserved or ip.is_link_local
    except Exception:
        return True

def get_ip_location(ip_str):
    """
    Resolves IP to geographic location.
    Private/LAN IPs -> 'School Campus / Local LAN'
    Public IPs -> Queries Geo-IP with caching and timeout.
    """
    if not ip_str or is_private_ip(ip_str) or ip_str in ['127.0.0.1', '::1', 'localhost']:
        return "GOMTI NAGAR, LUCKNOW (School Campus LAN)"

    if ip_str in GEO_CACHE:
        return GEO_CACHE[ip_str]

    try:
        url = f"http://ip-api.com/json/{ip_str}?fields=status,city,regionName,country"
        req = urllib.request.Request(url, headers={'User-Agent': 'GNPS-AuditEngine/1.0'})
        with urllib.request.urlopen(req, timeout=1.5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            if data.get('status') == 'success':
                city = data.get('city', '').strip()
                region = data.get('regionName', '').strip()
                country = data.get('country', '').strip()
                loc_parts = [p for p in [city, region, country] if p]
                loc = ", ".join(loc_parts) if loc_parts else "Public Internet IP"
                GEO_CACHE[ip_str] = loc
                return loc
    except Exception:
        pass

    fallback = f"Public IP ({ip_str})"
    GEO_CACHE[ip_str] = fallback
    return fallback

def parse_user_agent(ua_string):
    """
    Detects Device, Operating System, and Browser from User-Agent string.
    """
    if not ua_string:
        return "Unknown Device & Browser"

    ua = ua_string

    # 1. Detect OS & Hardware
    os_name = "Desktop PC"
    if "iPhone" in ua:
        os_name = "Apple iPhone"
    elif "iPad" in ua:
        os_name = "Apple iPad"
    elif "Macintosh" in ua or "Mac OS" in ua:
        os_name = "Apple Mac (macOS)"
    elif "Android" in ua:
        os_name = "Android Device"
    elif "Windows NT 10.0" in ua:
        os_name = "Windows 11/10"
    elif "Windows" in ua:
        os_name = "Windows PC"
    elif "CrOS" in ua:
        os_name = "Chromebook (ChromeOS)"
    elif "Linux" in ua:
        os_name = "Linux"

    # 2. Detect Browser
    browser_name = "Web Browser"
    if "Edg/" in ua:
        m = re.search(r'Edg/([0-9]+)', ua)
        browser_name = f"Edge {m.group(1)}" if m else "Edge"
    elif "Chrome/" in ua and "Safari/" in ua:
        m = re.search(r'Chrome/([0-9]+)', ua)
        browser_name = f"Chrome {m.group(1)}" if m else "Chrome"
    elif "Safari/" in ua and "Chrome" not in ua:
        browser_name = "Safari Mobile" if "Mobile" in ua else "Safari"
    elif "Firefox/" in ua:
        m = re.search(r'Firefox/([0-9]+)', ua)
        browser_name = f"Firefox {m.group(1)}" if m else "Firefox"
    elif "Opera" in ua or "OPR" in ua:
        browser_name = "Opera"

    return f"{os_name} • {browser_name}"

# -------------------------------------------------------------
# 4. AUDIT LOGGING & RATE LIMITING
# -------------------------------------------------------------

def record_audit_log(username, name, role, status, ip, device, location):
    """
    Appends an event to login_logs.json.
    Statuses: SUCCESS, FAILED_PASSWORD, ACCESS_WITHDRAWN, USER_NOT_FOUND, LOGOUT, BLOCKED_RATE_LIMIT
    """
    logs = get_logs()
    now = datetime.datetime.now()
    formatted_ist = now.strftime("%d %b %Y, %I:%M:%S %p")

    entry = {
        "id": int(time.time() * 1000),
        "timestamp": formatted_ist,
        "iso_time": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "username": username,
        "name": name or username,
        "role": role or "user",
        "status": status,
        "ip": ip,
        "device": device,
        "location": location
    }
    logs.insert(0, entry)
    save_logs(logs)
    return entry

def is_rate_limited(ip):
    now = time.time()
    attempts = FAILED_ATTEMPTS.get(ip, [])
    # Keep attempts within the window
    valid_attempts = [t for t in attempts if now - t < RATE_LIMIT_WINDOW]
    FAILED_ATTEMPTS[ip] = valid_attempts
    return len(valid_attempts) >= RATE_LIMIT_MAX_FAILURES

def record_failed_attempt(ip):
    now = time.time()
    if ip not in FAILED_ATTEMPTS:
        FAILED_ATTEMPTS[ip] = []
    FAILED_ATTEMPTS[ip].append(now)

# -------------------------------------------------------------
# 5. AUTHENTICATION & SESSION MANAGEMENT
# -------------------------------------------------------------

def authenticate_user(username, password, ip, user_agent_str):
    """
    Authenticates user and returns (success: bool, result_dict: dict, status_code: int).
    """
    device = parse_user_agent(user_agent_str)
    location = get_ip_location(ip)

    if is_rate_limited(ip):
        record_audit_log(username, username, "user", "BLOCKED_RATE_LIMIT", ip, device, location)
        return False, {"error": "Too many failed login attempts. Please wait 5 minutes before trying again."}, 429

    users = get_users()
    user = next((u for u in users if u["username"].lower() == username.lower().strip()), None)

    if not user:
        record_failed_attempt(ip)
        record_audit_log(username, "Unknown User", "user", "USER_NOT_FOUND", ip, device, location)
        return False, {"error": "Invalid username or password. Please verify credentials."}, 401

    if not verify_password(password, user.get("salt", ""), user.get("password_hash", "")):
        record_failed_attempt(ip)
        record_audit_log(user["username"], user["name"], user["role"], "FAILED_PASSWORD", ip, device, location)
        return False, {"error": "Invalid username or password. Please verify credentials."}, 401

    # Check permission status
    if user.get("status") == "suspended":
        record_audit_log(user["username"], user["name"], user["role"], "ACCESS_WITHDRAWN", ip, device, location)
        return False, {
            "error": "⛔ Access Denied: Your login permission has been withdrawn by the Super Admin. Please contact the school administration.",
            "permission_withdrawn": True
        }, 403

    # Success: update last login and create session token
    now_str = datetime.datetime.now().strftime("%d %b %Y, %I:%M %p")
    user["last_login"] = now_str
    save_users(users)

    # Issue secure session token
    token = secrets.token_hex(32)
    SESSIONS[token] = {
        "user_id": user["id"],
        "username": user["username"],
        "name": user["name"],
        "role": user["role"],
        "expires_at": time.time() + SESSION_TTL_SECONDS
    }
    save_sessions()

    record_audit_log(user["username"], user["name"], user["role"], "SUCCESS", ip, device, location)

    safe_user = {
        "id": user["id"],
        "name": user["name"],
        "username": user["username"],
        "role": user["role"],
        "status": user["status"],
        "last_login": user["last_login"]
    }

    return True, {"token": token, "user": safe_user}, 200

def verify_session_token(token):
    """
    Verifies token validity and user status.
    Returns (is_valid: bool, user_data: dict or None)
    """
    if not token or token not in SESSIONS:
        return False, None

    sess = SESSIONS[token]
    if time.time() > sess.get("expires_at", 0):
        del SESSIONS[token]
        save_sessions()
        return False, None

    # Check if user is still active in users.json
    users = get_users()
    user = next((u for u in users if u["id"] == sess["user_id"]), None)

    if not user or user.get("status") == "suspended":
        # Permission revoked while logged in!
        del SESSIONS[token]
        save_sessions()
        return False, None

    safe_user = {
        "id": user["id"],
        "name": user["name"],
        "username": user["username"],
        "role": user["role"],
        "status": user["status"],
        "last_login": user.get("last_login", "Recently")
    }
    return True, safe_user

def revoke_session_token(token, ip, user_agent_str):
    if token in SESSIONS:
        sess = SESSIONS[token]
        device = parse_user_agent(user_agent_str)
        location = get_ip_location(ip)
        record_audit_log(sess["username"], sess.get("name", sess["username"]), sess["role"], "LOGOUT", ip, device, location)
        del SESSIONS[token]
        save_sessions()
    return True

# -------------------------------------------------------------
# 6. SUPER ADMIN MANAGEMENT OPERATIONS
# -------------------------------------------------------------

def admin_get_all_users():
    users = get_users()
    # Strip sensitive salt and password_hash
    safe_list = []
    for u in users:
        safe_list.append({
            "id": u["id"],
            "name": u["name"],
            "username": u["username"],
            "role": u["role"],
            "status": u["status"],
            "created_at": u.get("created_at", "N/A"),
            "last_login": u.get("last_login", "Never")
        })
    return safe_list

def admin_toggle_user_permission(user_id):
    users = get_users()
    user = next((u for u in users if u["id"] == user_id), None)
    if not user:
        return False, "User not found"

    if user["role"] == "super_admin":
        return False, "Super Admin permissions cannot be withdrawn"

    user["status"] = "suspended" if user["status"] == "active" else "active"
    save_users(users)

    # If suspended, invalidate all active sessions for this user immediately
    if user["status"] == "suspended":
        tokens_to_remove = [k for k, v in SESSIONS.items() if v.get("user_id") == user_id]
        for t in tokens_to_remove:
            del SESSIONS[t]
        save_sessions()

    return True, user["status"]

def admin_create_user(name, username, password, role, status="active"):
    users = get_users()
    clean_username = username.strip().lower()

    if any(u["username"].lower() == clean_username for u in users):
        return False, f"Username '{clean_username}' already exists"

    salt, p_hash = hash_password(password)
    now_str = datetime.datetime.now().strftime("%d %b %Y, %I:%M %p")
    new_id = int(time.time() * 1000)

    new_user = {
        "id": new_id,
        "name": name.strip(),
        "username": clean_username,
        "role": role if role in ["super_admin", "user"] else "user",
        "status": status if status in ["active", "suspended"] else "active",
        "salt": salt,
        "password_hash": p_hash,
        "created_at": now_str,
        "last_login": "Never"
    }

    users.append(new_user)
    save_users(users)
    return True, new_user

def admin_reset_password(user_id, new_password):
    users = get_users()
    user = next((u for u in users if u["id"] == user_id), None)
    if not user:
        return False, "User not found"

    salt, p_hash = hash_password(new_password)
    user["salt"] = salt
    user["password_hash"] = p_hash
    save_users(users)

    # Invalidate existing sessions for this user so they log in with new password
    tokens_to_remove = [k for k, v in SESSIONS.items() if v.get("user_id") == user_id]
    for t in tokens_to_remove:
        del SESSIONS[t]
    save_sessions()

    return True, "Password reset successfully"

def admin_delete_user(user_id):
    users = get_users()
    user = next((u for u in users if u["id"] == user_id), None)
    if not user:
        return False, "User not found"

    if user["role"] == "super_admin":
        return False, "Super Admin account cannot be deleted"

    users = [u for u in users if u["id"] != user_id]
    save_users(users)

    tokens_to_remove = [k for k, v in SESSIONS.items() if v.get("user_id") == user_id]
    for t in tokens_to_remove:
        del SESSIONS[t]
    save_sessions()

    return True, "User deleted successfully"

def admin_clear_logs():
    save_logs([])
    return True

# Initialize storage on import
init_auth_storage()
