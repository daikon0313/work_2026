"""Setup script for creating .app bundle with py2app.

Run: python setup.py py2app
"""

import sys
import os

# Ensure we're using setup.py configuration, not pyproject.toml
os.environ['SETUPTOOLS_USE_DISTUTILS'] = 'local'

# Add src directory to path for package discovery
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from setuptools import setup

APP = ['src/worktime_tracker/app.py']
DATA_FILES = []

OPTIONS = {
    'argv_emulation': False,
    'packages': [
        'worktime_tracker',
        'google_auth_oauthlib',
        'googleapiclient',
        'httplib2',
        'uritemplate',
        'cachetools',
        'certifi',
        'charset_normalizer',
        'idna',
        'oauthlib',
        'pyasn1',
        'pyasn1_modules',
        'pyparsing',
        'requests',
        'requests_oauthlib',
        'rsa',
        'urllib3',
    ],
    'includes': [
        'tkinter',
        'tkinter.messagebox',
        'tkinter.simpledialog',
        'google.auth',
        'google.auth.transport',
        'google.auth.transport.requests',
        'google.oauth2',
        'google.oauth2.credentials',
        'google.auth.exceptions',
        'google.auth.credentials',
        'google.auth._default',
        'google.auth._helpers',
        'googleapiclient.discovery',
        'googleapiclient.errors',
        'googleapiclient.http',
    ],
    'iconfile': 'icon.icns',
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

# Use legacy setup() call for py2app compatibility
setup(
    name='WorktimeTracker',
    app=APP,
    data_files=DATA_FILES,
    options={'py2app': OPTIONS},
    setup_requires=['py2app'],
)
