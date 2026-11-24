#!/bin/bash
# polish every deck except chillchili (done separately with charts)
while read k n; do
  [ "$k" = "case21-chillchili" ] && continue
  f=/tmp/nr/final/$n-rebuilt.pptx
  [ -f "$f" ] || { echo "missing $f"; continue; }
  python3 /tmp/nr/nat/polish2.py $k "$f" /tmp/nr/pol/$k.pptx --report /tmp/nr/pol/$k.json > /tmp/nr/pol/$k.log 2>&1 && echo "ok $k" || echo "FAIL $k"
done < /tmp/nr/allkeys.txt
