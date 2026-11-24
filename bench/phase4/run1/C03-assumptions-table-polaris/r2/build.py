# Runs after build.js (cwd = this folder): the slide is page 22 of the deck, as the prompt says.
# The reference deck types its page numbers as plain text boxes; here the slide's page-number field is turned into the
# plain number 22 (a one-slide file would otherwise show 1), and firstSlideNum is set to 22 for PowerPoint too.
import re, zipfile, shutil
src = "candidate.pptx"; tmp = src + ".tmp"
with zipfile.ZipFile(src) as zin:
    with zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
        for item in zin.infolist():
            data = zin.read(item.filename)
            if item.filename == "ppt/presentation.xml":
                x = re.sub(r'\sfirstSlideNum="\d+"', "", data.decode("utf8"))
                data = re.sub(r"<p:presentation\b", '<p:presentation firstSlideNum="22"', x, count=1).encode("utf8")
            elif item.filename == "ppt/slides/slide1.xml":
                x = data.decode("utf8")
                x = re.sub(r'<a:fld [^>]*type="slidenum"[^>]*>(<a:rPr[^>]*/>)<a:t>[^<]*</a:t></a:fld>', r"<a:r>\1<a:t>22</a:t></a:r>", x)
                x = re.sub(r'<p:nvPr><p:ph type="sldNum"[^>]*/></p:nvPr>', "<p:nvPr/>", x)   # a plain text box, as in the deck
                data = x.encode("utf8")
            zout.writestr(item, data)
shutil.move(tmp, src)
print("page 22")
