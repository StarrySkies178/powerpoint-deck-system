# Runs after build.js (working directory = this folder): the slide is page 12 of the deck, so the presentation's
# first slide number is set to 12 and the page-number field reads 12; the title gets the reference's paragraph indent.
import os, re, shutil, zipfile
src = "candidate.pptx"; tmp = src + ".tmp"
with zipfile.ZipFile(src) as zi, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zo:
    for it in zi.infolist():
        data = zi.read(it.filename)
        if it.filename == "ppt/presentation.xml":
            x = data.decode("utf8")
            x = re.sub(r'\sfirstSlideNum="\d+"', "", x)
            x = x.replace("<p:presentation ", '<p:presentation firstSlideNum="12" ', 1)
            data = x.encode("utf8")
        if re.fullmatch(r"ppt/slides/slide\d+\.xml", it.filename):
            x = data.decode("utf8")
            # page number: the deck's field shows 12 (LibreOffice ignores firstSlideNum, so the number is written as text)
            x = re.sub(r'<a:fld [^>]*type="slidenum"[^>]*>(<a:rPr[^>]*/>)<a:t>\d+</a:t></a:fld>', r'<a:r>\1<a:t>12</a:t></a:r>', x)
            # title: the reference indents its title paragraph 0.35 in inside the full-width band (marL 318135 EMU)
            i = x.find('type="title"'); j = x.find('<a:pPr', i)
            if i > 0 and j > 0:
                k = x.find('>', j); pp = x[j:k]
                sc = pp.endswith("/"); pp = re.sub(r'\smarL="\d+"', "", pp.rstrip("/")) + ' marL="318135"' + ("/" if sc else "")
                x = x[:j] + pp + x[k:]
            # bullets in the deck's navy at ~80% of the text size, as its bullet lists have them (E-Cluster 14, 16)
            x = re.sub(r'(<a:buSzPct val="\d+"/>)?<a:buChar char="&#x25CF;"/>', '<a:buClr><a:srgbClr val="10366C"/></a:buClr><a:buSzPct val="80000"/><a:buChar char="&#x25CF;"/>', x)
            data = x.encode("utf8")
        zo.writestr(it, data)
shutil.move(tmp, src)
