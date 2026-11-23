import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../lib"))
from place_named import place_named
C = os.path.join(os.path.dirname(__file__), "candidate.pptx")
place_named(C, "del-014", texts=["设计方案", "试点验证", "全面推广"], replace={"Text, Arial  14-pt bold": "诊断现状"})  # first chevron label below
