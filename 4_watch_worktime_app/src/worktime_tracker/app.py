"""Main application module for Worktime Tracker."""

import subprocess
import tkinter as tk
from datetime import datetime, timedelta
from tkinter import messagebox

from worktime_tracker.calendar_api import GoogleCalendarAPI
from worktime_tracker.dialog import show_work_input_dialog


def show_notification(title: str, subtitle: str, message: str):
    """Show macOS notification using osascript."""
    script = f'''
    display notification "{message}" with title "{title}" subtitle "{subtitle}"
    '''
    try:
        subprocess.run(['osascript', '-e', script], check=False)
    except Exception:
        pass  # Silently ignore notification errors


class WorktimeTrackerApp:
    """Mac desktop app for tracking work time."""

    def __init__(self):
        # Create main window
        self.root = tk.Tk()
        self.root.title("Worktime Tracker")
        self.root.geometry("400x280")
        self.root.resizable(False, False)

        # Handle window close button (hide instead of quit)
        self.root.protocol("WM_DELETE_WINDOW", self.on_window_close)

        # State management
        self.start_dt: datetime | None = None  # Work start time
        self.last_resume_dt: datetime | None = None  # Last resume time
        self.elapsed: timedelta = timedelta()  # Accumulated elapsed time
        self.running: bool = False  # Currently tracking

        # Google Calendar API
        self.calendar_api = GoogleCalendarAPI()

        # Create UI elements
        self.create_widgets()

        # Start timer
        self.update_display()

    def create_widgets(self):
        """Create UI widgets."""
        # Time display
        self.time_label = tk.Label(
            self.root,
            text="00:00:00",
            font=("Helvetica", 48, "bold"),
            pady=30
        )
        self.time_label.pack(pady=(20, 10))

        # Button frame
        button_frame = tk.Frame(self.root)
        button_frame.pack(pady=15)

        # Start button
        self.start_button = tk.Button(
            button_frame,
            text="Start",
            command=self.on_start,
            width=10,
            height=2,
            font=("Helvetica", 12)
        )
        self.start_button.grid(row=0, column=0, padx=8)

        # Pause button
        self.pause_button = tk.Button(
            button_frame,
            text="Pause",
            command=self.on_pause,
            width=10,
            height=2,
            font=("Helvetica", 12),
            state=tk.DISABLED
        )
        self.pause_button.grid(row=0, column=1, padx=8)

        # Stop button
        self.stop_button = tk.Button(
            button_frame,
            text="Stop",
            command=self.on_stop,
            width=10,
            height=2,
            font=("Helvetica", 12),
            state=tk.DISABLED
        )
        self.stop_button.grid(row=0, column=2, padx=8)

        # Quit button
        quit_button = tk.Button(
            self.root,
            text="Quit",
            command=self.on_quit,
            width=12,
            height=1,
            font=("Helvetica", 11)
        )
        quit_button.pack(pady=15)

    def update_display(self):
        """Update the time display."""
        if self.running and self.last_resume_dt:
            current_elapsed = self.elapsed + (datetime.now() - self.last_resume_dt)
        else:
            current_elapsed = self.elapsed

        total_seconds = int(current_elapsed.total_seconds())
        hours = total_seconds // 3600
        minutes = (total_seconds % 3600) // 60
        seconds = total_seconds % 60

        self.time_label.config(text=f"{hours:02d}:{minutes:02d}:{seconds:02d}")

        # Schedule next update
        self.root.after(1000, self.update_display)

    def on_start(self):
        """Start or resume work tracking."""
        if not self.running:
            now = datetime.now()

            if self.start_dt is None:
                # First start
                self.start_dt = now

            self.last_resume_dt = now
            self.running = True

            # Update button states
            self.start_button.config(state=tk.DISABLED)
            self.pause_button.config(state=tk.NORMAL)
            self.stop_button.config(state=tk.NORMAL)

    def on_pause(self):
        """Pause work tracking."""
        if self.running:
            # Accumulate elapsed time
            if self.last_resume_dt:
                self.elapsed += datetime.now() - self.last_resume_dt

            self.running = False

            # Update button states
            self.start_button.config(state=tk.NORMAL)
            self.pause_button.config(state=tk.DISABLED)

    def on_stop(self):
        """Stop work tracking and register to Google Calendar."""
        if self.start_dt is None:
            return

        # Calculate final elapsed time
        end_dt = datetime.now()
        if self.running and self.last_resume_dt:
            self.elapsed += end_dt - self.last_resume_dt

        self.running = False

        # Get current time display
        current_time_display = self.time_label.cget("text")

        # Show input dialog
        result = show_work_input_dialog()

        if result:
            title, description = result

            # Register to Google Calendar
            success, message = self.calendar_api.create_event(
                summary=title,
                description=description,
                start_time=self.start_dt,
                end_time=end_dt,
            )

            if success:
                # Update daily summary
                summary_success, summary_msg = self.calendar_api.create_or_update_daily_summary(
                    date=self.start_dt
                )

                show_notification(
                    title="Work Registered",
                    subtitle=title,
                    message=f"Duration: {current_time_display}",
                )

                # Show success message with summary info
                success_msg = f"Work registered to Google Calendar!\n\nTitle: {title}\nDuration: {current_time_display}\n\n"
                if summary_success:
                    success_msg += f"✓ {summary_msg}"
                else:
                    success_msg += f"⚠ Summary update failed: {summary_msg}"

                messagebox.showinfo("Success", success_msg)
            else:
                show_notification(
                    title="Registration Failed",
                    subtitle="",
                    message="Failed to register to Google Calendar",
                )
                messagebox.showerror(
                    "Error",
                    f"Failed to register to Google Calendar.\n\nError: {message}"
                )
        else:
            show_notification(
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

        # Reset button states
        self.start_button.config(state=tk.NORMAL)
        self.pause_button.config(state=tk.DISABLED)
        self.stop_button.config(state=tk.DISABLED)

    def on_window_close(self):
        """Handle window close button (hide instead of quit)."""
        self.root.withdraw()

    def on_quit(self):
        """Quit the application."""
        self.root.quit()
        self.root.destroy()

    def run(self):
        """Start the application."""
        self.root.mainloop()


def main():
    """Entry point for the application."""
    app = WorktimeTrackerApp()
    app.run()


if __name__ == "__main__":
    main()
