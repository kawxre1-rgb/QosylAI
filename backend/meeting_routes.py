from datetime import datetime
from typing import List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from backend.database import (
    get_participant,
    save_availability,
    get_availability,
    delete_availability,
    get_common_availability,
    create_meeting_request,
    get_meeting_by_id,
    update_meeting_status,
    get_user_meetings,
    get_pending_meetings,
)

router = APIRouter(prefix="/api", tags=["Meeting Scheduler"])


class AvailabilitySlot(BaseModel):
    start_time: str
    end_time: str


class AvailabilityInput(BaseModel):
    user_id: int
    slots: List[AvailabilitySlot] = Field(default_factory=list)


class MeetingInput(BaseModel):
    requester_id: int
    recipient_id: int
    start_time: str
    end_time: str
    message: str = ""


class MeetingStatusInput(BaseModel):
    meeting_id: int
    user_id: int
    status: str


def validate_interval(start_time: str, end_time: str):
    try:
        start = datetime.fromisoformat(start_time)
        end = datetime.fromisoformat(end_time)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=422,
            detail="Invalid date/time format"
        )

    if start >= end:
        raise HTTPException(
            status_code=422,
            detail="End time must be after start time"
        )


@router.post("/availability")
def api_save_availability(payload: AvailabilityInput):
    if not get_participant(payload.user_id):
        raise HTTPException(
            status_code=404,
            detail="Participant not found"
        )

    clean_slots = []

    for slot in payload.slots:
        validate_interval(
            slot.start_time,
            slot.end_time
        )

        clean_slots.append({
            "start_time": slot.start_time,
            "end_time": slot.end_time
        })

    saved = save_availability(
        payload.user_id,
        clean_slots
    )

    return {
        "user_id": payload.user_id,
        "slots": saved
    }


@router.get("/availability/{user_id}")
def api_get_availability(user_id: int):
    if not get_participant(user_id):
        raise HTTPException(
            status_code=404,
            detail="Participant not found"
        )

    return {
        "user_id": user_id,
        "slots": get_availability(user_id)
    }


@router.delete("/availability/{user_id}/{slot_id}")
def api_delete_availability(user_id: int, slot_id: int):
    if not get_participant(user_id):
        raise HTTPException(
            status_code=404,
            detail="Participant not found"
        )

    if not delete_availability(user_id, slot_id):
        raise HTTPException(
            status_code=404,
            detail="Availability slot not found"
        )

    return {
        "message": "Availability slot deleted"
    }


@router.get("/availability/{user_id}/common/{other_user_id}")
def api_get_common_availability(user_id: int, other_user_id: int):
    if (
        not get_participant(user_id)
        or not get_participant(other_user_id)
    ):
        raise HTTPException(
            status_code=404,
            detail="Participant not found"
        )

    return {
        "user_id": user_id,
        "other_user_id": other_user_id,
        "common_slots": get_common_availability(
            user_id,
            other_user_id
        )
    }


@router.post("/meetings")
def api_create_meeting(payload: MeetingInput):
    validate_interval(
        payload.start_time,
        payload.end_time
    )

    try:
        meeting = create_meeting_request(
            payload.requester_id,
            payload.recipient_id,
            payload.start_time,
            payload.end_time,
            payload.message.strip()
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    return {
        "message": "Meeting request created",
        "meeting": meeting
    }


@router.get("/meetings/pending/{user_id}")
def api_get_pending_meetings(user_id: int):
    if not get_participant(user_id):
        raise HTTPException(
            status_code=404,
            detail="Participant not found"
        )

    return {
        "user_id": user_id,
        "pending_meetings": get_pending_meetings(user_id)
    }


@router.get("/meetings/{user_id}")
def api_get_user_meetings(user_id: int):
    if not get_participant(user_id):
        raise HTTPException(
            status_code=404,
            detail="Participant not found"
        )

    return {
        "user_id": user_id,
        "meetings": get_user_meetings(user_id)
    }


@router.post("/meetings/status")
def api_update_meeting_status(payload: MeetingStatusInput):
    meeting = get_meeting_by_id(payload.meeting_id)

    if not meeting:
        raise HTTPException(
            status_code=404,
            detail="Meeting not found"
        )

    if payload.status not in (
        "accepted",
        "rejected",
        "cancelled"
    ):
        raise HTTPException(
            status_code=422,
            detail="Invalid meeting status"
        )

    if not update_meeting_status(
        payload.meeting_id,
        payload.user_id,
        payload.status
    ):
        raise HTTPException(
            status_code=403,
            detail="You cannot change this meeting status"
        )

    return {
        "message": "Meeting status updated",
        "status": payload.status
    }
    