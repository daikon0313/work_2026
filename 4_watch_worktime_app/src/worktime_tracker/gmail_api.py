"""Gmail API integration module for sending daily work summary emails."""

import base64
from email.mime.text import MIMEText
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# OAuth 2.0 scopes for Gmail (send only)
SCOPES = [
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/gmail.send",
]

# Paths for credentials
APP_DIR = Path.home() / ".worktime_tracker"
CREDENTIALS_FILE = APP_DIR / "credentials.json"
TOKEN_FILE = APP_DIR / "token.json"


class GmailAPI:
    """Handles Gmail API operations."""

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
        """Get or create Gmail service."""
        if self._service is None:
            creds = self._get_credentials()
            if creds:
                self._service = build("gmail", "v1", credentials=creds)
        return self._service

    def send_email(
        self,
        to: str,
        subject: str,
        body: str,
    ) -> tuple[bool, str]:
        """Send an email.

        Args:
            to: Recipient email address
            subject: Email subject
            body: Email body (plain text)

        Returns:
            Tuple of (success: bool, message: str)
        """
        try:
            service = self._get_service()
            if not service:
                return False, "Failed to get Gmail service"

            # Create message
            message = MIMEText(body)
            message["To"] = to
            message["Subject"] = subject

            # Encode message
            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()

            # Send email
            send_message = service.users().messages().send(
                userId="me",
                body={"raw": raw_message}
            ).execute()

            return True, f"Message sent successfully (ID: {send_message['id']})"
        except HttpError as error:
            error_msg = f"HTTP Error: {error.status_code} - {error.reason}"
            print(error_msg)
            return False, error_msg
        except Exception as error:
            error_msg = f"Error: {str(error)}"
            print(error_msg)
            return False, error_msg
