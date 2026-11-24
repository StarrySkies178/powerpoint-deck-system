#!/usr/bin/env bash
# Run once per session before rendering slides to images on the Linux machine (the Mac's VM or the cloud).
# Since v2.84: the reference decks' own fonts are installed or mapped to metric-compatible ones, so a LibreOffice
# render breaks lines where PowerPoint does. Without this, LibreOffice draws a wider substitute (DejaVu Sans) for
# Verdana and Tahoma, and text wraps that does not wrap in PowerPoint (C07 in bench/review-mimic-3).
#   Verdana, Arial, Times New Roman  -> the real fonts, from Microsoft's free "core fonts for the web" (SourceForge
#                                       corefonts, the files Debian's ttf-mscorefonts-installer uses), extracted locally
#   Tahoma (+ Bold), Wingdings       -> Wine's metric-compatible Tahoma and Wingdings (Ubuntu package fonts-wine)
#   Calibri, Calibri Light           -> Carlito (metric-compatible with Calibri)
#   Arial MT                          -> Arial (the same design; PDF-derived decks name it so)
#   Microsoft YaHei, SimSun          -> Noto Sans / Serif CJK SC (close width)
# The font files stay in ~/.local/share/fonts/deck-system (never in the Powerpoint folder or the repo).
# Needs network (SourceForge, the Ubuntu/Debian package mirror); without it, only the mappings are set and the script
# says which fonts are missing. Prints what each family now resolves to.
set -u
FD="$HOME/.local/share/fonts/deck-system"; W="$HOME/.cache/deck-system-fonts"; mkdir -p "$FD" "$W" "$HOME/.config/fontconfig"
have() { fc-list : family | tr ',' '\n' | grep -qix "$1"; }
CAB=""
if command -v cabextract >/dev/null 2>&1; then CAB=cabextract
else
  ( cd "$W" && [ -f cabx/usr/bin/cabextract ] || { timeout 120 apt-get download cabextract libmspack0 >/dev/null 2>&1 && for d in cabextract_*.deb libmspack0_*.deb; do dpkg-deb -x "$d" cabx; done; } ) || true
  if [ -x "$W/cabx/usr/bin/cabextract" ]; then CAB="$W/cabx/usr/bin/cabextract"; export LD_LIBRARY_PATH="$(dirname "$(find "$W/cabx" -name 'libmspack.so*' | head -1)"):${LD_LIBRARY_PATH:-}"; fi
fi
for pkg in verdan32 arial32 arialb32 times32; do
  [ -n "$CAB" ] || break
  case $pkg in verdan32) fam=Verdana;; arial32|arialb32) fam=Arial;; times32) fam="Times New Roman";; esac
  [ -f "$W/$pkg.exe" ] || timeout 120 curl -sfL -o "$W/$pkg.exe" "https://downloads.sourceforge.net/corefonts/$pkg.exe" || { rm -f "$W/$pkg.exe"; continue; }
  "$CAB" -q -L -F '*.ttf' -d "$FD" "$W/$pkg.exe" >/dev/null 2>&1 || true
done
if ! ls "$FD"/tahoma*.ttf >/dev/null 2>&1; then
  ( cd "$W" && timeout 120 apt-get download fonts-wine >/dev/null 2>&1 && dpkg-deb -x fonts-wine_*.deb wine ) || true
  for f in tahoma.ttf tahomabd.ttf wingding.ttf; do p=$(find "$W/wine" -name "$f" 2>/dev/null | head -1); [ -n "$p" ] && cp "$p" "$FD/"; done
fi
cat > "$HOME/.config/fontconfig/fonts.conf" <<'XML'
<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>~/.local/share/fonts</dir>
  <alias binding="same"><family>Arial</family><prefer><family>Arial</family><family>Liberation Sans</family></prefer></alias>
  <alias binding="same"><family>Arial MT</family><prefer><family>Arial</family><family>Liberation Sans</family></prefer></alias>
  <alias binding="same"><family>Calibri</family><prefer><family>Carlito</family></prefer></alias>
  <alias binding="same"><family>Calibri Light</family><prefer><family>Carlito</family></prefer></alias>
  <alias binding="same"><family>Times New Roman</family><prefer><family>Times New Roman</family><family>Liberation Serif</family></prefer></alias>
  <alias binding="same"><family>Microsoft YaHei</family><prefer><family>Noto Sans CJK SC</family></prefer></alias>
  <alias binding="same"><family>微软雅黑</family><prefer><family>Noto Sans CJK SC</family></prefer></alias>
  <alias binding="same"><family>SimSun</family><prefer><family>Noto Serif CJK SC</family><family>Noto Sans CJK SC</family></prefer></alias>
</fontconfig>
XML
fc-cache -f >/dev/null 2>&1 || true
missing=""
for fam in Verdana Tahoma Arial "Arial MT" Calibri "Calibri Light" "Times New Roman" Wingdings "Microsoft YaHei"; do
  got=$(fc-match -f '%{family[0]}' "$fam"); echo "$fam -> $got"
  case "$fam:$got" in "Arial MT:Arial"|"Arial:Liberation Sans"|"Arial MT:Liberation Sans"|"Times New Roman:Liberation Serif"|"Calibri:Carlito"|"Calibri Light:Carlito"|"Microsoft YaHei:Noto Sans CJK SC") ;; *) [ "$got" = "$fam" ] || missing="$missing $fam";; esac
done
[ -z "$missing" ] && echo "ALL FONTS OK" || echo "NOT METRIC-COMPATIBLE:$missing (renders of decks using them may break lines differently from PowerPoint)"
