
from fastapi import APIRouter, HTTPException
from backend.database import get_participant

router = APIRouter(prefix="/api", tags=["Partner Booth Recommendations"])

BOOTH_CATALOG = [
    {
        "id": 1,
        "name": "AI & Machine Learning",
        "description": "Жасанды интеллект, машиналық оқыту және нейрондық желілер.",
        "keywords": ["ai", "artificial intelligence", "machine learning", "python", "нейрон", "жасанды интеллект"],
        "goal_keywords": ["ai", "research", "learn", "үйрену"]
    },
    {
        "id": 2,
        "name": "Startup & Innovation",
        "description": "Стартаптар, бизнес идеялар және кәсіпкерлік.",
        "keywords": ["startup", "business", "entrepreneurship", "бизнес", "стартап"],
        "goal_keywords": ["co-founder", "бизнес", "startup", "founder"]
    },
    {
        "id": 3,
        "name": "Career & IT Jobs",
        "description": "IT компаниялар, тағылымдамалар және жұмыс мүмкіндіктері.",
        "keywords": ["career", "job", "programming", "developer", "жұмыс", "мансап"],
        "goal_keywords": ["find a job", "job", "жұмыс"]
    },
    {
        "id": 4,
        "name": "Robotics & Engineering",
        "description": "Робототехника, электроника және инженерлік шешімдер.",
        "keywords": ["robotics", "arduino", "ev3", "engineering", "робототехника", "робот"],
        "goal_keywords": ["robotics", "engineering", "робот"]
    },
    {
        "id": 5,
        "name": "Web & Digital Technologies",
        "description": "Веб-әзірлеу, UX/UI және цифрлық өнімдер.",
        "keywords": ["web", "html", "css", "javascript", "ux", "ui", "дизайн"],
        "goal_keywords": ["web", "developer", "digital"]
    },
    {
        "id": 6,
        "name": "Education & Mentorship",
        "description": "Білім беру, менторлық және тәжірибе алмасу.",
        "keywords": ["education", "teaching", "mentor", "оқыту", "білім", "педагогика"],
        "goal_keywords": ["mentor", "mentorship", "exchange", "тәжірибе"]
    }
]


def calculate_booth_score(participant, booth):
    profile_text = " ".join([
        participant.get("role", ""),
        participant.get("experience", ""),
        participant.get("about", ""),
        " ".join(participant.get("skills", [])),
        " ".join(participant.get("interests", []))
    ]).lower()

    goal = participant.get("goal", "").lower()

    score = 0
    matched_keywords = []

    for keyword in booth["keywords"]:
        if keyword.lower() in profile_text:
            score += 2
            matched_keywords.append(keyword)

    for keyword in booth["goal_keywords"]:
        if keyword.lower() in goal:
            score += 3

    return score, matched_keywords


@router.get("/booths/recommendations/{user_id}")
def get_booth_recommendations(user_id: int):
    participant = get_participant(user_id)

    if not participant:
        raise HTTPException(
            status_code=404,
            detail="Participant not found"
        )

    recommendations = []

    for booth in BOOTH_CATALOG:
        score, matched_keywords = calculate_booth_score(
            participant,
            booth
        )

        recommendations.append({
            "id": booth["id"],
            "name": booth["name"],
            "description": booth["description"],
            "score": score,
            "matched_keywords": matched_keywords
        })

    recommendations.sort(
        key=lambda item: item["score"],
        reverse=True
    )

    return {
        "user_id": user_id,
        "recommendations": recommendations[:3]
    }
