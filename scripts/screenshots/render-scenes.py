"""Renders realistic-looking demo camera frames (no real camera, no real place).

Procedural textures (value-noise fBm), perspective ground, soft shadows and
typical security-camera artefacts: wide-angle barrel distortion, vignetting,
chromatic aberration, sensor noise, slight blur, JPEG compression and an OSD.
Usage: python3 scripts/screenshots/render-scenes.py scripts/screenshots  (needs numpy and Pillow)
"""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1600, 900
rng = np.random.default_rng(7)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float64)


def _hash(ix, iy, seed):
    v = np.sin(ix * 127.1 + iy * 311.7 + seed * 74.7) * 43758.5453
    return v - np.floor(v)


def vnoise(x, y, seed=0):
    ix, iy = np.floor(x), np.floor(y)
    fx, fy = x - ix, y - iy
    ux, uy = fx * fx * (3 - 2 * fx), fy * fy * (3 - 2 * fy)
    a, b = _hash(ix, iy, seed), _hash(ix + 1, iy, seed)
    c, d = _hash(ix, iy + 1, seed), _hash(ix + 1, iy + 1, seed)
    return (a + (b - a) * ux) + ((c + (d - c) * ux) - (a + (b - a) * ux)) * uy


def fbm(x, y, octaves=5, seed=0, gain=0.5):
    s, amp, f, tot = 0.0, 1.0, 1.0, 0.0
    for o in range(octaves):
        s = s + amp * vnoise(x * f, y * f, seed + o * 13)
        tot += amp
        amp *= gain
        f *= 2.03
    return s / tot


def mix(a, b, t):
    t = np.clip(t, 0, 1)[..., None] if np.ndim(t) else t
    return a * (1 - t) + b * t


def col(*rgb):
    return np.array(rgb, dtype=np.float64) / 255.0


def smooth(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def paint(img, mask, color):
    m = np.clip(mask, 0, 1)[..., None]
    return img * (1 - m) + color * m


# ---------------------------------------------------------------- sky / background
def sky(horizon):
    t = np.clip(yy / horizon, 0, 1)[..., None]
    img = col(118, 160, 206) * (1 - t) + col(214, 226, 236) * t
    c = fbm(xx / 420, yy / 160, 6, seed=3)
    c2 = fbm(xx / 90, yy / 60, 4, seed=9)
    cloud = smooth(0.52, 0.78, c * 0.85 + c2 * 0.25) * (1 - smooth(horizon * 0.55, horizon, yy))
    shade = 0.82 + 0.18 * smooth(0.4, 0.8, fbm(xx / 200, (yy - 30) / 90, 4, seed=5))
    img = paint(img, cloud * 0.9, col(244, 245, 247) * shade[..., None])
    return img


def treeline(img, base, height, seed, tint=(52, 78, 48), haze=0.35):
    prof = base - height * (0.35 + 0.65 * fbm(xx[0] / 140, np.zeros(W) + seed, 5, seed=seed))
    mask = smooth(-2, 2, yy - prof[None, :]) * (1 - smooth(base - 2, base + 6, yy))
    leaf = fbm(xx / 9, yy / 9, 4, seed=seed + 1)
    shade = 0.55 + 0.6 * leaf * (0.6 + 0.4 * smooth(base, prof[None, :], yy))
    c = col(*tint)[None, None, :] * shade[..., None]
    c = c * (1 - haze) + col(170, 190, 200) * haze
    return paint(img, mask, c)


def bush(img, cx, cy, rx, ry, seed, dark=(30, 58, 30), light=(86, 122, 62)):
    d = ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2
    edge = fbm(xx / 18, yy / 18, 4, seed=seed)
    mask = smooth(1.08, 0.82, d + (edge - 0.5) * 0.55)
    leaf = fbm(xx / 5, yy / 5, 4, seed=seed + 7)
    light_dir = smooth(cy + ry * 0.6, cy - ry * 0.9, yy) * 0.6 + smooth(cx + rx, cx - rx, xx) * 0.4
    t = np.clip(leaf * 0.8 + light_dir * 0.6 - 0.25, 0, 1)
    c = mix(col(*dark), col(*light), t)
    return paint(img, mask, c)


def shadow(img, cx, cy, rx, ry, strength=0.35):
    d = ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2
    m = smooth(1.0, 0.2, d) * strength
    return img * (1 - m[..., None])


# ---------------------------------------------------------------- ground
def lawn(img, horizon, cam_h=1.0):
    g = yy > horizon
    u, v, _ = ground_uv(horizon)
    near = smooth(horizon + 40, horizon + 400, yy)
    blades = fbm(u * 14, v * 14, 3, seed=21) * near + 0.5 * (1 - near)
    patch = fbm(u * 0.35, v * 0.35, 4, seed=22)
    stripes = 0.5 + 0.5 * np.sin(u * 2.2)
    base = mix(col(64, 102, 44), col(112, 146, 70), patch * 0.9 + blades * 0.35 - 0.1)
    base = base * (0.92 + 0.08 * stripes)[..., None]
    far = smooth(horizon + 140, horizon, yy)
    base = mix(base, col(140, 160, 120), far * 0.35)
    return np.where(g[..., None], base, img)


def ground_uv(horizon, focal=800.0, cam_h=3.0):
    d = np.maximum(yy - horizon, 0.5)
    Z = cam_h * focal / d
    X = (xx - W / 2) * cam_h / d
    return X, Z, Z


def path_mask(horizon, top_w, bot_w, cx_top, cx_bot, y_top):
    t = np.clip((yy - y_top) / (H - y_top), 0, 1)
    cx = cx_top + (cx_bot - cx_top) * t
    hw = (top_w + (bot_w - top_w) * t) / 2
    edge = fbm(xx / 14, yy / 14, 3, seed=31) * 10
    return smooth(hw + edge, hw - 4 + edge, np.abs(xx - cx)) * (yy >= y_top)


def pavers(img, mask, horizon, size=1.0, tone=(150, 142, 130), seed=40):
    u, v, z = ground_uv(horizon)
    su, sv = u / (0.2 * size), v / (0.1 * size)
    row = np.floor(sv)
    su = su + (row % 2) * 0.5
    fu, fv = su - np.floor(su), sv - np.floor(sv)
    # Fugen in Pixeln rechnen (ca. 1 px breit, weich), in der Ferne ausblenden statt flimmern
    d = np.maximum(yy - horizon, 0.5)
    dXdx, dZdy = 3.0 / d, 3.0 * 800.0 / (d * d)
    bw, bh = 0.2 * size, 0.1 * size
    px = np.minimum(np.minimum(fu, 1 - fu) * bw / dXdx, np.minimum(fv, 1 - fv) * bh / dZdy)
    joint_m = smooth(0.2, 1.4, px)
    joint_m = joint_m + (1 - joint_m) * smooth(5.0, 2.0, bh / dZdy) * 0.8
    stone = _hash(np.floor(su), row, seed) * 0.18
    grain = fbm(u * 40, v * 40, 3, seed=seed + 1) * 0.22
    c = col(*tone) * (0.82 + stone + grain)[..., None]
    c = mix(col(96, 92, 86), c, joint_m)
    far = smooth(horizon + 200, horizon, yy)
    c = mix(c, col(160, 158, 150), far * 0.3)
    return paint(img, mask, c)


def fence(img, y_top, y_bot, x0=0, x1=W, posts=9, seed=50):
    wood = fbm(xx / 160, yy / 3, 4, seed=seed)
    wcol = mix(col(94, 70, 48), col(150, 118, 84), wood)
    rails = ((yy > y_top + 8) & (yy < y_top + 20)) | ((yy > y_bot - 22) & (yy < y_bot - 10))
    m = rails & (xx >= x0) & (xx <= x1)
    img = paint(img, m.astype(float), wcol)
    for i in range(posts):
        px = x0 + (x1 - x0) * (i + 0.5) / posts
        pm = (np.abs(xx - px) < 9) & (yy > y_top) & (yy < y_bot + 6)
        sh = 0.75 + 0.25 * smooth(px + 9, px - 9, xx)
        img = paint(img, pm.astype(float), wcol * sh[..., None])
    return img


def flowers(img, cx, cy, rx, ry, seed, colors):
    r = np.random.default_rng(seed)
    for _ in range(40):
        a, rr = r.uniform(0, 2 * np.pi), np.sqrt(r.uniform(0, 1))
        x, y = cx + np.cos(a) * rx * rr, cy + np.sin(a) * ry * rr
        s = r.uniform(2.5, 5.0) * (0.5 + (y - cy + ry) / (2 * ry))
        d = (xx - x) ** 2 + (yy - y) ** 2
        img = paint(img, smooth(s * s, s * s * 0.3, d), col(*colors[r.integers(len(colors))]) * r.uniform(0.85, 1.1))
    return img


# ---------------------------------------------------------------- scenes
def scene_garden():
    horizon = 370
    img = sky(horizon)
    img = treeline(img, horizon + 30, 110, seed=11, tint=(60, 86, 58), haze=0.45)
    img = treeline(img, horizon + 50, 70, seed=12, tint=(46, 72, 42), haze=0.25)
    img = lawn(img, horizon + 40)
    img = fence(img, 410, 470, posts=10)
    pm = path_mask(horizon, 70, 640, 760, 700, 470)
    img = pavers(img, pm, horizon + 40, size=1.5, tone=(166, 156, 140))
    for (cx, cy, rx, ry, s) in [(170, 330, 210, 190, 61), (1430, 300, 230, 220, 62), (1560, 440, 140, 120, 63)]:
        img = shadow(img, cx + 40, cy + ry * 0.95, rx * 0.9, ry * 0.18)
        img = bush(img, cx, cy, rx, ry, s)
    img = bush(img, 300, 760, 260, 70, 64, dark=(52, 84, 40), light=(110, 148, 72))
    img = flowers(img, 300, 750, 230, 55, 65, [(236, 168, 52), (228, 92, 70), (240, 232, 220)])
    img = bush(img, 1300, 790, 280, 75, 66, dark=(52, 84, 40), light=(110, 148, 72))
    img = flowers(img, 1300, 780, 250, 55, 67, [(236, 168, 52), (196, 120, 196), (240, 232, 220)])
    # garden bench
    bm = ((xx > 1080) & (xx < 1250) & (yy > 520) & (yy < 552)).astype(float)
    wood = fbm(xx / 60, yy / 2, 3, seed=70)
    img = paint(img, bm, mix(col(98, 72, 50), col(138, 104, 72), wood))
    img = paint(img, ((xx > 1080) & (xx < 1250) & (yy > 488) & (yy < 512)).astype(float), mix(col(90, 66, 46), col(130, 98, 68), wood))
    for lx in (1095, 1230):
        img = paint(img, ((np.abs(xx - lx) < 5) & (yy > 552) & (yy < 590)).astype(float), col(40, 38, 36))
    img = shadow(img, 1170, 595, 110, 12, 0.3)
    return img


def scene_entrance():
    horizon = 300
    img = sky(horizon)
    img = treeline(img, horizon + 62, 160, seed=81, tint=(56, 82, 54), haze=0.4)
    img = lawn(img, horizon + 60)
    # Hausfassade rechts
    wall = (xx > 760) & (yy < 640)
    plaster = fbm(xx / 3, yy / 3, 3, seed=82) * 0.06 + fbm(xx / 60, yy / 60, 3, seed=83) * 0.08
    light = 0.9 + 0.12 * smooth(760, 1600, xx)
    img = paint(img, wall.astype(float), col(214, 204, 186) * (light + plaster)[..., None])
    img = paint(img, ((xx > 760) & (yy < 40)).astype(float), col(88, 70, 62))
    img = paint(img, ((xx > 760) & (yy >= 40) & (yy < 62)).astype(float), col(60, 54, 50))
    # Fenster
    for wx in (860, 1380):
        win = (xx > wx) & (xx < wx + 150) & (yy > 170) & (yy < 380)
        refl = mix(col(70, 92, 112), col(176, 196, 210), smooth(380, 170, yy) * 0.7 + fbm(xx / 40, yy / 40, 3, seed=wx) * 0.4)
        img = paint(img, win.astype(float), refl)
        frame = win & ((xx < wx + 8) | (xx > wx + 142) | (yy < 178) | (yy > 372) | (np.abs(xx - wx - 75) < 4))
        img = paint(img, frame.astype(float), col(236, 236, 232))
    # Haustür
    door = (xx > 1100) & (xx < 1270) & (yy > 250) & (yy < 640)
    grain = fbm(xx / 120, yy / 4, 4, seed=90)
    img = paint(img, door.astype(float), mix(col(70, 48, 34), col(116, 82, 56), grain))
    img = paint(img, ((np.abs(xx - 1250) < 5) & (np.abs(yy - 450) < 22)).astype(float), col(200, 200, 196))
    img = paint(img, ((xx > 1090) & (xx < 1280) & (yy > 236) & (yy < 252)).astype(float), col(236, 236, 232))
    # Briefkasten und Lampe
    img = paint(img, ((xx > 960) & (xx < 1030) & (yy > 430) & (yy < 500)).astype(float), col(52, 56, 60))
    img = paint(img, ((xx > 1300) & (xx < 1330) & (yy > 300) & (yy < 360)).astype(float), col(40, 40, 42))
    lamp = ((xx - 1315) ** 2 + (yy - 340) ** 2) < 120
    img = paint(img, lamp.astype(float), col(240, 228, 190))
    # Vorplatz mit Pflaster
    yard = smooth(0, 1, (yy - 600)) * (yy > 600)
    img = pavers(img, yard, horizon + 60, size=1.0, tone=(150, 146, 140), seed=95)
    step = (xx > 1080) & (xx < 1290) & (yy > 640) & (yy < 672)
    img = paint(img, step.astype(float), col(170, 168, 162) * (0.9 + 0.1 * fbm(xx / 8, yy / 8, 2, seed=96))[..., None])
    img = shadow(img, 1185, 676, 120, 10, 0.4)
    # Hecke links und Topfpflanzen
    img = bush(img, 260, 470, 330, 170, 97, dark=(28, 54, 30), light=(76, 110, 58))
    img = bush(img, 600, 520, 200, 110, 98, dark=(30, 56, 32), light=(80, 116, 60))
    for (px, s) in ((1040, 99), (1330, 100)):
        img = paint(img, ((np.abs(xx - px) < 34) & (yy > 600) & (yy < 664)).astype(float), col(150, 94, 70) * (0.9 + 0.1 * smooth(px + 34, px - 34, xx))[..., None])
        img = bush(img, px, 572, 52, 46, s, dark=(40, 70, 38), light=(98, 136, 66))
    img = shadow(img, 380, 650, 380, 26, 0.3)
    return img


# ---------------------------------------------------------------- camera look
def camera_look(img, name, stamp, seed):
    r = np.random.default_rng(seed)
    # Weitwinkel: tonnenförmige Verzerrung
    cx, cy = W / 2, H / 2
    nx, ny = (xx - cx) / cx, (yy - cy) / cx
    rr = nx * nx + ny * ny
    k = -0.06
    sx = cx + nx * (1 + k * rr) * cx * 1.03
    sy = cy + ny * (1 + k * rr) * cx * 1.03

    def sample(ch, ox=0.0):
        x = np.clip(sx + ox * nx, 0, W - 1).astype(np.int32)
        y = np.clip(sy + ox * ny, 0, H - 1).astype(np.int32)
        return ch[y, x]
    out = np.stack([sample(img[..., 0], 2.2), sample(img[..., 1]), sample(img[..., 2], -2.2)], -1)
    # Vignette, Kontrast, Weissabgleich
    vig = 1 - 0.32 * smooth(0.25, 1.35, rr)
    out = out * vig[..., None]
    out = np.clip((out - 0.5) * 1.06 + 0.5, 0, 1)
    out = out * col(255, 250, 244)
    # Sensorrauschen (feiner Luminanz- und etwas Farbrauschen)
    lum_n = r.normal(0, 0.018, (H, W))[..., None]
    chroma = r.normal(0, 0.008, (H, W, 3))
    out = np.clip(out + lum_n + chroma, 0, 1)
    im = Image.fromarray((out * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.9))
    im = im.filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=2))
    # OSD wie bei Reolink: weisse Schrift mit dunklem Rand
    d = ImageDraw.Draw(im)
    f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf', 30)
    d.text((26, 18), stamp, font=f, fill=(255, 255, 255), stroke_width=2, stroke_fill=(20, 20, 20))
    tw = d.textlength(name, font=f)
    d.text((W - 26 - tw, H - 52), name, font=f, fill=(255, 255, 255), stroke_width=2, stroke_fill=(20, 20, 20))
    return im


if __name__ == '__main__':
    out = sys.argv[1]
    camera_look(scene_garden(), 'Garden', '06/15/2026 13:02:30 MON', 1).save(f'{out}/scene-garden.jpg', quality=72)
    camera_look(scene_entrance(), 'Entrance', '06/15/2026 13:02:31 MON', 2).save(f'{out}/scene-entrance.jpg', quality=72)
    print('ok')
