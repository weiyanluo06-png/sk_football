"""Create small responsive showcase images; retain the original photos."""
import json
from pathlib import Path
from PIL import Image, ImageOps

root = Path(__file__).resolve().parents[1]
data = json.loads((root / 'js/newcomer-data.js').read_text(encoding='utf-8').split('=', 1)[1].strip().rstrip(';'))
dest = root / 'assets/players/showcase'
dest.mkdir(exist_ok=True)
manifest = {}
original_bytes = small_bytes = large_bytes = 0
for player in data['newcomers']:
    source = root / player['photo']
    original_bytes += source.stat().st_size
    variants = {}
    with Image.open(source) as raw:
        picture = ImageOps.exif_transpose(raw).convert('RGB')
        for width in (320, 640):
            scaled = picture.copy()
            scaled.thumbnail((width, 1600), Image.Resampling.LANCZOS)
            target = dest / f'{source.stem}-{width}.webp'
            scaled.save(target, 'WEBP', quality=80, method=6)
            variants[str(width)] = {'src': target.relative_to(root).as_posix(), 'width': scaled.width}
            if width == 320: small_bytes += target.stat().st_size
            else: large_bytes += target.stat().st_size
    manifest[player['photo']] = variants
(root / 'js/newcomer-images.js').write_text('window.NEWCOMER_IMAGES = ' + json.dumps(manifest, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
print(json.dumps({'originalBytes': original_bytes, 'smallBytes': small_bytes, 'largeBytes': large_bytes}))
