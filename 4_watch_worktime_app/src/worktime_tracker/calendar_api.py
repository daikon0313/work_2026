"""Google Calendar API integration module."""

import os
from datetime import datetime, timedelta
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# OAuth 2.0 scopes for Google Calendar
SCOPES = ["https://www.googleapis.com/auth/calendar.events"]

# Paths for credentials
APP_DIR = Path.home() / ".worktime_tracker"
CREDENTIALS_FILE = APP_DIR / "credentials.json"
TOKEN_FILE = APP_DIR / "token.json"


class GoogleCalendarAPI:
    """Handles Google Calendar API operations."""

    def __init__(self):
        self._service = None

    def _get_credentials(self) -> Credentials | None:
        """Get or refresh OAuth credentials."""
        creds = None

        # Check for existing token
        if TOKEN_FILE.exists():
            creds = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)

        # Refresh or get new credentials if needed
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                if not CREDENTIALS_FILE.exists():
                    print(f"Error: credentials.json not found at {CREDENTIALS_FILE}")
                    print("Please download OAuth credentials from Google Cloud Console")
                    return None

                flow = InstalledAppFlow.from_client_secrets_file(
                    str(CREDENTIALS_FILE), SCOPES
                )
                creds = flow.run_local_server(port=0)

            # Save credentials for next run
            APP_DIR.mkdir(parents=True, exist_ok=True)
            with open(TOKEN_FILE, "w") as token:
                token.write(creds.to_json())

        return creds

    def _get_service(self):
        """Get or create Google Calendar service."""
        if self._service is None:
            creds = self._get_credentials()
            if creds:
                self._service = build("calendar", "v3", credentials=creds)
        return self._service

    def create_event(
        self,
        summary: str,
        description: str,
        start_time: datetime,
        end_time: datetime,
        calendar_id: str = "primary",
    ) -> tuple[bool, str]:
        """Create a calendar event.

        Args:
            summary: Event title
            description: Event description
            start_time: Event start time
            end_time: Event end time
            calendar_id: Calendar ID (default: primary)

        Returns:
            Tuple of (success: bool, message: str)
        """
        try:
            service = self._get_service()
            if not service:
                return False, "Failed to get Google Calendar service"

            # Get local timezone
            local_tz = datetime.now().astimezone().tzinfo

            # Ensure datetime objects have timezone info
            if start_time.tzinfo is None:
                start_time = start_time.replace(tzinfo=local_tz)
            if end_time.tzinfo is None:
                end_time = end_time.replace(tzinfo=local_tz)

            event = {
                "summary": summary,
                "description": description,
                "start": {
                    "dateTime": start_time.isoformat(),
                    "timeZone": str(local_tz),
                },
                "end": {
                    "dateTime": end_time.isoformat(),
                    "timeZone": str(local_tz),
                },
                "colorId": "10",  # Green color for worktime tracker events
            }

            result = service.events().insert(calendarId=calendar_id, body=event).execute()
            return True, f"Event created: {result.get('htmlLink', '')}"
        except HttpError as error:
            error_msg = f"HTTP Error: {error.status_code} - {error.reason}"
            print(error_msg)
            return False, error_msg
        except Exception as error:
            error_msg = f"Error: {str(error)}"
            print(error_msg)
            return False, error_msg

    def get_events_for_date(
        self,
        date: datetime,
        color_id: str | None = None,
        calendar_id: str = "primary",
    ) -> list[dict]:
        """Get events for a specific date.

        Args:
            date: Target date
            color_id: Filter by color ID (optional)
            calendar_id: Calendar ID (default: primary)

        Returns:
            List of events
        """
        try:
            service = self._get_service()
            if not service:
                return []

            # Get start and end of the day
            start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
            end_of_day = start_of_day + timedelta(days=1)

            # Get local timezone
            local_tz = datetime.now().astimezone().tzinfo
            if start_of_day.tzinfo is None:
                start_of_day = start_of_day.replace(tzinfo=local_tz)
            if end_of_day.tzinfo is None:
                end_of_day = end_of_day.replace(tzinfo=local_tz)

            events_result = (
                service.events()
                .list(
                    calendarId=calendar_id,
                    timeMin=start_of_day.isoformat(),
                    timeMax=end_of_day.isoformat(),
                    singleEvents=True,
                    orderBy="startTime",
                )
                .execute()
            )

            events = events_result.get("items", [])
            print(f"[DEBUG] Total events found: {len(events)}")

            # Debug: print color IDs
            for event in events:
                print(f"[DEBUG] Event: {event.get('summary', 'No title')} - colorId: {event.get('colorId', 'None')}")

            # Filter by color if specified
            if color_id:
                events = [e for e in events if e.get("colorId") == color_id]
                print(f"[DEBUG] After color filter (colorId={color_id}): {len(events)} events")

            return events
        except Exception as error:
            print(f"Error getting events: {str(error)}")
            return []

    def calculate_total_duration(self, events: list[dict]) -> timedelta:
        """Calculate total duration from a list of events.

        Args:
            events: List of event dictionaries

        Returns:
            Total duration as timedelta
        """
        total = timedelta()

        for event in events:
            start = event.get("start", {})
            end = event.get("end", {})

            # Skip all-day events
            if "date" in start or "date" in end:
                continue

            try:
                start_dt = datetime.fromisoformat(start.get("dateTime", ""))
                end_dt = datetime.fromisoformat(end.get("dateTime", ""))
                total += end_dt - start_dt
            except Exception:
                continue

        return total

    def create_or_update_daily_summary(
        self,
        date: datetime,
        calendar_id: str = "primary",
    ) -> tuple[bool, str]:
        """Create or update daily work time summary as an all-day event.

        Args:
            date: Target date
            calendar_id: Calendar ID (default: primary)

        Returns:
            Tuple of (success: bool, message: str)
        """
        try:
            service = self._get_service()
            if not service:
                return False, "Failed to get Google Calendar service"

            # Get all green events (worktime tracker events) for the date
            green_events = self.get_events_for_date(date, color_id="10", calendar_id=calendar_id)
            print(f"[DEBUG] Found {len(green_events)} green events for {date.strftime('%Y-%m-%d')}")

            # Calculate total duration
            total_duration = self.calculate_total_duration(green_events)
            print(f"[DEBUG] Total duration: {total_duration}")

            # Format duration
            total_seconds = int(total_duration.total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60

            # Summary title with identifier
            summary_prefix = "📊 本日の作業時間: "
            summary_title = f"{summary_prefix}{hours}時間{minutes:02d}分"
            print(f"[DEBUG] Summary title: {summary_title}")

            # Get date string for all-day event
            date_str = date.strftime("%Y-%m-%d")

            # Check if summary event already exists
            all_events = self.get_events_for_date(date, calendar_id=calendar_id)
            existing_summary = None
            for event in all_events:
                if event.get("summary", "").startswith(summary_prefix):
                    existing_summary = event
                    break

            summary_event = {
                "summary": summary_title,
                "start": {"date": date_str},
                "end": {"date": date_str},
                "colorId": "8",  # Gray color
                "description": f"作業時間の集計 ({len(green_events)}件のタスク)",
            }

            if existing_summary:
                # Update existing summary
                result = (
                    service.events()
                    .update(
                        calendarId=calendar_id,
                        eventId=existing_summary["id"],
                        body=summary_event,
                    )
                    .execute()
                )
                return True, f"Daily summary updated: {summary_title}"
            else:
                # Create new summary
                result = (
                    service.events()
                    .insert(calendarId=calendar_id, body=summary_event)
                    .execute()
                )
                return True, f"Daily summary created: {summary_title}"
        except HttpError as error:
            error_msg = f"HTTP Error: {error.status_code} - {error.reason}"
            print(error_msg)
            return False, error_msg
        except Exception as error:
            error_msg = f"Error: {str(error)}"
            print(error_msg)
            return False, error_msg
