
import json
import random
from pathlib import Path

random.seed(42)

names = [
    "Aruzhan", "Merey", "Aibek", "Roman", "Alina",
    "Daniyar", "Ali", "Madina", "Nursultan", "Dias",
    "Amina", "Timur", "Adil", "Sanzhar", "Kamila",
    "Ernar", "Dana", "Arman", "Asel", "Islam",
    "Aigerim", "Miras", "Anel", "Rasul", "Nazar",
    "Laura", "Eldar", "Sofia", "Maxim", "Zarina"
]

surnames = [
    "S.", "K.", "A.", "M.", "T.",
    "B.", "R.", "D.", "N.", "O."
]

profiles = {
    "find_job": {
        "roles": ["Junior Developer", "Python Developer", "Frontend Developer"],
        "skills": [
            ["Python", "HTML", "CSS"],
            ["JavaScript", "React", "HTML"],
            ["Java", "SQL", "Python"],
            ["C++", "Python", "Algorithms"]
        ],
        "interests": [
            ["AI", "Robotics"],
            ["Web Development", "Startups"],
            ["Data Science", "Python"]
        ],
        "about": [
            "I am looking for a job in IT.",
            "I want to develop my programming skills and join a team.",
            "I am interested in software development and new technologies."
        ]
    },

    "hire": {
        "roles": ["HR Manager", "IT Recruiter", "Team Lead"],
        "skills": [
            ["Recruitment", "Python", "IT"],
            ["HR", "Communication", "Management"],
            ["SQL", "IT Recruitment", "Analytics"]
        ],
        "interests": [
            ["Recruitment", "Technology"],
            ["IT Careers", "Networking"],
            ["Human Resources", "Startups"]
        ],
        "about": [
            "I am looking for talented IT specialists.",
            "I recruit developers for technology companies.",
            "I want to meet professionals for our growing team."
        ]
    },

    "find_mentor": {
        "roles": ["Student", "Junior Developer", "Beginner Programmer"],
        "skills": [
            ["Python", "HTML", "CSS"],
            ["JavaScript", "React"],
            ["Python", "SQL"]
        ],
        "interests": [
            ["AI", "Programming"],
            ["Robotics", "Technology"],
            ["Web Development", "Data Science"]
        ],
        "about": [
            "I want to learn from experienced professionals.",
            "I am looking for a mentor in technology.",
            "I want to improve my professional skills."
        ]
    },

    "become_mentor": {
        "roles": ["Senior Developer", "Tech Lead", "AI Engineer"],
        "skills": [
            ["Python", "AI", "Machine Learning"],
            ["JavaScript", "React", "Node.js"],
            ["Python", "SQL", "Data Science"]
        ],
        "interests": [
            ["Mentoring", "AI"],
            ["Education", "Programming"],
            ["Robotics", "Technology"]
        ],
        "about": [
            "I have professional experience and want to mentor beginners.",
            "I enjoy sharing knowledge with young developers.",
            "I want to help people grow in IT."
        ]
    },

    "cofounder": {
        "roles": ["Startup Founder", "Product Manager", "Entrepreneur"],
        "skills": [
            ["Business", "Product", "Marketing"],
            ["Python", "AI", "Startups"],
            ["JavaScript", "Product Management", "Design"]
        ],
        "interests": [
            ["Startups", "Innovation"],
            ["AI", "Business"],
            ["Technology", "Entrepreneurship"]
        ],
        "about": [
            "I am building a startup and looking for a co-founder.",
            "I have a business idea and want to create a team.",
            "I am interested in launching innovative products."
        ]
    },

    "exchange": {
        "roles": ["Developer", "Designer", "IT Specialist"],
        "skills": [
            ["Python", "AI", "SQL"],
            ["JavaScript", "React", "CSS"],
            ["UI/UX", "Figma", "HTML"]
        ],
        "interests": [
            ["Technology", "AI"],
            ["Robotics", "Programming"],
            ["Design", "Startups"]
        ],
        "about": [
            "I want to exchange experience with other professionals.",
            "I enjoy meeting people and sharing ideas.",
            "I want to learn new approaches from the IT community."
        ]
    }
}

goal_counts = {
    "find_job": 25,
    "hire": 20,
    "find_mentor": 20,
    "become_mentor": 20,
    "cofounder": 20,
    "exchange": 15
}

experience_levels = [
    "Beginner",
    "Less than 1 year",
    "1-3 years",
    "3-5 years",
    "5+ years"
]

participants = []
participant_id = 1

for goal, count in goal_counts.items():
    for _ in range(count):
        template = profiles[goal]

        first_name = random.choice(names)
        last_name = random.choice(surnames)

        participant = {
            "id": participant_id,
            "name": f"{first_name} {last_name}",
            "role": random.choice(template["roles"]),
            "skills": random.choice(template["skills"]),
            "experience": random.choice(experience_levels),
            "interests": random.choice(template["interests"]),
            "about": random.choice(template["about"]),
            "goal": goal
        }

        participants.append(participant)
        participant_id += 1

output_path = Path(__file__).with_name("participants.json")

with open(output_path, "w", encoding="utf-8") as file:
    json.dump(
        participants,
        file,
        ensure_ascii=False,
        indent=4
    )

print("QOSYL AI participant database created!")
print(f"Total participants: {len(participants)}")
print(f"Saved to: {output_path}")
