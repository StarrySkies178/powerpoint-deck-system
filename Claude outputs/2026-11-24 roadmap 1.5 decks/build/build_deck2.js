// Deck 2 (roadmap step 1.5, real deck task): 高层管理会议, Simplified Chinese, 8 slides.
// Brief: third-quarter progress report of a manufacturer's digital transformation programme; mostly text,
// timeline, milestones, risks, next steps. 公司与数据均为虚构 (stated on every source line).
const path = require("path");
const ROOT = process.env.DECK_ROOT || "/home/claude/wt";
const pptxgen = require("pptxgenjs");
const G = require(path.join(ROOT, "Generators/patterns.js")), P = require(path.join(ROOT, "Generators/patterns_story.js"));
const H = G.HOUSE, { C } = G, L = H.LAYOUT, B = G.BODY;
const pres = H.newDeck(pptxgen, "华拓精密 数字化转型 2026年第三季度进展");
const SRC = "资料来源：公司与数据均为虚构，仅作示例";
const SECTIONS = ["总体进展", "时间与里程碑", "风险", "下一步"];
const S = (sec, title, src = SRC) => { const s = pres.addSlide({ masterName: L.titleOnly }); G.frame(pres, s, { title, crumb: sec == null ? undefined : { items: SECTIONS, current: sec }, source: src }); return s; };
const col = (name, labels, values, hi, format) => ({ type: "column", labels, series: [{ name, values }], highlight: hi, format });

// 1 封面
{ const s = pres.addSlide({ masterName: L.title });
  s.addText("数字化转型第三季度：整体按计划推进，MES二期需追加资源", { placeholder: "title" });
  s.addText("华拓精密制造（虚构公司）· 高层管理会议", { placeholder: "subtitle" });
  s.addText("2026年10月 · 示例材料，公司与数据均为虚构", { placeholder: "date" }); }

// 2 执行摘要
P.letteredSummary(S(null, "执行摘要：五个工作流中三个按计划推进，两个延迟，今天需要管理层做两项决定"), { highlight: 3,
  projection: { title: "本季度数字", items: [{ label: "预算使用（全年）", value: "62%" }, { label: "里程碑完成", value: "9 / 14" }, { label: "试点工厂OEE", value: "+6个百分点" }],
    risks: { title: "主要风险", items: ["主数据质量不足", "关键人员流失", "供应商交付延迟"] } }, items: [
  { conclusion: "总体按计划：五个工作流中三个达成季度目标", points: ["智能排产、设备联网、质量追溯按计划推进", "全年预算使用62%，与计划一致"] },
  { conclusion: "第三季度完成四个里程碑，试点工厂效率明显提升", points: ["试点工厂设备综合效率（OEE）由61%提升至67%", "质量追溯覆盖两条主线，客诉追查时间缩短一半"] },
  { conclusion: "MES二期与数据平台延迟，原因已查明", points: ["MES二期上线推迟至2027年3月：供应商人力不足", "数据平台受主数据质量拖累，延迟约六周"] },
  { conclusion: "请管理层今天决定两件事", points: ["追加MES二期预算380万元，确保2027年3月上线", "任命数据治理负责人，本月到位"] }] });

// 3 工作流状态：表格 + 预算
P.composeSlide(pres, S(0, "五个工作流中三个达成季度目标；MES二期和数据平台延迟，原因分别是供应商人力和主数据质量"), { layout: "T1B2", insightsLabel: "要点", panels: [
  { icon: "list-check", headline: "工作流进展一览：三个按计划，两个延迟", unit: "各工作流第三季度目标、实际进展与状态",
    draw: (s, b) => G.dataTable(s, { header: ["工作流", "第三季度目标", "实际进展", "状态"], colW: [0.17, 0.34, 0.34, 0.15], alignRight: false, maxRowH: 0.42, fontSize: 11, highlightRow: 3, rows: [
      ["智能排产", "试点工厂上线排产系统", "已上线，计划达成率提升至92%", "✓ 按计划"], ["设备联网", "接入300台关键设备", "已接入318台", "✓ 按计划"], ["质量追溯", "覆盖两条主线", "两条主线已覆盖", "✓ 按计划"],
      ["MES二期", "完成二期开发与测试", "开发完成70%，测试未开始", "✗ 延迟12周"], ["数据平台", "主数据清洗完成", "完成60%", "✗ 延迟6周"]] }, b) },
  { icon: "coins", headline: "预算使用与计划一致", unit: "全年预算累计使用比例，%", chart: { type: "column", labels: ["第一季度", "第二季度", "第三季度"], series: [{ name: "计划", values: [20, 42, 63] }, { name: "实际", values: [18, 40, 62] }], highlight: 1 },
    readingSide: "right", readingShare: 0.42, reading: ["累计使用**62%**，计划为63%", "延迟工作流的预算尚未花出，**不存在超支**"] }],
  insights: ["**三个工作流**达成季度目标", "MES二期延迟的原因是**供应商人力不足**", "数据平台延迟的原因是**主数据质量**", "两项延迟都需要管理层支持"],
  soWhat: "进展总体可控，但需要为两项延迟做决定" });

// 4 时间线（甘特图）
P.gantt(S(1, "MES二期上线由2026年12月推迟至2027年3月，其余里程碑保持不变，2027年底全面完成"), {
  periods: ["2026 Q1", "2026 Q2", "2026 Q3", "2026 Q4", "2027 Q1", "2027 Q2", "2027 Q3", "2027 Q4"],
  phases: [{ label: "试点", sub: "一家工厂", from: 0, to: 4 }, { label: "推广", sub: "三家工厂", from: 4, to: 8 }],
  groups: [{ name: "生产", rows: [{ label: "智能排产", from: 0, to: 6 }, { label: "MES二期（推迟）", from: 1, to: 5, hi: true, milestone: 5 }, { label: "设备联网", from: 0, to: 7 }] },
    { name: "质量与数据", rows: [{ label: "质量追溯", from: 1, to: 7 }, { label: "数据平台", from: 2, to: 6, milestone: 4.5 }, { label: "数据治理", from: 3, to: 8 }] },
    { name: "组织与人员", rows: [{ label: "数字化培训", from: 1, to: 8 }, { label: "变革管理", from: 2, to: 8 }] }], legend: false }, { ...B, h: B.h - 1.25 });
G.txt(pres.slides[pres.slides.length - 1], "■ 重点（推迟）   ■ 其他工作   ◆ 里程碑", B.x, B.y + B.h - 1.22, 4, 0.26, { fontSize: 9, color: C.g5 });
P.readingBox(pres.slides[pres.slides.length - 1], ["**MES二期**推迟一个季度至2027年3月：供应商增派人力后可以追回", "数据平台延迟六周，不影响2027年第二季度的推广", "全面完成时间仍为**2027年底**", "组织与人员工作贯穿两个阶段：培训按计划，变革管理从第二季度开始"], { x: B.x, y: B.y + B.h - 0.9, w: B.w, h: 0.9 });

// 5 本季度里程碑
P.composeSlide(pres, S(1, "第三季度完成四个里程碑，试点工厂设备综合效率提升6个百分点，客诉追查时间缩短一半"), { layout: "BAND2", panels: [
  { icon: "trophy", headline: "本季度完成的四个里程碑", points: [
    { icon: "calendar", label: "智能排产上线", text: "试点工厂**计划达成率**由84%升至92%。排产时间由每天两小时缩短至二十分钟，换型次数减少18%。" },
    { icon: "cpu", label: "设备联网", text: "**318台**关键设备实时采集数据，超出300台的目标。停机原因由人工记录改为自动采集。" },
    { icon: "search", label: "质量追溯", text: "两条主线实现从原料到成品的追溯，客诉追查时间由**4天缩短至2天**。" },
    { icon: "users", label: "数字化培训", text: "**420名**一线员工完成培训，超出计划20%；考核通过率94%。" }] },
  { icon: "chart-line", headline: "试点工厂OEE由61%升至67%", unit: "试点工厂设备综合效率（OEE），%，按月",
    chart: col("OEE, %", ["4月", "5月", "6月", "7月", "8月", "9月"], [61, 61, 62, 64, 66, 67], 5), readingSide: "right", readingShare: 0.45,
    reading: ["提升主要来自**换型时间缩短**（排产系统）", "停机原因可实时查看，维修响应加快", "目标为2026年底达到**70%**"] }] });

// 6 风险
P.riskMatrix(S(2, "三项风险需要管理层关注：主数据质量、关键人员流失和供应商交付，均已制定应对措施"), {
  x: { label: "影响" }, y: { label: "可能性" }, zone: { x0: 0.5, x1: 1, y0: 0.5, y1: 1, label: "重点风险" }, riskHeader: "风险", mitigationHeader: "应对措施",
  risks: [
  { id: 1, name: "主数据质量不足", x: 0.8, y: 0.75, mitigation: ["任命数据治理负责人", "每周发布数据质量报告"] },
  { id: 2, name: "关键人员流失", x: 0.7, y: 0.6, mitigation: ["核心骨干保留计划", "关键岗位设置后备人选"] },
  { id: 3, name: "供应商交付延迟", x: 0.85, y: 0.55, mitigation: ["合同增加交付节点与罚则", "追加预算换取增派人力"] },
  { id: 4, name: "车间对新系统接受度低", x: 0.45, y: 0.4, mitigation: ["现场支持小组驻厂三个月"] },
  { id: 5, name: "网络安全事件", x: 0.6, y: 0.25, mitigation: ["上线前完成渗透测试"] }] }, { ...B, h: B.h - 0.95 });
P.readingBox(pres.slides[pres.slides.length - 1], ["风险**1至3**位于重点区域，每项都有负责人和完成时间", "风险1和3与本次申请的两项决定直接相关"], { x: B.x, y: B.y + B.h - 0.8, w: B.w, h: 0.8 });

// 7 第四季度下一步
P.composeSlide(pres, S(3, "第四季度七项重点工作，其中两项需要管理层本月决定，其余由项目组推进"), { layout: "FULL", panels: [
  { icon: "checklist", headline: "第四季度重点工作、负责人与完成时间", unit: "高亮两项需要管理层本月决定",
    draw: (s, b) => G.dataTable(s, { header: ["重点工作", "负责人", "完成时间", "需要的支持"], colW: [0.42, 0.16, 0.14, 0.28], alignRight: false, maxRowH: 0.4, fontSize: 11, highlightRow: 0, rows: [
      ["MES二期：供应商增派人力，完成测试", "生产副总", "12月底", "追加预算380万元（今天决定）"], ["任命数据治理负责人，完成主数据清洗", "首席信息官", "11月底", "人选（今天决定）"],
      ["智能排产推广至第二家工厂", "计划部", "12月中", "无"], ["设备联网扩展至450台", "设备部", "12月底", "无"], ["质量追溯覆盖第三条主线", "质量部", "12月底", "无"],
      ["一线员工培训再增300人", "人力资源部", "12月底", "无"], ["2027年推广方案报管理层", "项目办公室", "12月底", "1月例会审议"]] }, b),
    reading: ["七项工作中**五项**由项目组自行推进，不需要额外资源", "**两项**需要管理层本月决定：MES二期追加预算和数据治理负责人人选", "2027年推广方案将在1月例会审议，届时汇报三家工厂的推广顺序和预算"] }] });

// 8 决定
{ const s = pres.addSlide({ masterName: L.statementDark });
  s.addText("请管理层今天决定：追加MES二期预算380万元，并任命数据治理负责人", { placeholder: "statement" });
  s.addText("两项决定可确保MES二期于2027年3月上线、数据平台不影响推广。示例材料，公司与数据均为虚构。", { placeholder: "support" }); }

const out = process.argv[2] || "/home/claude/decks/deck2.pptx";
(async () => { await pres.writeFile({ fileName: out }); await H.finalize(out); console.log("written", out); })();
