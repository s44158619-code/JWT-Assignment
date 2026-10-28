import os
import re
from datetime import datetime, timedelta, timezone

import jwt
from errors import ApiError


def jwt_config():
    secret = os.getenv("JWT_SECRET", "")
    if not re.fullmatch(r"[0-9a-fA-F]{64}", secret):
        raise RuntimeError("JWT_SECRET은 64자리 16진수여야 합니다.")
    return bytes.fromhex(secret)


def issue_token(user):
    secret = jwt_config()
    ttl = int(os.getenv("TOKEN_TTL", "90"))
    now = datetime.now(timezone.utc)

    payload = {
        "sub": str(user["id"]),
        "exp": now + timedelta(seconds=ttl),
        "iss": os.getenv("JWT_ISSUER", "webservice-class"),
        "aud": os.getenv("JWT_AUDIENCE", "board-api"),
    }

    return jwt.encode(payload, secret, algorithm="HS256")


def current_user_id(request):
    authorization = request.headers.get("Authorization", "")

    parts = authorization.split()

    if len(parts) != 2 or parts[0] != "Bearer":
        raise ApiError(401, "TOKEN_REQUIRED", "로그인이 필요합니다.")

    token = parts[1]

    try:
        payload = jwt.decode(
            token,
            jwt_config(),
            algorithms=["HS256"],
            issuer=os.getenv("JWT_ISSUER", "webservice-class"),
            audience=os.getenv("JWT_AUDIENCE", "board-api"),
            options={
                "require": ["sub", "exp", "iss", "aud"]
            },
        )

    except jwt.ExpiredSignatureError:
        raise ApiError(401, "TOKEN_EXPIRED", "토큰이 만료되었습니다.")

    except jwt.InvalidTokenError:
        raise ApiError(401, "INVALID_TOKEN", "유효하지 않은 토큰입니다.")

    sub = payload.get("sub")

    if not isinstance(sub, str) or not sub.isdigit():
        raise ApiError(401, "INVALID_TOKEN", "사용자 정보가 올바르지 않습니다.")

    user_id = int(sub)

    from users import find_public

    user = find_public(user_id)

    if user is None:
        raise ApiError(401, "INVALID_TOKEN", "존재하지 않는 사용자입니다.")

    return user_id


def assert_owner(user_id, author_id):
    if user_id != author_id:
        raise ApiError(
            403,
            "FORBIDDEN",
            "본인이 작성한 게시글만 수정하거나 삭제할 수 있습니다."
        )