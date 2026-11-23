/* @ds-bundle: {"format":4,"namespace":"HouseStyle","components":[{"name":"Slide"},{"name":"TitleSlide"},{"name":"SectionDivider"},{"name":"Agenda"},{"name":"ExecSummary"},{"name":"KeyStatement"},{"name":"EndSlide"},{"name":"KPIRow"},{"name":"ColumnChart"},{"name":"LineChart"},{"name":"BarRanking"},{"name":"StackedBar100"},{"name":"Waterfall"},{"name":"Scatter"},{"name":"ChartCommentary"},{"name":"Matrix"},{"name":"HarveyBallTable"},{"name":"BeforeAfter"},{"name":"ChevronProcess"},{"name":"Timeline"},{"name":"IssueTree"},{"name":"Pyramid"},{"name":"Cycle"},{"name":"HubSpoke"},{"name":"TextColumns"},{"name":"ImageText"},{"name":"TakeawayBox"},{"name":"Tracker"},{"name":"ChinaMap"},{"name":"Gantt"},{"name":"Funnel"},{"name":"Venn"},{"name":"OrgChart"},{"name":"Temple"},{"name":"DonutKPI"},{"name":"Pie"},{"name":"Marimekko"},{"name":"Heatmap"}]} */
/* Powerpoint House Style — slide components. Geometry mirrors Generators/patterns.js in the Powerpoint folder
   (1 in = 96 px; a slide is 1280 x 720). Colours are tokens only, so a theme or a reference palette restyles everything. */
(function () {
  var React = window.React, h = React.createElement;
  var V = function (n) { return "var(--" + n + ")"; };
  var PT = function (pt) { return Math.round(pt * 4 / 3 * 100) / 100 + "px"; };
  var BW = 1203.2, BH = 500.2; // body area (12.53 x 5.21 in)
  var FONT = V("font-sans");

  function abs(x, y, w, hh, style, children, key) {
    return h("div", { key: key, style: Object.assign({ position: "absolute", left: x, top: y, width: w, height: hh, boxSizing: "border-box" }, style || {}) }, children);
  }
  function text(x, y, w, hh, content, o, key) {
    o = o || {};
    var jc = o.valign === "middle" ? "center" : o.valign === "bottom" ? "flex-end" : "flex-start";
    return abs(x, y, w, hh, {
      display: "flex", flexDirection: "column", justifyContent: jc, fontFamily: FONT, fontSize: PT(o.pt || 14), lineHeight: o.lh || 1.22,
      fontWeight: o.bold ? 700 : 400, color: o.color || V("ink"), textAlign: o.align || "left", padding: o.pad != null ? o.pad : "0 4px", overflow: "hidden", whiteSpace: "pre-line"
    }, content, key);
  }
  function body(p, children, extra) {
    return h("div", { className: "hs-el", style: Object.assign({ position: "relative", width: p.width || BW, height: p.height || BH, fontFamily: FONT }, extra || {}) }, children);
  }
  function numSquare(n, x, y, s, fill, key) {
    return abs(x, y, s, s, { background: fill, color: V("paper"), fontFamily: FONT, fontWeight: 700, fontSize: Math.round(s * 0.5) + "px", display: "flex", alignItems: "center", justifyContent: "center" }, String(n), key);
  }
  function rich(label, body2, color) {
    return [h("div", { key: "l", style: { fontWeight: 700, color: color || V("main") } }, label), body2 ? h("div", { key: "b", style: { marginTop: 4 } }, body2) : null];
  }
  function maxOf(arr) { return arr.reduce(function (a, b) { return Math.max(a, b); }, 0); }
  function fmt(v) { return typeof v === "number" ? v.toLocaleString("en-US").replace("-", "\u2212") : v; }

  // ---------------------------------------------------------------- frame
  function Tracker(p) {
    var n = p.n || 4, cur = p.current || 0, s = 19, g = 4;
    var x0 = 1280 - 38.4 - n * (s + g) + g;
    return h("div", { style: { position: "absolute", left: x0, top: 21, height: s, display: "flex", gap: g } },
      Array.from({ length: n }, function (_, i) {
        var on = i === cur;
        return h("div", { key: i, style: { width: s, height: s, background: on ? V("accent") : V("grey-4"), color: on ? V("paper") : V("grey-1"), fontFamily: FONT, fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" } }, String(i + 1));
      }));
  }

  function Slide(p) {
    var dark = !!p.dark;
    return h("div", { className: "hs-slide", "data-theme": dark ? "dark" : "light", style: { background: V("surface"), color: V("ink") } },
      p.tracker ? h(Tracker, p.tracker) : null,
      p.title ? h("div", { className: "t-title hs-title", style: { color: V("title") } }, p.title) : null,
      p.subtitle ? h("div", { className: "t-subtitle hs-sub", style: { color: V("muted") } }, p.subtitle) : null,
      h("div", { className: "hs-body" }, p.children),
      p.source ? h("div", { className: "t-foot hs-src", style: { color: V("muted") } }, p.source) : null,
      p.page != null ? h("div", { className: "t-foot hs-pg", style: { color: V("muted") } }, String(p.page)) : null);
  }

  function TitleSlide(p) {
    return h("div", { className: "hs-slide", "data-theme": "dark", style: { background: V("surface") } },
      h("div", { className: "t-cover", style: { position: "absolute", left: 38.4, top: 150, width: 1000, height: 270, display: "flex", alignItems: "flex-end", color: V("title") } }, p.title),
      abs(38.4, 436.8, 115.2, 7.68, { background: V("accent") }),
      p.subtitle ? h("div", { className: "t-subtitle", style: { position: "absolute", left: 38.4, top: 466, width: 1000, color: V("title") } }, p.subtitle) : null,
      p.date ? h("div", { className: "t-foot", style: { position: "absolute", left: 38.4, top: 640, color: V("muted") } }, p.date) : null);
  }

  function SectionDivider(p) {
    return h("div", { className: "hs-slide", "data-theme": "dark", style: { background: V("surface") } },
      h("div", { className: "t-kpi", style: { position: "absolute", left: 38.4, top: 214, color: V("accent") } }, p.number),
      h("div", { className: "t-divider", style: { position: "absolute", left: 38.4, top: 318, width: 1000, color: V("title") } }, p.title),
      p.page != null ? h("div", { className: "t-foot hs-pg", style: { color: V("muted") } }, String(p.page)) : null);
  }

  function Agenda(p) {
    var items = p.items || [];
    return h(Slide, { title: p.title || "Agenda", page: p.page },
      body(p, items.map(function (it, i) {
        var on = p.current === i;
        return h("div", { key: i, style: { position: "absolute", left: 0, top: 10 + i * 58, display: "flex", alignItems: "center", gap: 16 } },
          h("div", { style: { width: 34, height: 34, background: on ? V("accent") : "transparent", color: on ? V("paper") : V("grey-1"), fontFamily: FONT, fontWeight: 700, fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center" } }, String(i + 1)),
          h("div", { className: "t-body", style: { fontSize: "21px", fontWeight: on ? 700 : 400, color: on ? V("main") : V("ink") } }, it));
      })));
  }

  function ExecSummary(p) {
    var items = p.items || [], n = items.length, gap = 14, rh = Math.min(66, (BH - (n - 1) * gap) / n), lw = 300;
    return body(p, items.map(function (it, i) {
      var y = i * (rh + gap), hi = p.highlight === i, col = hi ? V("accent") : V("main"), tcol = hi ? V("accent-text") : V("main");
      return h(React.Fragment, { key: i },
        numSquare(i + 1, 0, y + (rh - 26) / 2, 26, col, "n" + i),
        text(40, y, lw - 48, rh, it.label, { pt: 14, bold: true, color: tcol, valign: "middle" }, "l" + i),
        abs(lw, y, BW - lw, rh, { background: V("panel") }, null, "p" + i),
        text(lw + 12, y, BW - lw - 24, rh, it.text, { pt: 13, valign: "middle" }, "t" + i));
    }));
  }

  function KeyStatement(p) {
    var dark = !!p.dark;
    return h("div", { className: "hs-slide", "data-theme": dark ? "dark" : "light", style: { background: V("surface") } },
      abs(38.4, 238, 76.8, 7.68, { background: V("accent") }),
      h("div", { className: "t-cover", style: { position: "absolute", left: 38.4, top: 268, width: 1050, color: dark ? V("title") : V("main") } }, p.statement),
      p.attribution ? h("div", { className: "t-subtitle", style: { position: "absolute", left: 38.4, top: 470, color: V("muted") } }, p.attribution) : null,
      p.source ? h("div", { className: "t-foot hs-src", style: { color: V("muted") } }, p.source) : null,
      p.page != null ? h("div", { className: "t-foot hs-pg", style: { color: V("muted") } }, String(p.page)) : null);
  }

  function EndSlide(p) {
    return h("div", { className: "hs-slide", "data-theme": "dark", style: { background: V("surface") } },
      h("div", { className: "t-divider", style: { position: "absolute", left: 38.4, top: 300, color: V("title") } }, p.title || "Next steps"),
      h("div", { className: "t-body", style: { position: "absolute", left: 38.4, top: 380, width: 1000, color: V("muted") } }, (p.points || []).join("  ·  ")));
  }

  function TakeawayBox(p) {
    return h("div", { className: "hs-el", style: { width: p.width || BW, height: 50, background: V("main"), color: V("paper"), fontFamily: FONT, fontWeight: 700, fontSize: PT(14), display: "flex", alignItems: "center", padding: "0 14px", boxSizing: "border-box", position: p.bottom ? "absolute" : "relative", bottom: p.bottom ? 0 : undefined, left: p.bottom ? 0 : undefined } }, p.text);
  }

  // ---------------------------------------------------------------- numbers & charts
  function KPIRow(p) {
    var items = p.items || [], n = items.length, gap = 29, w = (BW - (n - 1) * gap) / n, hh = Math.min(BH, 250);
    return body(p, items.map(function (it, i) {
      var x = i * (w + gap), hi = p.highlight === i;
      var vpt = Math.max(28, Math.min(60, (w - 48) * 72 / 96 / Math.max(3, String(it.value).length) / 0.6));
      return h(React.Fragment, { key: i },
        abs(x, 0, w, hh, { background: hi ? V("main") : V("panel") }),
        hi ? abs(x, 0, 8.64, hh, { background: V("accent") }) : null,
        text(x + 29, 24, w - 48, 110, it.value, { pt: vpt, bold: true, color: hi ? V("paper") : V("main"), valign: "bottom", lh: 1, pad: 0 }),
        text(x + 29, 139, w - 48, 46, it.label, { pt: 15, bold: true, color: hi ? V("paper") : V("ink"), pad: 0 }),
        it.note ? text(x + 29, 187, w - 48, hh - 197, it.note, { pt: 11, color: hi ? V("paper") : V("grey-1"), pad: 0 }) : null);
    }));
  }

  // vertical columns; highlight = index (navy), others grey-3; value labels inside the top in white
  function ColumnChart(p) {
    var cats = p.categories || [], vals = p.values || [], n = vals.length, hi = p.highlight != null ? p.highlight : n - 1;
    var cw = p.callout ? BW * 0.6 : BW, plotH = BH - 40, max = maxOf(vals) || 1, slot = cw / n, bw = slot * 0.66;
    return body(p, [
      vals.map(function (v, i) {
        var bh = v / max * (plotH - 10), x = i * slot + (slot - bw) / 2, y = plotH - bh, on = i === hi;
        return h(React.Fragment, { key: i },
          abs(x, y, bw, bh, { background: on ? V("main") : V("grey-3") }),
          text(x, y + 4, bw, 22, fmt(v), { pt: 11, bold: true, color: V("paper"), align: "center", pad: 0 }),
          text(i * slot, plotH + 8, slot, 26, cats[i], { pt: 11, align: "center", pad: 0 }));
      }),
      abs(0, plotH, cw, 1.33, { background: V("ink") }, null, "axis"),
      p.callout ? text(cw + 40, 40, BW - cw - 40, 60, p.callout.value, { pt: 24, bold: true, color: V("main"), pad: 0 }, "cv") : null,
      p.callout ? text(cw + 40, 100, BW - cw - 40, 120, p.callout.text, { pt: 13, pad: 0 }, "ct") : null
    ]);
  }

  function LineChart(p) {
    var cats = p.categories || [], series = p.series || [], hi = p.highlight != null ? p.highlight : 0;
    var W2 = BW - 170, H2 = BH - 50, all = [].concat.apply([], series.map(function (s) { return s.values; }));
    var mx = maxOf(all), mn = Math.min.apply(null, all.concat(p.min != null ? [p.min] : [])); if (p.min != null) mn = p.min;
    var X = function (i) { return 20 + i * (W2 - 40) / Math.max(1, cats.length - 1); }, Y = function (v) { return 10 + (H2 - 20) * (1 - (v - mn) / ((mx - mn) || 1)); };
    var order = series.map(function (s, i) { return i; }).sort(function (a, b) { return (a === hi) - (b === hi); });
    var step = Math.max(1, Math.ceil(cats.length / 12));
    return body(p, [
      h("svg", { key: "svg", width: W2, height: H2, style: { position: "absolute", left: 0, top: 0, overflow: "visible" } },
        h("line", { x1: 0, y1: H2, x2: W2, y2: H2, stroke: V("ink"), strokeWidth: 1.33 }),
        order.map(function (si) {
          var s = series[si], on = si === hi, pts = s.values.map(function (v, i) { return X(i) + "," + Y(v); }).join(" ");
          return h("polyline", { key: si, points: pts, fill: "none", stroke: on ? V("main") : V("grey-3"), strokeWidth: on ? 3 : 2 });
        }),
        series[hi] ? h("circle", { cx: X(series[hi].values.length - 1), cy: Y(series[hi].values[series[hi].values.length - 1]), r: 5, fill: V("accent") }) : null),
      (function () {
        var labs = series.map(function (s, si) { return { si: si, y: Y(s.values[s.values.length - 1]) }; }).sort(function (a, b) { return a.y - b.y; });
        for (var k = 1; k < labs.length; k++) if (labs[k].y - labs[k - 1].y < 22) labs[k].y = labs[k - 1].y + 22;
        return labs.map(function (L) {
          var s = series[L.si], last = s.values[s.values.length - 1], on = L.si === hi;
          return text(W2 + 12, L.y - 12, 158, 24, s.name + "  " + fmt(last), { pt: 11, bold: on, color: on ? V("main") : V("grey-1"), valign: "middle", pad: 0 }, "lab" + L.si);
        });
      })(),
      cats.map(function (c, i) { return i % step ? null : text(X(i) - 40, H2 + 8, 80, 22, c, { pt: 10, align: "center", color: V("grey-1"), pad: 0 }, "c" + i); })
    ]);
  }

  // horizontal bars sorted largest first; highlightLabel in navy, others grey-3
  function BarRanking(p) {
    var d = (p.data || []).slice(); if (p.sort !== false) d.sort(function (a, b) { return b.value - a.value; });
    var n = d.length, rh = Math.min(56, BH / n), lw = 150, max = maxOf(d.map(function (x) { return x.value; })) || 1, pw = (p.width || BW) - lw - 60;
    return body(p, d.map(function (it, i) {
      var on = it.label === p.highlightLabel, y = i * rh, bw = it.value / max * pw;
      return h(React.Fragment, { key: i },
        text(0, y, lw - 10, rh, it.label, { pt: 12, align: "right", valign: "middle", bold: on, color: V("ink"), pad: 0 }),
        abs(lw, y + rh * 0.18, bw, rh * 0.64, { background: on ? V("main") : V("grey-3") }),
        text(lw + 6, y, 80, rh, fmt(it.value), { pt: 11, bold: true, color: V("paper"), valign: "middle", pad: 0 }));
    }));
  }

  // 100% stacked bars: one bar per group; highlight = series index in main, others greys
  function StackedBar100(p) {
    var cats = p.categories || [], series = p.series || [], hi = p.highlight != null ? p.highlight : 0;
    var greys = [V("grey-1"), V("grey-2"), V("grey-3"), V("grey-4")], n = cats.length, slot = (BW - 220) / n, bw = Math.min(150, slot * 0.6), plotH = BH - 40, gi = 0;
    var fills = series.map(function (s, i) { return i === hi ? V("main") : greys[(gi++) % greys.length]; });
    var dark = function (i) { return i === hi || fills[i] === greys[0] || fills[i] === greys[1]; };
    return body(p, [
      cats.map(function (c, ci) {
        var tot = series.reduce(function (a, s) { return a + (s.values[ci] || 0); }, 0) || 1, y = plotH, x = ci * slot + (slot - bw) / 2;
        return h(React.Fragment, { key: ci },
          series.map(function (s, si) {
            var v = s.values[ci] || 0, sh = v / tot * plotH; y -= sh;
            return h(React.Fragment, { key: si },
              abs(x, y, bw, sh, { background: fills[si], borderTop: "1.33px solid " + V("paper") }),
              sh > 20 ? text(x, y, bw, sh, Math.round(v / tot * 100) + "%", { pt: 11, bold: si === hi, color: dark(si) ? V("paper") : V("ink"), align: "center", valign: "middle", pad: 0 }) : null);
          }),
          text(ci * slot, plotH + 8, slot, 26, c, { pt: 11, align: "center", pad: 0 }));
      }),
      series.map(function (s, si) {
        return h("div", { key: "lg" + si, style: { position: "absolute", left: BW - 200, top: plotH - (si + 1) * 30, display: "flex", alignItems: "center", gap: 8, fontFamily: FONT, fontSize: PT(11), fontWeight: si === hi ? 700 : 400 } },
          h("span", { style: { width: 14, height: 14, background: fills[si], display: "inline-block" } }), s.name);
      }).reverse()
    ]);
  }

  // bridge: first and last steps are totals (navy); increases cyan; decreases grey-2
  function Waterfall(p) {
    var steps = p.steps || [], run = 0, bars = [], mx = 0;
    steps.forEach(function (s, i) {
      if (s.total || i === 0 || i === steps.length - 1) { var v = s.value != null ? s.value : run; bars.push({ lo: 0, hi: v, kind: "total", v: v }); run = v; }
      else if (s.value >= 0) { bars.push({ lo: run, hi: run + s.value, kind: "up", v: s.value }); run += s.value; }
      else { bars.push({ lo: run + s.value, hi: run, kind: "down", v: s.value }); run += s.value; }
      mx = Math.max(mx, run, bars[bars.length - 1].hi);
    });
    var cw = p.width || BW, plotH = BH - 40, n = steps.length, slot = cw / n, bw = slot * 0.6, Y = function (v) { return plotH - v / (mx || 1) * (plotH - 20); };
    var fill = { total: V("main"), up: V("secondary"), down: V("grey-2") };
    return body(p, [
      bars.map(function (b, i) {
        var x = i * slot + (slot - bw) / 2, y = Y(b.hi), hh = Math.max(2, Y(b.lo) - Y(b.hi));
        return h(React.Fragment, { key: i },
          abs(x, y, bw, hh, { background: fill[b.kind] }),
          i < n - 1 ? abs(x + bw, Y(bars[i].kind === "down" ? b.lo : b.hi), slot - bw, 1, { background: V("grey-3") }) : null,
          text(x, hh > 24 ? y : y - 24, bw, hh > 24 ? hh : 22, (b.kind === "up" ? "+" : "") + fmt(b.v), { pt: 11, bold: true, color: hh > 24 ? V("paper") : V("ink"), align: "center", valign: "middle", pad: 0 }),
          text(i * slot, plotH + 8, slot, 26, steps[i].label, { pt: 11, align: "center", pad: 0 }));
      }),
      abs(0, plotH, cw, 1.33, { background: V("ink") }, null, "axis")
    ]);
  }

  function Scatter(p) {
    var pts = p.points || [], W2 = (p.width || BW) - 60, H2 = BH - 60;
    var xs = pts.map(function (q) { return q.x; }), ys = pts.map(function (q) { return q.y; });
    var x0 = Math.min.apply(null, xs), x1 = maxOf(xs), y0 = Math.min.apply(null, ys), y1 = maxOf(ys), smax = maxOf(pts.map(function (q) { return q.size || 1; }));
    var X = function (v) { return 80 + (W2 - 140) * (v - x0) / ((x1 - x0) || 1); }, Y = function (v) { return 40 + (H2 - 80) * (1 - (v - y0) / ((y1 - y0) || 1)); };
    return body(p, [
      h("svg", { key: "s", width: W2, height: H2, style: { position: "absolute", left: 10, top: 0, overflow: "visible" } },
        h("line", { x1: 30, y1: H2, x2: W2, y2: H2, stroke: V("grey-1"), strokeWidth: 2 }),
        h("line", { x1: 30, y1: 0, x2: 30, y2: H2, stroke: V("grey-1"), strokeWidth: 2 }),
        pts.map(function (q, i) {
          var on = q.label === p.highlightLabel, r = q.size ? 8 + 26 * Math.sqrt(q.size / smax) : 7;
          return h("circle", { key: i, cx: X(q.x), cy: Y(q.y), r: r, fill: on ? V("main") : V("grey-3"), stroke: V("paper"), strokeWidth: 1.5 });
        })),
      pts.filter(function (q) { return q.label; }).map(function (q, i) {
        var on = q.label === p.highlightLabel, r = q.size ? 8 + 26 * Math.sqrt(q.size / smax) : 7;
        return text(10 + X(q.x) + r + 4, Y(q.y) - 11, 160, 22, q.label, { pt: 10, bold: on, color: on ? V("main") : V("grey-1"), valign: "middle", pad: 0 }, "l" + i);
      }),
      text(40, H2 + 14, W2 - 30, 24, p.xTitle, { pt: 12, bold: true, color: V("main"), align: "center" }, "xt"),
      h("div", { key: "yt", style: { position: "absolute", left: -110, top: H2 / 2 - 12, width: 240, textAlign: "center", transform: "rotate(-90deg)", fontFamily: FONT, fontSize: PT(12), fontWeight: 700, color: V("main") } }, p.yTitle)
    ]);
  }

  // chart left (62%), "So what" panel right
  function ChartCommentary(p) {
    var cw = BW * 0.62;
    return body(p, [
      h("div", { key: "c", style: { position: "absolute", left: 0, top: 0, width: cw, height: BH } }, p.chart),
      abs(cw + 19.2, 0, BW - cw - 19.2, BH, { background: V("panel"), padding: 24, fontFamily: FONT, fontSize: PT(13), color: V("ink") }, [
        h("div", { key: "t", style: { fontWeight: 700, color: V("main"), marginBottom: 12 } }, p.heading || "So what"),
        (p.points || []).map(function (t, i) { return h("p", { key: i, style: { margin: "0 0 10px" } }, t); })
      ], "panel")
    ]);
  }

  // ---------------------------------------------------------------- compare & position
  // grid of cells (2x2, 3x3); highlight [row, col] in accent; rows listed top (high) to bottom
  function Matrix(p) {
    var rows = p.rows || [], cols = p.cols || [], R = rows.length, Cn = cols.length, ax = 110, gap = 6;
    var gw = (p.comment ? BW * 0.66 : BW) - ax, gh = BH - 70, cw = (gw - (Cn - 1) * gap) / Cn, chh = (gh - (R - 1) * gap) / R;
    var out = [];
    rows.forEach(function (rl, r) {
      cols.forEach(function (cl, c) {
        var on = p.highlight && p.highlight[0] === r && p.highlight[1] === c, t = p.cells && p.cells[r] && p.cells[r][c];
        var x = ax + c * (cw + gap), y = r * (chh + gap);
        out.push(abs(x, y, cw, chh, { background: on ? V("accent") : V("panel") }, null, "b" + r + c));
        if (t) out.push(text(x + 11, y + 8, cw - 22, chh - 16, t, { pt: 13, bold: on, color: on ? V("paper") : V("ink") }, "t" + r + c));
      });
      out.push(text(ax - 100, r * (chh + gap), 88, chh, rl, { pt: 11, color: V("grey-1"), align: "right", valign: "middle", pad: 0 }, "r" + r));
    });
    cols.forEach(function (cl, c) { out.push(text(ax + c * (cw + gap), gh + 10, cw, 24, cl, { pt: 11, color: V("grey-1"), align: "center" }, "c" + c)); });
    out.push(abs(ax - 10, gh + 6, gw + 10, 2, { background: V("grey-1") }, null, "xa"), abs(ax - 10, -4, 2, gh + 10, { background: V("grey-1") }, null, "ya"));
    out.push(text(ax, gh + 36, gw, 26, p.xTitle, { pt: 12, bold: true, color: V("main"), align: "center" }, "xt"));
    out.push(h("div", { key: "yt", style: { position: "absolute", left: -130, top: gh / 2 - 12, width: 240, textAlign: "center", transform: "rotate(-90deg)", fontFamily: FONT, fontSize: PT(12), fontWeight: 700, color: V("main") } }, p.yTitle));
    if (p.comment) out.push(text(BW * 0.66 + 24, 0, BW * 0.34 - 24, gh, p.comment, { pt: 13 }, "cm"));
    return body(p, out);
  }

  function Ball(props) {
    var q = props.q, r = 14, c = 16, path = null;
    if (q > 0 && q < 4) { var a = q / 4 * 2 * Math.PI; path = h("path", { d: "M" + c + " " + c + " L" + c + " " + (c - r) + " A" + r + " " + r + " 0 " + (q > 2 ? 1 : 0) + " 1 " + (c + r * Math.sin(a)).toFixed(2) + " " + (c - r * Math.cos(a)).toFixed(2) + " Z", fill: V("main") }); }
    return h("svg", { width: 32, height: 32, viewBox: "0 0 32 32" }, h("circle", { cx: c, cy: c, r: r, fill: q >= 4 ? V("main") : V("paper"), stroke: V("main"), strokeWidth: 1.33 }), path);
  }
  // options as rows, criteria as columns; highlight = option index (light secondary band)
  function HarveyBallTable(p) {
    var crit = p.criteria || [], opts = p.options || [];
    var th = { fontFamily: FONT, fontSize: PT(11), fontWeight: 700, color: V("main"), padding: "10px 8px", textAlign: "center", borderBottom: "1.33px solid " + V("main") };
    return body(p, [
      h("table", { key: "t", style: { position: "absolute", left: 0, top: 0, width: "100%", borderCollapse: "collapse", fontFamily: FONT } },
        h("thead", null, h("tr", null, h("th", { style: Object.assign({}, th, { textAlign: "left" }) }), crit.map(function (c, i) { return h("th", { key: i, style: th }, c); }))),
        h("tbody", null, opts.map(function (o, r) {
          var on = p.highlight === r, bg = on ? V("secondary-tint") : "transparent";
          return h("tr", { key: r },
            h("td", { style: { background: bg, padding: "12px 8px", fontSize: PT(12), fontWeight: on ? 700 : 400, color: V("ink"), borderBottom: "1px solid " + V("grey-4") } }, o.name),
            o.scores.map(function (q, c) { return h("td", { key: c, style: { background: bg, textAlign: "center", padding: "8px", borderBottom: "1px solid " + V("grey-4") } }, h(Ball, { q: q })); }));
        }))),
      h("div", { key: "lg", style: { position: "absolute", left: 0, bottom: 0, display: "flex", gap: 18, alignItems: "center", fontFamily: FONT, fontSize: PT(9), color: V("grey-1") } },
        ["None", "Low", "Medium", "High", "Full"].map(function (l, i) { return h("span", { key: i, style: { display: "flex", alignItems: "center", gap: 4 } }, h("span", { style: { transform: "scale(.55)", display: "inline-flex" } }, h(Ball, { q: i })), l); }))
    ]);
  }

  // from / to rows with grey chevrons; "to" side on secondary-tint
  function BeforeAfter(p) {
    var rows = p.rows || [], aw = 58, cw = (BW - aw - 29) / 2, hh = 36, gap = 10, rh = Math.min(84, (BH - hh - 10 - (rows.length - 1) * gap) / rows.length);
    var xr = cw + aw + 29;
    return body(p, [
      text(0, 0, cw, hh, p.fromTitle, { pt: 16, bold: true, color: V("grey-1"), valign: "bottom" }, "ft"),
      text(xr, 0, cw, hh, p.toTitle, { pt: 16, bold: true, color: V("accent-text"), valign: "bottom" }, "tt"),
      rows.map(function (r, i) {
        var y = hh + 10 + i * (rh + gap);
        return h(React.Fragment, { key: i },
          abs(0, y, cw, rh, { background: V("panel") }),
          text(12, y, cw - 24, rh, r.from, { pt: 13, color: V("grey-1"), valign: "middle" }),
          h("svg", { width: aw - 20, height: 38, style: { position: "absolute", left: cw + 14, top: y + rh / 2 - 19 } }, h("polygon", { points: "0,0 " + (aw - 34) + ",0 " + (aw - 20) + ",19 " + (aw - 34) + ",38 0,38 14,19", fill: V("grey-3") })),
          abs(xr, y, cw, rh, { background: V("secondary-tint") }),
          text(xr + 12, y, cw - 24, rh, r.to, { pt: 13, bold: i === 0 || r.bold, valign: "middle" }));
      })
    ]);
  }

  // ---------------------------------------------------------------- sequence & structure
  // chevrons: steps before `current` grey-2, current accent, after navy; optional result panel
  function ChevronProcess(p) {
    var steps = p.steps || [], n = steps.length, resW = p.result ? 182 : 0, gap = 6, tip = 26, w = (BW - resW - (resW ? 19 : 0) - (n - 1) * gap) / n, H2 = 50;
    var shapes = steps.map(function (s, i) {
      var x = i * (w + gap), notch = i === 0 ? 0 : tip, cur = p.current;
      var fill = cur === i ? V("accent") : (cur != null && i < cur ? V("grey-2") : V("main"));
      var pts = [[x, 0], [x + w - tip + (i ? tip * 0 : 0), 0], [x + w, H2 / 2], [x + w - tip, H2], [x, H2], [x + notch, H2 / 2]];
      return h(React.Fragment, { key: i },
        h("svg", { width: BW, height: H2, style: { position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" } }, h("polygon", { points: pts.map(function (q) { return q[0].toFixed(1) + "," + q[1]; }).join(" "), fill: fill })),
        text(x + notch, 0, w - tip - notch / 2, H2, s.label, { pt: 13, bold: true, color: V("paper"), align: "center", valign: "middle", pad: 0 }),
        s.text ? text(x, H2 + 14, w - 6, BH - H2 - 80, s.text, { pt: 11, color: V("ink") }) : null);
    });
    return body(p, [shapes,
      p.result ? abs(BW - resW, 0, resW, BH - 70, { background: V("panel"), padding: 12, fontFamily: FONT }, [
        h("div", { key: "a", style: { fontWeight: 700, color: V("accent-text"), fontSize: PT(14) } }, p.result.label),
        h("div", { key: "b", style: { marginTop: 10, fontSize: PT(11), color: V("ink") } }, p.result.text)], "res") : null,
      p.takeaway ? h(TakeawayBox, { key: "tk", text: p.takeaway, bottom: true, width: BW }) : null]);
  }

  // milestones alternate above / below a grey arrow line; highlight in accent
  function Timeline(p) {
    var ms = p.milestones || [], n = ms.length, y = BH / 2, pad = 70, step = (BW - 2 * pad) / Math.max(1, n - 1);
    return body(p, [
      h("svg", { key: "l", width: BW, height: 20, style: { position: "absolute", left: 0, top: y - 10, overflow: "visible" } },
        h("line", { x1: 0, y1: 10, x2: BW - 12, y2: 10, stroke: V("grey-2"), strokeWidth: 2.67 }), h("polygon", { points: (BW - 14) + ",3 " + BW + ",10 " + (BW - 14) + ",17", fill: V("grey-2") })),
      ms.map(function (m, i) {
        var x = pad + i * step, up = i % 2 === 0, on = p.highlight === i, col = on ? V("accent-text") : V("main");
        return h(React.Fragment, { key: i },
          abs(x - 10.5, y - 10.5, 21, 21, { borderRadius: "50%", background: on ? V("accent") : V("main"), border: "2px solid " + V("paper") }),
          text(x - 77, up ? y + 14 : y - 45, 154, 30, m.date, { pt: 13, bold: true, color: col, align: "center", valign: up ? "top" : "bottom", pad: 0 }),
          abs(x - 0.5, up ? y - 70 : y + 12, 1, 58, { background: V("grey-3") }),
          text(x - 90, up ? y - 140 : y + 74, 180, 66, m.label, { pt: 11, align: "center", valign: up ? "bottom" : "top", pad: 0 }));
      })
    ]);
  }

  // root (navy) -> branches (grey-1, highlight accent) -> sub-points (panel, highlight secondary-tint) -> comment
  function IssueTree(p) {
    var br = p.branches || [], colW = [175, 240, 330], xs = [0, 235, 535], lh = 50, gap = 10;
    var tot = br.reduce(function (a, b) { return a + Math.max(1, (b.children || []).length); }, 0);
    var slotH = (BH - (tot - 1) * gap) / tot, out = [], cursor = 0, mids = [];
    br.forEach(function (b, bi) {
      var kids = b.children && b.children.length ? b.children : [""], on = p.highlight === bi, y0 = cursor, kidY = [];
      kids.forEach(function (k, ki) {
        var y = cursor + (slotH - Math.min(lh, slotH)) / 2; kidY.push(y + Math.min(lh, slotH) / 2);
        if (k) {
          out.push(abs(xs[2], y, colW[2], Math.min(lh, slotH), { background: on ? V("secondary-tint") : V("panel") }, null, "k" + bi + ki));
          out.push(text(xs[2] + 8, y, colW[2] - 16, Math.min(lh, slotH), k, { pt: 11, valign: "middle" }, "kt" + bi + ki));
        }
        cursor += slotH + gap;
      });
      var ym = (kidY[0] + kidY[kidY.length - 1]) / 2; mids.push(ym);
      out.push(abs(xs[1], ym - lh / 2, colW[1], lh, { background: on ? V("accent") : V("grey-1") }, null, "b" + bi));
      out.push(text(xs[1] + 8, ym - lh / 2, colW[1] - 16, lh, b.label, { pt: 13, bold: true, color: V("paper"), valign: "middle" }, "bt" + bi));
      kidY.forEach(function (ky, ki) {
        out.push(abs(xs[1] + colW[1] + 12, Math.min(ky, ym), 1.33, Math.abs(ky - ym) || 1.33, { background: V("grey-3") }, null, "v" + bi + ki));
        out.push(abs(xs[1] + colW[1] + 12, ky, xs[2] - xs[1] - colW[1] - 12, 1.33, { background: V("grey-3") }, null, "hk" + bi + ki));
      });
      out.push(abs(xs[1] + colW[1], ym, 12, 1.33, { background: V("grey-3") }, null, "hb" + bi));
      if (b.comment) out.push(text(xs[2] + colW[2] + 29, y0, BW - xs[2] - colW[2] - 29, cursor - gap - y0, b.comment, { pt: 12, valign: "middle", color: on ? V("accent-text") : V("grey-1") }, "c" + bi));
    });
    var ry = (mids[0] + mids[mids.length - 1]) / 2, rh = 90;
    out.push(abs(0, ry - rh / 2, colW[0], rh, { background: V("main") }, null, "root"));
    out.push(text(10, ry - rh / 2, colW[0] - 20, rh, p.root, { pt: 15, bold: true, color: V("paper"), valign: "middle" }, "rt"));
    out.push(abs(colW[0], ry, 30, 1.33, { background: V("grey-3") }, null, "rh"));
    out.push(abs(colW[0] + 30, Math.min.apply(null, mids), 1.33, (maxOf(mids) - Math.min.apply(null, mids)) || 1, { background: V("grey-3") }, null, "rv"));
    mids.forEach(function (m, i) { out.push(abs(colW[0] + 30, m, xs[1] - colW[0] - 30, 1.33, { background: V("grey-3") }, null, "rm" + i)); });
    return body(p, out);
  }

  // levels top -> bottom: navy, grey-1, grey-2, grey-3, grey-4; highlight accent; text to the right with a leader line
  function Pyramid(p) {
    var lv = p.levels || [], n = lv.length, pw = 470, gap = 5, lh = (BH - (n - 1) * gap) / n, cx = pw / 2;
    var ramp = [V("main"), V("grey-1"), V("grey-2"), V("grey-3"), V("grey-4")];
    return body(p, lv.map(function (L, i) {
      var on = p.highlight === i, fill = on ? V("accent") : ramp[Math.min(4, Math.round(i / Math.max(1, n - 1) * 4))];
      var top = i * (lh + gap), wT = pw * (i / n), wB = pw * ((i + 1) / n);
      var light = !on && Math.round(i / Math.max(1, n - 1) * 4) >= 3;
      return h(React.Fragment, { key: i },
        h("svg", { width: pw, height: lh, style: { position: "absolute", left: 0, top: top } }, h("polygon", { points: (cx - wT / 2) + ",0 " + (cx + wT / 2) + ",0 " + (cx + wB / 2) + "," + lh + " " + (cx - wB / 2) + "," + lh, fill: fill })),
        i > 0 ? text(cx - wB / 2 + 10, top, wB - 20, lh, L.label, { pt: 12, bold: true, color: light ? V("ink") : V("paper"), align: "center", valign: "middle", pad: 0 }) : null,
        abs(cx + (wT + wB) / 4 + 12, top + lh / 2, pw - (cx + (wT + wB) / 4) + 60, 0, { borderTop: "1.33px dotted " + V("grey-3") }),
        text(pw + 90, top, BW - pw - 90, lh, i === 0 ? rich(L.label, L.text, on ? V("accent-text") : V("main")) : L.text, { pt: 12, valign: "middle", pad: 0 }));
    }));
  }

  // segments around a circle, alternating grey-1 / grey-2, highlight accent; labels outside
  function Cycle(p) {
    var it = p.items || [], n = it.length, cx = BW / 2, cy = BH / 2, R = Math.min(BH / 2 - 60, 190), th = 46, out = [];
    var arc = function (a0, a1, r) { var x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0), x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1); return [x0, y0, x1, y1]; };
    var segs = it.map(function (s, i) {
      var a0 = (-90 + i * 360 / n + 4) * Math.PI / 180, a1 = (-90 + (i + 1) * 360 / n - 4) * Math.PI / 180, on = p.highlight === i;
      var o = arc(a0, a1, R), q = arc(a1, a0, R - th), large = (a1 - a0) > Math.PI ? 1 : 0;
      var d = "M" + o[0] + " " + o[1] + " A" + R + " " + R + " 0 " + large + " 1 " + o[2] + " " + o[3] + " L" + q[0] + " " + q[1] + " A" + (R - th) + " " + (R - th) + " 0 " + large + " 0 " + q[2] + " " + q[3] + " Z";
      return h("path", { key: i, d: d, fill: on ? V("accent") : (i % 2 ? V("grey-2") : V("grey-1")) });
    });
    out.push(h("svg", { key: "s", width: BW, height: BH, style: { position: "absolute", left: 0, top: 0 } }, segs));
    it.forEach(function (s, i) {
      var am = (-90 + (i + 0.5) * 360 / n) * Math.PI / 180, mx = cx + (R - th / 2) * Math.cos(am), my = cy + (R - th / 2) * Math.sin(am);
      out.push(text(mx - 15, my - 15, 30, 30, String(i + 1), { pt: 14, bold: true, color: V("paper"), align: "center", valign: "middle", pad: 0 }, "n" + i));
      var tx = cx + (R + 24) * Math.cos(am), ty = cy + (R + 24) * Math.sin(am), right = Math.cos(am) > 0.2, left = Math.cos(am) < -0.2;
      out.push(text(right ? tx : left ? tx - 260 : tx - 130, ty - 26, 260, 52, rich(s.label, s.text, p.highlight === i ? V("accent-text") : V("main")), { pt: 12, align: right ? "left" : left ? "right" : "center", valign: "middle", pad: 0 }, "t" + i));
    });
    if (p.centre) out.push(text(cx - R * 0.6, cy - 40, R * 1.2, 80, p.centre, { pt: 16, bold: true, color: V("main"), align: "center", valign: "middle" }, "c"));
    return body(p, out);
  }

  // navy hub, grey satellites (highlight accent), grey spokes, optional note beside each
  function HubSpoke(p) {
    var it = p.items || [], n = it.length, cx = BW / 2, cy = BH / 2, R = Math.min(BH / 2 - 55, 190), cD = 150, d = Math.min(96, 2 * R * Math.sin(Math.PI / n) - 14), out = [], lines = [];
    it.forEach(function (s, i) {
      var a = (-90 + i * 360 / n) * Math.PI / 180, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a), on = p.highlight === i;
      lines.push(h("line", { key: i, x1: cx, y1: cy, x2: x, y2: y, stroke: V("grey-3"), strokeWidth: 1.67 }));
      out.push(abs(x - d / 2, y - d / 2, d, d, { borderRadius: "50%", background: on ? V("accent") : V("grey-4"), border: "2.67px solid " + V("paper") }, null, "s" + i));
      var lpt = Math.min(12, (d - 12) / (Math.max(4, s.label.length) * 0.6) * 0.75);
      out.push(text(x - d / 2 + 4, y - d / 2, d - 8, d, s.label, { pt: lpt, bold: true, color: on ? V("paper") : V("main"), align: "center", valign: "middle", pad: 0 }, "l" + i));
      if (s.text) { var right = Math.cos(a) >= 0; out.push(text(right ? x + d / 2 + 10 : x - d / 2 - 230, y - 22, 220, 44, s.text, { pt: 11, color: V("grey-1"), align: right ? "left" : "right", valign: "middle", pad: 0 }, "t" + i)); }
    });
    return body(p, [h("svg", { key: "sv", width: BW, height: BH, style: { position: "absolute", left: 0, top: 0 } }, lines),
      abs(cx - cD / 2, cy - cD / 2, cD, cD, { borderRadius: "50%", background: V("main") }, null, "hub"),
      text(cx - cD / 2 + 10, cy - cD / 2, cD - 20, cD, p.centre, { pt: 15, bold: true, color: V("paper"), align: "center", valign: "middle", pad: 0 }, "ht"), out]);
  }

  // parallel columns: navy header bar (highlight accent) over a panel
  function TextColumns(p) {
    var it = p.items || [], n = it.length, gap = 19.2, w = (BW - (n - 1) * gap) / n, ph = Math.min(BH - 48 - (p.takeaway ? 70 : 0), 300);
    return body(p, [it.map(function (s, i) {
      var x = i * (w + gap), on = p.highlight === i;
      return h(React.Fragment, { key: i },
        abs(x, 0, w, 48, { background: on ? V("accent") : V("main") }),
        text(x + 10, 0, w - 20, 48, s.label, { pt: 14, bold: true, color: V("paper"), valign: "middle" }),
        abs(x, 48, w, ph, { background: V("panel") }),
        text(x + 12, 60, w - 24, ph - 24, s.text, { pt: 12 }));
    }), p.takeaway ? h(TakeawayBox, { key: "tk", text: p.takeaway, bottom: true, width: BW }) : null]);
  }

  // half-bleed image beside text; image is any URL (an asset upload, a file)
  function ImageText(p) {
    var left = p.side !== "right", iw = 640 - 38.4;
    return h("div", { className: "hs-slide", "data-theme": "light", style: { background: V("surface") } },
      h("img", { src: p.image, alt: p.alt || "", style: { position: "absolute", top: 0, left: left ? 0 : 640, width: 640, height: 720, objectFit: "cover" } }),
      h("div", { className: "t-title", style: { position: "absolute", top: 120, left: left ? 680 : 38.4, width: 560, color: V("title") } }, p.title),
      h("div", { style: { position: "absolute", top: 260, left: left ? 680 : 38.4, width: 540, fontFamily: FONT, fontSize: PT(14), color: V("ink") } },
        (p.points || []).map(function (t, i) { return h("p", { key: i, style: { margin: "0 0 14px", paddingLeft: 18, position: "relative" } }, h("span", { style: { position: "absolute", left: 0, top: 8, width: 7, height: 7, background: V("main") } }), t); })),
      p.source ? h("div", { className: "t-foot", style: { position: "absolute", top: 673, left: left ? 680 : 38.4, height: 27, display: "flex", alignItems: "flex-end", color: V("muted") } }, p.source) : null,
      iw ? null : null);
  }


  // ================================================================ v2.2 additions
  var MAP_CN = {"w":1000,"h":804.0,"provinces":[{"zh":"海南","en":"Hainan","d":"M619.6 779.4L610.5 789.8L610.3 794.7L593.0 803.9L575.5 798.6L572.4 789.1L573.7 785.2L583.5 778.5L587.0 776.8L602.5 775.3L609.7 775.3L612.4 773.5L617.2 774.7L619.6 779.4L619.6 779.4L619.6 779.4","cx":596.0,"cy":788.7,"area":1435},{"zh":"上海","en":"Shanghai","d":"M800.5 515.6L794.8 508.8L797.7 504.5L800.5 496.7L807.1 500.3L809.7 505.7L807.3 509.7L800.5 515.6L800.5 515.6","cx":802.2,"cy":506.1,"area":282},{"zh":"河南","en":"Henan","d":"M610.2 478.5L625.3 494.2L638.4 497.9L650.4 496.6L654.0 498.8L658.3 496.2L661.0 499.7L662.5 505.0L668.1 508.6L675.6 509.0L681.1 514.3L686.4 512.1L690.2 514.7L694.0 508.0L699.0 505.8L700.1 500.1L699.1 489.8L698.1 488.6L692.9 493.6L685.9 487.2L680.8 479.7L686.5 475.9L688.4 469.1L691.7 466.5L691.7 456.8L694.1 455.3L698.4 458.3L701.3 462.3L707.0 458.7L709.2 456.4L708.4 451.6L702.1 447.2L701.1 442.4L688.7 443.4L681.5 436.2L678.2 434.6L678.5 430.2L696.2 411.0L689.8 412.3L686.0 415.1L684.3 412.6L684.5 409.5L681.7 408.3L674.0 411.2L655.1 407.4L652.9 424.2L643.4 431.4L630.8 433.5L612.9 445.3L598.7 448.4L598.5 451.1L610.5 472.5L610.2 478.5L610.2 478.5","cx":653.9,"cy":461.1,"area":11878},{"zh":"台湾","en":"Taiwan","d":"M801.6 647.4L801.6 647.7L801.6 647.7L801.6 647.7L801.6 647.7L801.6 647.7L801.6 647.7L801.6 647.7L801.9 647.2L801.9 647.2L801.9 647.2L801.9 647.2L801.9 647.2L801.9 647.2L801.9 647.2L801.9 647.2L802.4 646.6L802.4 646.6L802.4 646.6L802.4 646.6L802.4 646.6L802.4 646.6L802.4 646.6L802.4 646.6L802.9 646.4L802.9 646.4L802.9 646.4L802.9 646.4L802.9 646.4L802.9 646.4L802.9 646.4L802.9 646.4L803.1 645.9L803.1 645.9L803.1 645.9L803.1 645.9L803.1 645.9L803.1 645.9L803.1 645.9L803.1 645.9L803.1 645.9L803.1 645.9L803.1 645.9L803.1 645.9L803.1 645.9L803.1 645.9L803.1 645.9L803.1 645.9L803.4 645.6L803.4 645.6L803.4 645.6L803.4 645.6L803.4 645.6L803.4 645.6L803.4 645.6L803.4 645.6L803.7 645.1L803.7 645.1L803.7 645.1L803.7 645.1L803.9 645.1L803.9 645.1L803.9 645.1L803.9 645.1L804.4 644.5L804.4 644.5L804.4 644.0L804.5 643.2L805.0 642.7L805.0 642.4L805.5 641.9L805.5 641.3L805.8 640.8L805.8 640.8L806.6 640.3L806.6 639.7L807.1 639.2L807.1 639.2L807.6 638.7L807.9 638.1L808.4 637.6L808.4 637.6L808.6 637.6L808.6 637.6L809.1 637.7L809.1 637.7L809.6 637.7L809.6 637.7L810.3 637.2L810.3 637.2L810.3 637.2L810.3 637.2L810.6 637.2L810.6 637.2L811.3 637.2L811.3 637.2L811.8 637.0L811.8 637.0L811.8 637.0L811.8 637.0L811.8 637.0L811.8 637.0L811.8 637.0L811.8 637.0L811.8 637.0L811.8 637.0L811.8 637.0L811.8 637.0L811.8 637.0L811.8 637.0L811.8 637.0L811.8 637.0L812.0 637.0L812.0 637.3L812.0 637.3L812.0 637.3L812.7 637.3L812.7 637.3L812.7 637.3L812.7 637.3L813.0 637.3L813.0 637.3L813.0 637.3L813.0 637.3L813.7 637.3L813.7 637.3L814.2 637.4L814.2 637.4L814.7 637.1L814.6 637.9L814.6 637.9L814.6 637.9L814.9 638.0L814.9 638.0L814.9 638.0L814.9 638.0L815.3 638.0L815.3 638.5L815.3 638.5L815.3 638.5L816.0 638.6L816.0 638.6L816.3 638.6L816.3 638.6L816.7 638.6L816.7 639.1L816.7 639.1L816.7 639.1L816.7 639.1L816.7 639.1L816.7 639.1L816.7 639.1L817.0 639.2L817.0 639.2L817.0 639.2L817.0 639.2L817.0 639.2L817.0 639.2L817.0 639.2L817.0 639.2L817.4 639.2L817.4 639.7L817.4 639.7L817.4 639.7L817.4 639.7L817.4 640.0L817.4 640.0L817.4 640.0L818.1 640.0L818.1 640.9L818.1 640.9L818.1 640.9L818.5 640.9L818.5 640.9L818.5 640.9L818.5 640.9L819.0 640.9L819.0 641.5L819.0 641.5L819.0 641.5L819.0 641.5L819.0 641.5L819.0 641.5L819.0 641.5L819.5 641.5L819.4 642.0L819.4 642.0L819.4 642.0L819.7 642.1L819.7 642.1L819.7 642.1L819.7 642.1L820.4 642.1L820.4 642.9L820.4 642.9L820.4 642.9L820.4 642.9L820.3 643.5L820.3 643.5L820.3 643.5L820.3 643.5L820.3 644.0L820.3 644.0L820.3 644.0L820.3 644.0L820.3 644.3L820.3 644.3L820.3 644.3L820.8 644.3L820.3 644.8L820.3 644.8L820.3 644.8L820.3 644.8L820.2 645.4L820.2 645.4L820.2 645.4L820.2 645.4L819.7 646.2L819.7 646.2L819.7 646.2L819.7 646.2L819.7 646.2L819.7 646.2L819.7 646.2L819.7 646.2L819.2 646.7L819.2 646.7L819.2 646.7L819.2 646.7L818.5 647.2L818.5 647.2L818.5 647.2L818.5 647.2L817.9 647.7L817.9 647.7L817.9 647.7L817.9 647.7L817.9 648.0L817.9 648.0L817.9 648.0L817.9 648.0L817.7 648.5L817.7 648.5L817.7 648.5L817.7 648.5L817.7 648.5L817.7 648.5L817.7 648.5L817.7 648.5L817.7 648.5L817.7 648.5L817.7 648.5L817.7 648.5L817.7 648.5L817.7 648.5L817.7 648.5L817.7 648.5L817.6 649.4L817.6 649.9L817.6 650.5L817.8 650.5L817.8 651.0L817.7 651.6L817.7 652.1L818.2 652.1L818.2 652.7L818.1 653.2L818.1 654.1L818.8 654.1L818.8 654.6L818.8 654.6L818.8 655.2L819.2 655.2L819.2 656.0L819.2 656.0L819.2 656.0L819.4 656.1L819.4 656.6L819.4 656.6L819.4 656.6L819.6 656.6L819.6 657.2L819.6 657.2L819.6 657.2L819.9 657.2L819.8 657.5L819.8 657.5L819.8 657.5L820.3 657.5L819.8 658.0L819.6 658.0L819.1 658.5L819.1 658.5L818.6 659.0L818.6 659.0L818.3 659.3L818.3 659.3L817.6 659.8L817.6 659.8L817.5 660.6L817.5 660.6L817.2 661.2L817.2 661.2L817.2 661.7L817.2 661.7L817.2 662.3L817.2 662.3L817.2 662.8L817.2 662.8L817.1 663.4L817.1 663.4L817.1 663.4L817.4 663.4L817.3 663.9L817.3 663.9L817.3 664.2L817.3 664.2L817.3 664.7L817.3 664.7L817.3 664.7L818.0 664.8L818.0 665.3L818.0 665.3L818.0 665.3L818.2 665.3L818.2 665.9L818.2 665.9L818.2 665.9L818.2 665.9L818.2 666.4L818.2 666.4L818.2 666.4L818.2 666.4L818.1 667.3L818.1 667.3L818.1 667.3L818.6 667.3L818.3 667.8L818.3 667.8L818.3 667.8L818.3 667.8L818.3 668.4L818.3 668.4L818.3 668.4L818.3 668.4L818.3 668.9L818.3 668.9L818.3 668.9L818.3 668.9L818.3 669.2L818.3 669.2L818.3 669.2L818.3 669.2L818.0 669.7L818.0 669.7L818.0 669.7L818.0 669.7L818.0 669.7L818.0 669.7L818.0 669.7L818.0 669.7L818.0 670.5L818.0 670.5L818.0 670.5L818.0 670.5L818.0 670.5L818.0 670.5L818.0 670.5L818.0 670.5L817.9 671.1L817.9 671.6L817.9 672.2L817.9 672.2L817.8 672.7L817.8 672.7L817.8 673.3L818.0 673.3L818.0 673.8L818.0 674.4L818.0 674.9L818.7 675.0L818.7 675.5L818.7 675.5L818.6 676.1L819.1 676.1L819.1 676.6L819.1 676.6L819.0 677.2L819.0 677.2L819.0 677.7L819.0 677.7L819.0 678.6L819.0 678.6L818.9 679.1L818.9 679.1L818.9 679.7L818.9 679.7L818.9 680.2L818.9 680.2L818.9 680.5L819.4 680.5L819.3 681.1L819.3 681.1L819.3 681.1L819.3 681.1L819.3 681.6L819.3 681.6L819.3 681.6L819.3 681.6L819.3 682.2L819.3 682.2L819.3 682.2L819.3 682.2L819.3 682.2L819.3 682.2L819.3 682.2L819.5 682.2L819.2 682.7L819.2 682.7L819.2 683.2L819.2 683.2L819.2 683.8L819.2 683.8L819.2 684.3L819.2 684.3L818.9 684.9L818.9 684.9L818.9 685.4L818.9 685.4L818.8 686.0L818.8 686.0L818.8 686.3L818.8 686.3L818.5 686.8L818.5 686.8L818.5 686.8L818.5 686.8L818.5 686.8L818.5 686.8L818.5 686.8L818.5 686.8L818.5 687.1L818.5 687.1L818.5 687.1L818.5 687.1L818.5 687.1L818.5 687.1L818.5 687.1L818.5 687.1L818.0 687.6L818.0 687.6L818.0 687.6L818.0 687.6L818.0 688.1L818.0 688.1L818.0 688.1L818.0 688.1L818.0 688.7L818.0 688.7L818.0 688.7L818.0 688.7L817.9 689.2L817.9 689.2L817.9 689.2L817.9 689.2L817.2 689.7L817.2 689.7L817.2 689.7L817.2 689.7L817.2 689.7L817.2 689.7L817.2 689.7L817.2 689.7L817.2 690.0L817.2 690.0L817.2 690.0L817.2 690.0L817.2 690.0L817.2 690.0L817.2 690.0L817.2 690.0L816.9 690.3L816.9 690.3L816.9 690.3L816.9 690.3L816.9 690.3L816.9 690.3L816.9 690.3L816.9 690.3L816.9 690.3L816.9 690.3L816.9 690.3L816.9 690.3L816.9 690.3L816.9 690.3L816.9 690.3L816.9 690.3L816.9 690.8L816.9 690.8L816.9 690.8L816.9 690.8L816.9 691.1L816.9 691.1L816.9 691.1L816.9 691.1L816.8 691.6L816.8 691.6L816.8 691.6L816.8 691.6L816.8 691.6L816.8 691.6L816.8 691.6L816.8 691.6L816.8 692.2L816.8 692.2L816.8 693.0L816.8 693.0L816.7 693.6L816.7 693.6L816.7 693.6L816.7 693.6L816.5 694.1L816.5 694.1L816.5 694.4L816.5 694.4L816.4 694.9L816.4 694.9L816.4 694.9L816.4 694.9L815.9 695.2L815.9 695.2L815.9 695.2L815.9 695.2L815.9 695.2L815.9 695.2L815.9 695.2L815.9 695.2L815.9 695.2L815.9 695.2L815.9 695.2L815.9 695.2L815.9 695.2L815.9 695.2L815.9 695.2L815.9 695.2L815.4 695.7L815.4 695.7L815.4 695.7L815.4 695.7L815.2 696.2L815.2 696.2L815.2 696.2L815.2 696.2L814.4 696.7L814.4 696.7L814.4 696.7L814.4 696.7L814.4 696.7L814.4 696.7L814.4 696.7L814.4 696.7L814.1 697.3L814.1 697.3L814.1 697.5L814.1 697.5L814.1 698.1L814.1 698.1L814.1 698.1L814.1 698.1L813.8 698.6L813.8 698.6L813.8 698.6L813.8 698.6L813.8 699.5L813.8 699.5L813.8 699.5L813.8 699.5L813.3 699.4L813.3 699.4L813.3 699.4L813.3 699.4L813.3 699.4L813.3 699.4L813.3 699.4L813.3 699.4L813.3 699.4L813.3 699.4L813.3 699.4L813.3 699.4L813.3 699.4L813.3 699.4L813.3 699.4L813.3 699.4L812.8 700.0L812.8 700.0L812.8 700.0L812.8 700.0L812.8 700.0L812.8 700.0L812.8 700.0L812.8 700.0L812.3 700.2L812.3 700.2L812.3 700.2L812.3 700.2L812.3 700.2L812.3 700.2L812.3 700.2L812.3 700.2L812.0 700.7L812.0 700.7L812.0 700.7L812.0 700.7L812.0 700.7L812.0 700.7L812.0 700.7L812.0 700.7L812.0 700.7L812.0 700.7L812.0 700.7L812.0 700.7L812.0 700.7L812.0 700.7L812.0 700.7L812.0 700.7L812.0 701.3L812.0 701.3L812.0 701.8L812.0 701.8L812.0 702.4L812.0 702.4L811.9 703.2L811.9 703.2L811.9 703.8L811.9 703.8L811.9 704.3L811.9 704.3L811.8 704.8L811.8 704.8L811.8 705.4L811.8 705.4L811.3 705.9L811.3 705.9L811.3 705.9L811.3 705.9L811.3 706.5L811.3 706.5L811.3 706.5L811.3 706.5L810.5 707.0L810.5 707.0L810.5 707.0L810.5 707.0L810.5 707.3L810.5 707.3L810.5 707.3L810.5 707.3L810.2 707.8L810.2 707.8L810.2 707.8L810.2 707.8L810.0 708.3L810.0 708.3L810.0 708.3L810.0 708.3L809.7 708.9L809.7 708.9L809.7 708.9L809.7 708.9L809.7 709.1L809.7 709.1L809.7 709.1L809.7 709.1L809.6 709.7L809.6 709.7L809.6 710.2L809.6 710.2L809.6 711.1L809.6 711.1L809.6 711.3L809.8 711.3L809.8 711.9L809.8 711.9L809.7 712.4L810.0 712.4L810.0 713.0L810.0 713.0L810.0 713.0L810.2 713.0L810.2 713.8L810.2 713.8L810.2 713.8L810.2 713.8L810.2 713.8L810.2 713.8L810.2 713.8L810.4 713.8L810.4 713.8L810.4 713.8L810.4 713.8L810.4 713.8L810.4 713.8L810.4 713.8L810.4 713.8L810.9 713.9L810.8 714.4L810.8 714.4L810.8 714.4L810.8 714.4L810.8 714.4L810.8 714.4L810.8 714.4L810.8 714.4L810.8 715.0L810.8 715.0L810.8 715.0L810.8 715.0L810.8 715.0L810.8 715.0L810.8 715.0L810.8 715.0L810.3 714.9L810.3 714.9L810.3 714.9L810.3 714.9L810.3 714.9L810.3 714.9L810.3 714.9L810.3 714.9L810.1 714.9L810.1 714.9L810.1 714.9L810.1 714.9L810.1 714.9L810.1 714.9L810.1 714.9L810.1 714.7L809.9 714.6L809.9 714.6L809.9 714.6L809.9 714.6L809.9 714.6L809.9 714.6L809.9 714.6L809.9 714.1L809.4 714.1L809.4 714.1L809.4 714.1L809.4 714.1L809.4 714.1L809.4 714.1L809.4 714.1L809.4 713.8L808.9 714.0L808.9 714.0L808.9 714.0L808.9 714.0L808.7 714.0L808.7 714.0L808.7 714.0L808.7 714.0L808.2 714.0L808.2 714.0L808.2 714.0L808.2 714.0L808.2 714.0L808.2 714.0L808.2 714.0L808.2 714.0L808.2 714.6L808.2 714.6L808.2 714.6L808.2 714.6L808.2 714.6L808.2 714.6L808.2 714.6L808.2 714.6L808.2 714.6L808.2 714.6L808.2 714.6L808.2 714.6L808.2 714.6L808.2 714.6L808.2 714.6L808.2 714.6L807.7 715.1L807.7 715.1L807.7 715.1L807.7 715.1L807.7 715.1L807.7 715.1L807.7 715.1L807.7 715.1L807.7 715.1L807.7 715.1L807.7 715.1L807.7 715.1L807.7 715.1L807.7 715.1L807.7 715.1L807.7 715.1L807.4 715.3L807.4 715.3L807.4 715.3L807.4 715.3L807.4 715.3L807.4 715.3L807.4 715.3L807.4 715.3L807.4 715.3L807.4 715.3L807.4 715.3L807.4 715.3L807.4 715.3L807.4 715.3L807.4 715.3L807.4 715.3L806.7 715.8L806.7 715.8L806.7 715.8L806.7 715.8L806.7 715.8L806.7 715.8L806.7 715.8L806.7 715.8L806.4 715.8L806.4 715.8L806.4 715.8L806.4 715.8L806.4 715.8L806.4 715.8L806.4 715.8L806.5 715.6L806.2 715.5L806.2 715.5L806.2 715.5L806.2 715.5L806.2 715.5L806.2 715.5L806.2 715.5L806.2 715.5L806.2 715.5L806.2 715.5L806.2 715.5L806.2 715.5L806.2 715.5L806.2 715.5L806.2 715.5L806.2 715.3L806.2 715.3L806.2 715.3L806.2 715.3L806.2 715.0L806.2 715.0L806.2 715.0L806.2 715.0L806.3 714.2L806.3 714.2L806.3 714.2L806.3 714.2L806.3 713.9L806.3 713.9L806.3 713.9L806.3 713.9L806.3 713.4L805.9 713.3L805.9 713.3L805.9 713.3L805.9 713.3L805.6 713.3L805.6 713.3L805.6 713.3L805.6 713.0L805.6 713.0L805.6 713.0L805.6 713.0L805.6 713.0L805.6 713.0L805.6 713.0L805.6 713.0L805.7 712.5L805.2 712.5L805.2 712.5L805.2 712.5L805.2 711.9L805.2 711.9L805.2 711.9L805.2 711.9L805.2 711.4L805.2 711.4L805.2 711.4L805.2 711.4L805.3 710.8L805.3 710.8L805.3 710.3L805.3 710.3L805.3 709.7L805.3 709.7L805.3 709.7L805.3 709.7L805.3 709.7L805.3 709.7L805.3 709.7L805.3 709.7L805.3 709.2L805.1 709.2L805.1 709.2L805.1 709.2L805.1 708.6L805.1 708.6L805.1 708.6L805.1 708.6L805.2 708.1L804.7 708.0L804.7 708.0L804.7 708.0L804.7 708.0L804.4 708.0L804.4 708.0L804.4 708.0L804.5 707.5L804.0 707.5L804.0 707.5L804.0 707.5L804.0 707.5L804.0 707.5L804.0 707.5L804.0 707.5L804.0 706.9L803.5 706.9L803.5 706.9L803.3 706.9L803.3 706.9L802.6 706.8L802.6 706.8L802.6 706.8L802.6 706.3L802.1 706.3L802.1 706.3L802.1 706.3L802.1 706.3L801.7 706.2L801.7 706.2L801.7 706.2L801.7 705.7L801.2 705.7L801.2 705.7L801.2 705.7L801.2 705.7L801.2 705.7L801.2 705.7L801.2 705.7L801.2 705.4L801.0 705.4L801.0 705.4L801.0 705.4L801.0 705.4L801.0 705.4L801.0 705.4L801.0 705.4L801.0 705.1L800.5 705.1L800.5 705.1L800.5 705.1L800.5 704.5L800.1 704.5L800.1 704.5L800.1 704.5L800.1 704.0L799.8 703.9L799.8 703.9L799.8 703.9L799.9 703.1L799.9 703.1L799.9 702.8L799.9 702.8L799.9 702.3L799.9 702.3L799.9 702.3L799.9 702.3L799.9 702.3L799.9 702.3L799.9 702.3L799.9 702.3L799.9 702.3L799.9 702.3L799.9 702.3L799.9 702.3L799.9 702.3L799.9 702.3L799.9 702.3L799.9 702.3L800.4 701.8L800.0 701.8L800.0 701.8L800.0 701.8L800.0 701.8L799.7 701.7L799.7 701.7L799.7 701.7L799.8 701.2L799.3 701.2L799.3 701.2L799.3 701.2L799.3 700.6L799.3 700.6L799.3 700.6L799.3 700.6L799.3 700.1L798.9 700.0L798.9 700.0L798.9 700.0L798.9 700.0L798.9 700.0L798.9 700.0L798.9 700.0L798.9 700.0L798.4 700.0L798.4 700.0L798.4 700.0L798.4 700.0L798.4 700.0L798.4 700.0L798.4 700.0L798.4 699.5L797.9 699.4L797.9 699.4L797.9 699.4L797.9 699.2L797.9 699.2L797.9 699.2L797.9 699.2L798.0 698.6L798.0 698.6L798.0 698.6L798.0 698.6L798.0 698.1L798.0 698.1L798.0 698.1L798.0 698.1L798.0 697.5L797.5 697.5L797.5 697.5L797.5 697.5L797.6 697.0L797.1 696.9L797.1 696.4L797.1 696.4L797.1 695.8L796.7 695.8L796.7 695.8L796.7 695.8L796.7 695.3L796.7 695.3L796.7 694.7L796.7 694.7L796.8 694.2L796.3 694.1L796.3 694.1L796.3 694.1L796.3 694.1L796.3 694.1L796.3 694.1L796.3 694.1L796.3 694.1L796.0 694.1L796.0 694.1L796.0 694.1L796.0 694.1L796.0 694.1L796.0 694.1L796.0 694.1L796.1 693.6L795.6 693.6L795.6 693.0L795.6 693.0L795.6 692.5L795.2 692.4L795.2 691.9L795.2 691.9L795.2 691.3L795.0 691.3L795.0 690.8L795.0 690.8L795.0 690.2L795.0 690.2L795.1 689.7L795.1 689.1L795.8 688.6L795.6 688.6L795.6 688.6L795.6 688.6L795.6 688.3L795.6 688.3L795.6 688.3L795.6 688.3L795.6 687.8L795.6 687.8L795.6 687.8L795.6 687.8L795.7 687.0L795.7 687.0L795.7 687.0L795.7 687.0L796.2 686.4L796.2 686.4L796.2 686.4L796.2 686.4L796.2 686.4L796.2 686.4L796.2 686.4L796.2 686.4L796.2 686.4L796.2 686.4L796.2 686.4L796.2 686.4L796.2 686.4L796.2 686.4L796.2 686.4L796.2 686.4L796.2 686.2L796.2 686.2L796.2 686.2L796.2 686.2L796.2 686.2L796.2 686.2L796.2 686.2L796.2 686.2L796.2 685.6L796.2 685.6L796.2 685.6L796.2 685.6L796.3 685.1L796.3 685.1L796.3 685.1L796.3 685.1L796.3 684.5L795.8 684.5L795.8 684.5L795.8 684.5L795.8 684.5L795.6 684.5L795.6 684.5L795.6 684.5L795.6 683.9L795.4 683.9L795.4 683.9L795.4 683.9L795.4 683.6L795.4 683.6L795.4 683.6L795.4 683.6L795.4 683.1L795.2 683.1L795.2 683.1L795.2 683.1L795.2 683.1L795.2 683.1L795.2 683.1L795.2 683.1L795.2 683.1L795.2 683.1L795.2 683.1L795.2 683.1L795.2 683.1L795.2 683.1L795.2 683.1L795.2 683.1L795.2 683.1L794.7 683.1L794.7 683.1L794.7 683.1L794.7 682.5L794.5 682.5L794.5 681.7L794.5 681.7L794.6 681.1L794.3 681.1L794.3 681.1L794.3 681.1L794.3 680.6L794.3 680.6L794.4 680.0L794.4 680.0L794.4 679.5L794.4 679.5L794.4 679.5L794.4 679.5L794.4 679.5L794.4 679.5L794.4 679.5L794.4 679.5L794.4 679.2L794.4 679.2L794.4 679.2L794.4 679.2L794.4 679.2L794.4 679.2L794.4 679.2L794.4 679.2L794.7 678.9L794.7 678.9L794.7 678.9L794.7 678.9L794.7 678.9L794.7 678.9L794.7 678.9L794.7 678.9L794.7 678.9L794.7 678.9L794.7 678.9L794.7 678.9L794.7 678.9L794.7 678.9L794.7 678.9L794.7 678.9L795.4 678.4L795.4 678.4L795.4 678.4L795.4 678.4L795.4 678.4L795.4 678.4L795.4 678.4L795.4 678.4L795.4 678.4L795.4 678.4L795.4 678.4L795.4 678.4L795.4 678.4L795.4 678.4L795.4 678.4L795.4 678.4L795.4 678.4L795.4 678.4L795.4 678.4L795.4 678.4L795.4 678.4L795.4 678.4L795.4 678.4L795.4 678.4L795.4 678.2L795.4 678.2L795.4 678.2L795.4 678.2L795.4 678.2L795.4 678.2L795.4 678.2L795.4 678.2L795.7 677.6L795.7 677.6L795.7 677.6L795.7 677.6L795.7 677.1L795.7 677.1L795.7 677.1L795.7 677.1L796.0 676.5L796.0 676.5L796.0 676.5L796.0 676.5L796.0 676.0L796.0 676.0L796.1 675.4L796.1 675.4L796.1 674.9L796.1 674.9L796.1 674.9L796.1 674.9L796.1 674.9L796.1 674.9L796.1 674.9L796.1 674.9L796.1 674.6L796.1 674.6L796.1 674.6L796.1 674.6L796.1 674.6L796.1 674.6L796.1 674.6L796.1 674.6L796.1 674.1L795.9 674.1L795.9 674.1L795.9 674.1L795.9 674.1L795.9 674.1L795.9 674.1L795.9 674.1L795.9 673.8L795.9 673.8L795.9 673.8L795.9 673.8L795.9 673.8L795.9 673.8L795.9 673.8L795.9 673.8L795.9 673.2L795.9 673.2L795.9 673.2L795.9 673.2L795.9 673.2L795.9 673.2L795.9 673.2L795.9 673.2L795.9 673.2L795.9 673.2L795.9 673.2L795.9 673.2L795.9 673.2L795.9 673.2L795.9 673.2L795.9 673.2L796.0 672.7L796.0 672.7L796.0 672.7L796.0 672.7L796.0 672.7L796.0 672.7L796.0 672.7L796.0 672.7L796.0 672.7L796.0 672.7L796.0 672.7L796.0 672.7L796.0 672.7L796.0 672.7L796.0 672.7L796.0 672.7L796.5 671.9L796.2 671.9L796.3 671.3L796.3 670.8L796.3 670.0L796.4 669.4L796.4 668.9L796.4 668.3L796.7 667.8L796.7 667.2L796.8 666.7L796.8 666.1L796.8 665.3L796.4 664.7L796.4 664.2L796.4 663.6L796.5 663.1L796.5 663.1L796.5 663.1L796.5 663.1L796.5 663.1L796.5 663.1L796.5 663.1L796.5 663.1L796.5 662.8L796.5 662.8L796.5 662.8L796.5 662.8L796.5 662.8L796.5 662.8L796.5 662.8L796.5 662.8L796.7 662.3L796.7 662.3L796.7 662.3L796.7 662.3L796.7 662.3L796.7 662.3L796.7 662.3L796.7 662.3L797.2 662.3L797.2 662.3L797.2 662.3L797.2 662.3L797.2 662.3L797.2 662.3L797.2 662.3L797.2 662.3L797.5 662.0L797.5 662.0L797.5 662.0L797.5 662.0L797.5 662.0L797.5 662.0L797.5 662.0L797.5 662.0L797.5 661.5L797.5 661.5L797.5 661.5L797.5 661.5L797.5 661.5L797.5 661.5L797.5 661.5L797.5 661.5L797.8 661.0L797.8 661.0L797.8 661.0L797.8 661.0L797.8 661.0L797.8 661.0L797.8 661.0L797.8 661.0L797.8 661.0L797.8 661.0L797.8 661.0L797.8 661.0L797.8 661.0L797.8 661.0L797.8 661.0L797.8 661.0L797.8 660.4L797.8 660.1L797.8 659.6L797.9 659.0L798.6 658.5L798.6 658.0L798.9 657.5L798.9 656.9L799.2 656.4L799.2 656.1L799.5 655.6L799.5 655.0L800.3 654.2L800.3 653.7L800.6 653.1L800.6 652.6L801.4 652.1L801.4 652.1L801.4 652.1L801.4 652.1L801.4 651.5L801.4 651.5L801.4 651.5L801.4 651.5L801.7 651.0L801.7 651.0L801.7 651.0L801.7 651.0L801.7 650.5L801.7 650.5L801.7 649.9L801.7 649.9L802.0 649.4L801.7 649.4L801.7 649.4L801.7 649.4L801.7 649.4L801.7 649.4L801.7 649.4L801.7 649.4L801.8 648.8L801.8 648.8L801.8 648.8L801.8 648.8L801.8 648.3L801.8 648.3L801.8 648.3L801.8 648.3L801.8 647.7L801.8 647.7L801.8 647.7L801.8 647.7L801.8 647.7L801.8 647.7L801.8 647.7L801.8 647.7L801.8 647.7L801.8 647.7L801.8 647.7L801.8 647.7L801.8 647.7L801.8 647.7L801.8 647.7L801.8 647.7L802.1 647.5L801.6 647.4L801.6 647.4L801.6 647.4L801.6 647.4L801.6 647.4L801.6 647.4L801.6 647.4L801.6 647.4L801.6 647.4L801.6 647.4L801.6 647.4L801.6 647.4L801.6 647.4L801.6 647.4L801.6 647.4L801.6 647.4L801.6 647.4L801.6 647.4","cx":807.5,"cy":676.4,"area":2088},{"zh":"广东","en":"Guangdong","d":"M634.1 668.1L638.2 665.0L638.5 658.9L640.4 657.1L645.3 657.9L653.5 662.2L655.0 659.2L653.1 655.5L654.0 653.1L659.2 648.7L668.4 651.9L673.8 648.9L677.6 653.0L686.8 650.7L688.2 654.6L685.4 658.3L680.3 665.8L680.2 667.7L682.7 669.8L702.4 662.8L709.3 667.3L711.2 665.2L709.6 660.7L710.3 658.0L722.7 661.4L724.9 663.5L728.6 663.1L733.2 670.5L738.3 684.0L734.2 687.1L730.7 693.3L727.3 694.2L724.3 700.4L714.4 704.9L710.8 702.5L708.0 706.8L707.9 707.9L705.3 707.7L699.8 707.4L694.7 711.0L691.4 708.7L687.3 711.5L676.4 715.6L667.9 707.7L666.8 713.7L669.7 722.4L661.4 725.3L656.9 731.4L648.5 732.9L644.2 734.6L635.6 734.2L629.2 739.9L613.5 744.9L605.7 750.3L601.8 754.0L608.2 766.5L603.0 770.6L597.3 770.0L591.2 756.7L593.0 747.4L593.2 743.0L598.6 734.7L605.0 733.4L604.7 729.0L611.4 726.6L612.5 718.9L624.3 710.1L624.4 698.0L633.4 686.6L633.3 682.1L636.4 677.9L634.1 668.1L634.1 668.1","cx":664.8,"cy":701.7,"area":17931},{"zh":"广西","en":"Guangxi","d":"M489.0 669.9L495.2 670.8L502.3 664.7L505.0 666.4L518.0 672.8L520.1 671.6L520.9 667.0L523.6 664.7L542.4 653.2L545.3 657.2L556.3 661.3L562.9 653.2L565.7 655.3L570.1 655.5L570.2 653.1L576.3 651.2L576.4 649.6L578.6 647.0L579.9 647.4L586.1 642.0L591.0 643.3L596.0 637.1L597.8 642.6L599.9 642.2L607.8 635.3L609.3 635.6L613.1 633.9L618.9 636.1L618.6 643.2L623.4 644.5L621.8 651.4L617.0 658.5L614.6 664.9L616.7 665.0L621.8 660.1L626.0 670.6L629.5 668.4L633.1 668.6L635.5 678.2L632.4 682.3L632.4 686.7L623.5 697.8L623.4 709.7L611.8 718.3L610.6 725.8L604.0 728.2L604.3 732.6L598.0 733.8L592.6 742.0L580.3 742.9L573.9 737.5L567.5 734.4L559.9 741.1L553.4 741.3L546.1 741.1L531.5 731.4L529.1 723.5L533.4 715.6L528.9 711.8L523.2 711.5L522.0 710.1L516.0 711.1L509.7 706.5L512.4 699.3L517.4 699.3L519.3 697.8L521.1 691.7L519.3 688.0L502.8 683.9L500.5 678.9L495.6 678.7L491.4 678.5L488.3 672.6L489.0 669.9L489.0 669.9","cx":561.9,"cy":688.4,"area":16045},{"zh":"福建","en":"Fujian","d":"M709.9 657.8L713.7 639.7L716.9 635.0L718.2 629.9L722.5 622.8L720.6 619.7L721.4 613.4L730.0 604.1L729.6 597.8L735.8 588.6L741.0 590.2L752.1 582.9L754.2 578.7L760.4 580.4L763.3 589.2L765.8 595.9L772.4 596.2L777.4 590.8L783.0 597.6L794.0 593.8L786.3 610.8L782.5 608.5L779.5 609.7L779.2 611.3L782.6 615.8L781.0 631.5L781.5 636.7L780.7 638.0L776.3 636.7L773.2 639.6L774.9 643.7L769.4 648.9L770.3 651.1L764.7 653.5L765.2 657.9L763.5 659.7L756.2 659.4L752.1 662.7L751.5 664.0L754.8 666.6L750.8 672.4L745.5 678.9L743.4 678.0L737.9 683.4L732.9 670.1L728.3 662.8L724.6 663.1L722.3 661.1L709.9 657.8L709.9 657.8","cx":752.0,"cy":631.0,"area":8805},{"zh":"江西","en":"Jiangxi","d":"M666.8 568.7L672.0 580.8L672.5 586.9L669.0 592.8L664.3 596.1L662.9 607.0L664.2 608.8L666.6 607.8L668.1 609.0L667.8 616.1L670.5 624.5L673.9 626.1L673.5 638.1L670.9 646.3L672.8 650.2L676.6 654.3L686.0 652.0L687.4 655.9L684.5 659.6L679.4 667.1L679.3 669.0L681.8 671.1L701.7 664.1L708.7 668.6L710.6 666.5L709.0 662.0L709.7 659.3L713.5 641.1L716.7 636.3L718.0 631.1L722.4 623.9L720.4 620.8L721.3 614.5L730.0 605.0L729.5 598.7L735.8 589.4L741.0 591.0L752.3 583.6L754.3 579.3L748.2 565.8L744.3 559.0L747.1 555.8L743.6 552.1L733.0 551.5L729.1 546.4L720.5 554.2L717.4 552.6L721.4 546.2L721.0 544.0L717.9 543.0L707.8 548.0L700.3 550.4L694.0 549.5L679.3 561.6L672.1 563.7L666.8 568.7L666.8 568.7","cx":708.6,"cy":607.0,"area":11708},{"zh":"湖南","en":"Hunan","d":"M669.7 568.1L665.3 567.0L663.6 563.9L664.0 556.5L661.5 553.1L656.6 557.8L654.3 561.2L650.6 561.0L650.2 555.2L645.6 556.4L639.7 560.4L635.6 557.8L628.3 551.9L606.2 549.1L603.7 551.4L608.1 557.1L602.4 560.7L594.3 556.4L585.2 563.6L582.0 570.9L581.9 587.4L584.9 605.7L574.9 615.8L575.8 617.5L584.4 615.2L587.3 619.5L584.3 632.0L588.5 641.6L593.4 642.9L598.4 636.6L600.2 642.2L602.4 641.7L610.3 634.7L611.9 635.1L615.7 633.4L621.6 635.6L621.2 642.7L626.1 644.1L624.4 651.1L619.6 658.3L617.2 664.8L619.2 664.9L624.5 659.9L628.6 670.6L632.2 668.3L635.8 668.5L639.9 665.4L640.2 659.4L642.2 657.6L647.1 658.4L655.3 662.6L656.7 659.7L654.8 656.0L655.7 653.6L661.0 649.2L670.2 652.4L675.6 649.4L673.7 645.5L676.3 637.4L676.6 625.3L673.3 623.7L670.6 615.4L671.0 608.2L669.5 607.1L667.0 608.0L665.8 606.3L667.2 595.4L671.8 592.1L675.3 586.2L674.8 580.1L669.7 568.1L669.7 568.1","cx":625.8,"cy":609.9,"area":12357},{"zh":"贵州","en":"Guizhou","d":"M506.3 602.7L503.3 610.6L498.3 612.0L487.9 609.8L485.7 612.4L479.9 609.9L474.3 617.5L476.5 619.8L476.2 624.9L478.6 629.3L489.0 626.6L492.2 629.5L486.2 650.3L492.1 657.1L489.6 669.1L495.8 670.0L502.8 663.9L505.5 665.6L518.4 672.0L520.5 670.7L521.2 666.2L523.9 663.9L542.6 652.4L545.5 656.4L556.3 660.4L562.9 652.4L565.7 654.4L570.0 654.7L570.2 652.3L576.2 650.4L576.3 648.8L578.5 646.2L579.7 646.5L586.0 641.2L581.8 631.8L584.8 619.5L581.9 615.3L573.5 617.6L572.6 615.9L582.4 605.9L579.5 587.9L572.8 592.6L567.4 586.1L562.4 578.3L562.4 573.7L558.6 573.0L554.2 574.1L547.4 570.2L543.4 578.4L537.2 578.9L532.7 585.4L529.7 584.2L525.5 585.0L519.0 580.6L513.3 587.1L513.1 589.8L523.4 596.3L525.7 601.0L517.8 603.5L506.3 602.7L506.3 602.7","cx":530.1,"cy":621.1,"area":11371},{"zh":"浙江","en":"Zhejiang","d":"M794.0 593.2L783.3 597.0L777.7 590.1L772.8 595.6L766.4 595.3L763.9 588.6L761.0 579.7L754.9 578.0L748.9 564.6L745.1 557.9L747.9 554.7L749.5 553.5L757.0 543.5L757.2 534.8L759.7 531.4L765.1 530.6L767.0 528.2L765.2 524.0L768.2 520.4L768.7 512.2L772.6 510.5L779.1 515.2L787.2 517.0L793.0 510.5L799.1 516.8L796.1 518.8L792.5 524.1L787.0 525.2L785.2 526.7L789.9 530.2L799.9 525.8L815.2 533.7L816.0 547.9L809.8 547.6L809.1 551.7L812.1 557.8L809.1 561.2L811.9 567.1L806.4 573.4L804.3 569.7L795.5 590.2L794.0 593.2L794.0 593.2","cx":780.5,"cy":553.8,"area":6133},{"zh":"安徽","en":"Anhui","d":"M701.0 441.6L704.1 441.0L714.7 446.0L719.4 451.5L727.6 454.4L731.1 457.6L735.9 457.1L736.9 459.1L734.7 470.0L739.0 472.8L741.4 477.0L748.4 479.1L751.3 474.2L755.8 474.7L758.7 479.1L758.0 482.9L749.0 483.5L748.8 487.4L748.6 490.5L745.0 494.1L747.4 498.7L754.2 504.6L754.4 510.7L768.8 512.9L768.3 521.2L765.2 524.9L767.1 529.1L765.1 531.5L759.6 532.4L757.0 535.8L756.8 544.7L749.2 554.8L747.6 556.1L744.1 552.3L733.6 551.8L729.6 546.6L721.1 554.5L718.0 552.9L722.0 546.5L721.6 544.2L718.5 543.2L708.5 548.3L700.3 529.2L703.5 523.9L702.8 521.6L698.2 520.0L690.0 514.3L693.8 507.5L698.9 505.3L700.0 499.6L699.0 489.2L698.0 488.1L692.7 493.1L685.7 486.6L680.6 479.1L686.3 475.3L688.2 468.4L691.5 465.8L691.5 456.1L694.0 454.6L698.3 457.6L701.2 461.6L706.9 458.0L709.2 455.7L708.4 450.9L702.0 446.4L701.0 441.6L701.0 441.6","cx":724.7,"cy":498.6,"area":10152},{"zh":"江苏","en":"Jiangsu","d":"M798.2 499.8L795.3 506.9L792.2 510.8L786.4 517.2L778.2 515.4L771.7 510.8L767.8 512.5L753.6 510.4L753.4 504.5L746.7 498.7L744.3 494.3L747.9 490.7L748.1 487.8L748.2 484.0L757.1 483.4L757.8 479.7L754.9 475.5L750.5 475.0L747.7 479.7L740.8 477.7L738.4 473.5L734.2 470.9L736.3 460.3L735.3 458.3L730.6 458.9L727.2 455.7L719.0 452.9L714.4 447.5L704.0 442.7L705.1 437.6L709.6 436.0L716.9 443.4L719.5 443.5L726.6 442.8L730.9 439.8L736.3 444.7L738.9 440.5L740.0 437.9L744.8 435.4L746.4 429.6L751.1 428.8L762.9 437.7L770.9 441.9L786.0 470.9L785.1 473.8L795.9 479.8L798.8 484.5L803.5 487.4L805.9 492.7L802.2 493.8L796.8 491.9L789.1 491.5L782.2 488.5L778.7 491.0L785.6 493.0L791.7 496.2L798.2 499.8L798.2 499.8","cx":750.0,"cy":473.0,"area":9008},{"zh":"湖北","en":"Hubei","d":"M579.4 571.7L582.7 564.3L591.8 557.0L600.0 561.3L605.8 557.7L601.3 551.9L603.8 549.5L626.2 552.4L633.5 558.3L637.6 561.0L643.6 556.9L648.2 555.7L648.7 561.6L652.4 561.8L654.7 558.3L659.7 553.6L662.1 557.0L661.7 564.5L663.4 567.7L667.9 568.8L673.2 563.7L680.4 561.6L695.1 549.3L701.4 550.2L708.9 547.8L700.7 528.6L703.8 523.2L703.2 521.0L698.5 519.3L690.3 513.6L686.5 510.9L681.1 513.1L675.6 507.8L667.9 507.4L662.3 503.8L660.7 498.4L658.0 494.9L653.6 497.5L650.0 495.3L637.8 496.6L624.5 492.9L609.2 477.0L604.8 480.7L602.8 478.9L599.6 478.7L585.1 478.0L582.6 479.8L586.9 484.5L591.3 485.8L595.2 487.7L592.9 490.7L585.6 493.9L584.0 499.9L585.2 502.2L585.6 509.8L590.0 510.9L593.9 516.9L595.4 529.0L593.6 532.8L590.7 531.8L582.2 538.3L567.6 539.8L563.7 543.8L566.6 548.1L566.4 557.0L570.3 558.1L579.4 571.7L579.4 571.7","cx":636.3,"cy":524.4,"area":13750},{"zh":"陕西","en":"Shaanxi","d":"M598.0 448.2L596.0 442.2L601.2 427.0L596.5 397.0L601.1 389.9L603.5 383.3L598.4 370.8L604.1 362.4L605.2 354.6L608.4 348.8L608.5 341.5L606.0 339.5L602.2 343.9L592.0 343.7L586.4 351.8L586.7 356.1L585.5 359.0L581.3 360.2L564.3 383.1L562.5 381.6L557.9 379.8L548.8 380.4L545.5 384.3L544.7 394.0L545.9 397.0L561.2 406.0L569.0 411.8L569.8 417.0L565.5 423.0L567.5 430.7L565.7 434.1L554.3 434.3L551.9 436.1L552.6 438.0L552.4 441.2L543.2 442.1L538.5 439.2L532.2 438.8L531.4 440.2L532.0 443.7L528.9 447.3L528.0 451.1L533.4 456.2L528.5 465.2L530.1 469.6L529.7 472.0L523.0 471.7L518.0 473.6L521.5 479.5L518.6 486.3L522.7 487.4L523.0 492.0L526.3 492.4L538.6 490.6L540.9 491.8L541.5 495.4L546.6 497.0L557.2 503.5L563.8 501.2L576.7 507.0L579.6 511.2L586.2 509.7L585.8 502.3L584.6 500.1L586.2 494.2L593.4 491.1L595.6 488.2L591.8 486.4L587.5 485.1L583.3 480.5L585.7 478.8L600.0 479.5L603.1 479.7L605.1 481.4L609.4 477.8L609.8 471.9L597.9 450.9L598.0 448.2L598.0 448.2","cx":563.9,"cy":425.4,"area":15762},{"zh":"山西","en":"Shanxi","d":"M598.6 447.0L612.8 443.9L630.6 432.4L643.2 430.3L652.7 423.2L654.9 406.8L650.5 400.9L652.3 395.8L655.7 391.4L656.8 384.7L659.9 379.7L655.5 369.4L649.2 361.0L653.7 348.4L662.4 342.9L664.3 334.9L661.1 327.1L661.6 317.9L656.7 312.8L644.1 318.7L642.1 316.7L635.1 320.9L630.0 320.4L618.5 335.8L614.8 335.6L609.1 340.1L609.0 347.5L605.8 353.3L604.6 361.1L599.0 369.4L604.1 381.9L601.6 388.6L597.1 395.6L601.8 425.7L596.6 440.9L598.6 447.0L598.6 447.0","cx":630.5,"cy":379.9,"area":9085},{"zh":"山东","en":"Shandong","d":"M702.9 442.6L703.9 437.5L708.5 435.8L716.1 443.3L718.7 443.5L725.9 442.7L730.3 439.7L735.8 444.6L738.4 440.4L739.6 437.7L744.5 435.2L746.2 429.3L751.0 428.4L765.9 405.3L763.5 401.1L766.3 398.8L769.1 400.0L773.5 397.8L776.4 392.5L788.3 382.1L797.2 379.6L801.3 375.9L800.7 367.1L795.0 366.3L781.7 367.2L772.7 362.4L767.1 362.9L752.7 380.2L748.6 382.5L740.1 378.2L739.6 373.5L738.1 365.5L733.5 362.0L725.5 363.5L720.7 359.9L713.1 368.8L705.0 370.9L693.9 380.5L680.9 401.7L683.8 408.2L682.8 410.6L682.7 413.6L684.4 416.2L688.3 413.3L694.7 412.0L676.7 431.1L676.5 435.5L679.9 437.0L687.2 444.3L699.7 443.3L702.9 442.6L702.9 442.6","cx":738.9,"cy":402.2,"area":10571},{"zh":"天津","en":"Tianjin","d":"M716.3 349.4L711.4 351.6L703.2 348.5L702.9 346.0L703.5 330.2L708.9 327.5L708.2 324.5L709.9 318.7L710.5 315.7L713.4 317.5L714.5 322.9L713.6 326.4L719.6 331.5L720.1 335.3L716.4 338.4L715.0 344.8L716.3 349.4L716.3 349.4","cx":711.5,"cy":333.6,"area":617},{"zh":"北京","en":"Beijing","d":"M703.0 329.7L705.6 325.1L707.9 325.2L710.5 318.2L710.7 315.9L708.7 308.6L706.4 308.5L695.3 300.8L688.0 307.5L685.3 314.5L678.0 321.3L677.7 328.4L679.7 333.3L686.7 331.3L693.5 334.0L696.0 331.8L703.0 329.7L703.0 329.7","cx":694.2,"cy":317.4,"area":1096},{"zh":"宁夏","en":"Ningxia","d":"M544.3 394.3L545.1 384.5L548.4 380.6L547.4 375.8L532.7 368.8L533.8 362.3L539.0 355.7L536.5 344.3L535.6 342.6L525.0 349.5L519.6 365.1L517.3 376.5L509.0 382.6L504.4 384.6L498.9 385.9L510.5 403.2L512.6 415.9L510.8 421.9L519.4 427.3L519.2 431.4L527.0 433.7L529.5 433.8L529.9 426.7L536.3 426.2L538.0 417.8L533.9 414.0L530.8 410.3L533.2 394.0L536.5 392.5L542.0 395.3L544.3 394.3L544.3 394.3","cx":523.6,"cy":388.2,"area":4514},{"zh":"西藏","en":"Tibet","d":"M237.3 569.5L248.6 571.4L252.2 577.3L254.2 578.2L271.4 576.2L272.9 572.7L275.9 571.2L284.5 564.6L291.8 564.2L298.5 559.9L311.8 553.3L313.0 555.8L322.7 559.3L336.8 552.4L341.3 555.9L336.8 561.9L338.3 563.4L344.0 563.7L344.4 566.1L339.3 574.8L340.5 576.2L343.3 576.4L357.1 581.2L363.3 576.1L372.2 584.2L375.3 580.8L377.5 583.3L380.6 583.5L382.0 581.1L382.1 569.7L384.2 568.2L390.8 561.2L391.1 532.1L386.7 517.2L390.7 514.5L380.7 492.7L368.0 480.9L364.0 483.4L364.2 489.7L351.7 504.8L333.1 499.8L332.2 492.1L320.5 481.4L294.4 475.7L283.3 473.2L278.7 472.2L269.3 463.5L248.9 457.3L235.9 427.5L235.8 419.4L242.2 416.7L242.6 407.8L247.4 396.9L242.7 391.5L249.2 386.4L245.4 383.7L236.1 383.2L219.5 374.5L208.3 373.9L199.7 375.6L190.1 375.1L174.6 383.0L162.5 381.0L150.4 384.7L141.0 380.7L135.1 375.0L119.2 371.4L108.4 378.5L102.8 376.0L98.1 371.7L86.6 368.1L78.3 373.6L74.7 382.7L67.8 386.1L66.2 391.5L62.0 392.6L57.4 392.1L55.1 395.8L54.0 401.1L51.7 401.0L51.1 406.7L56.5 413.0L56.6 421.7L54.3 424.8L46.0 425.5L41.6 420.6L37.4 420.7L36.5 424.4L38.7 431.1L39.2 435.7L38.9 441.7L37.1 445.9L37.8 448.9L42.9 450.0L46.0 455.6L58.1 466.9L57.9 470.1L67.2 481.7L69.8 486.0L72.9 487.2L78.9 481.3L83.8 486.7L104.8 507.4L108.1 517.9L113.0 518.1L116.1 515.0L118.3 517.8L117.8 526.5L130.3 535.1L133.2 534.1L134.6 541.8L145.4 549.4L145.4 553.8L147.4 555.3L157.0 555.2L162.2 555.5L169.7 561.9L186.8 562.5L196.1 562.2L198.2 566.3L195.7 574.9L198.2 578.0L207.9 570.1L220.3 561.8L228.8 563.6L237.3 569.5L237.3 569.5","cx":213.8,"cy":476.2,"area":76629},{"zh":"云南","en":"Yunnan","d":"M505.9 602.1L504.9 596.8L500.6 594.9L493.3 599.3L488.6 596.5L488.4 589.9L486.5 586.8L486.7 583.2L479.7 581.4L477.8 583.0L478.9 588.3L473.0 590.5L471.5 594.3L472.6 598.7L460.2 612.7L461.1 630.4L455.1 635.0L452.5 631.6L440.4 638.1L436.4 635.4L421.4 600.5L415.2 595.2L409.8 593.2L407.5 588.7L410.8 583.6L406.1 579.2L400.2 584.2L394.2 585.0L391.5 566.1L391.0 561.9L384.4 569.0L382.2 570.5L382.1 582.1L380.7 584.5L377.6 584.4L375.4 581.8L372.4 585.2L374.5 598.3L377.9 598.4L380.6 601.1L381.0 609.1L378.2 637.1L359.2 653.2L358.1 659.7L354.5 662.9L353.6 666.1L356.2 674.8L353.6 680.7L354.8 681.6L364.0 679.4L377.0 679.2L375.4 684.7L377.2 690.0L377.6 697.5L379.3 700.3L386.8 701.2L390.3 703.9L386.1 708.7L385.3 715.0L381.8 721.7L383.8 724.3L388.6 725.1L396.5 728.8L395.3 731.8L400.3 740.6L407.8 741.0L417.7 735.7L420.7 737.5L420.5 741.1L421.3 746.1L423.7 749.0L428.9 748.4L430.7 749.6L432.9 748.1L433.3 740.1L430.7 724.5L433.5 720.2L441.3 720.7L443.4 720.8L448.0 715.8L459.2 720.2L464.1 715.8L466.3 718.7L471.4 715.6L475.6 720.5L477.4 720.6L479.1 718.2L483.2 714.6L484.6 715.8L490.1 715.2L495.8 710.8L500.3 704.2L506.6 703.4L509.8 707.1L512.5 699.8L517.4 699.8L519.3 698.3L521.2 692.0L519.3 688.3L502.9 684.2L500.6 679.1L495.7 678.8L491.5 678.6L488.5 672.6L489.1 669.9L491.6 657.6L485.7 650.7L491.8 629.5L488.5 626.6L478.0 629.3L475.7 624.8L475.9 619.6L473.7 617.3L479.3 609.6L485.1 612.1L487.4 609.4L497.9 611.6L502.9 610.2L505.9 602.1L505.9 602.1","cx":437.4,"cy":655.8,"area":31459},{"zh":"青海","en":"Qinghai","d":"M247.5 386.1L254.9 389.5L268.6 385.8L266.6 383.2L263.5 383.0L261.8 378.5L263.3 375.0L269.5 372.5L274.7 365.3L261.6 352.7L261.5 340.3L268.1 335.3L313.2 328.8L316.5 326.5L323.1 327.4L345.4 334.1L351.5 338.9L361.4 345.5L367.5 345.5L377.5 340.0L390.1 342.3L398.7 338.3L415.2 350.5L424.3 347.4L428.7 359.8L440.1 368.2L448.1 376.6L454.6 374.7L466.0 392.0L467.8 403.1L472.0 409.7L469.7 422.4L459.6 429.9L461.1 435.2L457.3 438.9L452.0 443.6L451.5 452.1L447.1 455.8L442.0 453.6L437.5 448.6L434.9 453.8L437.5 458.6L445.4 459.6L452.0 468.0L456.8 468.2L459.7 472.2L456.5 479.3L456.4 479.8L450.2 478.7L445.8 482.0L442.9 476.6L435.4 479.3L432.8 483.0L432.5 489.4L424.7 490.6L415.5 479.9L412.9 474.8L405.2 476.6L392.2 472.0L372.3 474.0L370.4 475.9L368.2 482.4L364.1 485.0L364.3 491.3L351.6 506.7L332.7 501.6L331.8 493.8L319.9 482.9L293.3 477.1L282.1 474.6L277.4 473.5L267.9 464.7L247.1 458.3L233.9 428.0L233.8 419.7L240.3 417.0L240.8 407.9L245.6 396.8L240.9 391.2L247.5 386.1L247.5 386.1","cx":352.9,"cy":416.6,"area":42924},{"zh":"四川","en":"Sichuan","d":"M455.3 476.0L457.9 468.9L455.8 466.4L456.2 459.2L467.6 454.9L472.0 455.2L471.8 460.0L473.8 464.9L478.0 470.0L486.5 477.6L491.1 475.5L493.2 478.0L492.7 487.6L499.3 490.3L510.3 493.3L512.6 491.0L512.9 486.2L519.7 484.2L524.0 486.8L523.8 491.6L528.2 491.9L539.5 490.0L541.7 490.2L543.7 495.1L548.2 495.3L559.0 503.1L565.8 501.1L572.2 506.2L567.7 506.0L570.0 506.1L567.6 508.4L567.4 513.2L564.9 517.9L562.4 522.6L562.2 527.4L555.3 529.4L553.0 531.7L550.6 534.0L548.1 538.7L543.4 543.3L541.1 545.6L534.4 545.2L530.2 540.2L525.6 542.3L521.4 537.3L514.6 539.3L514.3 544.2L514.1 549.0L513.9 551.4L511.6 553.7L506.9 558.2L513.3 563.4L519.6 570.9L521.9 571.1L521.6 575.9L519.2 578.2L514.4 585.1L514.3 587.5L525.1 595.3L527.0 600.3L518.0 602.2L506.8 601.6L507.2 594.4L502.8 594.2L493.6 598.5L489.3 595.9L489.6 588.7L487.5 586.1L487.8 581.3L481.1 581.0L478.9 580.9L480.7 588.2L473.9 590.2L471.5 592.5L473.5 597.4L461.6 611.3L463.0 628.2L456.0 632.7L453.9 630.2L440.2 636.7L438.1 634.1L422.0 599.6L415.5 594.4L409.0 591.7L407.0 586.7L411.7 582.2L405.3 577.0L400.4 584.0L393.7 583.6L392.5 564.3L390.4 561.8L392.1 530.5L386.1 515.7L390.7 513.6L380.7 491.4L367.9 478.6L370.4 474.0L372.8 471.7L390.7 470.2L404.0 473.3L413.0 471.4L415.0 476.3L423.3 488.8L432.4 486.8L432.7 479.6L435.1 477.3L441.9 475.3L446.1 480.3L448.6 475.6L455.2 478.4L455.3 476.0L455.3 476.0","cx":470.1,"cy":545.8,"area":37142},{"zh":"甘肃","en":"Gansu","d":"M324.6 328.8L323.8 299.6L325.4 293.4L333.9 290.0L345.8 280.4L363.8 273.6L371.8 270.8L372.2 263.4L375.2 259.7L378.3 260.1L390.1 262.9L389.0 268.4L391.2 277.0L388.9 291.2L398.1 307.3L403.1 311.2L412.0 305.0L428.8 305.9L433.2 307.8L435.5 312.1L433.2 316.3L423.2 324.3L424.0 328.2L434.7 337.6L438.8 337.8L440.1 339.5L439.1 343.3L445.5 349.2L461.2 352.7L468.8 350.9L478.9 341.3L490.5 342.7L494.7 350.6L491.8 357.4L492.1 361.8L485.7 365.6L482.6 369.0L483.5 377.6L493.9 386.1L498.9 385.5L510.7 402.9L512.9 415.7L511.0 421.6L519.8 427.0L519.6 431.2L527.5 433.5L530.1 433.6L530.5 426.5L537.0 426.0L538.7 417.6L534.5 413.8L531.3 410.0L533.8 393.7L537.2 392.2L542.8 395.0L545.2 394.0L546.3 397.1L561.7 406.1L569.4 412.0L570.1 417.3L565.9 423.4L567.9 431.2L566.1 434.7L554.7 434.9L552.3 436.7L552.9 438.7L552.8 442.0L543.6 442.9L538.9 439.9L532.7 439.5L531.8 440.9L532.4 444.5L529.3 448.2L528.4 452.0L533.8 457.2L528.9 466.3L530.5 470.8L530.1 473.2L523.4 472.9L518.3 474.8L521.9 480.8L519.0 487.8L511.6 489.1L512.2 492.9L510.0 495.3L497.9 493.6L493.4 489.8L492.8 481.5L489.9 478.3L485.6 481.1L478.5 472.7L472.8 468.0L472.6 462.3L471.0 457.8L467.9 457.6L455.7 462.5L456.1 468.5L451.5 468.3L444.9 460.0L437.2 459.0L434.6 454.2L437.2 449.1L441.6 454.0L446.7 456.2L451.0 452.6L451.4 444.1L456.6 439.4L460.4 435.8L458.9 430.5L468.9 423.0L471.1 410.5L467.0 403.9L465.3 392.8L454.0 375.7L447.7 377.6L439.8 369.2L428.6 360.9L424.3 348.6L415.3 351.7L399.0 339.6L390.5 343.5L378.2 341.2L368.3 346.8L362.3 346.7L352.6 340.2L346.6 335.5L324.6 328.8L324.6 328.8","cx":407.0,"cy":347.5,"area":58028},{"zh":"河北","en":"Hebei","d":"M684.9 408.3L685.8 405.9L683.0 399.5L695.9 378.5L706.8 369.1L714.8 367.1L722.3 358.3L719.8 356.2L717.6 349.1L712.0 351.2L702.7 348.0L702.3 345.6L702.9 329.6L697.8 331.5L694.8 334.1L688.9 332.1L680.2 332.8L679.1 328.9L680.3 321.4L686.9 314.2L688.7 306.1L695.5 300.0L706.4 306.8L709.1 306.9L710.7 315.1L714.0 316.9L715.3 322.4L714.3 325.9L721.1 331.1L721.7 334.9L727.6 338.2L741.9 330.9L742.1 326.0L751.1 314.3L745.5 305.3L741.1 304.8L733.6 298.7L736.6 290.2L724.2 288.2L719.4 279.6L720.1 275.3L710.3 262.6L703.1 265.7L697.0 271.4L698.9 276.1L697.2 279.0L688.8 278.8L684.7 282.4L681.6 280.9L678.0 284.2L669.9 289.5L666.6 286.8L667.0 278.7L664.2 277.2L660.0 278.6L653.9 290.2L651.5 301.2L657.2 312.3L662.1 317.5L661.6 326.6L664.9 334.4L662.9 342.4L654.2 347.9L649.7 360.4L656.0 368.9L660.5 379.1L657.3 384.1L656.2 390.8L652.8 395.2L651.0 400.3L655.4 406.2L674.3 409.9L682.1 407.0L684.9 408.3L684.9 408.3","cx":688.4,"cy":356.2,"area":14936},{"zh":"内蒙古","en":"Inner Mongolia","d":"M498.9 385.6L504.4 384.2L509.1 382.3L517.5 376.1L519.9 364.7L525.4 349.1L536.1 342.2L537.0 343.9L539.5 355.3L534.3 361.9L533.1 368.4L548.0 375.5L549.1 380.3L558.1 379.6L562.7 381.5L564.4 383.0L581.4 359.7L585.6 358.5L586.8 355.6L586.5 351.2L592.1 343.0L602.2 343.2L606.0 338.7L608.5 340.8L614.2 336.2L617.8 336.3L629.2 320.7L634.4 321.3L641.3 317.0L643.3 319.0L655.7 313.1L650.1 301.8L652.5 290.6L658.6 278.9L662.8 277.5L665.5 279.0L665.1 287.2L668.3 289.8L676.4 284.5L679.9 281.1L682.9 282.6L687.0 279.0L695.3 279.2L697.0 276.2L695.1 271.5L701.1 265.7L708.3 262.5L718.0 275.4L717.2 279.8L721.9 288.5L734.2 290.5L737.4 284.4L735.0 266.4L738.2 263.3L743.7 268.0L748.1 276.4L757.3 263.7L761.3 262.6L767.8 256.6L770.6 256.7L775.8 251.5L778.9 251.7L782.0 246.6L789.5 247.0L796.6 240.2L800.1 236.9L800.3 233.0L795.3 229.5L795.7 222.1L786.4 208.4L776.3 217.5L773.6 214.9L773.4 209.6L770.1 203.2L769.2 196.2L769.5 189.1L763.1 183.6L762.5 180.8L764.5 176.5L776.7 181.0L777.8 175.0L782.2 169.5L779.5 166.3L780.3 160.6L786.7 158.2L788.0 156.3L787.1 154.1L780.6 155.9L769.2 146.3L768.8 143.8L774.9 136.4L787.7 118.1L788.9 116.0L790.7 116.1L794.3 121.5L795.0 122.3L797.0 98.8L801.0 96.8L801.5 87.8L800.9 72.9L806.9 52.9L793.1 40.7L781.7 49.7L776.0 50.5L773.0 53.3L763.6 51.2L759.2 45.2L756.9 36.3L757.3 32.7L750.1 27.2L745.3 34.3L737.3 28.7L736.1 27.2L741.7 14.1L738.1 8.4L734.8 8.2L725.7 14.3L718.1 24.9L721.1 27.0L726.3 28.1L729.8 39.8L727.0 44.3L722.5 50.7L713.4 80.7L716.0 86.1L713.4 90.3L694.9 103.1L685.5 100.7L680.2 98.2L679.5 101.2L670.1 133.6L666.0 137.5L667.7 143.4L671.9 148.0L680.1 144.1L693.2 145.6L697.2 139.2L704.2 137.9L716.6 143.5L731.7 161.9L731.5 165.4L727.7 167.7L709.6 167.6L703.4 172.5L698.8 171.7L695.2 177.3L686.0 178.7L680.2 187.5L678.8 194.0L665.9 202.1L657.9 202.2L649.0 214.4L640.5 219.2L625.2 214.5L620.2 211.8L613.7 218.0L610.0 229.6L617.8 243.2L612.0 249.0L604.1 253.5L591.9 268.2L576.3 274.3L552.2 275.8L548.6 275.0L519.6 286.2L506.3 294.2L502.8 291.9L501.7 287.7L484.5 285.7L464.7 278.3L459.6 271.5L430.9 266.4L425.4 268.6L390.5 263.2L389.5 268.6L391.6 277.2L389.3 291.4L398.5 307.5L403.5 311.4L412.4 305.2L429.1 306.1L433.4 308.0L435.8 312.2L433.5 316.5L423.5 324.5L424.3 328.4L434.9 337.7L439.1 338.0L440.3 339.7L439.3 343.5L445.7 349.3L461.3 352.9L468.9 351.1L479.0 341.4L490.5 342.9L494.8 350.8L491.8 357.5L492.1 361.9L485.7 365.7L482.7 369.1L483.5 377.6L493.9 386.2L498.9 385.6L498.9 385.6","cx":658.1,"cy":237.2,"area":157853},{"zh":"辽宁","en":"Liaoning","d":"M820.6 307.1L832.8 290.5L840.3 282.0L840.0 273.9L832.8 264.3L832.2 257.0L819.2 236.6L818.6 238.7L815.5 241.6L809.8 234.5L801.8 231.4L801.2 234.1L801.0 237.8L797.3 241.1L790.1 247.8L782.5 247.4L779.3 252.3L776.2 252.2L770.9 257.3L768.0 257.2L761.4 263.0L757.3 264.2L748.0 276.6L743.4 268.3L737.8 263.7L734.5 266.7L737.0 284.4L733.8 290.5L730.7 298.9L738.3 305.0L742.8 305.5L748.4 314.4L752.7 312.2L760.0 304.0L767.5 292.5L779.2 290.4L786.2 298.6L780.3 309.9L772.6 320.6L778.7 325.5L778.1 330.8L772.9 335.7L773.8 337.9L782.5 333.5L795.4 317.7L814.4 308.2L820.6 307.1L820.6 307.1","cx":785.5,"cy":284.6,"area":11672},{"zh":"吉林","en":"Jilin","d":"M918.1 205.9L914.8 205.1L910.3 204.9L902.9 202.1L900.8 197.3L898.2 201.0L894.7 198.4L886.7 206.9L885.0 209.0L881.9 209.4L877.2 204.0L872.9 201.6L868.7 191.5L864.9 193.8L865.7 202.6L863.0 204.1L857.4 196.7L855.0 193.3L850.3 193.0L847.8 185.3L841.8 181.4L832.4 184.5L829.1 183.7L824.1 178.0L816.9 181.5L812.7 181.2L807.9 183.7L800.9 177.6L796.4 168.1L784.8 169.7L780.4 175.2L779.3 181.1L767.0 176.7L764.9 180.9L765.5 183.7L772.1 189.2L771.7 196.3L772.6 203.1L776.0 209.6L776.2 214.8L778.9 217.4L789.1 208.4L798.6 222.0L798.2 229.3L803.2 232.8L803.9 230.1L811.8 233.3L817.5 240.4L820.5 237.6L821.1 235.4L833.9 256.0L834.6 263.4L841.7 273.0L842.0 281.2L849.3 277.5L856.2 259.1L859.4 258.1L866.0 262.6L877.0 261.8L881.1 258.5L876.3 249.8L877.8 247.7L888.1 244.7L892.7 236.2L898.6 234.0L899.3 225.6L901.2 220.2L904.3 219.3L906.8 222.4L909.5 225.3L917.1 215.6L919.3 207.8L918.1 205.9L918.1 205.9","cx":842.1,"cy":224.6,"area":17463},{"zh":"黑龙江","en":"Heilongjiang","d":"M783.2 169.0L794.8 167.4L799.3 176.9L806.3 183.0L811.1 180.6L815.3 180.8L822.6 177.3L827.5 183.1L830.9 183.8L840.2 180.7L846.3 184.6L848.7 192.4L853.4 192.6L855.9 196.0L861.5 203.4L864.2 201.9L863.4 193.1L867.1 190.9L871.3 200.9L875.7 203.3L880.3 208.8L883.5 208.4L885.2 206.3L893.2 197.7L896.8 200.3L899.3 196.6L901.4 201.4L908.9 204.2L913.3 204.5L916.7 205.2L915.0 201.3L914.9 188.7L906.7 174.7L911.7 169.7L916.6 161.3L932.8 162.1L936.1 159.5L935.4 153.0L939.4 146.4L938.2 143.0L939.9 136.8L941.5 105.5L946.7 96.0L941.6 89.4L942.6 85.1L940.7 81.5L934.3 83.9L926.5 91.9L919.0 95.1L911.4 105.3L893.1 110.9L885.3 103.9L886.6 99.9L882.5 93.2L881.0 86.5L874.0 85.9L862.6 78.5L857.5 80.1L851.9 76.8L843.5 78.0L836.6 74.9L832.7 68.2L828.6 62.8L827.3 57.8L822.1 51.5L818.7 45.9L811.5 34.3L809.5 27.7L801.4 15.8L799.4 9.7L788.5 3.4L781.3 5.7L774.9 3.7L760.9 0.0L741.7 6.1L738.5 8.9L742.1 14.6L736.4 27.6L737.7 29.1L745.7 34.7L750.6 27.6L757.9 33.1L757.4 36.7L759.8 45.5L764.2 51.5L773.8 53.6L776.8 50.8L782.6 50.0L794.1 41.0L808.1 53.2L802.1 73.1L802.6 87.9L802.2 96.9L798.1 98.8L796.1 122.2L795.4 121.3L791.7 116.0L789.9 115.9L788.8 118.0L775.8 136.1L769.6 143.5L770.0 145.9L781.6 155.5L788.2 153.7L789.1 155.9L787.7 157.8L781.3 160.2L780.5 165.9L783.2 169.0L783.2 169.0","cx":841.5,"cy":94.4,"area":43911},{"zh":"新疆","en":"Xinjiang","d":"M265.3 94.7L267.5 94.8L264.9 101.9L269.1 107.0L269.0 109.4L275.3 116.9L277.1 124.3L288.2 124.9L292.4 129.9L294.7 130.0L298.5 142.3L304.3 159.5L301.5 169.0L301.4 171.4L296.5 180.8L296.1 188.0L315.6 198.7L335.5 202.1L354.6 220.0L361.2 222.8L361.0 225.2L365.0 235.1L368.7 249.7L374.9 259.7L372.4 264.4L372.0 271.6L363.0 273.6L344.8 279.8L333.2 288.9L324.0 293.2L323.6 300.5L324.4 329.4L317.8 326.7L313.2 328.9L270.5 336.3L263.5 340.7L262.9 352.8L275.6 365.5L270.8 372.5L263.9 377.0L263.7 379.4L265.7 384.3L267.9 384.4L270.0 386.9L256.4 391.0L250.0 385.9L245.7 383.2L236.8 382.8L219.4 374.6L208.3 374.0L199.2 376.0L190.3 375.5L174.3 384.3L161.0 381.2L149.7 385.4L141.0 380.2L134.6 375.0L119.2 371.8L107.6 378.4L101.1 375.7L96.8 373.0L83.4 372.3L83.8 365.1L64.2 397.9L49.4 382.6L43.3 372.6L46.4 355.9L39.8 353.1L24.9 340.3L20.4 340.1L16.4 332.6L19.1 323.1L19.2 320.7L12.8 315.5L10.8 310.6L0.1 302.8L0.2 300.4L7.0 298.3L9.1 300.9L13.7 298.7L12.1 286.5L14.9 274.6L6.4 266.9L1.8 269.1L0.0 261.8L2.5 257.1L2.9 249.9L7.6 245.3L9.9 243.0L10.0 240.6L17.0 236.1L23.8 234.1L30.6 232.0L37.1 234.8L39.5 232.5L41.6 235.0L41.3 239.8L45.6 242.4L52.4 240.4L61.8 231.2L81.6 237.1L90.9 230.3L120.2 224.6L122.6 219.9L125.4 210.4L132.4 203.6L134.7 203.7L134.9 198.9L136.3 172.4L138.8 167.7L132.3 162.5L130.2 160.0L139.3 158.1L159.3 159.1L163.6 161.8L170.2 164.5L172.4 164.6L174.7 162.3L172.8 157.4L187.9 124.4L190.1 124.5L205.3 132.6L212.0 132.9L214.1 135.4L227.7 131.3L231.0 109.8L238.0 105.3L244.6 105.7L249.5 98.7L251.9 94.0L256.5 91.8L265.3 94.7L265.3 94.7","cx":187.4,"cy":244.8,"area":114757},{"zh":"重庆","en":"Chongqing","d":"M519.9 573.4L519.9 573.4L515.5 570.7L511.1 568.1L509.1 563.2L504.8 560.5L507.1 558.3L511.9 553.7L512.5 541.7L514.8 541.8L519.4 539.6L523.6 544.7L528.2 542.5L532.5 547.6L539.2 547.9L539.3 545.5L546.3 541.1L548.9 534.0L553.5 531.8L558.1 529.6L560.6 525.0L563.1 520.3L565.6 515.6L566.0 508.4L564.0 503.5L577.2 509.0L579.3 511.5L586.1 511.9L590.6 512.1L594.8 517.1L596.4 529.2L593.9 533.9L591.7 533.8L582.5 538.1L568.9 539.8L564.1 544.4L568.4 549.4L568.0 556.6L570.1 559.1L580.7 571.7L579.8 588.5L572.8 593.0L568.7 585.5L562.4 578.0L562.6 573.2L558.1 573.0L553.5 575.1L547.0 570.0L542.0 579.3L537.6 579.1L532.7 586.1L528.3 583.4L523.7 585.6L517.2 580.4L519.9 573.4Z","cx":550.6,"cy":548.2,"area":8198}],"ink":["M677.8 716.9L683.3 718.6L689.0 715.0L691.2 722.0L685.3 724.2L677.7 723.3L676.7 718.2L677.8 716.9L677.8 716.9L677.8 716.9","M942.7 680.1C942.0 679.8 941.3 679.6 940.2 679.4C939.0 678.3 939.5 677.6 939.5 676.5C939.7 675.3 939.5 675.6 940.9 675.3C940.9 675.1 941.1 674.9 941.3 674.9C941.3 674.4 941.3 673.8 941.3 673.3C941.3 673.3 941.3 673.3 941.6 673.3C941.8 673.3 942.2 673.5 942.9 673.3C943.6 673.1 944.1 672.6 944.8 672.2C946.0 672.2 947.1 672.2 948.3 672.2C948.5 672.2 949.2 672.6 949.2 673.5C949.0 674.2 948.8 674.7 948.3 675.1C947.8 675.8 947.4 676.5 947.1 677.6C945.7 678.3 944.6 678.9 943.4 679.8C943.2 680.1 942.9 680.1 942.7 680.1ZM924.8 641.3C941.8 641.3 941.8 641.3 941.8 641.3C941.8 641.7 941.8 642.4 941.8 643.1C941.8 643.5 942.0 643.8 942.7 644.2C942.7 644.4 942.9 644.7 943.2 645.1C942.2 645.1 941.8 645.6 941.1 645.8C940.2 646.9 939.0 647.4 938.1 648.3C937.4 648.7 936.4 649.0 935.7 648.7C935.3 648.7 935.0 648.5 934.3 648.3C933.4 646.9 933.4 647.4 932.5 647.2C932.2 647.4 932.0 647.4 932.0 647.8C932.0 648.1 932.0 648.3 932.0 648.5C931.3 649.2 930.4 649.9 929.9 650.8C929.2 651.0 928.5 651.0 928.3 651.2C927.1 650.8 926.9 650.3 926.4 649.9C926.2 649.9 926.0 649.6 925.7 649.6C925.3 649.6 925.0 649.6 924.8 649.6C924.8 641.3 924.8 641.3 924.8 641.3ZM942.0 641.3C960.4 641.3 960.4 641.3 960.4 641.3C960.4 641.7 960.6 642.0 960.6 642.2C961.1 643.1 961.1 643.5 960.9 644.4C960.9 645.1 960.9 645.8 961.1 646.9C959.7 646.9 958.3 646.9 956.7 646.9C956.2 647.4 956.9 648.3 957.4 648.7C957.4 649.0 957.1 649.2 957.1 649.4C956.7 649.4 955.7 648.3 955.7 648.3C955.3 648.3 954.8 648.3 954.3 648.3C954.1 648.5 953.9 649.0 953.6 649.4C953.6 649.6 953.6 650.5 952.9 651.0C952.3 650.3 951.3 650.8 950.9 650.8C950.6 650.8 950.6 650.5 950.4 650.3C950.4 649.0 949.5 649.2 949.0 649.2C949.0 649.2 949.0 649.0 949.0 648.7C949.5 647.8 950.2 646.7 950.2 645.8C949.7 645.1 949.0 644.7 949.0 644.0C948.5 643.3 948.3 643.5 947.8 643.5C947.4 643.8 946.9 643.8 946.4 643.8C945.7 644.4 945.3 644.7 944.8 644.9C944.3 644.9 943.9 645.1 943.4 645.1C943.4 644.0 942.7 643.8 942.2 643.3C942.0 643.1 942.0 643.1 942.0 643.1C942.0 642.4 942.0 641.7 942.0 641.3ZM960.9 641.3C971.3 641.3 971.3 641.3 971.3 641.3C971.3 641.5 971.3 641.5 971.3 641.7C971.3 642.0 971.3 642.6 971.1 642.9C970.2 643.8 969.9 643.8 969.9 645.1C969.9 645.3 970.2 645.6 970.2 645.8C969.9 646.5 969.5 647.8 969.7 648.7C969.7 649.0 969.7 649.2 969.9 649.2C969.5 649.4 968.8 649.6 968.3 650.1C967.4 649.2 966.4 649.9 965.3 650.3C964.8 650.3 964.6 650.5 964.1 650.5C963.9 650.3 963.2 650.3 963.0 650.3C963.0 650.1 963.0 650.1 963.0 650.1C963.7 649.4 964.3 648.7 964.8 648.1C964.8 647.2 964.6 646.9 964.6 646.7C963.7 646.7 963.2 646.7 962.7 646.9C962.5 646.9 962.0 646.9 961.6 647.2C961.6 646.5 961.3 646.0 961.1 645.6C961.1 644.4 961.6 643.5 961.3 642.2C961.1 642.2 961.1 642.0 960.9 642.0C960.9 641.7 960.9 641.5 960.9 641.3ZM971.8 641.3C984.1 641.3 984.1 641.3 984.1 641.3C983.9 642.2 983.4 643.1 983.9 644.0C984.1 644.0 984.1 644.2 984.4 644.2C984.4 644.4 984.4 644.4 984.4 644.4C984.1 644.2 984.1 644.2 984.1 644.2C983.9 644.2 983.4 644.2 983.0 644.4C982.7 644.7 983.0 644.7 983.0 645.3C981.8 646.3 982.0 645.8 981.8 647.4C981.6 647.8 981.1 648.1 980.9 648.3C980.2 648.3 979.7 648.5 979.5 648.5C979.0 648.7 979.0 649.2 979.7 649.6C978.3 649.9 977.6 651.0 976.9 651.9C976.9 651.9 976.9 652.1 976.7 652.3C976.4 653.0 976.0 653.2 975.5 653.5C975.5 652.6 975.0 652.1 974.6 651.9C974.6 651.9 974.6 651.9 974.6 651.9C973.9 650.8 973.2 649.9 972.3 649.0C971.3 648.7 970.6 649.0 970.2 648.7C969.9 647.8 970.2 647.2 970.4 646.3C970.6 645.6 970.4 644.9 970.4 644.4C970.9 643.8 971.3 643.3 971.6 642.9C971.6 642.6 971.8 642.2 971.8 641.7C971.8 641.7 971.8 641.5 971.8 641.3ZM924.8 657.1C924.8 653.7 924.8 653.7 924.8 653.7C925.3 653.9 925.7 653.9 926.2 654.1C926.4 654.1 926.7 654.4 927.1 654.6C927.4 654.6 927.8 654.6 928.1 654.6C928.1 655.0 928.3 655.3 928.3 655.5C928.1 655.7 928.1 655.9 927.8 656.2C927.4 656.6 926.9 656.8 926.4 656.8C925.7 656.8 925.3 657.1 924.8 657.1ZM924.8 653.2C924.8 650.1 924.8 650.1 924.8 650.1C925.0 650.1 925.0 650.1 925.3 650.1C925.7 650.1 926.0 650.3 926.4 650.3C926.7 650.8 927.1 651.0 927.6 651.4C928.1 651.4 928.5 651.7 929.7 651.4C930.6 650.8 931.5 649.4 932.5 648.7C932.5 648.5 932.5 648.3 932.5 647.8C932.7 647.8 932.9 647.8 933.4 647.8C933.4 648.1 933.6 648.1 933.6 648.3C934.1 648.5 935.0 649.0 936.0 649.4C936.2 649.4 936.4 649.4 936.7 649.4C937.1 649.2 937.6 649.0 938.3 648.7C939.0 648.1 939.5 647.8 940.6 647.2C940.6 646.9 940.9 646.9 941.1 646.7C941.8 645.8 942.2 645.6 943.4 645.3C943.9 645.3 944.3 645.3 945.0 645.3C946.4 644.7 946.7 644.0 948.3 644.0C948.5 644.4 948.8 644.9 949.2 645.3C949.5 645.6 949.7 645.8 949.9 646.0C949.5 646.7 949.0 647.4 948.5 648.5C948.5 648.7 948.5 649.2 948.5 649.4C948.8 649.6 949.2 649.6 949.9 649.6C949.9 650.1 950.2 650.3 950.2 650.8C950.4 651.0 950.4 651.0 950.6 651.2C951.1 651.2 951.8 651.0 952.5 651.0C952.9 651.4 952.9 652.3 952.9 653.5C952.9 653.7 952.7 653.9 952.3 654.1C952.3 654.4 951.8 654.4 951.6 654.4C951.6 655.0 951.6 655.7 951.3 656.2C951.3 656.6 951.1 656.8 950.9 657.3C950.6 657.3 950.2 657.5 950.2 658.0C949.2 658.0 948.5 660.0 947.8 660.5C947.8 660.7 947.1 660.9 947.1 660.9C946.7 661.4 946.0 661.8 945.7 662.0C945.7 662.3 945.7 662.3 945.7 662.3C945.5 662.3 945.5 662.3 945.5 662.3C945.5 662.5 945.5 662.5 945.5 662.5C945.0 662.5 944.6 663.2 944.3 663.6C944.1 664.1 943.9 664.5 943.6 665.0C942.7 665.2 942.2 665.4 941.8 665.9C941.3 665.9 941.3 665.9 941.1 665.9C941.1 665.6 941.1 665.4 941.1 665.2C940.9 665.2 940.9 665.0 940.6 665.0C940.2 665.0 940.2 664.7 939.9 664.7C939.7 663.8 939.2 663.8 938.8 664.1C938.5 664.5 938.5 664.7 938.5 665.0C937.6 665.2 936.7 665.2 935.7 665.2C935.3 665.2 934.6 665.0 933.9 665.0C933.4 664.7 933.2 664.7 932.7 664.7C932.2 664.3 932.0 664.1 931.5 663.6C931.5 663.2 931.3 662.9 931.1 662.7C931.1 662.7 931.1 662.7 931.1 662.7C930.6 661.8 931.1 661.6 931.3 660.9C931.3 660.7 931.3 660.2 931.3 660.0C931.1 659.8 930.6 659.6 930.4 659.3C930.4 659.1 930.4 659.1 930.4 659.1C928.8 659.1 927.8 659.1 926.9 658.9C926.7 658.9 926.4 658.6 926.0 658.6C926.0 658.0 925.7 657.7 925.7 657.3C926.0 657.3 926.4 657.3 926.9 657.3C927.4 657.3 927.8 656.6 928.3 656.4C928.8 655.5 928.8 654.8 928.3 654.4C928.1 654.4 927.6 654.4 927.4 654.4C926.4 653.7 925.7 653.5 924.8 653.2ZM945.5 670.8C944.6 670.1 944.6 669.7 944.3 669.2C944.1 668.3 943.6 667.9 943.4 667.4C943.4 666.3 943.4 666.5 944.1 665.9C944.3 664.1 944.3 663.8 946.0 662.5C946.9 661.8 947.6 661.1 948.5 660.5C949.2 659.6 949.9 658.9 950.9 657.7C951.6 657.3 951.6 656.8 951.8 656.2C951.8 654.4 952.5 654.8 953.4 653.7C953.4 653.0 953.4 651.9 953.4 651.2C953.9 650.8 953.9 650.1 954.1 649.6C954.1 649.2 954.3 649.0 954.6 648.7C954.8 648.7 955.0 648.7 955.3 648.7C955.7 649.0 956.2 649.4 956.7 649.9C956.9 649.9 957.1 649.9 957.4 649.9C958.1 649.4 958.1 648.7 958.1 648.5C957.8 648.3 957.1 647.8 956.9 647.4C957.1 647.4 957.1 647.4 957.1 647.4C958.8 647.4 959.9 647.4 961.1 647.4C961.6 647.8 963.0 647.8 963.9 646.9C964.1 646.9 964.1 646.9 964.3 646.9C964.3 647.4 964.3 647.8 964.3 648.1C963.9 648.5 963.0 649.2 962.5 649.9C962.5 650.8 962.7 651.0 964.6 651.0C965.3 650.5 966.0 650.3 966.9 650.1C967.1 650.1 967.4 650.1 967.6 650.1C967.6 650.1 967.8 650.3 968.1 650.3C969.5 650.3 970.2 648.7 972.0 649.4C972.5 649.9 972.7 650.3 973.2 650.8C973.7 651.4 974.4 652.1 975.0 653.2C975.0 653.5 975.0 653.5 975.0 653.7C974.1 653.7 974.1 653.9 973.7 654.1C973.2 654.6 972.0 654.8 972.7 655.9C972.7 655.9 972.7 655.9 972.7 656.2C971.6 656.6 970.2 657.5 968.8 658.4C968.8 658.4 968.5 658.6 968.3 658.9C967.8 658.9 967.6 658.6 967.6 658.6C967.4 658.6 967.1 658.6 966.9 658.6C966.7 658.6 966.4 658.9 966.4 659.1C966.2 659.1 966.0 659.1 966.0 659.1C965.3 658.4 965.0 658.6 964.6 658.6C964.6 659.1 964.6 659.3 964.6 659.8C964.1 660.2 963.7 659.6 963.2 660.7C962.3 660.7 962.5 660.5 962.3 660.0C962.0 660.0 962.0 660.0 962.0 660.0C961.6 659.6 961.3 659.3 960.9 659.1C960.9 659.1 960.6 659.1 960.4 659.1C960.2 659.6 960.2 659.6 959.9 660.0C959.7 660.5 959.2 660.9 959.0 661.4C958.1 661.8 958.1 661.8 957.4 662.5C957.1 662.5 956.9 662.7 956.4 662.7C956.2 662.9 956.0 663.2 955.7 663.6C954.6 663.6 954.3 663.6 953.9 664.1C953.9 664.1 953.9 664.3 953.6 664.5C953.6 664.5 953.4 664.5 953.2 664.5C952.3 664.1 952.3 664.3 951.3 664.5C950.4 664.7 949.7 665.0 949.0 665.2C947.8 665.4 947.4 665.4 946.7 666.1C946.7 666.5 946.4 666.8 946.4 667.0C945.5 667.4 945.3 667.4 945.3 668.3C945.7 668.8 946.9 669.5 946.9 670.4C946.4 670.6 945.7 670.8 945.5 670.8ZM990.6 659.8C990.2 659.1 989.9 658.6 989.5 658.0C989.2 657.7 989.0 657.7 988.8 657.7C988.5 656.8 988.1 656.2 987.8 655.9C987.6 655.7 987.6 655.5 987.6 655.0C987.8 654.4 988.1 653.7 988.1 653.0C987.6 651.2 988.3 651.0 989.0 650.1C989.0 649.6 989.0 649.2 989.2 648.7C989.7 647.2 989.9 646.5 990.9 645.6C991.3 645.1 991.8 644.9 992.5 644.4C993.0 644.4 993.2 644.4 993.7 644.4C993.7 644.7 994.1 645.6 993.9 646.0C993.2 647.2 993.7 649.4 993.7 651.2C993.2 652.3 992.5 653.9 991.6 655.0C991.6 655.3 991.6 655.5 991.3 655.7C991.3 656.8 991.1 658.4 991.1 659.6C990.9 659.6 990.6 659.8 990.6 659.8Z","M941.2 685.1C955.1 712.0 937.9 715.0 936.5 728.3C935.4 733.1 938.9 748.2 960.9 741.0C990.5 719.5 983.7 700.1 986.0 680.4C989.5 662.5 998.8 664.8 996.3 647.2","M924.8 641.3L1000.0 641.3L1000.0 745.9L924.8 745.9L924.8 641.3Z"]};

  // choropleth of China's provinces: values binned into 4 steps of the main colour; highlighted provinces in accent
  function ChinaMap(p) {
    var data = p.data || {}, hl = p.highlight || [], M = MAP_CN, mw = (p.points ? BW * 0.62 : BW), sc = Math.min((mw - 180) / M.w, BH / M.h), out = [];
    var val = function (pr) { var v = data[pr.en]; if (v == null) v = data[pr.zh]; return v; };
    var vals = M.provinces.map(val).filter(function (v) { return v != null; }).sort(function (a, b) { return a - b; });
    var q = function (k) { return vals.length ? vals[Math.min(vals.length - 1, Math.floor(vals.length * k))] : 0; }, cuts = [q(0.25), q(0.5), q(0.75)];
    var step = function (v) { return v == null ? -1 : v <= cuts[0] ? 0 : v <= cuts[1] ? 1 : v <= cuts[2] ? 2 : 3; };
    var op = [0.22, 0.45, 0.72, 1];
    var isHl = function (pr) { return hl.indexOf(pr.en) >= 0 || hl.indexOf(pr.zh) >= 0; };
    var paths = M.provinces.map(function (pr, i) {
      var s = step(val(pr)), on = isHl(pr);
      return h("path", { key: i, d: pr.d, fill: on ? V("accent") : s < 0 ? V("grey-4") : V("main"), fillOpacity: on || s < 0 ? 1 : op[s], stroke: V("paper"), strokeWidth: 1.4 / sc * 0.9 }, h("title", null, pr.en + (val(pr) != null ? ": " + fmt(val(pr)) : "")));
    });
    var ink = M.ink.map(function (d, i) { return h("path", { key: "i" + i, d: d, fill: "none", stroke: V("grey-2"), strokeWidth: 1 / sc }); });
    out.push(h("svg", { key: "m", width: M.w * sc, height: M.h * sc, viewBox: "0 0 " + M.w + " " + M.h, style: { position: "absolute", left: 0, top: 0 } }, paths, ink));
    var lab = (p.labels || M.provinces.filter(function (pr) { return val(pr) != null; }).sort(function (a, b) { return val(b) - val(a); }).slice(0, 5).map(function (pr) { return pr.en; }));
    var lp = M.provinces.filter(function (pr) { return lab.indexOf(pr.en) >= 0 || lab.indexOf(pr.zh) >= 0; }).sort(function (a, b) { return a.cy - b.cy; });
    var colX = M.w * sc + 34, gapY = 42, lines = [], ys = [];
    lp.forEach(function (pr, k) { ys.push(Math.max(k ? ys[k - 1] + gapY : 0, pr.cy * sc - 18)); });
    for (var k2 = ys.length - 1; k2 >= 0; k2--) ys[k2] = Math.min(ys[k2], (k2 < ys.length - 1 ? ys[k2 + 1] - gapY : BH - 60));
    lp.forEach(function (pr, k) {
      var ly2 = ys[k], on = isHl(pr);
      lines.push(h("polyline", { key: k, points: (pr.cx * sc) + "," + (pr.cy * sc) + " " + (colX - 14) + "," + (ly2 + 18) + " " + (colX - 4) + "," + (ly2 + 18), fill: "none", stroke: V("grey-1"), strokeWidth: 1 }),
        h("circle", { key: "c" + k, cx: pr.cx * sc, cy: pr.cy * sc, r: 3.5, fill: V("ink"), stroke: V("paper"), strokeWidth: 1.5 }));
      out.push(text(colX, ly2, 140, 36, [h("div", { key: "a", style: { fontWeight: 700, color: on ? V("accent-text") : V("main") } }, pr.en), val(pr) != null ? h("div", { key: "b" }, fmt(val(pr)) + (p.unit ? " " + p.unit : "")) : null], { pt: 10, lh: 1.15, valign: "middle", pad: 0 }, "lb" + pr.en));
    });
    out.push(h("svg", { key: "ll", width: colX, height: BH, style: { position: "absolute", left: 0, top: 0, pointerEvents: "none" } }, lines));
    var lx = 0, ly = M.h * sc - 22;
    ["Low", "", "", "High"].forEach(function (t, i) { out.push(abs(lx + i * 34, ly, 30, 12, { background: V("main"), opacity: op[i] }, null, "lg" + i)); });
    out.push(text(lx + 140, ly - 4, 300, 20, (p.legend || "Low → high") + (p.unit ? ", " + p.unit : ""), { pt: 9, color: V("muted"), valign: "middle", pad: 0 }, "lgt"));
    if (p.points) out.push(abs(mw + 19.2, 0, BW - mw - 19.2, BH, { background: V("panel"), padding: 24, fontFamily: FONT, fontSize: PT(13) }, [h("div", { key: "t", style: { fontWeight: 700, color: V("main"), marginBottom: 12 } }, p.heading || "So what"), p.points.map(function (t, i) { return h("p", { key: i, style: { margin: "0 0 10px" } }, t); })], "panel"));
    return body(p, out);
  }

  // workplan: period header bars in navy, zebra rows, bars in secondary (focus row accent), milestones as accent diamonds
  function Gantt(p) {
    var per = p.periods || [], rows = p.rows || [], P = per.length, lw = Math.min(300, BW * 0.26), cw = (BW - lw) / P, hh = 36, rh = Math.min(46, (BH - hh - 10) / Math.max(1, rows.length)), out = [];
    per.forEach(function (t, j) { var x = lw + j * cw; out.push(abs(x, 0, cw - 2, hh, { background: V("main") }, null, "ph" + j), text(x, 0, cw - 2, hh, t, { pt: 11, bold: true, color: V("paper"), align: "center", valign: "middle", pad: 0 }, "pt" + j)); });
    rows.forEach(function (r, i) {
      var y = hh + 10 + i * rh, on = p.highlight === i;
      if (i % 2 === 0) out.push(abs(0, y, BW, rh, { background: V("panel") }, null, "z" + i));
      out.push(text(r.group ? 0 : 14, y, lw - 18, rh, r.label, { pt: r.group ? 12 : 11, bold: !!r.group || on, color: r.group ? V("main") : V("ink"), valign: "middle" }, "l" + i));
      if (r.end != null) out.push(abs(lw + r.start * cw + 4, y + rh * 0.24, (r.end - r.start + 1) * cw - 8, rh * 0.52, { background: on ? V("accent") : V("secondary") }, null, "b" + i));
      if (r.milestone != null) out.push(abs(lw + r.milestone * cw + cw / 2 - 10, y + rh / 2 - 10, 20, 20, { background: on ? V("main") : V("accent"), transform: "rotate(45deg)", border: "1.5px solid " + V("paper") }, null, "m" + i));
    });
    return body(p, out);
  }

  // narrowing stages: main at the top through the greys; focus stage accent; value inside, label + text to the right
  function Funnel(p) {
    var st = p.stages || [], n = st.length, fw = 430, gap = 6, sh = (BH - (n - 1) * gap) / n, ramp = [V("main"), V("grey-1"), V("grey-2"), V("grey-3"), V("grey-4")], out = [];
    st.forEach(function (s, i) {
      var top = i * (sh + gap), wT = fw * (1 - i * 0.62 / n), wB = fw * (1 - (i + 1) * 0.62 / n), cx = fw / 2, on = p.highlight === i, k = Math.min(4, Math.round(i / Math.max(1, n - 1) * 4));
      var fill = on ? V("accent") : ramp[k], light = !on && k >= 3;
      out.push(h("svg", { key: "s" + i, width: fw, height: sh, style: { position: "absolute", left: 0, top: top } }, h("polygon", { points: (cx - wT / 2) + ",0 " + (cx + wT / 2) + ",0 " + (cx + wB / 2) + "," + sh + " " + (cx - wB / 2) + "," + sh, fill: fill })));
      out.push(text(cx - wB / 2, top, wB, sh, fmt(s.value), { pt: 16, bold: true, color: light ? V("ink") : V("paper"), align: "center", valign: "middle", pad: 0 }, "v" + i));
      out.push(abs(cx + wT / 2 + 10, top + sh / 2, fw - cx - wT / 2 + 40, 0, { borderTop: "1.33px dotted " + V("rule") }, null, "d" + i));
      out.push(text(fw + 70, top, BW - fw - 70, sh, rich(s.label, s.text, on ? V("accent-text") : V("main")), { pt: 13, valign: "middle", pad: 0 }, "t" + i));
    });
    return body(p, out);
  }

  // 2–3 overlapping sets (main, grey-2, accent), the intersection marked and explained to the right
  function Venn(p) {
    var sets = p.sets || [], n = sets.length, R = n === 2 ? 170 : 150, cx = 360, cy = BH / 2, out = [], cols = [V("main"), V("grey-2"), V("accent")];
    var pos = n === 2 ? [[cx - 95, cy], [cx + 95, cy]] : [[cx, cy - 85], [cx - 98, cy + 85], [cx + 98, cy + 85]];
    out.push(h("svg", { key: "v", width: BW, height: BH, style: { position: "absolute", left: 0, top: 0 } }, pos.map(function (q, i) { return h("circle", { key: i, cx: q[0], cy: q[1], r: R, fill: cols[i], fillOpacity: 0.72 }); }),
      h("circle", { cx: cx, cy: n === 2 ? cy : cy + 25, r: 14, fill: V("paper"), stroke: V("accent"), strokeWidth: 3 }),
      h("line", { x1: cx + 18, y1: n === 2 ? cy : cy + 25, x2: 700, y2: n === 2 ? cy : cy + 25, stroke: V("accent"), strokeWidth: 1.67, strokeDasharray: "6 4" })));
    pos.forEach(function (q, i) { var dx = n === 2 ? (i ? 70 : -70) : [0, -60, 60][i], dy = n === 2 ? 0 : [-60, 50, 50][i]; out.push(text(q[0] + dx - 90, q[1] + dy - 20, 180, 40, sets[i].label, { pt: 13, bold: true, color: i === 2 ? V("ink") : V("paper"), align: "center", valign: "middle", pad: 0 }, "l" + i)); });
    if (p.intersection) out.push(text(712, (n === 2 ? cy : cy + 25) - 60, BW - 712, 120, rich(p.intersection.label, p.intersection.text, V("accent-text")), { pt: 13, valign: "middle", pad: 0 }, "x"));
    return body(p, out);
  }

  // root box (main), one level of units (panel, focus accent) and their sub-units as a list beneath
  function OrgChart(p) {
    var kids = p.children || [], n = kids.length, gap = 19.2, w = (BW - (n - 1) * gap) / n, out = [], rw = 300;
    out.push(abs(BW / 2 - rw / 2, 0, rw, 66, { background: V("main") }, null, "r"));
    out.push(text(BW / 2 - rw / 2 + 10, 0, rw - 20, 66, [h("div", { key: "a", style: { fontWeight: 700 } }, p.root.label), p.root.sub ? h("div", { key: "b", style: { fontSize: PT(11) } }, p.root.sub) : null], { pt: 14, color: V("paper"), align: "center", valign: "middle" }, "rt"));
    out.push(abs(BW / 2, 66, 1.33, 30, { background: V("rule") }, null, "v0"), abs(w / 2, 96, BW - w, 1.33, { background: V("rule") }, null, "h0"));
    kids.forEach(function (k, i) {
      var x = i * (w + gap), on = p.highlight === i;
      out.push(abs(x + w / 2, 96, 1.33, 24, { background: V("rule") }, null, "v" + i));
      out.push(abs(x, 120, w, 66, { background: on ? V("accent") : V("panel") }, null, "b" + i));
      out.push(text(x + 8, 120, w - 16, 66, [h("div", { key: "a", style: { fontWeight: 700 } }, k.label), k.sub ? h("div", { key: "b", style: { fontSize: PT(11), color: on ? V("paper") : V("muted") } }, k.sub) : null], { pt: 13, color: on ? V("paper") : V("main"), align: "center", valign: "middle" }, "t" + i));
      (k.children || []).forEach(function (c, j) {
        out.push(abs(x + 18, 206 + j * 46, 1.33, 46, { background: V("rule") }, null, "cv" + i + j), abs(x + 18, 229 + j * 46, 14, 1.33, { background: V("rule") }, null, "ch" + i + j));
        out.push(text(x + 38, 210 + j * 46, w - 40, 40, c, { pt: 12, valign: "middle" }, "c" + i + j));
      });
    });
    return body(p, out);
  }

  // strategy house: roof (vision) in main, pillars with grey-1 headers (focus accent) over panels, foundation in grey-2
  function Temple(p) {
    var pil = p.pillars || [], n = pil.length, inset = 30, gap = 14, pw = (BW - 2 * inset - (n - 1) * gap) / n, roofH = 78, fH = 46, out = [];
    out.push(h("svg", { key: "roof", width: BW, height: roofH, style: { position: "absolute", left: 0, top: 0 } }, h("polygon", { points: "0," + roofH + " " + BW / 2 + ",0 " + BW + "," + roofH, fill: V("main") })));
    out.push(text(BW / 2 - 300, 26, 600, roofH - 26, p.roof, { pt: 14, bold: true, color: V("paper"), align: "center", valign: "middle" }, "rt"));
    var top = roofH + 12, ph = BH - top - fH - 12;
    pil.forEach(function (s, i) {
      var x = inset + i * (pw + gap), on = p.highlight === i;
      out.push(abs(x, top, pw, 42, { background: on ? V("accent") : V("grey-1") }, null, "h" + i), text(x + 8, top, pw - 16, 42, s.label, { pt: 13, bold: true, color: V("paper"), align: "center", valign: "middle" }, "ht" + i));
      out.push(abs(x, top + 42, pw, ph - 42, { background: V("panel") }, null, "p" + i), text(x + 10, top + 52, pw - 20, ph - 62, s.text, { pt: 12 }, "pt" + i));
    });
    out.push(abs(0, BH - fH, BW, fH, { background: V("grey-2") }, null, "f"), text(10, BH - fH, BW - 20, fH, p.foundation, { pt: 13, bold: true, color: V("paper"), align: "center", valign: "middle" }, "ft"));
    return body(p, out);
  }

  function ring(pct, R, th, col) {
    var a = Math.min(99.99, Math.max(0, pct)) / 100 * 2 * Math.PI, x = R + R * Math.sin(a), y = R - R * Math.cos(a), r2 = R - th;
    var x2 = R + r2 * Math.sin(a), y2 = R - r2 * Math.cos(a), lg = a > Math.PI ? 1 : 0;
    return h("path", { d: "M" + R + " 0 A" + R + " " + R + " 0 " + lg + " 1 " + x + " " + y + " L" + x2 + " " + y2 + " A" + r2 + " " + r2 + " 0 " + lg + " 0 " + R + " " + th + " Z", fill: col });
  }
  // row of donut KPIs (shares out of 100); the key one in main, the others grey-2, on a grey-4 track
  function DonutKPI(p) {
    var it = p.items || [], n = it.length, w = BW / n, R = Math.min(105, w / 2 - 30), th = R * 0.38;
    return body(p, it.map(function (s, i) {
      var cx = i * w + w / 2, on = p.highlight === i;
      return h(React.Fragment, { key: i },
        h("svg", { width: 2 * R, height: 2 * R, style: { position: "absolute", left: cx - R, top: 30 } }, h("circle", { cx: R, cy: R, r: R - th / 2, fill: "none", stroke: V("grey-4"), strokeWidth: th }), ring(s.value, R, th, on ? V("main") : V("grey-2"))),
        text(cx - R, 30, 2 * R, 2 * R, s.value + "%", { pt: 22, bold: true, color: on ? V("main") : V("grey-1"), align: "center", valign: "middle", pad: 0 }),
        text(cx - w / 2 + 20, 30 + 2 * R + 18, w - 40, 26, s.label, { pt: 13, bold: true, align: "center", pad: 0 }),
        s.note ? text(cx - w / 2 + 20, 30 + 2 * R + 46, w - 40, 40, s.note, { pt: 11, color: V("muted"), align: "center", pad: 0 }) : null);
    }));
  }

  // one split of 2–5 parts; the part that matters in main, the others greys, labels outside with shares
  function Pie(p) {
    var sl = p.slices || [], tot = sl.reduce(function (a, s) { return a + s.value; }, 0) || 1, R = 190, cx = 330, cy = BH / 2, a0 = -Math.PI / 2, greys = [V("grey-1"), V("grey-2"), V("grey-3"), V("grey-4")], gi = 0, segs = [], labs = [];
    sl.forEach(function (s, i) {
      var a1 = a0 + s.value / tot * 2 * Math.PI, on = p.highlight === i, fill = on ? V("main") : greys[(gi++) % 4], lg = a1 - a0 > Math.PI ? 1 : 0;
      segs.push(h("path", { key: i, d: "M" + cx + " " + cy + " L" + (cx + R * Math.cos(a0)) + " " + (cy + R * Math.sin(a0)) + " A" + R + " " + R + " 0 " + lg + " 1 " + (cx + R * Math.cos(a1)) + " " + (cy + R * Math.sin(a1)) + " Z", fill: fill, stroke: V("paper"), strokeWidth: 2 }));
      var am = (a0 + a1) / 2, lx = cx + (R + 26) * Math.cos(am), ly = cy + (R + 26) * Math.sin(am), right = Math.cos(am) >= 0;
      labs.push(text(right ? lx : lx - 220, ly - 20, 220, 40, [h("div", { key: "a", style: { fontWeight: 700, color: on ? V("main") : V("ink") } }, Math.round(s.value / tot * 100) + "%"), h("div", { key: "b" }, s.label)], { pt: 12, align: right ? "left" : "right", valign: "middle", pad: 0 }, "l" + i));
      a0 = a1;
    });
    return body(p, [h("svg", { key: "s", width: BW, height: BH, style: { position: "absolute", left: 0, top: 0 } }, segs), labs,
      p.comment ? text(720, 40, BW - 720, BH - 80, p.comment, { pt: 13, valign: "middle" }, "c") : null]);
  }

  // Marimekko: column width = segment size, stack = player shares; the player that matters in main
  function Marimekko(p) {
    var seg = p.segments || [], pl = p.players || [], tot = seg.reduce(function (a, s) { return a + s.size; }, 0) || 1, cw = BW - 190, plotH = BH - 60, x = 0, out = [], greys = [V("grey-1"), V("grey-2"), V("grey-3"), V("grey-4")];
    var fill = function (j) { return j === p.highlight ? V("main") : greys[(j - (p.highlight != null && j > p.highlight ? 1 : 0)) % 4]; };
    seg.forEach(function (s, i) {
      var w = s.size / tot * cw, y = 0, sum = s.shares.reduce(function (a, b) { return a + b; }, 0) || 1;
      s.shares.forEach(function (v, j) {
        var hh = v / sum * plotH, dark = j === p.highlight || fill(j) === greys[0] || fill(j) === greys[1];
        out.push(abs(x, y, w - 2, hh - 2, { background: fill(j) }, null, "c" + i + j));
        if (hh > 24 && w > 50) out.push(text(x, y, w - 2, hh - 2, Math.round(v / sum * 100) + "%", { pt: 10, bold: j === p.highlight, color: dark ? V("paper") : V("ink"), align: "center", valign: "middle", pad: 0 }, "t" + i + j));
        y += hh;
      });
      out.push(text(x, plotH + 6, w, 22, s.label, { pt: 11, bold: true, align: "center", pad: 0 }, "s" + i), text(x, plotH + 28, w, 20, fmt(s.size) + (p.unit ? " " + p.unit : ""), { pt: 10, color: V("muted"), align: "center", pad: 0 }, "z" + i));
      x += w;
    });
    pl.forEach(function (n, j) { out.push(h("div", { key: "lg" + j, style: { position: "absolute", left: cw + 24, top: j * 28, display: "flex", alignItems: "center", gap: 8, fontFamily: FONT, fontSize: PT(11), fontWeight: j === p.highlight ? 700 : 400 } }, h("span", { style: { width: 14, height: 14, background: fill(j), display: "inline-block" } }), n)); });
    return body(p, out);
  }

  // value grid shaded in steps of main; targeted cells outlined with a dashed accent line
  function Heatmap(p) {
    var rows = p.rows || [], cols = p.cols || [], v = p.values || [], all = [].concat.apply([], v), mx = maxOf(all) || 1, lw = 200, hh = 40;
    var cw = (BW - lw) / cols.length, rh = Math.min(70, (BH - hh) / rows.length), out = [], tgt = p.highlight || [];
    cols.forEach(function (c, j) { out.push(text(lw + j * cw, 0, cw, hh, c, { pt: 12, bold: true, color: V("main"), align: "center", valign: "middle" }, "c" + j)); });
    rows.forEach(function (r, i) {
      out.push(text(0, hh + i * rh, lw - 10, rh, r, { pt: 12, valign: "middle" }, "r" + i));
      cols.forEach(function (c, j) {
        var val = v[i][j], k = val / mx, on = tgt.some(function (t) { return t[0] === i && t[1] === j; });
        out.push(abs(lw + j * cw + 2, hh + i * rh + 2, cw - 4, rh - 4, { background: V("main"), opacity: 0.1 + 0.9 * k }, null, "b" + i + j));
        if (on) out.push(abs(lw + j * cw + 2, hh + i * rh + 2, cw - 4, rh - 4, { border: "2.67px dashed " + V("accent") }, null, "o" + i + j));
        out.push(text(lw + j * cw, hh + i * rh, cw, rh, (p.format ? p.format(val) : val + (p.suffix || "")), { pt: 12, bold: on, color: k > 0.5 ? V("paper") : V("ink"), align: "center", valign: "middle", pad: 0 }, "t" + i + j));
      });
    });
    return body(p, out);
  }

  window.HouseStyle = {
    Slide: Slide, TitleSlide: TitleSlide, SectionDivider: SectionDivider, Agenda: Agenda, ExecSummary: ExecSummary, KeyStatement: KeyStatement, EndSlide: EndSlide,
    KPIRow: KPIRow, ColumnChart: ColumnChart, LineChart: LineChart, BarRanking: BarRanking, StackedBar100: StackedBar100, Waterfall: Waterfall, Scatter: Scatter,
    ChartCommentary: ChartCommentary, Matrix: Matrix, HarveyBallTable: HarveyBallTable, BeforeAfter: BeforeAfter, ChevronProcess: ChevronProcess, Timeline: Timeline,
    IssueTree: IssueTree, Pyramid: Pyramid, Cycle: Cycle, HubSpoke: HubSpoke, TextColumns: TextColumns, ImageText: ImageText, TakeawayBox: TakeawayBox, Tracker: Tracker,
    ChinaMap: ChinaMap, Gantt: Gantt, Funnel: Funnel, Venn: Venn, OrgChart: OrgChart, Temple: Temple, DonutKPI: DonutKPI, Pie: Pie, Marimekko: Marimekko, Heatmap: Heatmap
  };
})();
