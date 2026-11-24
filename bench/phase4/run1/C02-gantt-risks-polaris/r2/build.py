# Runs after build.js (cwd = this folder): the page number from the prompt ("Page ..." line) goes on the page.
# Sets the presentation's first page number and writes the number as plain text in place of the number field
# (LibreOffice ignores firstSlideNum, so the field alone would read 1 in a render).
import zipfile, shutil, re
PAGE = str(8 * 2)   # the prompt's page number
src = "candidate.pptx"; tmp = "candidate.tmp.pptx"
with zipfile.ZipFile(src) as zi, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zo:
    for it in zi.infolist():
        data = zi.read(it.filename)
        if it.filename == "ppt/presentation.xml":
            x = re.sub(r'\sfirstSlideNum="\d+"', "", data.decode("utf8"))
            data = x.replace("<p:presentation ", '<p:presentation firstSlideNum="%s" ' % PAGE, 1).encode("utf8")
        elif re.fullmatch(r"ppt/slides/slide\d+\.xml", it.filename):
            x = data.decode("utf8")
            x = re.sub(r'<a:fld [^>]*type="slidenum"[^>]*>(<a:rPr[^>]*/>)<a:t>\d+</a:t></a:fld>', lambda m: m.group(1).join(["<a:r>", "<a:t>%s</a:t></a:r>" % PAGE]), x)
            data = x.encode("utf8")
        zo.writestr(it, data)
shutil.move(tmp, src)
