"""Background scheduler for daily email summaries."""

import os
import threading
import time
from datetime import datetime

import schedule

from worktime_tracker.email_summary import DailySummaryEmailer

# Email recipient from environment variable
EMAIL_RECIPIENT = os.environ.get("EMAIL_RECIPIENT", "")


class DailySummaryScheduler:
    """Schedules and runs daily email summary tasks."""

    def __init__(self):
        self.emailer = DailySummaryEmailer()
        self.running = False
        self.thread = None

    def send_daily_summary_job(self):
        """Job to send daily summary email."""
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Running daily summary job...")

        try:
            success, message = self.emailer.send_yesterday_summary(EMAIL_RECIPIENT)

            if success:
                print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Daily summary sent successfully: {message}")
            else:
                print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Failed to send daily summary: {message}")
        except Exception as error:
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Error in daily summary job: {str(error)}")

    def run_scheduler(self):
        """Run the scheduler loop."""
        while self.running:
            schedule.run_pending()
            time.sleep(60)  # Check every minute

    def start(self):
        """Start the scheduler in a background thread."""
        if self.running:
            print("Scheduler is already running")
            return

        # Check if EMAIL_RECIPIENT is set
        if not EMAIL_RECIPIENT:
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] WARNING: EMAIL_RECIPIENT environment variable is not set. Daily summary emails will not be sent.")
            return

        # Schedule daily summary at 6:00 AM
        schedule.every().day.at("06:00").do(self.send_daily_summary_job)

        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Daily summary scheduler started (sends at 06:00 AM to {EMAIL_RECIPIENT})")

        self.running = True
        self.thread = threading.Thread(target=self.run_scheduler, daemon=True)
        self.thread.start()

    def stop(self):
        """Stop the scheduler."""
        if not self.running:
            return

        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Stopping daily summary scheduler...")
        self.running = False

        if self.thread:
            self.thread.join(timeout=5)

        schedule.clear()
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Scheduler stopped")

    def send_test_email(self):
        """Send a test email immediately (for testing purposes)."""
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Sending test email...")
        self.send_daily_summary_job()
