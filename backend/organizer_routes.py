
from fastapi import APIRouter

from backend.database import get_all_participants

router = APIRouter(
    prefix="/api/organizer",
    tags=["Organizer Dashboard"]
)

INTEREST_ZONES = [
    {
        "id": "ai",
        "name": "AI & Machine Learning",
        "keywords": [
            "ai", "artificial intelligence",
            "machine learning", "python",
            "нейрон", "жасанды интеллект"
        ],
        "x": 0,
        "y": 0
    },
    {
        "id": "startup",
        "name": "Startup & Business",
        "keywords": [
            "startup", "business",
            "entrepreneurship", "стартап", "бизнес"
        ],
        "x": 1,
        "y": 0
    },
    {
        "id": "career",
        "name": "Career & IT Jobs",
        "keywords": [
            "career", "job", "developer",
            "programming", "жұмыс", "мансап"
        ],
        "x": 0,
        "y": 1
    },
    {
        "id": "robotics",
        "name": "Robotics & Engineering",
        "keywords": [
            "robotics", "arduino", "ev3",
            "engineering", "робот", "робототехника"
        ],
        "x": 1,
        "y": 1
    },
    {
        "id": "web",
        "name": "Web & UX/UI",
        "keywords": [
            "web", "html", "css",
            "javascript", "ux", "ui", "дизайн"
        ],
        "x": 0,
        "y": 2
    },
    {
        "id": "education",
        "name": "Education & Mentorship",
        "keywords": [
            "education", "teaching", "mentor",
            "оқыту", "білім", "педагогика"
        ],
        "x": 1,
        "y": 2
    }
]


@router.get("/interest-map")
def get_interest_map():
    participants = get_all_participants()

    total = len(participants)
    zones = []

    for zone in INTEREST_ZONES:
        interested_ids = set()

        for person in participants:
            profile_text = " ".join([
                person.get("role") or "",
                person.get("experience") or "",
                person.get("about") or "",
                person.get("goal") or "",
                " ".join(person.get("skills") or []),
                " ".join(person.get("interests") or [])
            ]).lower()

            if any(
                keyword in profile_text
                for keyword in zone["keywords"]
            ):
                interested_ids.add(person["id"])

        count = len(interested_ids)

        percentage = round(
            count / total * 100, 1
        ) if total else 0

        zones.append({
            "id": zone["id"],
            "name": zone["name"],
            "participants": count,
            "percentage": percentage,
            "x": zone["x"],
            "y": zone["y"]
        })

    zones.sort(
        key=lambda item: item["participants"],
        reverse=True
    )

    return {
        "total_participants": total,
        "total_zones": len(zones),
        "zones": zones,
        "most_popular": zones[0] if zones and zones[0]["participants"] else None
    }
