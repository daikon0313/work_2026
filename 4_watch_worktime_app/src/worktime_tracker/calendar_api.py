"""Google Calendar API integration module."""

import os
from datetime import datetime
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
    ) -> bool:
        """Create a calendar event.

        Args:
            summary: Event title
            description: Event description
            start_time: Event start time
            end_time: Event end time
            calendar_id: Calendar ID (default: primary)

        Returns:
            True if event was created successfully, False otherwise
        """
        service = self._get_service()
        if not service:
            return False

        # Get local timezone
        local_tz = datetime.now().astimezone().tzinfo

        event = {
            "summary": summary,
            "description": description,
            "start": {
                "dateTime": start_time.astimezone(local_tz).isoformat(),
                "timeZone": str(local_tz),
            },
            "end": {
                "dateTime": end_time.astimezone(local_tz).isoformat(),
                "timeZone": str(local_tz),
            },
        }

        try:
            service.events().insert(calendarId=calendar_id, body=event).execute()
            return True
        except HttpError as error:
            print(f"Error creating calendar event: {error}")
            return False
