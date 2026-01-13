"""Create a simple clock icon for the Worktime Tracker app."""

from PIL import Image, ImageDraw

# Create a 512x512 image with transparent background
size = 512
img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Clock colors
bg_color = (52, 120, 246)  # Blue
face_color = (255, 255, 255)  # White
hand_color = (52, 120, 246)  # Blue

# Draw outer circle (clock background)
margin = 40
draw.ellipse([margin, margin, size - margin, size - margin], fill=bg_color)

# Draw clock face (white circle)
face_margin = 60
draw.ellipse([face_margin, face_margin, size - face_margin, size - face_margin], fill=face_color)

# Draw clock hands
center_x = size // 2
center_y = size // 2

# Hour hand (pointing at 10 o'clock)
hour_length = 100
hour_angle = -60  # degrees from top
import math
hour_rad = math.radians(hour_angle - 90)
hour_end_x = center_x + hour_length * math.cos(hour_rad)
hour_end_y = center_y + hour_length * math.sin(hour_rad)
draw.line([center_x, center_y, hour_end_x, hour_end_y], fill=hand_color, width=20)

# Minute hand (pointing at 2 o'clock)
minute_length = 140
minute_angle = 60  # degrees from top
minute_rad = math.radians(minute_angle - 90)
minute_end_x = center_x + minute_length * math.cos(minute_rad)
minute_end_y = center_y + minute_length * math.sin(minute_rad)
draw.line([center_x, center_y, minute_end_x, minute_end_y], fill=hand_color, width=15)

# Draw center circle
center_radius = 25
draw.ellipse([center_x - center_radius, center_y - center_radius,
              center_x + center_radius, center_y + center_radius], fill=hand_color)

# Save the icon
img.save('icon.png', 'PNG')
print("Icon created: icon.png")
