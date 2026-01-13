"""Main application module for Worktime Tracker."""

from datetime import datetime, timedelta

import rumps

from .calendar_api import GoogleCalendarAPI
from .dialog import show_work_input_dialog


class WorktimeTrackerApp(rumps.App):
    """Mac menubar app for tracking work time."""

    def __init__(self):
        super().__init__("Work", quit_button=None)

        # State management
        self.start_dt: datetime | None = None  # Work start time
        self.last_resume_dt: datetime | None = None  # Last resume time
        self.elapsed: timedelta = timedelta()  # Accumulated elapsed time
        self.running: bool = False  # Currently tracking

        # Timer for updating display
        self.timer = rumps.Timer(self.update_display, 1)

        # Google Calendar API
        self.calendar_api = GoogleCalendarAPI()

        # Menu setup
        self.menu = [
            rumps.MenuItem("Start", callback=self.on_start),
            rumps.MenuItem("Pause", callback=self.on_pause),
            rumps.MenuItem("Stop", callback=self.on_stop),
            None,  # Separator
            rumps.MenuItem("Quit", callback=self.on_quit),
        ]

        # Initial menu state
        self.menu["Pause"].set_callback(None)  # Disabled initially
        self.menu["Stop"].set_callback(None)  # Disabled initially

    def update_display(self, _sender):
        """Update the menubar display with current elapsed time."""
        if self.running and self.last_resume_dt:
            current_elapsed = self.elapsed + (datetime.now() - self.last_resume_dt)
        else:
            current_elapsed = self.elapsed

        total_seconds = int(current_elapsed.total_seconds())
        hours = total_seconds // 3600
        minutes = (total_seconds % 3600) // 60
        seconds = total_seconds % 60

        self.title = f"{hours:02d}:{minutes:02d}:{seconds:02d}"

    def on_start(self, _sender):
        """Start or resume work tracking."""
        if not self.running:
            now = datetime.now()

            if self.start_dt is None:
                # First start
                self.start_dt = now

            self.last_resume_dt = now
            self.running = True
            self.timer.start()

            # Update menu state
            self.menu["Start"].set_callback(None)  # Disable Start
            self.menu["Pause"].set_callback(self.on_pause)  # Enable Pause
            self.menu["Stop"].set_callback(self.on_stop)  # Enable Stop

    def on_pause(self, _sender):
        """Pause work tracking."""
        if self.running:
            # Accumulate elapsed time
            if self.last_resume_dt:
                self.elapsed += datetime.now() - self.last_resume_dt

            self.running = False
            self.timer.stop()
            self.update_display(None)  # Update display one last time

            # Update menu state
            self.menu["Start"].set_callback(self.on_start)  # Enable Start (Resume)
            self.menu["Pause"].set_callback(None)  # Disable Pause

    def on_stop(self, _sender):
        """Stop work tracking and register to Google Calendar."""
        if self.start_dt is None:
            return

        # Calculate final elapsed time
        end_dt = datetime.now()
        if self.running and self.last_resume_dt:
            self.elapsed += end_dt - self.last_resume_dt

        self.running = False
        self.timer.stop()
        self.update_display(None)

        # Show input dialog
        result = show_work_input_dialog()

        if result:
            title, description = result

            # Register to Google Calendar
            success = self.calendar_api.create_event(
                summary=title,
                description=description,
                start_time=self.start_dt,
                end_time=end_dt,
            )

            if success:
                rumps.notification(
                    title="Work Registered",
                    subtitle=title,
                    message=f"Duration: {self.title}",
                )
            else:
                rumps.notification(
                    title="Registration Failed",
                    subtitle="",
                    message="Failed to register to Google Calendar",
                )
        else:
            rumps.notification(
                title="Work Cancelled",
                subtitle="",
                message="Work was not registered",
            )

        # Reset state
        self.reset_state()

    def reset_state(self):
        """Reset all tracking state."""
        self.start_dt = None
        self.last_resume_dt = None
        self.elapsed = timedelta()
        self.running = False
        self.title = "Work"

        # Reset menu state
        self.menu["Start"].set_callback(self.on_start)
        self.menu["Pause"].set_callback(None)
        self.menu["Stop"].set_callback(None)

    def on_quit(self, _sender):
        """Quit the application."""
        rumps.quit_application()


def main():
    """Entry point for the application."""
    WorktimeTrackerApp().run()


if __name__ == "__main__":
    main()
