
import json
from pathlib import Path


# 1. Мақсаттардың өзара сәйкестігі
GOAL_COMPATIBILITY = {
    "find_job": {
        "hire": 100,
        "become_mentor": 65,
        "exchange": 45
    },
    "hire": {
        "find_job": 100,
        "exchange": 45
    },
    "find_mentor": {
        "become_mentor": 100,
        "exchange": 55
    },
    "become_mentor": {
        "find_mentor": 100,
        "exchange": 55
    },
    "cofounder": {
        "cofounder": 70,
        "exchange": 50
    },
    "exchange": {
        "exchange": 100,
        "find_job": 45,
        "hire": 45,
        "find_mentor": 55,
        "become_mentor": 55,
        "cofounder": 50
    }
}


# 2. Рөлдерді бағыттарға бөлу
ROLE_GROUPS = {
    "developer": [
        "Junior Developer",
        "Python Developer",
        "Frontend Developer",
        "Senior Developer",
        "Developer",
        "Beginner Programmer",
        "AI Engineer"
    ],
    "recruitment": [
        "HR Manager",
        "IT Recruiter"
    ],
    "management": [
        "Team Lead",
        "Product Manager"
    ],
    "business": [
        "Startup Founder",
        "Entrepreneur"
    ],
    "design": [
        "Designer",
        "IT Specialist"
    ],
    "student": [
        "Student"
    ]
}


# 3. Ортақ элементтерді пайызбен есептеу
def similarity(list_a, list_b):
    set_a = set(list_a)
    set_b = set(list_b)

    if not set_a or not set_b:
        return 0

    return len(set_a & set_b) / len(set_a | set_b) * 100


# 4. Мақсаттардың сәйкестігін есептеу
def compare_goals(user, candidate):
    user_goal = user.get("goal")
    candidate_goal = candidate.get("goal")

    return GOAL_COMPATIBILITY.get(
        user_goal, {}
    ).get(candidate_goal, 0)


# 5. Рөлдердің сәйкестігін есептеу
def compare_roles(user, candidate):
    user_role = user.get("role")
    candidate_role = candidate.get("role")

    if user_role == candidate_role:
        return 50

    for group in ROLE_GROUPS.values():
        if user_role in group and candidate_role in group:
            return 75

    return 40


# 6. Тәжірибе деңгейін бағалау
def experience_score(user, candidate):
    levels = {
        "Beginner": 1,
        "Less than 1 year": 2,
        "1-3 years": 3,
        "3-5 years": 4,
        "5+ years": 5
    }

    user_level = levels.get(user.get("experience"), 1)
    candidate_level = levels.get(candidate.get("experience"), 1)

    difference = abs(user_level - candidate_level)

    return max(0, 100 - difference * 25)


# 7. Әр ұсыныстың себебін дайындау
def generate_reason(user, candidate, goal_score, skill_score,
                    interest_score):

    reasons = []

    if goal_score >= 100:
        reasons.append(
            "Сіздердің мақсаттарыңыз бір-бірін толықтырады."
        )
    elif goal_score >= 65:
        reasons.append(
            "Кәсіби мақсаттарыңыз арасында пайдалы байланыс бар."
        )
    else:
        reasons.append(
            "Ортақ бағыттарыңыз бойынша тәжірибе алмаса аласыздар."
        )

    common_skills = set(user.get("skills", [])) & set(
        candidate.get("skills", [])
    )

    if common_skills:
        reasons.append(
            "Ортақ дағдыларыңыз: " +
            ", ".join(sorted(common_skills)) + "."
        )

    common_interests = set(user.get("interests", [])) & set(
        candidate.get("interests", [])
    )

    if common_interests:
        reasons.append(
            "Екеуіңізге де қызықты бағыттар: " +
            ", ".join(sorted(common_interests)) + "."
        )

    if len(reasons) == 1:
        reasons.append(
            "Бұл таныстық кәсіби байланыс орнатуға мүмкіндік береді."
        )

    return " ".join(reasons[:2])


# 8. Танысуды бастауға арналған сөйлем
def generate_intro(user, candidate):
    return (
        f"Сәлеметсіз бе, {candidate.get('name')}! "
        f"Мен {user.get('role')} ретінде "
        f"{candidate.get('role')} бағыты бойынша "
        "тәжірибе алмасқым келеді. Танысуға қалай қарайсыз?"
    )


# 9. Жалпы сәйкестік ұпайы
def calculate_match(user, candidate):
    goal = compare_goals(user, candidate)

    if goal == 0:
        return None

    role = compare_roles(user, candidate)

    skills = similarity(
        user.get("skills", []),
        candidate.get("skills", [])
    )

    interests = similarity(
        user.get("interests", []),
        candidate.get("interests", [])
    )

    experience = experience_score(user, candidate)

    total = (
        goal * 0.40 +
        role * 0.25 +
        skills * 0.15 +
        interests * 0.10 +
        experience * 0.10
    )

    return {
        "score": round(total, 1),
        "goal_score": goal,
        "role_score": role,
        "skill_score": round(skills, 1),
        "interest_score": round(interests, 1),
        "experience_score": experience
    }


# 10. Ең үздік 5 адамды таңдау
def recommend_matches(user, participants, limit=5):
    recommendations = []

    for candidate in participants:

        # Өзін-өзі ұсынуға болмайды
        if candidate["id"] == user["id"]:
            continue

        scores = calculate_match(user, candidate)

        # Мақсаттары сәйкес келмейтіндерді өткізіп жіберу
        if scores is None:
            continue

        result = {
            "id": candidate["id"],
            "name": candidate["name"],
            "role": candidate["role"],
            "skills": candidate["skills"],
            "goal": candidate["goal"],
            "match_percentage": scores["score"],
            "reason": generate_reason(
                user,
                candidate,
                scores["goal_score"],
                scores["skill_score"],
                scores["interest_score"]
            ),
            "opening_message": generate_intro(user, candidate)
        }

        recommendations.append(result)

    recommendations.sort(
        key=lambda item: item["match_percentage"],
        reverse=True
    )

    return recommendations[:limit]


# 11. Алгоритмді жеке тексеру
if __name__ == "__main__":

    data_path = Path(__file__).resolve().parent.parent / "data" / "participants.json"

    with open(data_path, "r", encoding="utf-8") as file:
        participants = json.load(file)

    # Демонстрацияға арналған пайдаланушы
    user = {
        "id": 999,
        "name": "Demo User",
        "role": "Junior Developer",
        "skills": ["Python", "HTML", "CSS"],
        "experience": "Less than 1 year",
        "interests": ["AI", "Robotics"],
        "about": "I am looking for an IT job.",
        "goal": "find_job"
    }

    matches = recommend_matches(user, participants)

    print("\nQOSYL AI — TOP 5 MATCHES\n")

    for index, match in enumerate(matches, start=1):
        print(f"{index}. {match['name']}")
        print(f"   Role: {match['role']}")
        print(f"   Match: {match['match_percentage']}%")
        print(f"   Reason: {match['reason']}")
        print(f"   Intro: {match['opening_message']}")
        print("-" * 55)
