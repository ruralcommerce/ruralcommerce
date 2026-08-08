from PIL import Image

src = r'public/images/projeto/im-los-santos-logo-azul.png'
img = Image.open(src).convert('RGBA')
w, h = img.size
pixels = img.load()

min_x, min_y, max_x, max_y = w, h, 0, 0
for y in range(h):
    for x in range(w):
        a = pixels[x, y][3]
        if a > 12:
            if x < min_x:
                min_x = x
            if y < min_y:
                min_y = y
            if x > max_x:
                max_x = x
            if y > max_y:
                max_y = y

pad = 24
box = (
    max(0, min_x - pad),
    max(0, min_y - pad),
    min(w, max_x + 1 + pad),
    min(h, max_y + 1 + pad),
)
cropped = img.crop(box)
print('original', w, h, 'bbox', box, 'cropped', cropped.size)

out = cropped.copy()
px = out.load()
cw, ch = out.size
for y in range(ch):
    for x in range(cw):
        r, g, b, a = px[x, y]
        if a < 8:
            continue
        # keep teal / cyan accents
        if g > r + 20 and g > b - 10 and g > 90:
            continue
        # keep red accent
        if r > 140 and r > g + 40 and r > b + 40:
            continue
        # keep near-white
        if r > 210 and g > 210 and b > 210:
            continue
        brightness = (r + g + b) / 3
        if brightness < 170:
            t = max(0.0, min(1.0, brightness / 170))
            v = int(220 + 35 * t)
            px[x, y] = (v, v, v, a)

out_path = r'public/images/projeto/im-los-santos-logo-header.png'
cropped_path = r'public/images/projeto/im-los-santos-logo-cropped.png'
out.save(out_path, 'PNG')
cropped.save(cropped_path, 'PNG')
print('saved', out_path, out.size)
print('saved', cropped_path, cropped.size)
