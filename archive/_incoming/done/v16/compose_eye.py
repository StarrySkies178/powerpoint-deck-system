# Composition of every slide, classified by eye on the rendered slides (auto panel scan used only as a guide).
# Codes:
#  FULL   one exhibit across the body            | HALF2  two exhibits side by side
#  BAND2  two horizontal bands (each: exhibit + its text) | GRID4  2x2 panels
#  GRID4I 2x2 where one cell is the Insights box  | T2B1  two panels on top + one wide below (or mirror)
#  COL3   three columns                            | EXI   exhibits on the left + insight/so-what column on the right (~30%)
#  CVT    chart -> chevron -> takeaway box         | ROWS  repeated rows (table-like: label | exhibit | text)
#  FLOW   left -> arrow -> right (cause/effect, before/after) | FRAME  one framework/summary diagram
#  TEXT   text-led (exec summary, list)            | META  cover / divider / agenda / end
C = {}
def c(deck, codes):
    for i, k in enumerate(codes.split(), 1): C[(deck, i)] = k
c("Harvester", "META TEXT META GRID4 META GRID4I GRID4I GRID4I ROWS GRID4I GRID4I BAND2 FLOW META FRAME HALF2 COL3 BAND2 HALF2 META")
#  T1B2   one wide panel on top + two below (usually exhibit + comment) | TABLE  one full table
#  CHAIN  evidence (chart/table) -> chevron -> decision box, with tactic boxes below
c("Jaguar", "META TEXT GRID4I META T1B2 ROWS GRID4I TABLE META BAND2 TABLE ROWS GRID4I FLOW META T2B1 CHAIN CHAIN BAND2 META")
c("Sparkle", "META FRAME HALF2 HALF2 T1B2 T1B2 HALF2 HALF2 GRID4 T2B1 T2B1 HALF2 HALF2 HALF2 FRAME FULL")
SYN = "META TEXT META GRID4I"
#  EXB    one exhibit + insight bar below it
c("Synergy", SYN + " EXB GRID4 GRID4I HALF2 META GRID4 FLOW EXI EXI T1B2 COL3 HALF2 FULL META")
TN = "META META GRID4 GRID4I EXI BAND2"
c("TrueNorth", TN + " T2B1 TABLE HALF2 ROWS GRID4 BAND2 HALF2 HALF2 BAND2 T1B2 FULL TABLE META HALF2 HALF2 BAND2 FULL")
POL = "META FRAME HALF2"
#  L2R1   left column of two stacked panels + one tall panel on the right (or mirror)
c("Polaris", POL + " L2R1 EXB TABLE T1B2 T2B1 HALF2 T2B1 HALF2 L2R1 HALF2 BAND2 FRAME FULL")
SS = "META META L2R1 META FLOW META FLOW"
SS += " T2B1 META COL3 HALF2 HALF2 META L2R1 HALF2 META L2R1 BAND2 GRID4 META FULL TABLE TABLE TABLE TABLE COL3 HALF2"
SS += " GRID4I TABLE"
c("SSSR", SS)
c("LittleBoat", "META META META T1B2 GRID4I BAND2 EXI EXI META EXI HALF2 EXI FRAME FRAME META HALF2 EXI TABLE")
c("Neptune", "META FRAME GRID4I META GRID4I GRID4I GRID4I GRID4I GRID4I HALF2 META FRAME T2B1 HALF2 GRID4I FRAME T2B1 TABLE")
OD = "META FRAME"
c("OldDriver", OD + " META HALF2 META HALF2 HALF2 HALF2 HALF2 HALF2 HALF2 META FRAME L2R1 HALF2 COL3 HALF2 BAND2 GRID4 FULL FULL")
