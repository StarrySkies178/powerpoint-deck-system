#!/usr/bin/env bash
# Run once per session before rendering slides to images on the Linux machine.
# Maps the house fonts to installed look-alikes so previews have realistic line breaks:
#   Arial           -> Liberation Sans (metric-compatible)
#   Microsoft YaHei -> Noto Sans CJK SC (close width)
set -e
mkdir -p "$HOME/.config/fontconfig"
cat > "$HOME/.config/fontconfig/fonts.conf" <<'EOF'
<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <alias binding="same"><family>Arial</family><prefer><family>Liberation Sans</family></prefer></alias>
  <alias binding="same"><family>Microsoft YaHei</family><prefer><family>Noto Sans CJK SC</family></prefer></alias>
  <alias binding="same"><family>微软雅黑</family><prefer><family>Noto Sans CJK SC</family></prefer></alias>
</fontconfig>
EOF
fc-cache -f >/dev/null 2>&1 || true
echo "Arial -> $(fc-match -f '%{family}' 'Arial')"
echo "Microsoft YaHei -> $(fc-match -f '%{family}' 'Microsoft YaHei')"
