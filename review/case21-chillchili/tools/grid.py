"""grid.py key slide [x0 y0 x1 y1] -> /tmp/nr/bx/g-key-slide.png page with a 50px grid and labels"""
import sys
from PIL import Image, ImageDraw
key, si = sys.argv[1], int(sys.argv[2])
im = Image.open(f"/tmp/nr/img/{key}/pg-{si-1:03d}.png").convert("RGB")
box = [int(v) for v in sys.argv[3:7]] if len(sys.argv) > 6 else [0, 0, im.size[0], im.size[1]]
im = im.crop(box); d = ImageDraw.Draw(im)
for x in range((box[0] // 50 + 1) * 50, box[2], 50):
    d.line([(x - box[0], 0), (x - box[0], im.size[1])], fill=(0, 160, 255) if x % 100 else (0, 90, 255), width=1)
    if x % 100 == 0: d.text((x - box[0] + 2, 2), str(x), fill=(0, 0, 255))
for y in range((box[1] // 50 + 1) * 50, box[3], 50):
    d.line([(0, y - box[1]), (im.size[0], y - box[1])], fill=(0, 160, 255) if y % 100 else (0, 90, 255), width=1)
    if y % 100 == 0: d.text((2, y - box[1] + 2), str(y), fill=(0, 0, 255))
im.save(f"/tmp/nr/bx/g-{key}-{si}.png")
