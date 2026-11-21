
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "qosyl.db"


def get_connection():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def init_db():
    with get_connection() as db:
        db.execute("""
            CREATE TABLE IF NOT EXISTS participants (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                role TEXT NOT NULL,
                skills TEXT NOT NULL,
                experience TEXT NOT NULL,
                interests TEXT NOT NULL,
                about TEXT NOT NULL,
                goal TEXT NOT NULL
            )
        """)

        db.execute("""
            CREATE TABLE IF NOT EXISTS feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                candidate_id INTEGER NOT NULL,
                status TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        db.execute("""
            CREATE TABLE IF NOT EXISTS connections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                candidate_id INTEGER NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        connection_columns = [
            row["name"]
            for row in db.execute(
                "PRAGMA table_info(connections)"
            ).fetchall()
        ]

        if "status" not in connection_columns:
            db.execute("""
                ALTER TABLE connections
                ADD COLUMN status TEXT NOT NULL DEFAULT 'pending'
            """)

        if "updated_at" not in connection_columns:
            db.execute("""
                ALTER TABLE connections
                ADD COLUMN updated_at TIMESTAMP
            """)

        db.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                connection_id INTEGER NOT NULL,
                sender_id INTEGER NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (connection_id)
                    REFERENCES connections(id)
            )
        """)

        db.execute("""
            CREATE INDEX IF NOT EXISTS idx_messages_connection
            ON messages(connection_id, id)
        """)

        db.execute("""
            CREATE INDEX IF NOT EXISTS idx_connections_users
            ON connections(user_id, candidate_id, status)
        """)

        db.execute("""
            CREATE TABLE IF NOT EXISTS availability (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                start_time TEXT NOT NULL,
                end_time TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, start_time, end_time)
            )
        """)

        db.execute("""
            CREATE INDEX IF NOT EXISTS idx_availability_user
            ON availability(user_id, start_time)
        """)

        db.execute("""
            CREATE TABLE IF NOT EXISTS meetings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                requester_id INTEGER NOT NULL,
                recipient_id INTEGER NOT NULL,
                start_time TEXT NOT NULL,
                end_time TEXT NOT NULL,
                message TEXT DEFAULT '',
                status TEXT NOT NULL DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        db.execute("""
            CREATE INDEX IF NOT EXISTS idx_meetings_users
            ON meetings(requester_id, recipient_id, status)
        """)


def save_participant(participant):
    with get_connection() as db:
        cursor = db.execute("""
            INSERT INTO participants
            (name, role, skills, experience, interests, about, goal)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            participant["name"],
            participant["role"],
            ",".join(participant["skills"]),
            participant["experience"],
            ",".join(participant["interests"]),
            participant["about"],
            participant["goal"]
        ))

        return cursor.lastrowid


def get_participant(user_id):
    with get_connection() as db:
        row = db.execute("""
            SELECT * FROM participants
            WHERE id = ?
        """, (user_id,)).fetchone()

        if row is None:
            return None

        participant = dict(row)

        participant["skills"] = (
            participant["skills"].split(",")
            if participant["skills"] else []
        )

        participant["interests"] = (
            participant["interests"].split(",")
            if participant["interests"] else []
        )

        return participant


def get_all_participants():
    with get_connection() as db:
        rows = db.execute("""
            SELECT * FROM participants
            ORDER BY id DESC
        """).fetchall()

        participants = []

        for row in rows:
            participant = dict(row)

            participant["skills"] = (
                participant["skills"].split(",")
                if participant["skills"] else []
            )

            participant["interests"] = (
                participant["interests"].split(",")
                if participant["interests"] else []
            )

            participants.append(participant)

        return participants


def save_feedback(user_id, candidate_id, status):
    with get_connection() as db:
        db.execute("""
            INSERT INTO feedback (user_id, candidate_id, status)
            VALUES (?, ?, ?)
        """, (user_id, candidate_id, status))


def get_feedback(user_id):
    with get_connection() as db:
        rows = db.execute("""
            SELECT candidate_id, status, created_at
            FROM feedback
            WHERE user_id = ?
            ORDER BY id DESC
        """, (user_id,)).fetchall()

        return [dict(row) for row in rows]


def create_connection(user_id, candidate_id, initial_message=""):
    if user_id == candidate_id:
        raise ValueError("You cannot connect with yourself")

    with get_connection() as db:
        existing = db.execute("""
            SELECT * FROM connections
            WHERE
                (user_id = ? AND candidate_id = ?)
                OR
                (user_id = ? AND candidate_id = ?)
            ORDER BY id DESC
            LIMIT 1
        """, (
            user_id,
            candidate_id,
            candidate_id,
            user_id
        )).fetchone()

        if existing:
            return dict(existing)

        cursor = db.execute("""
            INSERT INTO connections
            (user_id, candidate_id, status)
            VALUES (?, ?, 'pending')
        """, (user_id, candidate_id))

        connection_id = cursor.lastrowid

        if initial_message and initial_message.strip():
            db.execute("""
                INSERT INTO messages
                (connection_id, sender_id, content)
                VALUES (?, ?, ?)
            """, (
                connection_id,
                user_id,
                initial_message.strip()
            ))

        row = db.execute("""
            SELECT * FROM connections
            WHERE id = ?
        """, (connection_id,)).fetchone()

        return dict(row)


def get_connection_by_id(connection_id):
    with get_connection() as db:
        row = db.execute("""
            SELECT * FROM connections
            WHERE id = ?
        """, (connection_id,)).fetchone()

        return dict(row) if row else None


def accept_connection(connection_id, user_id):
    with get_connection() as db:
        cursor = db.execute("""
            UPDATE connections
            SET status = 'accepted',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
              AND candidate_id = ?
              AND status = 'pending'
        """, (connection_id, user_id))

        return cursor.rowcount > 0


def get_user_connections(user_id):
    with get_connection() as db:
        rows = db.execute("""
            SELECT
                c.id AS connection_id,
                c.user_id,
                c.candidate_id,
                c.status,
                c.created_at,
                CASE
                    WHEN c.user_id = ? THEN c.candidate_id
                    ELSE c.user_id
                END AS other_user_id,
                p.name AS other_name,
                p.role AS other_role
            FROM connections c
            JOIN participants p
              ON p.id = CASE
                  WHEN c.user_id = ? THEN c.candidate_id
                  ELSE c.user_id
              END
            WHERE
                (c.user_id = ? OR c.candidate_id = ?)
                AND c.status = 'accepted'
            ORDER BY c.updated_at DESC, c.id DESC
        """, (
            user_id,
            user_id,
            user_id,
            user_id
        )).fetchall()

        return [dict(row) for row in rows]


def get_pending_requests(user_id):
    with get_connection() as db:
        rows = db.execute("""
            SELECT
                c.id AS connection_id,
                c.user_id,
                c.candidate_id,
                c.created_at,
                p.name,
                p.role,
                (
                    SELECT m.content
                    FROM messages m
                    WHERE m.connection_id = c.id
                    ORDER BY m.id ASC
                    LIMIT 1
                ) AS initial_message
            FROM connections c
            JOIN participants p
              ON p.id = c.user_id
            WHERE c.candidate_id = ?
              AND c.status = 'pending'
            ORDER BY c.id DESC
        """, (user_id,)).fetchall()

        return [dict(row) for row in rows]


def get_messages(connection_id, user_id):
    with get_connection() as db:
        connection = db.execute("""
            SELECT * FROM connections
            WHERE id = ?
              AND status = 'accepted'
              AND (user_id = ? OR candidate_id = ?)
        """, (
            connection_id,
            user_id,
            user_id
        )).fetchone()

        if not connection:
            return None

        rows = db.execute("""
            SELECT
                id,
                connection_id,
                sender_id,
                content,
                created_at
            FROM messages
            WHERE connection_id = ?
            ORDER BY id ASC
        """, (connection_id,)).fetchall()

        return [dict(row) for row in rows]


def send_message(connection_id, sender_id, content):
    with get_connection() as db:
        connection = db.execute("""
            SELECT * FROM connections
            WHERE id = ?
              AND status = 'accepted'
              AND (user_id = ? OR candidate_id = ?)
        """, (
            connection_id,
            sender_id,
            sender_id
        )).fetchone()

        if not connection:
            return None

        cursor = db.execute("""
            INSERT INTO messages
            (connection_id, sender_id, content)
            VALUES (?, ?, ?)
        """, (
            connection_id,
            sender_id,
            content
        ))

        row = db.execute("""
            SELECT
                id,
                connection_id,
                sender_id,
                content,
                created_at
            FROM messages
            WHERE id = ?
        """, (cursor.lastrowid,)).fetchone()

        return dict(row)


# MEETING SCHEDULER


# MEETING SCHEDULER


def save_availability(user_id, slots):
    with get_connection() as db:
        db.execute("""
            DELETE FROM availability
            WHERE user_id = ?
        """, (user_id,))

        saved_slots = []

        for slot in slots:
            start_time = slot["start_time"]
            end_time = slot["end_time"]

            cursor = db.execute("""
                INSERT INTO availability
                (user_id, start_time, end_time)
                VALUES (?, ?, ?)
            """, (
                user_id,
                start_time,
                end_time
            ))

            saved_slots.append({
                "id": cursor.lastrowid,
                "user_id": user_id,
                "start_time": start_time,
                "end_time": end_time
            })

        return saved_slots


def get_availability(user_id):
    with get_connection() as db:
        rows = db.execute("""
            SELECT id, user_id, start_time, end_time
            FROM availability
            WHERE user_id = ?
            ORDER BY start_time ASC
        """, (user_id,)).fetchall()

        return [dict(row) for row in rows]


def delete_availability(user_id, slot_id):
    with get_connection() as db:
        cursor = db.execute("""
            DELETE FROM availability
            WHERE id = ? AND user_id = ?
        """, (slot_id, user_id))

        return cursor.rowcount > 0


def _parse_availability_time(value):
    from datetime import datetime

    try:
        return datetime.fromisoformat(value)
    except (TypeError, ValueError):
        raise ValueError("Invalid availability date/time format")


def _merge_time_intervals(rows):
    intervals = sorted(
        (
            _parse_availability_time(row["start_time"]),
            _parse_availability_time(row["end_time"])
        )
        for row in rows
    )

    merged = []

    for start, end in intervals:
        if end <= start:
            continue

        if merged and start <= merged[-1][1]:
            merged[-1] = (
                merged[-1][0],
                max(merged[-1][1], end)
            )
        else:
            merged.append((start, end))

    return merged


def get_common_availability(user_id, other_user_id):
    with get_connection() as db:
        user_rows = db.execute("""
            SELECT start_time, end_time
            FROM availability
            WHERE user_id = ?
            ORDER BY start_time ASC
        """, (user_id,)).fetchall()

        other_rows = db.execute("""
            SELECT start_time, end_time
            FROM availability
            WHERE user_id = ?
            ORDER BY start_time ASC
        """, (other_user_id,)).fetchall()

    user_intervals = _merge_time_intervals(user_rows)
    other_intervals = _merge_time_intervals(other_rows)

    common = []

    i = 0
    j = 0

    while (
        i < len(user_intervals)
        and j < len(other_intervals)
    ):
        start = max(
            user_intervals[i][0],
            other_intervals[j][0]
        )

        end = min(
            user_intervals[i][1],
            other_intervals[j][1]
        )

        if start < end:
            common.append({
                "start_time": start.isoformat(timespec="minutes"),
                "end_time": end.isoformat(timespec="minutes")
            })

        if user_intervals[i][1] < other_intervals[j][1]:
            i += 1
        else:
            j += 1

    return common


def create_meeting_request(
    requester_id,
    recipient_id,
    start_time,
    end_time,
    message=""
):
    if requester_id == recipient_id:
        raise ValueError(
            "You cannot schedule a meeting with yourself"
        )

    requested_start = _parse_availability_time(start_time)
    requested_end = _parse_availability_time(end_time)

    if requested_start >= requested_end:
        raise ValueError(
            "Meeting end time must be after start time"
        )

    with get_connection() as db:
        requester = db.execute("""
            SELECT id FROM participants
            WHERE id = ?
        """, (requester_id,)).fetchone()

        recipient = db.execute("""
            SELECT id FROM participants
            WHERE id = ?
        """, (recipient_id,)).fetchone()

        if not requester or not recipient:
            raise ValueError("Participant not found")

        requester_rows = db.execute("""
            SELECT start_time, end_time
            FROM availability
            WHERE user_id = ?
        """, (requester_id,)).fetchall()

        recipient_rows = db.execute("""
            SELECT start_time, end_time
            FROM availability
            WHERE user_id = ?
        """, (recipient_id,)).fetchall()

        def contains_requested_interval(rows):
            for slot_start, slot_end in _merge_time_intervals(rows):
                if (
                    slot_start <= requested_start
                    and slot_end >= requested_end
                ):
                    return True

            return False

        if not contains_requested_interval(requester_rows):
            raise ValueError(
                "You are not available at this time"
            )

        if not contains_requested_interval(recipient_rows):
            raise ValueError(
                "Recipient is not available at this time"
            )

        cursor = db.execute("""
            INSERT INTO meetings
            (
                requester_id,
                recipient_id,
                start_time,
                end_time,
                message,
                status
            )
            VALUES (?, ?, ?, ?, ?, 'pending')
        """, (
            requester_id,
            recipient_id,
            start_time,
            end_time,
            message
        ))

        row = db.execute("""
            SELECT * FROM meetings
            WHERE id = ?
        """, (cursor.lastrowid,)).fetchone()

        return dict(row)


def get_meeting_by_id(meeting_id):
    with get_connection() as db:
        row = db.execute("""
            SELECT * FROM meetings
            WHERE id = ?
        """, (meeting_id,)).fetchone()

        return dict(row) if row else None


def update_meeting_status(meeting_id, user_id, status):
    if status not in (
        "accepted",
        "rejected",
        "cancelled"
    ):
        raise ValueError("Invalid meeting status")

    with get_connection() as db:
        meeting = db.execute("""
            SELECT * FROM meetings
            WHERE id = ?
        """, (meeting_id,)).fetchone()

        if not meeting:
            return False

        if status in ("accepted", "rejected"):
            if meeting["recipient_id"] != user_id:
                return False

            if meeting["status"] != "pending":
                return False

        elif status == "cancelled":
            if user_id not in (
                meeting["requester_id"],
                meeting["recipient_id"]
            ):
                return False

            if meeting["status"] not in (
                "pending",
                "accepted"
            ):
                return False

        cursor = db.execute("""
            UPDATE meetings
            SET status = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (status, meeting_id))

        return cursor.rowcount > 0


def get_user_meetings(user_id):
    with get_connection() as db:
        rows = db.execute("""
            SELECT
                m.*,
                requester.name AS requester_name,
                requester.role AS requester_role,
                recipient.name AS recipient_name,
                recipient.role AS recipient_role
            FROM meetings m
            JOIN participants requester
              ON requester.id = m.requester_id
            JOIN participants recipient
              ON recipient.id = m.recipient_id
            WHERE m.requester_id = ?
               OR m.recipient_id = ?
            ORDER BY m.start_time ASC, m.id DESC
        """, (user_id, user_id)).fetchall()

        return [dict(row) for row in rows]


def get_pending_meetings(user_id):
    with get_connection() as db:
        rows = db.execute("""
            SELECT
                m.*,
                p.name AS requester_name,
                p.role AS requester_role
            FROM meetings m
            JOIN participants p
              ON p.id = m.requester_id
            WHERE m.recipient_id = ?
              AND m.status = 'pending'
            ORDER BY m.start_time ASC
        """, (user_id,)).fetchall()

        return [dict(row) for row in rows]


def get_availability(user_id):
    with get_connection() as db:
        rows = db.execute("""
            SELECT id, user_id, start_time, end_time
            FROM availability
            WHERE user_id = ?
            ORDER BY start_time ASC
        """, (user_id,)).fetchall()

        return [dict(row) for row in rows]


def delete_availability(user_id, slot_id):
    with get_connection() as db:
        cursor = db.execute("""
            DELETE FROM availability
            WHERE id = ? AND user_id = ?
        """, (slot_id, user_id))

        return cursor.rowcount > 0


def get_common_availability(user_id, other_user_id):
    with get_connection() as db:
        rows = db.execute("""
            SELECT
                a.start_time,
                a.end_time
            FROM availability a
            JOIN availability b
              ON a.start_time = b.start_time
             AND a.end_time = b.end_time
            WHERE a.user_id = ?
              AND b.user_id = ?
            ORDER BY a.start_time ASC
        """, (user_id, other_user_id)).fetchall()

        return [dict(row) for row in rows]


def create_meeting_request(
    requester_id,
    recipient_id,
    start_time,
    end_time,
    message=""
):
    if requester_id == recipient_id:
        raise ValueError("You cannot schedule a meeting with yourself")

    with get_connection() as db:
        requester = db.execute("""
            SELECT id FROM participants WHERE id = ?
        """, (requester_id,)).fetchone()

        recipient = db.execute("""
            SELECT id FROM participants WHERE id = ?
        """, (recipient_id,)).fetchone()

        if not requester or not recipient:
            raise ValueError("Participant not found")

        common_slot = db.execute("""
            SELECT id FROM availability
            WHERE user_id = ?
              AND start_time = ?
              AND end_time = ?
        """, (
            recipient_id,
            start_time,
            end_time
        )).fetchone()

        if not common_slot:
            raise ValueError("Recipient is not available at this time")

        cursor = db.execute("""
            INSERT INTO meetings
            (
                requester_id,
                recipient_id,
                start_time,
                end_time,
                message,
                status
            )
            VALUES (?, ?, ?, ?, ?, 'pending')
        """, (
            requester_id,
            recipient_id,
            start_time,
            end_time,
            message
        ))

        row = db.execute("""
            SELECT * FROM meetings
            WHERE id = ?
        """, (cursor.lastrowid,)).fetchone()

        return dict(row)


def get_meeting_by_id(meeting_id):
    with get_connection() as db:
        row = db.execute("""
            SELECT * FROM meetings
            WHERE id = ?
        """, (meeting_id,)).fetchone()

        return dict(row) if row else None


def update_meeting_status(meeting_id, user_id, status):
    if status not in ("accepted", "rejected", "cancelled"):
        raise ValueError("Invalid meeting status")

    with get_connection() as db:
        meeting = db.execute("""
            SELECT * FROM meetings
            WHERE id = ?
        """, (meeting_id,)).fetchone()

        if not meeting:
            return False

        if status in ("accepted", "rejected"):
            if meeting["recipient_id"] != user_id:
                return False

            if meeting["status"] != "pending":
                return False

        elif status == "cancelled":
            if user_id not in (
                meeting["requester_id"],
                meeting["recipient_id"]
            ):
                return False

            if meeting["status"] not in ("pending", "accepted"):
                return False

        cursor = db.execute("""
            UPDATE meetings
            SET status = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (status, meeting_id))

        return cursor.rowcount > 0


def get_user_meetings(user_id):
    with get_connection() as db:
        rows = db.execute("""
            SELECT
                m.*,
                requester.name AS requester_name,
                requester.role AS requester_role,
                recipient.name AS recipient_name,
                recipient.role AS recipient_role
            FROM meetings m
            JOIN participants requester
              ON requester.id = m.requester_id
            JOIN participants recipient
              ON recipient.id = m.recipient_id
            WHERE m.requester_id = ?
               OR m.recipient_id = ?
            ORDER BY m.start_time ASC, m.id DESC
        """, (user_id, user_id)).fetchall()

        return [dict(row) for row in rows]


def get_pending_meetings(user_id):
    with get_connection() as db:
        rows = db.execute("""
            SELECT
                m.*,
                p.name AS requester_name,
                p.role AS requester_role
            FROM meetings m
            JOIN participants p
              ON p.id = m.requester_id
            WHERE m.recipient_id = ?
              AND m.status = 'pending'
            ORDER BY m.start_time ASC
        """, (user_id,)).fetchall()

        return [dict(row) for row in rows]
