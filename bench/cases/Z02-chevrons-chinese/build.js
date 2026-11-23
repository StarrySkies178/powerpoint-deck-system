const L = require("../../lib/bench_lib.js");
const { pres, slide, B, P } = L.start({ ref: "Deloitte-timesaver", title: "文本框", subtitle: "带文本框的箭头流程" });
const cw = 9.14 / 4, pts = [["访谈关键管理层", "梳理现有流程", "找出三大痛点"], ["确定目标模式", "设计组织与流程", "制定关键指标"], ["选择两个试点区域", "跟踪指标三个月", "总结经验教训"], ["分批推广到全国", "建立培训体系", "持续改进机制"]];
pts.forEach((a, i) => P.txt(slide, a.map((t, k) => ({ text: t, options: { bullet: true, breakLine: k < 2 } })), 0.43 + i * cw, 2.6, cw - 0.12, 1.6, { fontSize: 11, keepSize: true, margin: 0 }));
L.save(pres, __dirname + "/candidate.pptx");
