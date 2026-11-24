#!/bin/bash
# full second pass per deck: written chart specs -> picture tables -> text polish -> found charts
N=/tmp/nr/nat; O=/tmp/nr/p3
declare -A TB=( [case21-starlight]="case21-starlight:19 case21-starlight:20" [case21-whyconsulting]="case21-whyconsulting:19 case21-whyconsulting:20" [case24-yess]="case24-yess:18 case24-yess:21 case24-yess:23" )
for k in "$@"; do
  n=$(grep "^$k " /tmp/nr/allkeys.txt | cut -d' ' -f2); src=/tmp/nr/final/$n-rebuilt.pptx; cur=$O/$k.0.pptx; cp "$src" $cur
  if [ -f $N/specs/$k.json ]; then python3 $N/nativize.py $cur $k $N/specs/$k.json $O/$k.1.pptx > $O/$k.nat.log 2>&1 && cur=$O/$k.1.pptx; fi
  if [ -n "${TB[$k]}" ]; then python3 $N/ocrtable.py $cur $O/$k.2.pptx ${TB[$k]} > $O/$k.tab.log 2>&1 && cur=$O/$k.2.pptx; fi
  python3 $N/polish2.py $k $cur $O/$k.3.pptx --report $O/$k.polish.json > $O/$k.pol.log 2>&1 && cur=$O/$k.3.pptx
  :
  cp $cur $O/$k.pptx; echo "done $k $(basename $cur)"
done
