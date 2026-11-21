
import json
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from backend.meeting_routes import router as meeting_router
from backend.booth_routes import router as booth_router
from backend.organizer_routes import router as organizer_router
from backend.physical_routes import router as physical_router

from backend.matching import recommend_matches
from backend.database import (
    init_db,
    save_participant,
    get_participant,
    get_all_participants,
    save_feedback,
    get_feedback,
    create_connection,
    get_connection_by_id,
    accept_connection,
    get_user_connections,
    get_pending_requests,
    get_messages,
    send_message
)


app = FastAPI(
    title="QOSYL AI",
    description="AI Smart Networking Platform",
    version="2.2.0"
)
app.include_router(meeting_router)
app.include_router(booth_router)
app.include_router(organizer_router)
app.include_router(physical_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "participants.json"
FRONTEND_PATH = Path(__file__).resolve().parent.parent / "frontend"


@app.on_event("startup")
def startup():
    init_db()


class ParticipantInput(BaseModel):
    name: str
    role: str
    skills: list[str]
    experience: str
    interests: list[str]
    about: str
    goal: str
    user_id: int | None = None
    exclude_ids: list[int] | None = None


class FeedbackInput(BaseModel):
    user_id: int
    candidate_id: int
    status: str


class ConnectionRequest(BaseModel):
    user_id: int
    candidate_id: int
    initial_message: str = ""


class ConnectionAccept(BaseModel):
    connection_id: int
    user_id: int


class MessageInput(BaseModel):
    connection_id: int
    sender_id: int
    content: str


def load_participants():
    if not DATA_PATH.exists():
        raise HTTPException(
            status_code=500,
            detail="Participants database not found"
        )

    with open(DATA_PATH, "r", encoding="utf-8") as file:
        participants = json.load(file)

    demo_participants = []

    for person in participants:
        demo_person = person.copy()
        demo_person["id"] = -abs(int(person["id"]))
        demo_person["is_demo"] = True
        demo_participants.append(demo_person)

    return demo_participants


@app.get("/")
def home():
    return {
        "message": "Welcome to QOSYL AI!",
        "status": "running"
    }


@app.get("/api/health")
def health():
    return {
        "status": "OK",
        "project": "QOSYL AI",
        "version": "2.2.0"
    }


@app.get("/api/participants")
def get_participants():
    demo_participants = load_participants()
    real_participants = get_all_participants()

    for person in real_participants:
        person["is_demo"] = False

    all_participants = demo_participants + real_participants

    return {
        "total": len(all_participants),
        "demo_total": len(demo_participants),
        "real_total": len(real_participants),
        "participants": all_participants
    }


@app.post("/api/matches")
def get_matches(user: ParticipantInput):
    user_data = user.model_dump()

    exclude_ids = set(user_data.pop("exclude_ids") or [])
    existing_user_id = user_data.pop("user_id", None)

    if existing_user_id is not None:
        saved_user = get_participant(existing_user_id)

        if saved_user is None:
            raise HTTPException(
                status_code=404,
                detail="Participant not found"
            )

        user_data = saved_user
        user_id = existing_user_id

    else:
        user_id = save_participant(user_data)
        user_data["id"] = user_id

    demo_participants = load_participants()
    real_participants = get_all_participants()

    for person in real_participants:
        person["is_demo"] = False

    all_candidates = demo_participants + real_participants

    available_participants = [
        person for person in all_candidates
        if person["id"] != user_id
        and person["id"] not in exclude_ids
    ]

    matches = recommend_matches(
        user_data,
        available_participants,
        limit=5
    )

    for match in matches:
        match["is_demo"] = match["id"] < 0

    return {
        "user_id": user_id,
        "total_candidates": len(available_participants),
        "matches": matches
    }


@app.post("/api/feedback")
def submit_feedback(feedback: FeedbackInput):
    if feedback.status not in ["connected", "not_relevant"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid feedback status"
        )

    if get_participant(feedback.user_id) is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    save_feedback(
        feedback.user_id,
        feedback.candidate_id,
        feedback.status
    )

    return {
        "message": "Feedback saved successfully",
        "status": feedback.status
    }


@app.get("/api/feedback/{user_id}")
def read_feedback(user_id: int):
    return {
        "user_id": user_id,
        "feedback": get_feedback(user_id)
    }


@app.post("/api/connections/request")
def request_connection(request: ConnectionRequest):

    if request.candidate_id <= 0:
        raise HTTPException(
            status_code=400,
            detail="Demo profiles cannot receive connection requests"
        )

    if request.user_id == request.candidate_id:
        raise HTTPException(
            status_code=400,
            detail="You cannot connect with yourself"
        )

    if get_participant(request.user_id) is None:
        raise HTTPException(
            status_code=404,
            detail="Your profile was not found"
        )

    if get_participant(request.candidate_id) is None:
        raise HTTPException(
            status_code=404,
            detail="This participant is not registered"
        )

    initial_message = request.initial_message.strip()

    if len(initial_message) > 2000:
        raise HTTPException(
            status_code=400,
            detail="Initial message is too long"
        )

    connection = create_connection(
        request.user_id,
        request.candidate_id,
        initial_message
    )

    return {
        "message": "Connection request processed",
        "connection": connection
    }


@app.post("/api/connections/accept")
def accept_connection_request(request: ConnectionAccept):
    connection = get_connection_by_id(request.connection_id)

    if connection is None:
        raise HTTPException(
            status_code=404,
            detail="Connection request not found"
        )

    if connection["candidate_id"] != request.user_id:
        raise HTTPException(
            status_code=403,
            detail="You cannot accept this request"
        )

    if connection["status"] == "accepted":
        return {
            "message": "Connection already accepted",
            "status": "accepted"
        }

    success = accept_connection(
        request.connection_id,
        request.user_id
    )

    if not success:
        raise HTTPException(
            status_code=400,
            detail="Could not accept connection request"
        )

    return {
        "message": "Connection accepted successfully",
        "status": "accepted",
        "connection_id": request.connection_id
    }


@app.get("/api/connections/{user_id}")
def read_connections(user_id: int):
    if get_participant(user_id) is None:
        raise HTTPException(
            status_code=404,
            detail="Participant not found"
        )

    return {
        "user_id": user_id,
        "connections": get_user_connections(user_id)
    }


@app.get("/api/connections/pending/{user_id}")
def read_pending_requests(user_id: int):
    if get_participant(user_id) is None:
        raise HTTPException(
            status_code=404,
            detail="Participant not found"
        )

    return {
        "user_id": user_id,
        "requests": get_pending_requests(user_id)
    }


@app.get("/api/messages/{connection_id}")
def read_messages(connection_id: int, user_id: int):
    messages = get_messages(
        connection_id,
        user_id
    )

    if messages is None:
        raise HTTPException(
            status_code=403,
            detail="Chat not found or access denied"
        )

    return {
        "connection_id": connection_id,
        "messages": messages
    }


@app.post("/api/messages")
def create_message(message: MessageInput):
    content = message.content.strip()

    if not content:
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty"
        )

    if len(content) > 2000:
        raise HTTPException(
            status_code=400,
            detail="Message is too long"
        )

    saved_message = send_message(
        message.connection_id,
        message.sender_id,
        content
    )

    if saved_message is None:
        raise HTTPException(
            status_code=403,
            detail="Chat not found, not accepted, or access denied"
        )

    return {
        "message": "Message sent successfully",
        "data": saved_message
    }

STATIC_PATH = FRONTEND_PATH / "assets"

app.mount(
    "/static",
    StaticFiles(directory=STATIC_PATH),
    name="static"
)

app.mount(
    "/site",
    StaticFiles(directory=FRONTEND_PATH, html=True),
    name="site"
)
