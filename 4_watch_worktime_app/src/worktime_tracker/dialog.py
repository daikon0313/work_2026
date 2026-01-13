"""Input dialog module for work details."""

import rumps


def show_work_input_dialog() -> tuple[str, str] | None:
    """Show dialog to input work title and description.

    Returns:
        Tuple of (title, description) if user confirms, None if cancelled.
    """
    # Get work title (required)
    title_window = rumps.Window(
        message="Enter work title:",
        title="Work Title",
        default_text="",
        ok="Next",
        cancel="Cancel",
        dimensions=(320, 24),
    )
    title_response = title_window.run()

    if not title_response.clicked:
        return None

    title = title_response.text.strip()
    if not title:
        rumps.alert(
            title="Error",
            message="Work title is required.",
        )
        return None

    # Get work description (optional)
    description_window = rumps.Window(
        message="Enter work description (optional):",
        title="Work Description",
        default_text="",
        ok="Register",
        cancel="Cancel",
        dimensions=(320, 100),
    )
    description_response = description_window.run()

    if not description_response.clicked:
        return None

    description = description_response.text.strip()

    return (title, description)
