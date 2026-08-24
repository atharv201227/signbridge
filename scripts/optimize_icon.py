from pathlib import Path
from PIL import Image

source = Path('/home/ubuntu/webdev-static-assets/signbridge-icon.png')
targets = [
    Path('/home/ubuntu/signbridge/assets/images/icon.png'),
    Path('/home/ubuntu/signbridge/assets/images/splash-icon.png'),
    Path('/home/ubuntu/signbridge/assets/images/favicon.png'),
    Path('/home/ubuntu/signbridge/assets/images/android-icon-foreground.png'),
]
image = Image.open(source).convert('RGB')
for target in targets:
    image.resize((1024, 1024), Image.Resampling.LANCZOS).save(target, format='PNG', optimize=True, compress_level=9)
