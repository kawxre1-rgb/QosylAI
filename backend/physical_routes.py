import re

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from backend.database import get_connection, get_participant

router = APIRouter(
    prefix="/api/physical-match",
    tags=["Physical Match"]
)

BOOTH_NAMES = {
    1: "AI & Machine Learning",
    2: "Startup & Innovation",
    3: "Career & IT Jobs",
    4: "Robotics & Engineering",
    5: "Web & Digital Technologies",
    6: "Education & Mentorship"
}


class CheckInRequest(BaseModel):
    user_id: int
    booth_id: int = Field(ge=1, le=6)


class CheckOutRequest(BaseModel):
    user_id: int


def profile_words(participant):
    values = [
        participant.get("role", ""),
        participant.get("experience", ""),
        participant.get("about", ""),
        participant.get("goal", "")
    ]

    values.extend(participant.get("skills", []))
    values.extend(participant.get("interests", []))

    text = " ".join(str(value) for value in values).lower()

    return set(re.findall(r"[a-zа-яәіңғүұқөһ0-9+#.]+", text))


def calculate_match(user, candidate):
    user_words = profile_words(user)
    candidate_words = profile_words(candidate)

    common = user_words & candidate_words

    stop_words = {
        "and", "the", "with", "for", "from",
        "мен", "және", "үшін", "туралы"
    }

    common = {
        word for word in common
        if len(word) > 2 and word not in stop_words
    }

    score = min(100, len(common) * 15)

    return score, sorted(common)


@router.post("/check-in")
def physical_check_in(request: CheckInRequest):
    participant = get_participant(request.user_id)

    if not participant:
        raise HTTPException(
            status_code=404,
            detail="Participant not found"
        )

    with get_connection() as db:
        db.execute("""
            INSERT INTO physical_presence
                (user_id, booth_id, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(user_id)
            DO UPDATE SET
                booth_id = excluded.booth_id,
                updated_at = CURRENT_TIMESTAMP
        """, (
            request.user_id,
            request.booth_id
        ))

    return {
        "message": "Check-in successful",
        "user_id": request.user_id,
        "booth_id": request.booth_id,
        "booth_name": BOOTH_NAMES[request.booth_id]
    }


@router.get("/{user_id}")
def get_physical_matches(user_id: int, booth_id: int):
    user = get_participant(user_id)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Participant not found"
        )

    if booth_id not in BOOTH_NAMES:
        raise HTTPException(
            status_code=400,
            detail="Invalid booth"
        )

    with get_connection() as db:
        rows = db.execute("""
            SELECT p.id
            FROM physical_presence pp
            JOIN participants p ON p.id = pp.user_id
            WHERE pp.booth_id = ?
              AND pp.user_id != ?
              AND pp.updated_at >= datetime('now', '-15 minutes')
            ORDER BY pp.updated_at DESC
        """, (
            booth_id,
            user_id
        )).fetchall()

    matches = []

    for row in rows:
        candidate = get_participant(row["id"])

        if not candidate:
            continue

        score, common = calculate_match(user, candidate)

        if score == 0:
            continue

        matches.append({
            "id": candidate["id"],
            "name": candidate["name"],
            "role": candidate["role"],
            "score": score,
            "matched_keywords": common,
            "booth_id": booth_id,
            "booth_name": BOOTH_NAMES[booth_id]
        })

    matches.sort(
        key=lambda item: item["score"],
        reverse=True
    )

    return {
        "user_id": user_id,
        "booth_id": booth_id,
        "booth_name": BOOTH_NAMES[booth_id],
        "total": len(matches),
        "matches": matches
    }


@router.post("/check-out")
def physical_check_out(request: CheckOutRequest):
    with get_connection() as db:
        db.execute("""
            DELETE FROM physical_presence
            WHERE user_id = ?
        """, (request.user_id,))

    return {
        "message": "Check-out successful"
    }