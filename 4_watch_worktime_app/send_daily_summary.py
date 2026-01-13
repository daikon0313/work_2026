#!/usr/bin/env python3
"""Standalone script to send daily work summary email.

This script is designed to run in GitHub Actions or other CI/CD environments.
It reads credentials from environment variables or files and sends a summary email.
"""

import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

# Add src directory to path
sys.path.insert(0, 'src')

from worktime_tracker.email_summary import DailySummaryEmailer


def load_credentials_from_env():
    """Load Google API credentials from environment variables.

    Expected environment variables:
    - GOOGLE_CREDENTIALS_JSON: Base64-encoded credentials.json content
    - GOOGLE_TOKEN_JSON: Base64-encoded token.json content (if available)
    """
    import base64

    # Create credentials directory
    creds_dir = Path.home() / ".worktime_tracker"
    creds_dir.mkdir(parents=True, exist_ok=True)

    # Load credentials.json
    credentials_b64 = os.environ.get("GOOGLE_CREDENTIALS_JSON")
    if credentials_b64:
        credentials_json = base64.b64decode(credentials_b64).decode("utf-8")
        with open(creds_dir / "credentials.json", "w") as f:
            f.write(credentials_json)
        print("Loaded credentials.json from environment variable")

    # Load token.json if available
    token_b64 = os.environ.get("GOOGLE_TOKEN_JSON")
    if token_b64:
        token_json = base64.b64decode(token_b64).decode("utf-8")
        with open(creds_dir / "token.json", "w") as f:
            f.write(token_json)
        print("Loaded token.json from environment variable")


def main():
    """Send daily work summary email."""
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Starting daily summary email job...")

    # Get email recipient from environment variable
    email_recipient = os.environ.get("EMAIL_RECIPIENT")

    if not email_recipient:
        print("ERROR: EMAIL_RECIPIENT environment variable is not set.")
        sys.exit(1)

    # Load credentials from environment if available
    if os.environ.get("GOOGLE_CREDENTIALS_JSON"):
        load_credentials_from_env()

    # Create emailer and send summary
    emailer = DailySummaryEmailer()
    yesterday = datetime.now() - timedelta(days=1)

    print(f"Sending summary for {yesterday.strftime('%Y-%m-%d')} to {email_recipient}...")

    try:
        success, message = emailer.send_yesterday_summary(email_recipient)

        if success:
            print(f"✓ Email sent successfully!")
            print(f"  {message}")
            sys.exit(0)
        else:
            print(f"✗ Failed to send email")
            print(f"  {message}")
            sys.exit(1)
    except Exception as error:
        print(f"✗ Error: {str(error)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
