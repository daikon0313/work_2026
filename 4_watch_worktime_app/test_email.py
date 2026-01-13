"""Test script for email summary functionality."""

import os
import sys
from datetime import datetime, timedelta

# Add src directory to path
sys.path.insert(0, 'src')

from worktime_tracker.email_summary import DailySummaryEmailer


def main():
    """Test email summary functionality."""
    # Get email recipient from environment variable
    email_recipient = os.environ.get("EMAIL_RECIPIENT")

    if not email_recipient:
        print("ERROR: EMAIL_RECIPIENT environment variable is not set.")
        print("Please set it before running this script:")
        print("  export EMAIL_RECIPIENT=your.email@example.com")
        sys.exit(1)

    emailer = DailySummaryEmailer()

    # Test with yesterday's date
    yesterday = datetime.now() - timedelta(days=1)

    print(f"Testing email summary for {yesterday.strftime('%Y-%m-%d')}...")
    print(f"Recipient: {email_recipient}")
    print()

    # Send test email
    success, message = emailer.send_yesterday_summary(email_recipient)

    if success:
        print(f"✓ Email sent successfully!")
        print(f"  {message}")
    else:
        print(f"✗ Failed to send email")
        print(f"  {message}")


if __name__ == "__main__":
    main()
