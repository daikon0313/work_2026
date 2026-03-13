"""Main application module for Worktime Tracker."""

import subprocess
import tkinter as tk
from datetime import datetime, timedelta
from tkinter import messagebox

import AppKit

from worktime_tracker.calendar_api import GoogleCalendarAPI
from worktime_tracker.scheduler import DailySummaryScheduler


def _hide_dock_icon():
    """Hide the Python Dock icon, keeping only the tkinter window."""
    app = AppKit.NSApplication.sharedApplication()
    # NSApplicationActivationPolicyAccessory = 1 (no Dock icon, no menu bar)
    app.setActivationPolicy_(1)


def show_notification(title: str, subtitle: str, message: str):
    """Show macOS notification using osascript."""
    script = f'''
    display notification "{message}" with title "{title}" subtitle "{subtitle}"
    '''
    try:
        subprocess.run(['osascript', '-e', script], check=False)
    except Exception:
        pass


class WorkInputDialog:
    """Dialog for inputting work title and description."""

    def __init__(self, parent, elapsed_str: str):
        self.result = None

        self.dialog = tk.Toplevel(parent)
        self.dialog.title("作業内容の入力")
        self.dialog.geometry("420x300")
        self.dialog.resizable(False, False)
        self.dialog.transient(parent)
        self.dialog.grab_set()

        # Center the dialog
        self.dialog.update_idletasks()
        x = parent.winfo_x() + (parent.winfo_width() - 420) // 2
        y = parent.winfo_y() + (parent.winfo_height() - 300) // 2
        self.dialog.geometry(f"+{x}+{y}")

        # Elapsed time display
        tk.Label(
            self.dialog,
            text=f"作業時間: {elapsed_str}",
            font=("Helvetica", 14, "bold"),
        ).pack(pady=(15, 10))

        # Title input
        tk.Label(self.dialog, text="作業タイトル（必須）", anchor="w").pack(
            fill="x", padx=20
        )
        self.title_entry = tk.Entry(self.dialog, font=("Helvetica", 13))
        self.title_entry.pack(fill="x", padx=20, pady=(2, 10))
        self.title_entry.focus_set()

        # Description input
        tk.Label(self.dialog, text="作業内容（任意）", anchor="w").pack(
            fill="x", padx=20
        )
        self.desc_text = tk.Text(self.dialog, font=("Helvetica", 12), height=4)
        self.desc_text.pack(fill="x", padx=20, pady=(2, 10))

        # Buttons
        btn_frame = tk.Frame(self.dialog)
        btn_frame.pack(pady=10)

        tk.Button(
            btn_frame, text="登録", command=self.on_ok, width=10, font=("Helvetica", 12)
        ).pack(side="left", padx=10)
        tk.Button(
            btn_frame,
            text="キャンセル",
            command=self.on_cancel,
            width=10,
            font=("Helvetica", 12),
        ).pack(side="left", padx=10)

        self.dialog.bind("<Return>", lambda e: self.on_ok())
        self.dialog.bind("<Escape>", lambda e: self.on_cancel())
        self.dialog.protocol("WM_DELETE_WINDOW", self.on_cancel)

        parent.wait_window(self.dialog)

    def on_ok(self):
        title = self.title_entry.get().strip()
        if not title:
            messagebox.showerror("エラー", "作業タイトルは必須です", parent=self.dialog)
            return
        description = self.desc_text.get("1.0", "end").strip()
        self.result = (title, description)
        self.dialog.destroy()

    def on_cancel(self):
        self.result = None
        self.dialog.destroy()


class WorktimeTrackerApp:
    """Mac desktop app for tracking work time."""

    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Worktime Tracker")
        self.root.geometry("320x200")
        self.root.resizable(False, False)

        # Transparency (0.0=fully transparent, 1.0=opaque)
        self.root.attributes("-alpha", 0.85)

        # State management
        self.start_dt: datetime | None = None
        self.last_resume_dt: datetime | None = None
        self.elapsed: timedelta = timedelta()
        self.running: bool = False

        # Google Calendar API
        self.calendar_api = GoogleCalendarAPI()

        # Daily summary scheduler
        self.scheduler = DailySummaryScheduler()

        self.create_widgets()
        self.update_display()

    def create_widgets(self):
        """Create UI widgets."""
        self.time_label = tk.Label(
            self.root, text="00:00:00", font=("Helvetica", 36, "bold"),
        )
        self.time_label.pack(pady=(20, 10), anchor="center")

        button_frame = tk.Frame(self.root)
        button_frame.pack(pady=8, anchor="center")

        self.start_button = tk.Button(
            button_frame,
            text="Start",
            command=self.on_start,
            width=7,
            font=("Helvetica", 11),
        )
        self.start_button.grid(row=0, column=0, padx=5)

        self.pause_button = tk.Button(
            button_frame,
            text="Pause",
            command=self.on_pause,
            width=7,
            font=("Helvetica", 11),
            state=tk.DISABLED,
        )
        self.pause_button.grid(row=0, column=1, padx=5)

        self.stop_button = tk.Button(
            button_frame,
            text="Stop",
            command=self.on_stop,
            width=7,
            font=("Helvetica", 11),
            state=tk.DISABLED,
        )
        self.stop_button.grid(row=0, column=2, padx=5)

        quit_button = tk.Button(
            self.root,
            text="Quit",
            command=self.on_quit,
            width=8,
            font=("Helvetica", 10),
        )
        quit_button.pack(pady=8, anchor="center")

    def get_elapsed_str(self) -> str:
        """Get formatted elapsed time string."""
        if self.running and self.last_resume_dt:
            current_elapsed = self.elapsed + (datetime.now() - self.last_resume_dt)
        else:
            current_elapsed = self.elapsed

        total_seconds = int(current_elapsed.total_seconds())
        hours = total_seconds // 3600
        minutes = (total_seconds % 3600) // 60
        seconds = total_seconds % 60
        return f"{hours:02d}:{minutes:02d}:{seconds:02d}"

    def update_display(self):
        """Update the time display."""
        self.time_label.config(text=self.get_elapsed_str())
        self.root.after(1000, self.update_display)

    def on_start(self):
        """Start or resume work tracking."""
        if not self.running:
            now = datetime.now()
            if self.start_dt is None:
                self.start_dt = now
            self.last_resume_dt = now
            self.running = True

            self.start_button.config(state=tk.DISABLED)
            self.pause_button.config(state=tk.NORMAL)
            self.stop_button.config(state=tk.NORMAL)

    def on_pause(self):
        """Pause work tracking."""
        if self.running:
            if self.last_resume_dt:
                self.elapsed += datetime.now() - self.last_resume_dt
            self.running = False

            self.start_button.config(state=tk.NORMAL)
            self.pause_button.config(state=tk.DISABLED)

    def on_stop(self):
        """Stop work tracking and register to Google Calendar."""
        if self.start_dt is None:
            return

        end_dt = datetime.now()
        if self.running and self.last_resume_dt:
            self.elapsed += end_dt - self.last_resume_dt
        self.running = False

        elapsed_str = self.get_elapsed_str()

        # Show input dialog
        dialog = WorkInputDialog(self.root, elapsed_str)

        if dialog.result:
            title, description = dialog.result

            success, message = self.calendar_api.create_event(
                summary=title,
                description=description,
                start_time=self.start_dt,
                end_time=end_dt,
            )

            if success:
                self.calendar_api.create_or_update_daily_summary(date=self.start_dt)

                show_notification(
                    title="登録完了",
                    subtitle=title,
                    message=f"作業時間: {elapsed_str}",
                )
                messagebox.showinfo(
                    "登録完了",
                    f"Googleカレンダーに登録しました\n\n"
                    f"タイトル: {title}\n"
                    f"作業時間: {elapsed_str}",
                )
            else:
                show_notification(
                    title="登録失敗",
                    subtitle="",
                    message="Googleカレンダーへの登録に失敗しました",
                )
                messagebox.showerror(
                    "エラー",
                    f"Googleカレンダーへの登録に失敗しました\n\nエラー: {message}",
                )
        else:
            show_notification(
                title="キャンセル",
                subtitle="",
                message="作業は登録されませんでした",
            )

        self.reset_state()

    def reset_state(self):
        """Reset all tracking state."""
        self.start_dt = None
        self.last_resume_dt = None
        self.elapsed = timedelta()
        self.running = False

        self.start_button.config(state=tk.NORMAL)
        self.pause_button.config(state=tk.DISABLED)
        self.stop_button.config(state=tk.DISABLED)

    def on_quit(self):
        """Quit the application."""
        self.scheduler.stop()
        self.root.quit()
        self.root.destroy()

    def run(self):
        """Start the application."""
        self.scheduler.start()
        self.root.mainloop()


def main():
    """Entry point for the application."""
    app = WorktimeTrackerApp()
    _hide_dock_icon()
    app.run()


if __name__ == "__main__":
    main()
