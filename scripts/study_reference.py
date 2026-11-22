#!/usr/bin/env python3
"""Study a reference deck/slide and write a style card (markdown).

Usage:
  python3 study_reference.py <reference file> [output.md]

Handles .pptx / .potx / .pptm (measured from the XML), .ppt (converted with
LibreOffice first), .pdf (first pages rendered, then image analysis) and
images (.png/.jpg). Measures; does not judge. Claude reads the card, checks
it against rendered slides, and decides.
"""
import sys, os, re, zipfile, subprocess, tempfile, collections
import xml.etree.ElementTree as ET

EMU = 914400.0
NS = {
    'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
    'p': 'http://schemas.openxmlformats.org/presentationml/2006/main',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
}
A = '{%s}' % NS['a']
P = '{%s}' % NS['p']


def inch(v):
    return round(int(v) / EMU, 2)


def num_key(name):
    m = re.search(r'(\d+)\.xml$', name)
    return int(m.group(1)) if m else 0


def top(counter, n=12):
    return counter.most_common(n)


# ---------------------------------------------------------------- pptx
def study_pptx(path):
    z = zipfile.ZipFile(path)
    names = z.namelist()
    read = lambda n: ET.fromstring(z.read(n))
    out = []

    # Slide size
    pres = read('ppt/presentation.xml')
    sz = pres.find('p:sldSz', NS)
    W, H = int(sz.get('cx')), int(sz.get('cy'))
    ratio = W / H
    fmt = '16:9' if abs(ratio - 16 / 9) < 0.02 else '4:3' if abs(ratio - 4 / 3) < 0.02 else 'custom'
    out.append('## Format\n')
    out.append(f'- Slide size: {inch(W)} x {inch(H)} in ({fmt})\n')

    # Theme (of first master)
    theme_name = 'ppt/theme/theme1.xml'
    rels = 'ppt/slideMasters/_rels/slideMaster1.xml.rels'
    if rels in names:
        for rel in read(rels):
            t = rel.get('Target', '')
            if 'theme' in t:
                theme_name = 'ppt/' + t.replace('../', '')
    theme = read(theme_name)
    scheme = {}
    cs = theme.find('.//a:clrScheme', NS)
    for el in cs:
        tag = el.tag.replace(A, '')
        c = el.find('a:srgbClr', NS)
        s = el.find('a:sysClr', NS)
        scheme[tag] = (c.get('val') if c is not None else s.get('lastClr') if s is not None else '?').upper()
    alias = {'tx1': 'dk1', 'bg1': 'lt1', 'tx2': 'dk2', 'bg2': 'lt2'}
    fonts = {}
    fs = theme.find('.//a:fontScheme', NS)
    for kind, key in (('majorFont', 'mj'), ('minorFont', 'mn')):
        f = fs.find(f'a:{kind}', NS)
        for script in ('latin', 'ea', 'cs'):
            e = f.find(f'a:{script}', NS)
            fonts[f'+{key}-{script[:2] if script != "latin" else "lt"}'] = e.get('typeface') if e is not None else ''
    out.append('\n## Theme\n')
    out.append('| Slot | Hex |\n|---|---|\n')
    for k, v in scheme.items():
        out.append(f'| {k} | `{v}` |\n')
    out.append(f"\n- Heading font (major): latin **{fonts.get('+mj-lt')}**, east-asian **{fonts.get('+mj-ea') or '(none)'}**\n")
    out.append(f"- Body font (minor): latin **{fonts.get('+mn-lt')}**, east-asian **{fonts.get('+mn-ea') or '(none)'}**\n")

    # Master text styles
    master = read('ppt/slideMasters/slideMaster1.xml')
    out.append('\n## Master text styles (default sizes)\n')
    tx = master.find('p:txStyles', NS)
    if tx is not None:
        for style in ('titleStyle', 'bodyStyle', 'otherStyle'):
            st = tx.find(f'p:{style}', NS)
            if st is None:
                continue
            parts = []
            for lvl in range(1, 4):
                pp = st.find(f'a:lvl{lvl}pPr', NS)
                if pp is None:
                    continue
                d = pp.find('a:defRPr', NS)
                if d is not None and d.get('sz'):
                    parts.append(f'L{lvl} {int(d.get("sz")) / 100:g}pt' + (' bold' if d.get('b') == '1' else ''))
            out.append(f'- {style}: {", ".join(parts) or "(not set)"}\n')

    # Placeholder geometry on master + layouts
    def placeholders(root):
        res = []
        for sp in root.iter(P + 'sp'):
            ph = sp.find('p:nvSpPr/p:nvPr/p:ph', NS)
            if ph is None:
                continue
            off = sp.find('p:spPr/a:xfrm/a:off', NS)
            ext = sp.find('p:spPr/a:xfrm/a:ext', NS)
            if off is None or ext is None:
                continue
            res.append((ph.get('type', 'body'), off, ext))
        return res

    out.append('\n## Placeholder positions on the master (inches)\n')
    out.append('| Placeholder | Left | Top | Width | Height | Right margin | Bottom gap |\n|---|---|---|---|---|---|---|\n')
    for t, off, ext in placeholders(master):
        x, y, cx, cy = int(off.get('x')), int(off.get('y')), int(ext.get('cx')), int(ext.get('cy'))
        out.append(f'| {t} | {inch(x)} | {inch(y)} | {inch(cx)} | {inch(cy)} | {inch(W - x - cx)} | {inch(H - y - cy)} |\n')

    layouts = sorted([n for n in names if re.match(r'ppt/slideLayouts/slideLayout\d+\.xml$', n)], key=num_key)
    out.append(f'\n## Layouts ({len(layouts)})\n')
    title_pos = collections.Counter()
    for n in layouts:
        root = read(n)
        name = root.find('p:cSld', NS).get('name', '')
        out.append(f'- {name}\n')
        for t, off, ext in placeholders(root):
            if t in ('title', 'ctrTitle'):
                title_pos[(inch(off.get('x')), inch(off.get('y')), inch(ext.get('cx')))] += 1
    if title_pos:
        out.append('\nTitle box (left, top, width) across layouts: ' + '; '.join(f'{k} x{v}' for k, v in top(title_pos, 5)) + '\n')

    # Slides: actual usage
    slides = sorted([n for n in names if re.match(r'ppt/slides/slide\d+\.xml$', n)], key=num_key)
    size_title, size_other = collections.Counter(), collections.Counter()
    faces, colours, lines = collections.Counter(), collections.Counter(), collections.Counter()
    lefts, rights, tops, bottoms = (collections.Counter() for _ in range(4))
    title_geo = collections.Counter()
    n_tables = n_charts = n_pics = 0

    def r05(v):  # round inches to 0.05
        return round(round(int(v) / EMU / 0.05) * 0.05, 2)

    for n in slides:
        root = read(n)
        for sp in root.iter(P + 'sp'):
            ph = sp.find('p:nvSpPr/p:nvPr/p:ph', NS)
            is_title = ph is not None and ph.get('type') in ('title', 'ctrTitle')
            off = sp.find('p:spPr/a:xfrm/a:off', NS)
            ext = sp.find('p:spPr/a:xfrm/a:ext', NS)
            if is_title and off is not None and ext is not None:
                title_geo[(inch(off.get('x')), inch(off.get('y')), inch(ext.get('cx')))] += 1
            for tag in ('rPr', 'defRPr', 'endParaRPr'):
                for r in sp.iter(A + tag):
                    if r.get('sz'):
                        (size_title if is_title else size_other)[int(r.get('sz')) / 100] += 1
        for el in root.iter(A + 'latin'):
            tf = el.get('typeface', '')
            faces[fonts.get(tf, tf) if tf.startswith('+') else tf] += 1
        for el in root.iter(A + 'srgbClr'):
            colours[el.get('val').upper()] += 1
        for el in root.iter(A + 'schemeClr'):
            v = el.get('val')
            hexv = scheme.get(alias.get(v, v))
            if hexv:
                colours[hexv] += 1
        for el in root.iter(A + 'ln'):
            if el.get('w'):
                lines[round(int(el.get('w')) / 12700, 2)] += 1
        for xf in root.iter(A + 'xfrm'):
            off, ext = xf.find('a:off', NS), xf.find('a:ext', NS)
            if off is None or ext is None:
                continue
            x, y, cx, cy = int(off.get('x')), int(off.get('y')), int(ext.get('cx')), int(ext.get('cy'))
            if cx >= 0.95 * W or cx < 0.2 * EMU or x <= 0 or y <= 0 or x + cx >= W or y + cy >= H:
                continue  # full-bleed, edge-touching, tiny or group-internal shapes
            lefts[r05(x)] += 1
            rights[r05(W - x - cx)] += 1
            tops[r05(y)] += 1
            bottoms[r05(H - y - cy)] += 1
        n_tables += len(list(root.iter(A + 'tbl')))
        n_charts += sum(1 for g in root.iter(A + 'graphicData') if 'chart' in g.get('uri', ''))
        n_pics += len(list(root.iter(P + 'pic')))

    out.append(f'\n## Actual usage across {len(slides)} slides\n')
    out.append(f'- Objects: {n_tables} tables, {n_charts} charts, {n_pics} pictures\n')
    out.append('- Title font sizes (pt, count): ' + ', '.join(f'{k:g} x{v}' for k, v in top(size_title, 6)) + '\n')
    out.append('- Other text sizes (pt, count): ' + ', '.join(f'{k:g} x{v}' for k, v in top(size_other, 10)) + '\n')
    out.append('- Typefaces used (count): ' + ', '.join(f'{k or "(inherit)"} x{v}' for k, v in top(faces, 8)) + '\n')
    out.append('- Line weights (pt, count): ' + ', '.join(f'{k:g} x{v}' for k, v in top(lines, 6)) + '\n')
    if title_geo:
        out.append('- Title box on slides (left, top, width): ' + '; '.join(f'{k} x{v}' for k, v in top(title_geo, 4)) + '\n')
    out.append('\n### Colours actually used (theme colours resolved to hex)\n')
    out.append('| Hex | Uses | Theme slot |\n|---|---|---|\n')
    inv = {}
    for k, v in scheme.items():
        inv.setdefault(v, k)
    for hexv, c in top(colours, 16):
        out.append(f'| `{hexv}` | {c} | {inv.get(hexv, "")} |\n')
    out.append('\n### Alignment lines (most common edges, inches; strongest = likely margins/grid)\n')
    out.append('- Left edges: ' + ', '.join(f'{k} x{v}' for k, v in top(lefts, 6)) + '\n')
    out.append('- Right margins: ' + ', '.join(f'{k} x{v}' for k, v in top(rights, 6)) + '\n')
    out.append('- Top edges: ' + ', '.join(f'{k} x{v}' for k, v in top(tops, 6)) + '\n')
    out.append('- Bottom margins: ' + ', '.join(f'{k} x{v}' for k, v in top(bottoms, 6)) + '\n')
    return ''.join(out)


# ---------------------------------------------------------------- images / pdf
def study_images(paths, page_size_in=None):
    from PIL import Image
    out = ['## Image analysis (measured from pixels; verify by eye)\n']
    total = collections.Counter()
    for pth in paths:
        im = Image.open(pth).convert('RGB')
        w, h = im.size
        ratio = w / h
        fmt = '16:9' if abs(ratio - 16 / 9) < 0.03 else '4:3' if abs(ratio - 4 / 3) < 0.03 else f'{ratio:.2f}:1'
        out.append(f'- {os.path.basename(pth)}: {w}x{h}px ({fmt})\n')
        small = im.copy()
        small.thumbnail((400, 400))
        q = small.quantize(colors=12, method=Image.Quantize.MEDIANCUT).convert('RGB')
        for count, rgb in q.getcolors(400 * 400):
            total['%02X%02X%02X' % rgb] += count
        # content box: non-near-white pixels
        g = im.convert('L').point(lambda v: 0 if v > 245 else 255)
        box = g.getbbox()
        if box:
            l, t, r, b = box
            out.append(f'  - Content box margins (fraction of width/height): left {l / w:.3f}, right {(w - r) / w:.3f}, top {t / h:.3f}, bottom {(h - b) / h:.3f}\n')
            if page_size_in:
                pw, ph = page_size_in
                out.append(f'  - In inches at {pw}x{ph}: left {l / w * pw:.2f}, right {(w - r) / w * pw:.2f}, top {t / h * ph:.2f}, bottom {(h - b) / h * ph:.2f}\n')
    out.append('\n### Dominant colours (share of pixels)\n| Hex | Share |\n|---|---|\n')
    s = sum(total.values())
    for hexv, c in total.most_common(12):
        out.append(f'| `{hexv}` | {c / s:.1%} |\n')
    out.append('\nFonts and exact sizes cannot be measured from pixels: identify by eye, name the closest available font, and state it as inferred.\n')
    return ''.join(out)


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    src = sys.argv[1]
    ext = os.path.splitext(src)[1].lower()
    tmp = tempfile.mkdtemp()
    header = f'# Reference style card: {os.path.basename(src)}\n\nGenerated by scripts/study_reference.py. Measured values; confirm against rendered slides before use.\n\n'
    if ext == '.ppt':
        subprocess.run(['soffice', '--headless', '--convert-to', 'pptx', '--outdir', tmp, src], check=True, capture_output=True)
        src = os.path.join(tmp, os.path.splitext(os.path.basename(src))[0] + '.pptx')
        ext = '.pptx'
    if ext in ('.pptx', '.potx', '.pptm', '.potm'):
        body = study_pptx(src)
    elif ext == '.pdf':
        info = subprocess.run(['pdfinfo', src], capture_output=True, text=True).stdout
        m = re.search(r'Page size:\s+([\d.]+) x ([\d.]+) pts', info)
        page = (round(float(m.group(1)) / 72, 2), round(float(m.group(2)) / 72, 2)) if m else None
        subprocess.run(['pdftoppm', '-png', '-r', '60', '-l', '6', src, os.path.join(tmp, 'pg')], check=True)
        imgs = sorted(os.path.join(tmp, f) for f in os.listdir(tmp) if f.endswith('.png'))
        body = (f'- PDF page size: {page[0]} x {page[1]} in\n\n' if page else '') + study_images(imgs, page)
    else:
        body = study_images([src])
    text = header + body
    if len(sys.argv) > 2:
        os.makedirs(os.path.dirname(os.path.abspath(sys.argv[2])), exist_ok=True)
        open(sys.argv[2], 'w', encoding='utf8').write(text)
        print('written', sys.argv[2])
    else:
        print(text)


if __name__ == '__main__':
    main()
