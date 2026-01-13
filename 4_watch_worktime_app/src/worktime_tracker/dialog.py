"""Input dialog module for work details."""

import tkinter as tk
from tkinter import messagebox, simpledialog


def show_work_input_dialog() -> tuple[str, str] | None:
    """Show dialog to input work title and description.

    Returns:
        Tuple of (title, description) if user confirms, None if cancelled.
    """
    # Create a temporary root window for dialogs
    root = tk.Tk()
    root.withdraw()  # Hide the main window

    # Get work title (required)
    title = simpledialog.askstring(
        "Work Title",
        "Enter work title:",
        parent=root
    )

    if not title or not title.strip():
        if title is not None:  # User clicked OK with empty text
            messagebox.showerror(
                "Error",
                "Work title is required.",
                parent=root
            )
        root.destroy()
        return None

    # Get work description (optional)
    description = simpledialog.askstring(
        "Work Description",
        "Enter work description (optional):",
        parent=root
    )

    if description is None:  # User clicked Cancel
        root.destroy()
        return None

    root.destroy()
    return (title.strip(), description.strip())
