"""Setup script for creating .app bundle with py2app."""

from setuptools import setup

APP = ['src/worktime_tracker/app.py']
DATA_FILES = []
OPTIONS = {
    'argv_emulation': False,
    'packages': [
        'worktime_tracker',
        'googleapiclient',
        'google_auth_oauthlib',
        'httplib2',
        'uritemplate',
    ],
    'includes': [
        'tkinter',
        'google',
        'google.auth',
        'google.auth.transport',
        'google.oauth2',
        'google.oauth2.credentials',
        'google.auth.transport.requests',
    ],
    'iconfile': 'icon.icns',  # Custom icon
    'plist': {
        'CFBundleName': 'Worktime Tracker',
        'CFBundleDisplayName': 'Worktime Tracker',
        'CFBundleIdentifier': 'com.yourname.worktime-tracker',
        'CFBundleVersion': '1.0.0',
        'CFBundleShortVersionString': '1.0.0',
        'LSUIElement': False,  # Show in Dock
        'NSHighResolutionCapable': True,
    }
}

setup(
    name='Worktime Tracker',
    version='1.0.0',
    app=APP,
    data_files=DATA_FILES,
    options={'py2app': OPTIONS},
    setup_requires=['py2app'],
)
