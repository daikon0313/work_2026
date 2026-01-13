"""Daily work summary email generation and sending."""

from datetime import datetime, timedelta

from worktime_tracker.calendar_api import GoogleCalendarAPI
from worktime_tracker.gmail_api import GmailAPI


class DailySummaryEmailer:
    """Handles daily work summary email generation and sending."""

    def __init__(self):
        self.calendar_api = GoogleCalendarAPI()
        self.gmail_api = GmailAPI()

    def format_duration(self, duration: timedelta) -> str:
        """Format timedelta to readable string.

        Args:
            duration: Time duration

        Returns:
            Formatted string (e.g., "2時間30分")
        """
        total_seconds = int(duration.total_seconds())
        hours = total_seconds // 3600
        minutes = (total_seconds % 3600) // 60

        if hours > 0:
            return f"{hours}時間{minutes:02d}分"
        else:
            return f"{minutes}分"

    def generate_summary_body(self, date: datetime) -> str:
        """Generate email body with work summary for the given date.

        Args:
            date: Target date

        Returns:
            Email body text
        """
        # Get all worktime tracker events (green, colorId=10) for the date
        events = self.calendar_api.get_events_for_date(date, color_id="10")

        if not events:
            return f"""作業記録はありませんでした。

日付: {date.strftime("%Y年%m月%d日")}
合計作業時間: 0時間00分

良い一日を!
"""

        # Calculate total duration
        total_duration = self.calendar_api.calculate_total_duration(events)

        # Build work list
        work_lines = []
        for i, event in enumerate(events, 1):
            summary = event.get("summary", "タイトルなし")
            description = event.get("description", "")

            # Calculate event duration
            start = event.get("start", {})
            end = event.get("end", {})

            # Skip all-day events
            if "date" in start or "date" in end:
                continue

            try:
                start_dt = datetime.fromisoformat(start.get("dateTime", ""))
                end_dt = datetime.fromisoformat(end.get("dateTime", ""))
                event_duration = end_dt - start_dt

                # Format start time
                start_time_str = start_dt.strftime("%H:%M")

                duration_str = self.format_duration(event_duration)

                work_lines.append(f"{i}. {summary}")
                work_lines.append(f"   開始時刻: {start_time_str}")
                work_lines.append(f"   作業時間: {duration_str}")

                if description:
                    work_lines.append(f"   内容: {description}")

                work_lines.append("")  # Empty line
            except Exception:
                continue

        # Build email body
        body = f"""こんにちは、

{date.strftime("%Y年%m月%d日")}の作業サマリーをお送りします。

【作業一覧】
{"".join([line + "\\n" for line in work_lines])}

【合計作業時間】
{self.format_duration(total_duration)}

本日も頑張りましょう!

---
このメールは作業計測アプリから自動送信されています。
"""
        return body

    def send_daily_summary(
        self,
        date: datetime,
        recipient: str,
    ) -> tuple[bool, str]:
        """Send daily work summary email.

        Args:
            date: Target date for summary
            recipient: Email address to send to

        Returns:
            Tuple of (success: bool, message: str)
        """
        try:
            # Generate email body
            body = self.generate_summary_body(date)

            # Email subject
            subject = f"【作業サマリー】{date.strftime('%Y年%m月%d日')}の作業記録"

            # Send email
            success, message = self.gmail_api.send_email(
                to=recipient,
                subject=subject,
                body=body,
            )

            return success, message
        except Exception as error:
            error_msg = f"Error: {str(error)}"
            print(error_msg)
            return False, error_msg

    def send_yesterday_summary(self, recipient: str) -> tuple[bool, str]:
        """Send yesterday's work summary email.

        Args:
            recipient: Email address to send to

        Returns:
            Tuple of (success: bool, message: str)
        """
        yesterday = datetime.now() - timedelta(days=1)
        return self.send_daily_summary(yesterday, recipient)
