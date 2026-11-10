
import { ATLAS_G as G } from "../geo/atlas-data.js";
import { countriesToPaint, regionMatches } from "./visit.js";
var api = (function () {
  var PI = Math.PI, D2R = PI / 18000;               // координаты хранятся в сотых долях градуса
  var $ = function (id) { return document.getElementById(id); };
  var root = document.getElementById("map");
  var countryList = null;
  if (!root || !G) return {};
  var hooks = { click: null, move: null, afterView: null, paint: null };
  var markC = {} as any, markR = {} as any, markRev = 0, washIso = {} as any, nameIso = {} as any, visitTone = "past";
  function fillCountry(strong?) {
    if (visitTone === "future") return strong ? "rgba(147,197,253,.78)" : "rgba(147,197,253,.58)";
    return strong ? "rgba(214,168,72,.78)" : "rgba(214,168,72,.62)";
  }
  function fillRegion() {
    return visitTone === "future" ? "rgba(29,78,216,.62)" : "rgba(196,92,40,.72)";
  }
  function fillDot() {
    return visitTone === "future" ? "rgba(29,78,216,.9)" : "rgba(214,168,72,.96)";
  }
  function countryRings(iso){
    var list=countryList, i, item, out=[], poly, ring;
    if(!list) return out;
    for(i=0;i<list.length;i++) if(list[i].i===iso){ item=list[i]; break; }
    if(!item || !item.p) return out;
    item.p.forEach(function(poly){
      ring=(poly[0] && typeof poly[0][0]!=="number")?poly[0]:poly;
      if(ring && ring.length>2) out.push(ring);
    });
    return out;
  }
  function traceFlat(ctx, iso){
    var rings=countryRings(iso), r, i, p;
    if(!rings.length) return false;
    ctx.beginPath();
    for(r=0;r<rings.length;r++){
      p=flatXY(rings[r][0][0]*PI/180, rings[r][0][1]*PI/180);
      ctx.moveTo(p[0], p[1]);
      for(i=1;i<rings[r].length;i++){
        p=flatXY(rings[r][i][0]*PI/180, rings[r][i][1]*PI/180);
        ctx.lineTo(p[0], p[1]);
      }
      ctx.closePath();
    }
    return true;
  }
  (function mountAtlas() {
    var css = document.createElement("style");
    css.textContent = "#flatBox,#globeBox{position:absolute;inset:0;overflow:hidden}#flatBox{background:#4e8cb2}#globeBox{background:#16324a}#cvF,#cvG,#cvGgl{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;cursor:grab}#cvGgl{pointer-events:none;z-index:0}#cvG{z-index:1;background:transparent}#cvF.drag,#cvG.drag{cursor:grabbing}#tipF,#tipG{position:absolute;z-index:4;pointer-events:none;background:#1f2a26;color:#fff;padding:5px 9px;border-radius:6px;font:600 13px/1.3 Manrope,system-ui,sans-serif;opacity:0;transform:translate(12px,12px);white-space:nowrap}#tipF small,#tipG small{display:block;opacity:.7;font-size:11px;font-weight:500}#atlas-html{position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden}";
    document.head.appendChild(css);
    function box(id){ var d=document.createElement("div"); d.id=id; return d; }
    var fb=box("flatBox"), cv=document.createElement("canvas"); cv.id="cvF"; fb.appendChild(cv);
    var tip=document.createElement("div"); tip.id="tipF"; fb.appendChild(tip); root.appendChild(fb);
    var gb=box("globeBox"); gb.hidden=true; var cv2=document.createElement("canvas"); cv2.id="cvG"; gb.appendChild(cv2);
    var tip2=document.createElement("div"); tip2.id="tipG"; gb.appendChild(tip2); root.appendChild(gb);
    var htmlPane=document.createElement("div"); htmlPane.id="atlas-html"; root.appendChild(htmlPane);
    root.style.background="#4e8cb2";
  })();

  // ===================== общая распаковка =====================
  function reader(b64) {
    var s = atob(b64), u = new Uint8Array(s.length), p = 0;
    for (var i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
    return { more: function () { return p < u.length; }, next: function () { var z = 0, sh = 0, b; do { b = u[p++]; z |= (b & 127) << sh; sh += 7; } while (b & 128); return (z >>> 1) ^ -(z & 1); } };
  }
  // проекция Natural Earth (плоская карта)
  var WID = 4000, XMAX = PI * 0.8707;
  function ne(lo, la) { var p2 = la * la, p4 = p2 * p2; return [lo * (0.8707 - 0.131979 * p2 + p4 * (-0.013791 + p4 * (0.003971 * p2 - 0.001529 * p4))), la * (1.007226 + p2 * (0.015085 + p4 * (-0.044475 + 0.028874 * p2 - 0.005916 * p4)))]; }
  var S0 = WID / (2 * XMAX), YTOP = ne(0, 84 * PI / 180)[1], YBOT = ne(0, -58 * PI / 180)[1], HF = (YTOP - YBOT) * S0;
  function flatXY(lo, la) { var p = ne(lo, la); return [p[0] * S0 + WID / 2, (YTOP - p[1]) * S0]; }
  function unflat(fx, fy) {
    var X = (fx - WID / 2) / S0, Y = YTOP - fy / S0, phi = Y / 1.007226;
    for (var i = 0; i < 8; i++) { var p2 = phi * phi, p4 = p2 * p2, f = phi * (1.007226 + p2 * (0.015085 + p4 * (-0.044475 + 0.028874 * p2 - 0.005916 * p4))) - Y, df = 1.007226 + 3 * 0.015085 * p2 + p4 * (-0.044475 * 9 + 0.028874 * 11 * p2 - 0.005916 * 13 * p4); phi -= f / df; }
    var p2b = phi * phi, p4b = p2b * p2b, lam = X / (0.8707 - 0.131979 * p2b + p4b * (-0.013791 + p4b * (0.003971 * p2b - 0.001529 * p4b)));
    return Math.abs(lam) > PI ? null : [lam / D2R, phi / D2R];       // в сотых долях градуса
  }

  // ---------- полигоны ----------
  var lx = [], ly = [], rStart = [], rLen = [], rHole = [], rCx = [], rCy = [], rCz = [], rSin = [], rbx0 = [], rby0 = [], rbx1 = [], rby1 = [];
  var ents = [], byLayer = { W: [], R: [], C: [], G: [], B: [] };
  ["W", "R", "C", "G", "B"].forEach(function (L) {
    var rd = reader(G["d" + L]), idx = 0;
    while (rd.more()) {
      var info = G.n[L] ? G.n[L][idx] : null, e: any = { L: L, r0: rStart.length, bb: [1e9, 1e9, -1e9, -1e9], nb: 0, name: "", sub: "" };
      if (L === "W") { e.name = info[0]; e.nb = info[1]; }
      else if (L === "G") { e.name = info[0]; e.sub = G.c[info[1]]; }
      else if (L === "R") { e.name = info; e.sub = "Россия"; }
      else if (L === "C") { e.name = info; e.sub = "Китай"; }
      var nr = rd.next();
      for (var r = 0; r < nr; r++) {
        var n = rd.next(), x = rd.next(), y = rd.next(), sx = 0, sy = 0, sz = 0, pts = [], fx0 = 1e9, fy0 = 1e9, fx1 = -1e9, fy1 = -1e9;
        rStart.push(lx.length);
        for (var i = 0; i < n; i++) {
          if (i) { x += rd.next(); y += rd.next(); }
          lx.push(x); ly.push(y);
          var la = y * D2R, lo = x * D2R, c = Math.cos(la), X = c * Math.sin(lo), Y = Math.sin(la), Z = c * Math.cos(lo);
          pts.push(X, Y, Z); sx += X; sy += Y; sz += Z;
          var f = flatXY(lo, la); if (f[0] < fx0) fx0 = f[0]; if (f[0] > fx1) fx1 = f[0]; if (f[1] < fy0) fy0 = f[1]; if (f[1] > fy1) fy1 = f[1];
          if (x < e.bb[0]) e.bb[0] = x; if (y < e.bb[1]) e.bb[1] = y; if (x > e.bb[2]) e.bb[2] = x; if (y > e.bb[3]) e.bb[3] = y;
        }
        var m = Math.hypot(sx, sy, sz) || 1; sx /= m; sy /= m; sz /= m;
        var cmin = 1; for (var k = 0; k < pts.length; k += 3) { var dt = pts[k] * sx + pts[k + 1] * sy + pts[k + 2] * sz; if (dt < cmin) cmin = dt; }
        rLen.push(n); rHole.push(0); rCx.push(sx); rCy.push(sy); rCz.push(sz); rSin.push(Math.sin(Math.acos(Math.max(-1, Math.min(1, cmin)))));
        rbx0.push(fx0); rby0.push(fy0); rbx1.push(fx1); rby1.push(fy1);
      }
      e.r1 = rStart.length; ents.push(e); byLayer[L].push(ents.length - 1); idx++;
    }
  });
  var NV = lx.length, LX = Int32Array.from(lx), LY = Int32Array.from(ly), VX = new Float32Array(NV), VY = new Float32Array(NV), VZ = new Float32Array(NV), FXv = new Float32Array(NV), FYv = new Float32Array(NV);
  for (var i = 0; i < NV; i++) { var la = LY[i] * D2R, lo = LX[i] * D2R, c = Math.cos(la); VX[i] = c * Math.sin(lo); VY[i] = Math.sin(la); VZ[i] = c * Math.cos(lo); var f = flatXY(lo, la); FXv[i] = f[0]; FYv[i] = f[1]; }
  function ringContains(r, x, y) {
    var s = rStart[r], n = rLen[r], c = false, i, j = n - 1, xi, yi, xj, yj;
    for (i = 0; i < n; i++) {
      xi = lx[s + i]; yi = ly[s + i]; xj = lx[s + j]; yj = ly[s + j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / ((yj - yi) || 1e-9) + xi) c = !c;
      j = i;
    }
    return c;
  }
  (function markHoles() {
    var ei, e, r, i, s, n, a, x, y, px, py, areas, bestA, sign, cx, cy, o;
    for (ei = 0; ei < ents.length; ei++) {
      e = ents[ei];
      if (e.r1 - e.r0 < 2) continue;
      areas = []; bestA = 0;
      for (r = e.r0; r < e.r1; r++) {
        s = rStart[r]; n = rLen[r]; a = 0; px = lx[s]; py = ly[s];
        for (i = 1; i < n; i++) { x = lx[s + i]; y = ly[s + i]; a += px * y - x * py; px = x; py = y; }
        a += px * ly[s] - lx[s] * py;
        areas[r] = a;
        if (Math.abs(a) > Math.abs(bestA)) bestA = a;
      }
      if (!bestA) continue;
      sign = bestA > 0 ? 1 : -1;
      for (r = e.r0; r < e.r1; r++) {
        if ((areas[r] || 0) * sign >= 0) continue;
        s = rStart[r]; n = rLen[r]; cx = 0; cy = 0;
        for (i = 0; i < n; i++) { cx += lx[s + i]; cy += ly[s + i]; }
        cx /= n; cy /= n;
        for (o = e.r0; o < e.r1; o++) {
          if (o === r || (areas[o] || 0) * sign <= 0) continue;
          if (ringContains(o, cx, cy)) { rHole[r] = 1; break; }
        }
      }
    }
  })();
  lx = ly = null;
  var rSkip = new Uint8Array(rStart.length);
  ents.forEach(function (e) {
    if (e.name !== "Армения" && e.name !== "Азербайджан") return;
    for (var r = e.r0; r < e.r1; r++) if (rLen[r] < 4) rSkip[r] = 1;
  });
  var edgeCut = {} as any;
  (function buildEdgeCuts() {
    var cell = 100, grid = {} as any, EX0 = [], EY0 = [], EX1 = [], EY1 = [], EOwn = [], EAt = [];
    function bucketAdd(id, x0, y0, x1, y1) {
      var i, j, k, xa = x0 < x1 ? x0 : x1, xb = x0 < x1 ? x1 : x0, ya = y0 < y1 ? y0 : y1, yb = y0 < y1 ? y1 : y0;
      for (i = (xa / cell) | 0; i <= xb / cell; i++) {
        for (j = (ya / cell) | 0; j <= yb / cell; j++) {
          k = i + ":" + j;
          (grid[k] || (grid[k] = [])).push(id);
        }
      }
    }
    byLayer.W.forEach(function (ei) {
      var e = ents[ei], r, s, n, i, a, b, id;
      for (r = e.r0; r < e.r1; r++) {
        s = rStart[r]; n = rLen[r];
        for (i = 0; i < n; i++) {
          a = s + i; b = s + ((i + 1) % n); id = EX0.length;
          EX0.push(LX[a]); EY0.push(LY[a]); EX1.push(LX[b]); EY1.push(LY[b]);
          EOwn.push(ei); EAt.push(a);
          bucketAdd(id, LX[a], LY[a], LX[b], LY[b]);
        }
      }
    });
    function cross(ax, ay, bx, by, cx, cy) { return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax); }
    function hitT(a, b) {
      var ax = EX0[a], ay = EY0[a], bx = EX1[a], by = EY1[a];
      var cx = EX0[b], cy = EY0[b], dx = EX1[b], dy = EY1[b];
      var d1 = cross(cx, cy, dx, dy, ax, ay), d2 = cross(cx, cy, dx, dy, bx, by);
      var d3 = cross(ax, ay, bx, by, cx, cy), d4 = cross(ax, ay, bx, by, dx, dy);
      if (!(((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0)))) return null;
      var den = d1 - d2;
      if (!den) return null;
      var t = d1 / den;
      return (t > 0.01 && t < 0.99) ? t : null;
    }
    function deepIn(oe, x, y, ex, ey) {
      var len = Math.hypot(ex, ey) || 1, nx = -ey / len * 1.1, ny = ex / len * 1.1;
      return inside(oe, x + nx, y + ny) && inside(oe, x - nx, y - ny);
    }
    var cuts = {} as any, seen = {} as any, id, xa, xb, ya, yb, i, j, bucket, m, other, t, pair;
    var piece = [], cutIds = {} as any;
    for (id = 0; id < EX0.length; id++) {
      xa = EX0[id] < EX1[id] ? EX0[id] : EX1[id]; xb = EX0[id] < EX1[id] ? EX1[id] : EX0[id];
      ya = EY0[id] < EY1[id] ? EY0[id] : EY1[id]; yb = EY0[id] < EY1[id] ? EY1[id] : EY0[id];
      for (i = (xa / cell) | 0; i <= xb / cell; i++) {
        for (j = (ya / cell) | 0; j <= yb / cell; j++) {
          bucket = grid[i + ":" + j];
          if (!bucket) continue;
          for (m = 0; m < bucket.length; m++) {
            other = bucket[m];
            if (other <= id || EOwn[other] === EOwn[id]) continue;
            pair = id + ":" + other;
            if (seen[pair]) continue;
            seen[pair] = 1;
            t = hitT(id, other);
            if (t == null) continue;
            (cuts[id] || (cuts[id] = [])).push(t);
            t = hitT(other, id);
            if (t != null) (cuts[other] || (cuts[other] = [])).push(t);
          }
        }
      }
    }
    Object.keys(cuts).forEach(function (sid) {
      var idn = +sid, ts = cuts[sid], u = [], last = -1, prev = 0, ei = EOwn[idn], k, mid, x, y, o, oe;
      cutIds[idn] = 1;
      ts.sort(function (a, b) { return a - b; });
      for (k = 0; k < ts.length; k++) if (ts[k] - last > 0.012) { u.push(ts[k]); last = ts[k]; }
      u.push(1);
      for (k = 0; k < u.length; k++) {
        mid = (prev + u[k]) * 0.5;
        x = EX0[idn] + (EX1[idn] - EX0[idn]) * mid;
        y = EY0[idn] + (EY1[idn] - EY0[idn]) * mid;
        var drop = false;
        if (u[k] - prev > 0.02) {
          for (o = 0; o < byLayer.W.length; o++) {
            if (byLayer.W[o] <= ei) continue;
            oe = ents[byLayer.W[o]];
            if (inside(oe, x, y) && deepIn(oe, x, y, EX1[idn] - EX0[idn], EY1[idn] - EY0[idn])) { drop = true; break; }
          }
        }
        piece.push({ id: idn, t0: prev, t1: u[k], drop: drop });
        prev = u[k];
      }
    });
    var spansBy = {} as any;
    piece.forEach(function (p) {
      if (p.drop || p.t1 - p.t0 < 0.015) return;
      (spansBy[p.id] || (spansBy[p.id] = [])).push(p.t0, p.t1);
    });
    Object.keys(cutIds).forEach(function (sid) {
      var idn = +sid, spans = spansBy[idn];
      if (!spans) { edgeCut[EAt[idn]] = []; return; }
      if (spans.length === 2 && spans[0] < 0.012 && spans[1] > 0.988) return;
      edgeCut[EAt[idn]] = spans;
    });
  })();
  var NR = rStart.length;

  // ---------- общее состояние ----------
  var hoverEnt = -1, selEnt = -1, mode = "flat", views = {} as any;
  function inside(e, lo, la) {
    var bb = e.bb; if (lo < bb[0] || lo > bb[2] || la < bb[1] || la > bb[3]) return false;
    var c = false;
    for (var r = e.r0; r < e.r1; r++) {
      if (rSkip[r]) continue;
      var s = rStart[r], n = rLen[r];
      for (var i = 0, j = n - 1; i < n; j = i++) {
        var xi = LX[s + i], yi = LY[s + i], xj = LX[s + j], yj = LY[s + j];
        if ((yi > la) !== (yj > la) && lo < (xj - xi) * (la - yi) / (yj - yi) + xi) c = !c;
      }
    }
    return c;
  }
  function geoCovers(lo, la) {
    var rings = countryRings("UA");
    if (!rings.length) return true;
    var x = lo / 100, y = la / 100, r, i, j, ring, inn;
    for (r = 0; r < rings.length; r++) {
      ring = rings[r]; inn = false; j = ring.length - 1;
      for (i = 0; i < ring.length; i++) {
        var xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
        if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / ((yj - yi) || 1e-12) + xi) inn = !inn;
        j = i;
      }
      if (inn) return true;
    }
    return false;
  }
  function segDist2(px, py, ax, ay, bx, by) {
    var dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy, t;
    if (!l2) { dx = px - ax; dy = py - ay; return dx * dx + dy * dy; }
    t = ((px - ax) * dx + (py - ay) * dy) / l2;
    if (t < 0) t = 0; else if (t > 1) t = 1;
    dx = px - (ax + t * dx); dy = py - (ay + t * dy);
    return dx * dx + dy * dy;
  }
  function nearestRegion(list, lo, la) {
    var best = -1, bestD = 1e18, i, e, r, s, n, j, d, pad = 250;
    for (i = 0; i < list.length; i++) {
      e = ents[list[i]];
      if (lo < e.bb[0] - pad || lo > e.bb[2] + pad || la < e.bb[1] - pad || la > e.bb[3] + pad) continue;
      for (r = e.r0; r < e.r1; r++) {
        s = rStart[r]; n = rLen[r];
        if (n < 2) continue;
        for (j = 1; j < n; j++) {
          d = segDist2(lo, la, LX[s + j - 1], LY[s + j - 1], LX[s + j], LY[s + j]);
          if (d < bestD) { bestD = d; best = list[i]; }
        }
      }
    }
    if (bestD > 250 * 250) return -1;
    return best;
  }
  function pickLL(lo, la) {
    var country = -1, i, L = byLayer.W;
    for (i = 0; i < L.length; i++) if (inside(ents[L[i]], lo, la)) { country = L[i]; break; }
    if (country >= 0 && ents[country].name === "Украина" && !geoCovers(lo, la)) country = -1;
    var host = country >= 0 ? ents[country] : null;
    var list = regionsOf(host ? entityIso(host) : "");
    var best = -1, bestA = Infinity, r, area;
    for (i = 0; i < list.length; i++) {
      r = ents[list[i]];
      if (!inside(r, lo, la)) continue;
      area = Math.max(0, r.bb[2] - r.bb[0]) * Math.max(0, r.bb[3] - r.bb[1]);
      if (area < bestA) { bestA = area; best = list[i]; }
    }
    if (best >= 0) {
      if (hoverEnt >= 0 && hoverEnt !== best) {
        var prev = ents[hoverEnt];
        if (prev && prev.L !== "W") {
          var pad = 22, bb = prev.bb;
          if (lo >= bb[0] - pad && lo <= bb[2] + pad && la >= bb[1] - pad && la <= bb[3] + pad) {
            var pArea = Math.max(1, bb[2] - bb[0]) * Math.max(1, bb[3] - bb[1]);
            var bArea = Math.max(1, ents[best].bb[2] - ents[best].bb[0]) * Math.max(1, ents[best].bb[3] - ents[best].bb[1]);
            if (pArea < bArea * 0.45) return hoverEnt;
          }
        }
      }
      return best;
    }
    if (list.length) {
      var near = nearestRegion(list, lo, la);
      if (near >= 0) return near;
    }
    if (country < 0) {
      var order = ["R", "C", "G"], k;
      for (k = 0; k < order.length; k++) {
        L = byLayer[order[k]] || [];
        for (i = 0; i < L.length; i++) {
          r = ents[L[i]];
          if (!inside(r, lo, la)) continue;
          area = Math.max(0, r.bb[2] - r.bb[0]) * Math.max(0, r.bb[3] - r.bb[1]);
          if (area < bestA) { bestA = area; best = L[i]; }
        }
      }
    }
    return best >= 0 ? best : country;
  }
  function entityIso(e) {
    if (!e) return "";
    if (e.L === "R" || e.sub === "Россия") return "RU";
    if (e.L === "C" || e.sub === "Китай") return "CN";
    var sub = String(e.L === "W" ? (e.name || "") : (e.sub || ""));
    var n = sub.toLowerCase().replace(/ё/g, "е");
    if (n === "беларусь" || n === "белоруссия") return "BY";
    if (e.iso) return e.iso;
    return isoOfName(sub || e.name || "");
  }
  var regsByIso = null;
  function regionsOf(iso) {
    if (!iso) return [];
    if (!regsByIso) {
      stampIso();
      regsByIso = {} as any;
      ["R", "C", "G"].forEach(function (L) {
        (byLayer[L] || []).forEach(function (idx) {
          var id = entityIso(ents[idx]);
          if (!id) return;
          (regsByIso[id] = regsByIso[id] || []).push(idx);
        });
      });
    }
    return regsByIso[iso] || [];
  }
  function regionLayerOpen(e) {
    if (!e || e.L === "W") return false;
    var iso = entityIso(e);
    if (!iso) return false;
    return !!(markC[iso] || washIso[iso]);
  }
  function countryHasMarkedRegions(iso) {
    var list = regionsOf(iso), i;
    if (!iso || !list.length) return false;
    for (i = 0; i < list.length; i++) if (regionMarked(ents[list[i]])) return true;
    return false;
  }
  function showTip(tip, box, e, i) {
    if (i < 0) { tip.style.opacity = 0; return; }
    var r = box.getBoundingClientRect(), en = ents[i];
    tip.innerHTML = ""; tip.appendChild(document.createTextNode(en.name));
    if (en.sub) { var s = document.createElement("small"); s.textContent = en.sub; tip.appendChild(s); }
    tip.style.left = (e.clientX - r.left) + "px"; tip.style.top = (e.clientY - r.top) + "px"; tip.style.opacity = 1;
  }
  function setSelected(i) {
    selEnt = (i === selEnt) ? -1 : i;
    var t = "";
    if (selEnt >= 0) {
      var en = ents[selEnt]; t = en.sub ? en.name + " — " + en.sub : en.name;
      // Хук для вашего кода: window.addEventListener("mapselect", function (ev) { ev.detail.name })
      window.dispatchEvent(new CustomEvent("mapselect", { detail: { name: en.name, country: en.sub || en.name } }));
    }
    $("stF") && ($("stF").textContent = t); $("stG") && ($("stG").textContent = t);
  }
  function pinchDist(a, b) { return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); }

  function hostEntities(e) {
    var iso = entityIso(e), out = [], seen = {} as any, i, w, id, wiso, sub;
    if (!e) return out;
    if (e.L === "R" || iso === "RU") {
      for (i = 0; i < byLayer.R.length; i++) out.push(ents[byLayer.R[i]]);
      return out;
    }
    sub = e.L === "W" ? (e.name || "") : (e.sub || "");
    for (i = 0; i < byLayer.W.length; i++) {
      id = byLayer.W[i];
      if (seen[id]) continue;
      w = ents[id];
      wiso = w.iso || entityIso(w);
      if (w === e || (iso && wiso === iso) || (sub && w.name === sub)) {
        seen[id] = 1;
        out.push(w);
      }
    }
    if (!out.length && e.L !== "W") out.push(e);
    return out;
  }

  // ===================== ПЛОСКАЯ КАРТА =====================
  views.flat = (function () {
    var box = $("flatBox"), cv = $("cvF"), ctx = cv.getContext("2d"), tip = $("tipF");
    var cw = 800, ch = 350, dpr = 1, k = 1, tx = 0, ty = 0, KMAX = 170, raf = 0;
    function kMin(){ var need = HF / WID * cw; return Math.max(0.4, Math.min(1, ch / Math.max(1, need))); }
    var texF = new Image(); texF.onload = function () { texPix = null; byLayer.W.forEach(function (i) { ents[i]._fill = null; }); schedule(); }; texF.src = G.tf;
    var relF = new Image();
    var texPix = null, texPW = 0, texPH = 0, relPix = null, relW = 0, relH = 0, seaRGB = [78, 140, 178];
    if (G.rs) { relF.onload = function () { relPix = null; relMips = null; schedule(); }; relF.src = G.rs; }
    function grab(img) {
      if (!img.complete || !img.naturalWidth) return null;
      var cv = document.createElement("canvas");
      cv.width = img.naturalWidth; cv.height = img.naturalHeight;
      var g = cv.getContext("2d", { willReadFrequently: true });
      g.drawImage(img, 0, 0);
      return { d: g.getImageData(0, 0, cv.width, cv.height).data, w: cv.width, h: cv.height };
    }
    function pixAt(f) {
      if (!texPix || !f) return null;
      var x = Math.max(0, Math.min(texPW - 1, Math.round(f[0] / WID * texPW)));
      var y = Math.max(0, Math.min(texPH - 1, Math.round(f[1] / HF * texPH)));
      var o = (y * texPW + x) * 4;
      return [texPix[o], texPix[o + 1], texPix[o + 2]];
    }
    function isWater(col) { return col && col[2] > col[0] + 10 && col[2] > col[1] + 2; }
    function ensurePix() {
      if (!texPix) {
        var t = grab(texF);
        if (t) {
          texPix = t.d; texPW = t.w; texPH = t.h;
          var sea = pixAt(flatXY(-40 * PI / 180, 25 * PI / 180));
          if (sea && isWater(sea)) seaRGB = sea;
        }
      }
      if (!relPix && G.rs) {
        var r = grab(relF);
        if (r) { relPix = r.d; relW = r.w; relH = r.h; }
      }
    }
    function countryFill(e) {
      if (e._fill) return e._fill;
      ensurePix();
      if (!texPix) return "#8eae74";
      var best = 0, br = e.r0, r, s, n, step, i, ax = 0, ay = 0, cnt = 0, acc = [0, 0, 0, 0], col, fx, fy;
      for (r = e.r0; r < e.r1; r++) if (rLen[r] > best) { best = rLen[r]; br = r; }
      s = rStart[br]; n = best; step = Math.max(1, (n / 28) | 0);
      for (i = 0; i < n; i += step) { ax += FXv[s + i]; ay += FYv[s + i]; cnt++; }
      ax /= cnt || 1; ay /= cnt || 1;
      for (i = 0; i < n; i += step) {
        fx = FXv[s + i] * 0.22 + ax * 0.78; fy = FYv[s + i] * 0.22 + ay * 0.78;
        col = pixAt([fx, fy]);
        if (!col || isWater(col)) continue;
        acc[0] += col[0]; acc[1] += col[1]; acc[2] += col[2]; acc[3]++;
        if (acc[3] >= 8) break;
      }
      e._fill = acc[3] ? ("rgb(" + ((acc[0] / acc[3]) | 0) + "," + ((acc[1] / acc[3]) | 0) + "," + ((acc[2] / acc[3]) | 0) + ")") : "#8eae74";
      return e._fill;
    }
    var relMips = null;
    function buildMips() {
      if (!relPix || relMips) return;
      function down(f) {
        var w = Math.max(1, (relW / f) | 0), h = Math.max(1, (relH / f) | 0), d = new Uint8Array(w * h), y, x, yy, xx, acc, c, sy, sx;
        for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
          acc = 0; c = 0;
          for (yy = 0; yy < f; yy++) for (xx = 0; xx < f; xx++) {
            sy = y * f + yy; sx = x * f + xx;
            if (sy >= relH || sx >= relW) continue;
            acc += relPix[(sy * relW + sx) * 4]; c++;
          }
          d[y * w + x] = c ? (acc / c) | 0 : 0;
        }
        return { d: d, w: w, h: h };
      }
      relMips = [down(4), down(16)];
    }
    function shadeOf(lng, lat, mip) {
      var pix, pw, ph, stride;
      if (!relPix) return 214;
      if (mip) { pix = mip.d; pw = mip.w; ph = mip.h; stride = 1; }
      else { pix = relPix; pw = relW; ph = relH; stride = 4; }
      var u = ((lng + 180) / 360) * pw, v = ((90 - lat) / 180) * ph;
      if (v < 0) v = 0; else if (v > ph - 1.001) v = ph - 1.001;
      u = ((u % pw) + pw) % pw;
      var x0 = u | 0, y0 = v | 0, x1 = (x0 + 1) % pw, y1 = y0 + 1 < ph ? y0 + 1 : y0;
      var fx = u - x0, fy = v - y0;
      var a = pix[(y0 * pw + x0) * stride], b = pix[(y0 * pw + x1) * stride];
      var c0 = pix[(y1 * pw + x0) * stride], d0 = pix[(y1 * pw + x1) * stride];
      var v0 = a * (1 - fx) * (1 - fy) + b * fx * (1 - fy) + c0 * (1 - fx) * fy + d0 * fx * fy;
      var n = 220 + (v0 - 190) * 0.45;
      if (n < 165) n = 165; else if (n > 242) n = 242;
      return n;
    }
    var shCanvas = document.createElement("canvas"), shCtx = shCanvas.getContext("2d", { willReadFrequently: true });
    var maskCanvas = document.createElement("canvas"), maskCtx = maskCanvas.getContext("2d");
    function paintCrisp(c, vx0, vy0, vx1, vy1) {
      ensurePix();
      var sea = "rgb(" + seaRGB[0] + "," + seaRGB[1] + "," + seaRGB[2] + ")";
      function fillShown(list) {
        list.forEach(function (i) {
          var e = ents[i], r, on = false;
          for (r = e.r0; r < e.r1; r++) if (RV[r]) { on = true; break; }
          if (!on) return;
          c.beginPath(); entPathFull(c, e);
          c.fillStyle = countryFill(e);
          c.fill("evenodd");
        });
      }
      if (!texF.complete || !texF.naturalWidth) {
        c.fillStyle = sea;
        c.fillRect(vx0 - 40, vy0 - 40, (vx1 - vx0) + 80, (vy1 - vy0) + 80);
        fillShown(byLayer.W);
        fillShown(byLayer.R);
        return;
      }
      c.imageSmoothingEnabled = true;
      c.imageSmoothingQuality = "high";
      c.drawImage(texF, 0, 0, WID, HF);
      if (relPix) {
        buildMips();
        var w = Math.max(2, Math.round(cw)), h = Math.max(2, Math.round(ch)), kk = cw / WID * k, cap = 650000;
        if (w * h > cap) { var sc = Math.sqrt(cap / (w * h)); w = Math.max(2, Math.round(w * sc)); h = Math.max(2, Math.round(h * sc)); }
        if (shCanvas.width !== w || shCanvas.height !== h) { shCanvas.width = w; shCanvas.height = h; }
        var pixSpan = relW / Math.max(1, k * w), mip = null;
        if (relMips) { if (pixSpan > 14) mip = relMips[1]; else if (pixSpan > 4) mip = relMips[0]; }
        var img = shCtx.createImageData(w, h), d = img.data, y, x, ll, s, o;
        for (y = 0; y < h; y++) {
          var my = (((y + 0.5) * ch / h) - ty) / kk;
          for (x = 0; x < w; x++) {
            ll = unflat((((x + 0.5) * cw / w) - tx) / kk, my);
            s = ll ? shadeOf(ll[0] / 100, ll[1] / 100, mip) : 220;
            o = (y * w + x) * 4;
            d[o] = d[o + 1] = d[o + 2] = s; d[o + 3] = 255;
          }
        }
        shCtx.putImageData(img, 0, 0);
        c.save();
        c.globalCompositeOperation = "multiply";
        c.drawImage(shCanvas, vx0, vy0, vx1 - vx0, vy1 - vy0);
        c.restore();
      }
      var mw = Math.max(2, Math.round(cw * dpr)), mh = Math.max(2, Math.round(ch * dpr));
      if (maskCanvas.width !== mw || maskCanvas.height !== mh) { maskCanvas.width = mw; maskCanvas.height = mh; }
      maskCtx.setTransform(1, 0, 0, 1, 0, 0);
      maskCtx.clearRect(0, 0, mw, mh);
      maskCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      maskCtx.save();
      maskCtx.translate(tx, ty);
      maskCtx.scale(cw / WID * k, cw / WID * k);
      maskCtx.fillStyle = "#fff";
      function stamp(list) {
        var i, e, r, on;
        for (i = 0; i < list.length; i++) {
          e = ents[list[i]]; on = false;
          for (r = e.r0; r < e.r1; r++) {
            if (rSkip[r]) continue;
            if (rbx1[r] < vx0 || rbx0[r] > vx1 || rby1[r] < vy0 || rby0[r] > vy1) continue;
            on = true; break;
          }
          if (!on) continue;
          maskCtx.beginPath();
          entPathFull(maskCtx, e);
          maskCtx.fill("evenodd");
        }
      }
      stamp(byLayer.W);
      stamp(byLayer.R);
      maskCtx.restore();
      c.save();
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.globalCompositeOperation = "destination-in";
      c.drawImage(maskCanvas, 0, 0, cw, ch);
      c.globalCompositeOperation = "destination-over";
      c.fillStyle = sea;
      c.fillRect(0, 0, cw, ch);
      c.restore();
    }
    var show = { rd: false, rl: false, rv: true };
    var LAYERS = [];
    function addTiers(key, arr, ths, style) {
      if (!arr || !arr.length) return;
      arr.forEach(function (b, i) { LAYERS.push({ key: key, b64: b, th: ths[i], style: style, ready: false, rank: i }); });
    }
    addTiers("rv", G.rv, [0.35, 0.85, 1.35, 2.1], { c: "#1a6fa5", w: 1.4, a: 0.92 });
    LAYERS.forEach(function (L) {
      if (L.key !== "rv") return;
      L.style = { c: "#1a6fa5", w: [1.55, 1.25, 1.05, 0.9][L.rank] || 1, a: 0.92 };
    });
    function load(L) {
      var rd = reader(L.b64), n = rd.next(), ps = new Int32Array(n), pl = new Int32Array(n), bx = new Float32Array(n * 4), px = [], py = [], gx = [], gy = [];
      for (var i = 0; i < n; i++) {
        var m = rd.next(), x = rd.next(), y = rd.next(); ps[i] = px.length; pl[i] = m;
        var a0 = 1e9, b0 = 1e9, a1 = -1e9, b1 = -1e9;
        for (var j = 0; j < m; j++) {
          if (j) { x += rd.next(); y += rd.next(); }
          var f = flatXY(x * D2R, y * D2R); px.push(f[0]); py.push(f[1]); gx.push(x / 100); gy.push(y / 100);
          if (f[0] < a0) a0 = f[0]; if (f[0] > a1) a1 = f[0]; if (f[1] < b0) b0 = f[1]; if (f[1] > b1) b1 = f[1];
        }
        bx[i * 4] = a0; bx[i * 4 + 1] = b0; bx[i * 4 + 2] = a1; bx[i * 4 + 3] = b1;
      }
      L.n = n; L.ps = ps; L.pl = pl; L.bx = bx; L.px = Float32Array.from(px); L.py = Float32Array.from(py); L.gx = Float32Array.from(gx); L.gy = Float32Array.from(gy); L.ready = true; L.b64 = null;
    }
    function resize() { var r = box.getBoundingClientRect(); cw = Math.max(200, r.width); ch = Math.max(100, r.height); dpr = Math.min(window.devicePixelRatio || 1, 2); cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr); clamp(); }
    function clamp() {
      k = Math.max(kMin(), Math.min(KMAX, k));
      var kk = cw / WID * k, w = WID * kk, h = HF * kk;
      tx = w <= cw ? (cw - w) / 2 : Math.min(0, Math.max(cw - w, tx));
      ty = h <= ch ? (ch - h) / 2 : Math.min(0, Math.max(ch - h, ty));
    }
    var RV = new Uint8Array(NR);
    var thr2 = 0;     // вершины ближе порога (в долях пикселя) пропускаются: на мелком масштабе их не видно
    function ringPath(c, r) {
      if (rSkip[r]) return;
      var s = rStart[r], n = rLen[r], px = FXv[s], py = FYv[s]; c.moveTo(px, py);
      for (var i = 1; i < n; i++) { var x = FXv[s + i], y = FYv[s + i], dx = x - px, dy = y - py; if (dx * dx + dy * dy < thr2 && i < n - 1) continue; c.lineTo(x, y); px = x; py = y; }
      c.closePath();
    }
    function ringStrokeFlat(c, r) {
      if (rSkip[r]) return;
      var s = rStart[r], n = rLen[r], i, a, b, cut, k, t0, t1, drawing = false;
      if (n < 2) return;
      for (i = 0; i < n; i++) {
        a = s + i; b = s + ((i + 1) % n);
        cut = edgeCut[a];
        if (!cut) {
          if (!drawing) { c.moveTo(FXv[a], FYv[a]); drawing = true; }
          c.lineTo(FXv[b], FYv[b]);
        } else if (!cut.length) drawing = false;
        else {
          for (k = 0; k < cut.length; k += 2) {
            t0 = cut[k]; t1 = cut[k + 1];
            c.moveTo(FXv[a] + (FXv[b] - FXv[a]) * t0, FYv[a] + (FYv[b] - FYv[a]) * t0);
            c.lineTo(FXv[a] + (FXv[b] - FXv[a]) * t1, FYv[a] + (FYv[b] - FYv[a]) * t1);
          }
          drawing = false;
        }
      }
    }
    function entStrokeFlat(c, e) { for (var r = e.r0; r < e.r1; r++) if (RV[r]) ringStrokeFlat(c, r); }
    function entPath(c, e) { for (var r = e.r0; r < e.r1; r++) if (RV[r]) ringPath(c, r); }
    function entPathFull(c, e) { for (var r = e.r0; r < e.r1; r++) ringPath(c, r); }
    var bc = document.createElement("canvas"), bctx = bc.getContext("2d"), bkey = "", snapTx = 0, snapTy = 0, snapK = 1, hold = 0, zoomIdle = 0;
    var rc = document.createElement("canvas"), rctx = rc.getContext("2d");
    function base() {
      var c = bctx, kk = cw / WID * k; thr2 = Math.pow(1.3 / kk, 2);
      c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, bc.width, bc.height); c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.save(); c.translate(tx, ty); c.scale(kk, kk);
      var vx0 = -tx / kk, vx1 = (cw - tx) / kk, vy0 = -ty / kk, vy1 = (ch - ty) / kk, px1 = 1.4 / kk;
      stampIso();
      for (var r = 0; r < NR; r++) RV[r] = (rbx1[r] < vx0 || rbx0[r] > vx1 || rby1[r] < vy0 || rby0[r] > vy1 || (rbx1[r] - rbx0[r] < px1 && rby1[r] - rby0[r] < px1)) ? 0 : 1;
      paintCrisp(c, vx0, vy0, vx1, vy1);
      var lw = 1 / kk; c.lineJoin = "round"; c.lineCap = "round";
      function showSmall(e){
        for (var r = e.r0; r < e.r1; r++){
          if (rbx1[r] < vx0 || rbx0[r] > vx1 || rby1[r] < vy0 || rby0[r] > vy1) continue;
          RV[r] = 1;
        }
      }
      var detailThr = thr2;
      thr2 = 0;
      byLayer.W.forEach(function (i) {
        var e = ents[i];
        if (e.name === "Украина") {
          if (!(litCountry(e) || markC.UA || washIso.UA)) return;
          showSmall(e);
          c.beginPath(); entPath(c, e); c.fillStyle = fillCountry(); c.fill("evenodd");
          return;
        }
        if (!litCountry(e)) return;
        showSmall(e);
        c.beginPath(); entPath(c, e); c.fillStyle = fillCountry(); c.fill("evenodd");
      });
      if (washIso.RU || markC.RU) {
        byLayer.R.forEach(function (i) {
          var e = ents[i];
          showSmall(e);
          c.beginPath(); entPath(c, e); c.fillStyle = fillCountry(); c.fill("evenodd");
        });
      }
      ["R", "C", "G"].forEach(function (L) {
        byLayer[L].forEach(function (i) {
          var e = ents[i];
          if (!regionMarked(e)) return;
          showSmall(e);
          c.beginPath(); entPath(c, e);
          c.fillStyle = fillRegion();
          c.fill("evenodd");
        });
      });
      thr2 = detailThr;
      (function paintFlatOverlays(){
        var ids = Object.keys(washIso), k, iso, rings, ring, i, p, minx, miny, maxx, maxy, sw, sh;
        for (k in markC) if (ids.indexOf(k) < 0) ids.push(k);
        for (k = 0; k < ids.length; k++) {
          iso = ids[k];
          if (!overlayWanted(iso)) continue;
          if (!traceFlat(c, iso)) continue;
          c.fillStyle = fillCountry(true);
          c.fill("nonzero");
          rings = countryRings(iso);
          if (!rings.length || !rings[0].length) continue;
          ring = rings[0]; minx = 1e9; miny = 1e9; maxx = -1e9; maxy = -1e9;
          for (i = 0; i < ring.length; i++) {
            p = flatXY(ring[i][0] * PI / 180, ring[i][1] * PI / 180);
            if (p[0] < minx) minx = p[0]; if (p[0] > maxx) maxx = p[0];
            if (p[1] < miny) miny = p[1]; if (p[1] > maxy) maxy = p[1];
          }
          sw = (maxx - minx) * kk; sh = (maxy - miny) * kk;
          if (sw < 13 && sh < 13) {
            c.beginPath();
            c.arc((minx + maxx) / 2, (miny + maxy) / 2, 7 / kk, 0, 2 * PI);
            c.fillStyle = fillDot();
            c.fill();
            c.lineWidth = 1.2 / kk;
            c.strokeStyle = "rgba(90,56,12,.9)";
            c.stroke();
          }
        }
      })();
      c.restore();
    }
    function paintNets(target) {
      var kk = cw / WID * k, vx0 = -tx / kk, vx1 = (cw - tx) / kk, vy0 = -ty / kk, vy1 = (ch - ty) / kk, any = false;
      LAYERS.forEach(function (L) { if (show[L.key] && k >= L.th) any = true; });
      if (!any) return;
      target.setTransform(dpr, 0, 0, dpr, 0, 0);
      target.save();
      target.translate(tx, ty); target.scale(kk, kk);
      target.lineJoin = "round"; target.lineCap = "round";
      LAYERS.forEach(function (L) {
        if (!show[L.key] || k < L.th) return;
        if (!L.ready) load(L);
        target.beginPath();
        for (var i = 0; i < L.n; i++) {
          var b = i * 4;
          if (L.bx[b + 2] < vx0 || L.bx[b] > vx1 || L.bx[b + 3] < vy0 || L.bx[b + 1] > vy1) continue;
          var s = L.ps[i], m = L.pl[i], j;
          target.moveTo(L.px[s], L.py[s]);
          for (j = 1; j < m; j++) target.lineTo(L.px[s + j], L.py[s + j]);
        }
        target.strokeStyle = L.style.c;
        target.globalAlpha = L.style.a;
        target.lineWidth = L.style.w / kk;
        target.setLineDash(L.style.dash ? L.style.dash.map(function (d) { return d / kk; }) : []);
        target.stroke();
      });
      target.setLineDash([]); target.globalAlpha = 1;
      target.restore();
    }
    function draw() {
      var dragging = cv.classList.contains("drag");
      var settled = !dragging && !hold;
      var key = [cw, ch, dpr, Math.round(k * 1000), settled ? Math.round(tx) : "m", settled ? Math.round(ty) : "m", show.rd ? 1 : 0, show.rl ? 1 : 0, show.rv ? 1 : 0, texF.complete ? 1 : 0, relF.complete ? 1 : 0, markRev].join("|");
      if (bc.width !== cv.width || bc.height !== cv.height) { bc.width = cv.width; bc.height = cv.height; rc.width = cv.width; rc.height = cv.height; bkey = ""; }
      if (settled && key !== bkey) { base(); bkey = key; snapTx = tx; snapTy = ty; snapK = k; }
      if (settled) {
        rctx.setTransform(1, 0, 0, 1, 0, 0); rctx.clearRect(0, 0, rc.width, rc.height);
        if (hooks.paint) { rctx.setTransform(dpr, 0, 0, dpr, 0, 0); hooks.paint(rctx); }
        var labels = document.getElementById("atlas-html"); if (labels) labels.style.transform = "";
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
      if (!settled && snapK) {
        var s = k / snapK;
        ctx.setTransform(s, 0, 0, s, (tx - snapTx * s) * dpr, (ty - snapTy * s) * dpr);
        ctx.drawImage(bc, 0, 0);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        paintNets(ctx);
        ctx.setTransform(s, 0, 0, s, (tx - snapTx * s) * dpr, (ty - snapTy * s) * dpr);
        ctx.drawImage(rc, 0, 0);
        var labels2 = document.getElementById("atlas-html");
        if (labels2) { labels2.style.transformOrigin = "0 0"; labels2.style.transform = "translate(" + (tx - snapTx * s) + "px," + (ty - snapTy * s) + "px) scale(" + s + ")"; }
      } else { ctx.drawImage(bc, 0, 0); paintNets(ctx); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(rc, 0, 0); }
      if (!settled) return;
      var kk = cw / WID * k; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.save(); ctx.translate(tx, ty); ctx.scale(kk, kk); ctx.lineJoin = "round";
      ([[hoverEnt, "rgba(255,248,220,.66)"], [selEnt, "rgba(255,214,140,.72)"]] as [number, string][]).forEach(function (h) {
        if (h[0] < 0) return;
        var e = ents[h[0]], hi, host;
        var hosts = hostEntities(e);
        for (hi = 0; hi < hosts.length; hi++) {
          host = hosts[hi];
          if (e.L !== "W" && host === e) continue;
          if (host.name === "Украина" && traceFlat(ctx, "UA")) {
            ctx.fillStyle = e.L === "W" ? h[1] : "rgba(125,198,255,.46)";
            ctx.fill("evenodd");
            continue;
          }
          ctx.beginPath(); entPathFull(ctx, host);
          ctx.fillStyle = e.L === "W" ? h[1] : "rgba(125,198,255,.46)";
          ctx.fill("evenodd");
        }
        if (e.L === "W") return;
        if (e.name === "Украина" && traceFlat(ctx, "UA")) {
          ctx.fillStyle = h[1]; ctx.fill("evenodd");
          return;
        }
        ctx.beginPath(); entPathFull(ctx, e); ctx.fillStyle = h[1]; ctx.fill("evenodd");
      });
      ctx.restore();
    }
    function schedule() { if (!raf) raf = requestAnimationFrame(function () { raf = 0; if (mode === "flat") draw(); }); }
    function zoomAt(px, py, f) { var nk = Math.max(kMin(), Math.min(KMAX, k * f)); f = nk / k; tx = px - (px - tx) * f; ty = py - (py - ty) * f; k = nk; clamp(); hold = 1; schedule(); if (zoomIdle) clearTimeout(zoomIdle); zoomIdle = setTimeout(function () { zoomIdle = 0; hold = 0; bkey = ""; schedule(); if (hooks.afterView) hooks.afterView(); }, 140); }
    function local(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    function llAt(px, py) { var kk = cw / WID * k; return unflat((px - tx) / kk, (py - ty) / kk); }
    function pickAt(px, py) { var q = llAt(px, py); return q ? pickLL(q[0], q[1]) : -1; }

    var ptrs = {} as any, last = null, moved = 0, pinch = 0;
    cv.addEventListener("pointerdown", function (e) { ptrs[e.pointerId] = e; moved = 0; cv.setPointerCapture(e.pointerId); last = { x: e.clientX, y: e.clientY }; var ids = Object.keys(ptrs); if (ids.length === 2) pinch = pinchDist(ptrs[ids[0]], ptrs[ids[1]]); });
    cv.addEventListener("pointermove", function (e) {
      if (!ptrs[e.pointerId]) { hover(e); return; }
      ptrs[e.pointerId] = e; var ids = Object.keys(ptrs);
      if (ids.length === 2) { var a = ptrs[ids[0]], b = ptrs[ids[1]], d = pinchDist(a, b); if (pinch) { var p = local({ clientX: (a.clientX + b.clientX) / 2, clientY: (a.clientY + b.clientY) / 2 }); zoomAt(p.x, p.y, d / pinch); } pinch = d; moved = 99; return; }
      var dx = e.clientX - last.x, dy = e.clientY - last.y; moved += Math.abs(dx) + Math.abs(dy);
      if (moved > 5) { cv.classList.add("drag"); tip.style.opacity = 0; }
      tx += dx; ty += dy; last = { x: e.clientX, y: e.clientY }; clamp(); schedule(); if (hooks.move) hooks.move();
    });
    function end(e) { delete ptrs[e.pointerId]; pinch = 0; cv.classList.remove("drag"); var ids = Object.keys(ptrs); if (ids.length === 1) last = { x: ptrs[ids[0]].clientX, y: ptrs[ids[0]].clientY }; }
    var lastTap = 0, lastTapPt = null, tapTimer = 0;
    cv.addEventListener("pointerup", function (e) {
      var click = moved <= 5, p = local(e); end(e);
      if (click) {
        var now = Date.now();
        var near = lastTapPt && Math.abs(p.x - lastTapPt.x) < 32 && Math.abs(p.y - lastTapPt.y) < 32;
        if (near && now - lastTap < 320) {
          clearTimeout(tapTimer); lastTap = 0; lastTapPt = null;
          zoomAt(p.x, p.y, 2);
          return;
        }
        lastTap = now; lastTapPt = p;
        clearTimeout(tapTimer);
        tapTimer = setTimeout(function () {
          var q = llAt(p.x, p.y); if (q && hooks.click) hooks.click({ lat: q[1] / 100, lng: q[0] / 100, x: p.x, y: p.y });
        }, 280);
      }
      schedule(); if (hooks.afterView) hooks.afterView();
    });
    cv.addEventListener("pointercancel", end);
    cv.addEventListener("pointerleave", function () { tip.style.opacity = 0; if (hoverEnt >= 0) { hoverEnt = -1; schedule(); } });
    cv.addEventListener("wheel", function (e) { e.preventDefault(); var p = local(e); zoomAt(p.x, p.y, e.deltaY < 0 ? 1.25 : 0.8); }, { passive: false });
    function hover(e) {
      if (e.pointerType === "touch") return; var p = local(e), i = pickAt(p.x, p.y);
      if (i !== hoverEnt) { hoverEnt = i; schedule(); } showTip(tip, box, e, i);
    }
    var netGraphs = {} as any;
    function km2(a, b) {
      var R = 6371, p1 = a[0] * PI / 180, p2 = b[0] * PI / 180, dp = (b[0] - a[0]) * PI / 180, dl = (b[1] - a[1]) * PI / 180;
      var s = Math.sin(dp / 2) * Math.sin(dp / 2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
      return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
    }
    function graphOf(key) {
      if (netGraphs[key]) return netGraphs[key];
      var L = null, i;
      for (i = 0; i < LAYERS.length; i++) if (LAYERS[i].key === key && (LAYERS[i].rank || 0) === 0) L = LAYERS[i];
      if (!L) return null;
      if (!L.ready) load(L);
      if (!L.ready || !L.n) return null;
      var snap = 0.12, nodes = {} as any, edges = [], adj = {} as any, grid = {} as any;
      function nid(lat, lng) { return Math.round(lat / snap) + ":" + Math.round(lng / snap); }
      function touch(id, lat, lng) {
        if (!nodes[id]) {
          nodes[id] = { lat: lat, lng: lng };
          var cell = Math.floor(lat) + ":" + Math.floor(lng);
          (grid[cell] = grid[cell] || []).push(id);
        }
      }
      for (i = 0; i < L.n; i++) {
        var s0 = L.ps[i], m = L.pl[i];
        if (m < 2) continue;
        var aLat = L.gy[s0], aLng = L.gx[s0], bLat = L.gy[s0 + m - 1], bLng = L.gx[s0 + m - 1];
        var ia = nid(aLat, aLng), ib = nid(bLat, bLng);
        if (ia === ib) continue;
        touch(ia, aLat, aLng); touch(ib, bLat, bLng);
        var pts = new Array(m), j;
        for (j = 0; j < m; j++) pts[j] = [L.gy[s0 + j], L.gx[s0 + j]];
        var idx = edges.length;
        edges.push({ a: ia, b: ib, w: km2([aLat, aLng], [bLat, bLng]) || 0.1, pts: pts });
        (adj[ia] = adj[ia] || []).push(idx);
        (adj[ib] = adj[ib] || []).push(idx);
      }
      netGraphs[key] = { nodes: nodes, edges: edges, adj: adj, grid: grid };
      return netGraphs[key];
    }
    function nearestNode(g, lat, lng) {
      var best = null, bd = 140, cy, cx, arr, i, id, n, d;
      for (cy = Math.floor(lat) - 1; cy <= Math.floor(lat) + 1; cy++) {
        for (cx = Math.floor(lng) - 1; cx <= Math.floor(lng) + 1; cx++) {
          arr = g.grid[cy + ":" + cx];
          if (!arr) continue;
          for (i = 0; i < arr.length; i++) {
            id = arr[i]; n = g.nodes[id];
            d = km2([lat, lng], [n.lat, n.lng]);
            if (d < bd) { bd = d; best = id; }
          }
        }
      }
      return best;
    }
    function traceKey(key, lat1, lng1, lat2, lng2) {
      var g = graphOf(key);
      if (!g) return null;
      var start = nearestNode(g, lat1, lng1), goal = nearestNode(g, lat2, lng2);
      if (!start || !goal || start === goal) return null;
      var open = [start], gscore = {} as any, prev = {} as any, seen = {} as any, guard = 0, i, bi, b, id, f, cur, list, e, nxt, ng;
      gscore[start] = 0;
      while (open.length && guard++ < 7000) {
        bi = 0; b = 1e18;
        for (i = 0; i < open.length; i++) {
          id = open[i];
          f = gscore[id] + km2([g.nodes[id].lat, g.nodes[id].lng], [g.nodes[goal].lat, g.nodes[goal].lng]);
          if (f < b) { b = f; bi = i; }
        }
        cur = open.splice(bi, 1)[0];
        if (cur === goal) break;
        if (seen[cur]) continue;
        seen[cur] = 1;
        list = g.adj[cur] || [];
        for (i = 0; i < list.length; i++) {
          e = g.edges[list[i]];
          nxt = e.a === cur ? e.b : e.a;
          ng = gscore[cur] + e.w;
          if (gscore[nxt] == null || ng < gscore[nxt]) {
            gscore[nxt] = ng;
            prev[nxt] = { from: cur, edge: list[i] };
            open.push(nxt);
          }
        }
      }
      if (gscore[goal] == null) return null;
      var straight = km2([lat1, lng1], [lat2, lng2]);
      if (gscore[goal] > Math.max(90, straight * 2.6)) return null;
      var parts = [], walk = goal;
      while (prev[walk]) {
        e = g.edges[prev[walk].edge];
        parts.push(e.a === prev[walk].from ? e.pts : e.pts.slice().reverse());
        walk = prev[walk].from;
      }
      parts.reverse();
      var out = [[lat1, lng1]], q;
      for (i = 0; i < parts.length; i++) for (q = 0; q < parts[i].length; q++) out.push(parts[i][q]);
      out.push([lat2, lng2]);
      return out;
    }
    return {
      resize: resize, draw: schedule, drawNow: draw, zoomAt: zoomAt, kMin: kMin,
      getK: function () { return k; },
      getSize: function () { return { x: cw, y: ch }; },
      projectLL: function (lat, lng) { var f = flatXY(lng * PI / 180, lat * PI / 180), kk = cw / WID * k; return { x: f[0] * kk + tx, y: f[1] * kk + ty }; },
      flatOf: function (lat, lng) { return flatXY(lng * PI / 180, lat * PI / 180); },
      unproject: function (px, py) { var q = llAt(px, py); return q ? { lat: q[1] / 100, lng: q[0] / 100 } : null; },
      getCenter: function () { var q = llAt(cw / 2, ch / 2); return q ? { lon: q[0] / 100, lat: q[1] / 100, z: k } : { lon: 40, lat: 48, z: k }; },
      setCenter: function (lon, lat, z) { var f = flatXY(lon * PI / 180, lat * PI / 180); k = Math.max(kMin(), Math.min(KMAX, z)); var kk = cw / WID * k; tx = cw / 2 - f[0] * kk; ty = ch / 2 - f[1] * kk; clamp(); schedule(); },
      glance: function (lon, lat) { var f = flatXY(lon * PI / 180, lat * PI / 180), kk = cw / WID * k; tx = cw / 2 - f[0] * kk; ty = ch / 2 - f[1] * kk; clamp(); hold = 1; schedule(); if (zoomIdle) clearTimeout(zoomIdle); zoomIdle = setTimeout(function () { zoomIdle = 0; hold = 0; bkey = ""; schedule(); }, 240); },
      setCenterFromFlat: function (fx, fy, nk) { k = Math.max(kMin(), Math.min(KMAX, nk)); var kk = cw / WID * k; tx = cw / 2 - fx * kk; ty = ch / 2 - fy * kk; clamp(); schedule(); },
      netLayers: function () { return LAYERS; },
      netOn: function (key) { return !!show[key]; },
      ensure: function (L) { if (L && !L.ready && L.b64) load(L); },
      setShow: function (key, on) { show[key] = !!on; bkey = ""; schedule(); },
      hasKey: function (key) { for (var i = 0; i < LAYERS.length; i++) if (LAYERS[i].key === key) return true; return false; },
      addNet: function (key, arr) {
        if (!arr || !arr.length || this.hasKey(key)) return;
        if (key === "rd") addTiers("rd", arr, [1.05, 6, 16, 32], { c: "#c08a4b", w: 0.8, a: 0.9 });
        else if (key === "rl") addTiers("rl", arr, [1.05, 5, 14], { c: "#54606a", w: 1, a: 0.95, dash: [5, 3] });
        bkey = "";
      },
      warm: function (key) {
        var i, L = null;
        for (i = 0; i < LAYERS.length; i++) if (LAYERS[i].key === key && (LAYERS[i].rank || 0) === 0) L = LAYERS[i];
        if (L && !L.ready && L.b64) load(L);
      },
      trace: function (key, lat1, lng1, lat2, lng2) { return traceKey(key, lat1, lng1, lat2, lng2); }
    };
  })();

  // ===================== ГЛОБУС =====================
  views.globe = (function () {
    var box = $("globeBox"), cv = $("cvG"), ctx = cv.getContext("2d", { alpha: true }), tip = $("tipG");
    var glcv = document.createElement("canvas"); glcv.id = "cvGgl"; glcv.style.opacity = "0"; glcv.style.pointerEvents = "none"; box.insertBefore(glcv, cv);
    var tex = null, TW = 0, TH = 0, rbuf = document.createElement("canvas"), rctx = rbuf.getContext("2d"), rimg = null, gimg = new Image(), gready = false;
    var gl = null, glProg = null, glBuf = null, glTex = null, uLoc = null, sphereMode = "";
    gimg.onload = function () { gready = true; if (mode === "globe") { uploadSphere(); schedule(); } }; gimg.src = G.tg;
    function bootGL() {
      if (sphereMode) return sphereMode === "webgl";
      var opts = { alpha: true, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, preserveDrawingBuffer: true };
      var g = glcv.getContext("webgl2", opts) || glcv.getContext("webgl", opts) || glcv.getContext("experimental-webgl", opts);
      if (!g) { sphereMode = "cpu"; return false; }
      function sh(type, src) {
        var s = g.createShader(type); g.shaderSource(s, src); g.compileShader(s);
        if (!g.getShaderParameter(s, g.COMPILE_STATUS)) { sphereMode = "cpu"; return null; }
        return s;
      }
      var vs = sh(g.VERTEX_SHADER, "attribute vec2 a;varying vec2 v;void main(){v=a;gl_Position=vec4(a,0.0,1.0);}");
      var fs = sh(g.FRAGMENT_SHADER, "precision mediump float;varying vec2 v;uniform sampler2D uTex;uniform float uLon,uLat,uR,uCx,uCy,uW,uH,uHas;const float PI=3.14159265;void main(){float px=(v.x*.5+.5)*uW;float py=(.5-v.y*.5)*uH;float nx=(px-uCx)/uR;float ny=(uCy-py)/uR;float r2=nx*nx+ny*ny;if(r2>=1.0){gl_FragColor=vec4(0.0);return;}float nz=sqrt(1.0-r2);float cp=cos(uLat),sp=sin(uLat),cl=cos(uLon),sl=sin(uLon);float Y=ny*cp+nz*sp;float z1=-ny*sp+nz*cp;float X=nx*cl+z1*sl;float Z=-nx*sl+z1*cl;float u=atan(X,Z)/(2.0*PI)+.5;float vv=.5+asin(clamp(Y,-1.0,1.0))/PI;vec3 col=uHas>.5?texture2D(uTex,vec2(u,vv)).rgb:vec3(.55,.70,.80);float limb=pow(nz,.55);col*=.86+.14*limb;float atmos=pow(1.0-nz,2.6);col=mix(col,vec3(.62,.82,.98),atmos*.42);gl_FragColor=vec4(col,1.0);}");
      if (!vs || !fs) { sphereMode = "cpu"; return false; }
      var p = g.createProgram(); g.attachShader(p, vs); g.attachShader(p, fs); g.bindAttribLocation(p, 0, "a"); g.linkProgram(p);
      if (!g.getProgramParameter(p, g.LINK_STATUS)) { sphereMode = "cpu"; return false; }
      gl = g; glProg = p;
      glBuf = g.createBuffer(); g.bindBuffer(g.ARRAY_BUFFER, glBuf); g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), g.STATIC_DRAW);
      uLoc = { lon: g.getUniformLocation(p, "uLon"), lat: g.getUniformLocation(p, "uLat"), R: g.getUniformLocation(p, "uR"), cx: g.getUniformLocation(p, "uCx"), cy: g.getUniformLocation(p, "uCy"), w: g.getUniformLocation(p, "uW"), h: g.getUniformLocation(p, "uH"), has: g.getUniformLocation(p, "uHas") };
      g.useProgram(p); g.uniform1i(g.getUniformLocation(p, "uTex"), 0);
      sphereMode = "webgl";
      return true;
    }
    function pot(n) { var p = 1; while (p < n) p <<= 1; return p; }
    function uploadSphere() {
      if (!gready || !bootGL() || glTex) return;
      var src = gimg, w = gimg.width, h = gimg.height, webgl2 = typeof WebGL2RenderingContext !== "undefined" && gl instanceof WebGL2RenderingContext;
      if (!webgl2 && ((w & (w - 1)) || (h & (h - 1)))) {
        var c = document.createElement("canvas"); c.width = pot(w); c.height = pot(h);
        c.getContext("2d").drawImage(gimg, 0, 0, c.width, c.height); src = c as any;
      }
      var t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      var webgl2b = typeof WebGL2RenderingContext !== "undefined" && gl instanceof WebGL2RenderingContext;
      var potOk = src.width && !(src.width & (src.width - 1)) && !(src.height & (src.height - 1));
      if (webgl2b || potOk) {
        try {
          gl.generateMipmap(gl.TEXTURE_2D);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        } catch (e) {}
      }
      glTex = t;
    }
    function paintSphere() {
      if (bootGL()) {
        uploadSphere();
        if (glcv.width !== cv.width || glcv.height !== cv.height) { glcv.width = cv.width; glcv.height = cv.height; }
        gl.viewport(0, 0, glcv.width, glcv.height);
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(glProg);
        gl.bindBuffer(gl.ARRAY_BUFFER, glBuf); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.uniform1f(uLoc.lon, lon0 * PI / 180); gl.uniform1f(uLoc.lat, lat0 * PI / 180);
        gl.uniform1f(uLoc.R, R); gl.uniform1f(uLoc.cx, cx); gl.uniform1f(uLoc.cy, cy);
        gl.uniform1f(uLoc.w, cw); gl.uniform1f(uLoc.h, ch); gl.uniform1f(uLoc.has, glTex ? 1 : 0);
        if (glTex) { gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, glTex); }
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        return;
      }
    }
    function initTex() { if (tex || !gready || sphereMode === "webgl") return; var c = document.createElement("canvas"); c.width = TW = gimg.width; c.height = TH = gimg.height; var x = c.getContext("2d"); x.drawImage(gimg, 0, 0); tex = x.getImageData(0, 0, TW, TH).data; }
    var SX = new Float32Array(NV), SY = new Float32Array(NV), ZV = new Uint8Array(NV), RVg = new Uint8Array(NR);
    var lon0 = 60, lat0 = 25, zoom = 1, cw = 600, ch = 600, dpr = 1, spinning = false, moving = 0, raf = 0, idle = 0, cl, sl, cp, sp, R, cx, cy;
    function setCam() { var a = lon0 * PI / 180, b = lat0 * PI / 180; cl = Math.cos(a); sl = Math.sin(a); cp = Math.cos(b); sp = Math.sin(b); R = Math.min(cw, ch) / 2 * 0.9 * zoom; cx = cw / 2; cy = ch / 2; }
    function resize() { var r = box.getBoundingClientRect(); cw = Math.max(200, r.width); ch = Math.max(200, r.height); dpr = Math.min(window.devicePixelRatio || 1, 2); cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr); }
    function hq() { return Math.min(1, 960 / Math.max(cw, ch)); }
    function relief(q, fast) {
      var rw = Math.max(2, Math.round(cw * q)), rh = Math.max(2, Math.round(ch * q)), kq = 1 / q;
      if (rbuf.width !== rw || rbuf.height !== rh) { rbuf.width = rw; rbuf.height = rh; rimg = rctx.createImageData(rw, rh); }
      var d = rimg.data, t = tex, TH1 = TH - 1;
      for (var y = 0; y < rh; y++) {
        var ny = (cy - (y + 0.5) * kq) / R, ny2 = ny * ny;
        for (var x = 0; x < rw; x++) {
          var o = (y * rw + x) * 4, nx = ((x + 0.5) * kq - cx) / R, r2 = nx * nx + ny2;
          if (r2 >= 1) { d[o + 3] = 0; continue; }
          var nz = Math.sqrt(1 - r2), Y = ny * cp + nz * sp, z1 = -ny * sp + nz * cp, X = nx * cl + z1 * sl, Z = -nx * sl + z1 * cl;
          var u = (Math.atan2(X, Z) / (2 * PI) + 0.5) * TW - 0.5, v = (0.5 - Math.asin(Y) / PI) * TH - 0.5;
          if (v < 0) v = 0; else if (v > TH1) v = TH1;
          if (fast) {
            var uf = ((Math.round(u) % TW) + TW) % TW, vf = Math.round(v), p = (vf * TW + uf) * 4;
            d[o] = t[p]; d[o + 1] = t[p + 1]; d[o + 2] = t[p + 2]; d[o + 3] = 255;
            continue;
          }
          var u0 = Math.floor(u), v0 = Math.floor(v), fu = u - u0, fv = v - v0, v1 = v0 < TH1 ? v0 + 1 : v0, ua = ((u0 % TW) + TW) % TW, ub = (ua + 1) % TW;
          var a = (v0 * TW + ua) * 4, b = (v0 * TW + ub) * 4, c = (v1 * TW + ua) * 4, e = (v1 * TW + ub) * 4, w1 = (1 - fu) * (1 - fv), w2 = fu * (1 - fv), w3 = (1 - fu) * fv, w4 = fu * fv;
          d[o] = t[a] * w1 + t[b] * w2 + t[c] * w3 + t[e] * w4; d[o + 1] = t[a + 1] * w1 + t[b + 1] * w2 + t[c + 1] * w3 + t[e + 1] * w4; d[o + 2] = t[a + 2] * w1 + t[b + 2] * w2 + t[c + 2] * w3 + t[e + 2] * w4; d[o + 3] = 255;
        }
      }
      rctx.putImageData(rimg, 0, 0);
    }
    function project(step) {
      step = step || 1;
      for (var r = 0; r < NR; r++) {
        var z1 = rCx[r] * sl + rCz[r] * cl, z2 = rCy[r] * sp + z1 * cp, vis = z2 > -rSin[r] - 0.35 ? 1 : 0;
        RVg[r] = vis;
        if (!vis) continue;
        var s0 = rStart[r], e0 = s0 + rLen[r], j;
        for (j = s0; j < e0; j++) ZV[j] = 0;
        for (j = s0; j < e0; j += step) {
          var X = VX[j], Y = VY[j], Z = VZ[j], x1 = X * cl - Z * sl, zz = X * sl + Z * cl, y2 = Y * cp - zz * sp, z = Y * sp + zz * cp;
          if (z > 0.02) { ZV[j] = 1; SX[j] = cx + R * x1; SY[j] = cy - R * y2; }
        }
        if (step > 1) {
          j = e0 - 1;
          var X2 = VX[j], Y2 = VY[j], Z2 = VZ[j], x12 = X2 * cl - Z2 * sl, zz2 = X2 * sl + Z2 * cl, y22 = Y2 * cp - zz2 * sp, zc = Y2 * sp + zz2 * cp;
          if (zc > 0.02) { ZV[j] = 1; SX[j] = cx + R * x12; SY[j] = cy - R * y22; }
        }
      }
    }
    function projectFull(e) {
      for (var r = e.r0; r < e.r1; r++) {
        var s0 = rStart[r], n = rLen[r], j, idx, X, Y, Z, x1, zz, y2, z, any = 0;
        for (j = 0; j < n; j++) {
          idx = s0 + j;
          X = VX[idx]; Y = VY[idx]; Z = VZ[idx];
          x1 = X * cl - Z * sl; zz = X * sl + Z * cl; y2 = Y * cp - zz * sp; z = Y * sp + zz * cp;
          if (z > 0.02) { ZV[idx] = 1; SX[idx] = cx + R * x1; SY[idx] = cy - R * y2; any = 1; }
          else ZV[idx] = 0;
        }
        if (any) RVg[r] = 1;
      }
    }
    function limbXY(i, j) {
      function xyz(idx) {
        var X = VX[idx], Y = VY[idx], Z = VZ[idx];
        var x1 = X * cl - Z * sl, zz = X * sl + Z * cl, y2 = Y * cp - zz * sp, z = Y * sp + zz * cp;
        return [cx + R * x1, cy - R * y2, z];
      }
      var a = xyz(i), b = xyz(j), t = (0.025 - a[2]) / ((b[2] - a[2]) || 1e-6);
      if (t < 0) t = 0; else if (t > 1) t = 1;
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    }
    function fillRings(e) {
      for (var r = e.r0; r < e.r1; r++) {
        if (rSkip[r] || !RVg[r]) continue;
        var s = rStart[r], n = rLen[r];
        if (n < 3) continue;
        var started = false;
        for (var i = 0; i < n; i++) {
          var j = s + i, jn = s + ((i + 1) % n), a = ZV[j], b = ZV[jn], p;
          if (!a && !b) continue;
          if (!started) {
            if (a) ctx.moveTo(SX[j], SY[j]);
            else { p = limbXY(j, jn); ctx.moveTo(p[0], p[1]); }
            started = true;
          } else if (a) ctx.lineTo(SX[j], SY[j]);
          else { p = limbXY(j, jn); ctx.lineTo(p[0], p[1]); }
          if (a && b) ctx.lineTo(SX[jn], SY[jn]);
          else if (a && !b) { p = limbXY(j, jn); ctx.lineTo(p[0], p[1]); }
        }
        if (started) ctx.closePath();
      }
    }
    function projHundreds(x, y) {
      var lo = x * D2R, la = y * D2R, X = Math.cos(la) * Math.sin(lo), Y = Math.sin(la), Z = Math.cos(la) * Math.cos(lo);
      var x1 = X * cl - Z * sl, zz = X * sl + Z * cl, y2 = Y * cp - zz * sp, z = Y * sp + zz * cp;
      if (z <= 0.02) return null;
      return [cx + R * x1, cy - R * y2];
    }
    function strokeRings(e, min2) {
      min2 = min2 || 0;
      for (var r = e.r0; r < e.r1; r++) {
        if (rSkip[r] || !RVg[r]) continue;
        var s = rStart[r], n = rLen[r], i, a, b, cut, drawing = false, px = 0, py = 0, x, y, dx, dy, k, p0, p1;
        for (i = 0; i < n; i++) {
          a = s + i; b = s + ((i + 1) % n);
          cut = e.L === "W" ? edgeCut[a] : undefined;
          if (cut) {
            drawing = false;
            for (k = 0; k < cut.length; k += 2) {
              p0 = projHundreds(LX[a] + (LX[b] - LX[a]) * cut[k], LY[a] + (LY[b] - LY[a]) * cut[k]);
              p1 = projHundreds(LX[a] + (LX[b] - LX[a]) * cut[k + 1], LY[a] + (LY[b] - LY[a]) * cut[k + 1]);
              if (!p0 || !p1) continue;
              ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]);
            }
            continue;
          }
          if (!ZV[a] || !ZV[b]) { drawing = false; continue; }
          if (!drawing) { ctx.moveTo(SX[a], SY[a]); drawing = true; px = SX[a]; py = SY[a]; }
          x = SX[b]; y = SY[b];
          if (min2) { dx = x - px; dy = y - py; if (dx * dx + dy * dy < min2 && i < n - 1) continue; }
          ctx.lineTo(x, y); px = x; py = y;
        }
      }
    }
    function fillGeo(iso){
      var rings=countryRings(iso), r, i, n, lo, la, X, Y, Z, x1, zz, y2, zc, pts, a, b, p, started;
      if(!rings.length) return false;
      function proj(pt){
        lo=pt[0]*PI/180; la=pt[1]*PI/180;
        X=Math.cos(la)*Math.sin(lo); Y=Math.sin(la); Z=Math.cos(la)*Math.cos(lo);
        x1=X*cl-Z*sl; zz=X*sl+Z*cl; y2=Y*cp-zz*sp; zc=Y*sp+zz*cp;
        return {x:cx+R*x1, y:cy-R*y2, z:zc};
      }
      function mid(u, v){
        var t=(0.025-u.z)/((v.z-u.z)||1e-6);
        if(t<0) t=0; else if(t>1) t=1;
        return {x:u.x+(v.x-u.x)*t, y:u.y+(v.y-u.y)*t};
      }
      ctx.beginPath();
      for(r=0;r<rings.length;r++){
        n=rings[r].length;
        if(n<3) continue;
        pts=[];
        for(i=0;i<n;i++) pts.push(proj(rings[r][i]));
        started=false;
        for(i=0;i<n;i++){
          a=pts[i]; b=pts[(i+1)%n];
          if(a.z<=0.025 && b.z<=0.025) continue;
          if(!started){
            p=a.z>0.025?a:mid(a,b);
            ctx.moveTo(p.x, p.y);
            started=true;
          } else if(a.z>0.025) ctx.lineTo(a.x, a.y);
          else { p=mid(a,b); ctx.lineTo(p.x, p.y); }
          if(a.z>0.025 && b.z>0.025) ctx.lineTo(b.x, b.y);
          else if(a.z>0.025 && b.z<=0.025){ p=mid(a,b); ctx.lineTo(p.x, p.y); }
        }
        if(started) ctx.closePath();
      }
      return true;
    }
    function countryScreen(iso){
      var rings=countryRings(iso), ring, i, lo, la, X, Y, Z, x1, zz, y2, zc, sx, sy;
      var minx=1e9, miny=1e9, maxx=-1e9, maxy=-1e9, sx0=0, sy0=0, nFront=0;
      if(!rings.length) return null;
      ring=rings[0];
      for(i=0;i<ring.length;i++){
        lo=ring[i][0]*PI/180; la=ring[i][1]*PI/180;
        X=Math.cos(la)*Math.sin(lo); Y=Math.sin(la); Z=Math.cos(la)*Math.cos(lo);
        x1=X*cl-Z*sl; zz=X*sl+Z*cl; y2=Y*cp-zz*sp; zc=Y*sp+zz*cp;
        if(zc<=0.02) continue;
        sx=cx+R*x1; sy=cy-R*y2; nFront++;
        if(sx<minx) minx=sx; if(sx>maxx) maxx=sx;
        if(sy<miny) miny=sy; if(sy>maxy) maxy=sy;
        sx0+=sx; sy0+=sy;
      }
      if(!nFront) return null;
      return {x:sx0/nFront, y:sy0/nFront, small:(maxx-minx)<14 && (maxy-miny)<14};
    }
    function paintGlobeOverlays(){
      var ids=Object.keys(washIso), k;
      for(k in markC) if(ids.indexOf(k)<0) ids.push(k);
      ids.forEach(function(iso){
        if(!overlayWanted(iso)) return;
        if(!fillGeo(iso)) return;
        ctx.fillStyle=fillCountry(true);
        ctx.fill("nonzero");
        var dot=countryScreen(iso);
        if(dot && dot.small){
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, 6.5, 0, 2*PI);
          ctx.fillStyle=fillDot();
          ctx.fill();
          ctx.strokeStyle="rgba(90,56,12,.9)";
          ctx.lineWidth=1;
          ctx.stroke();
        }
      });
    }
    function draw(q, fast) {
      setCam();
      var glOn = bootGL();
      if (glOn) paintSphere();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      if (glOn) {
        try { if (gl) gl.flush(); ctx.drawImage(glcv, 0, 0); glcv.style.opacity = "0"; }
        catch (err) { glcv.style.opacity = "1"; }
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!glOn) {
        if (!gready) {
          ctx.fillStyle = "#96b8d0";
          ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * PI); ctx.fill();
        } else {
          initTex();
          if (tex) {
            relief(fast ? 0.85 : (q || hq()), !!fast);
            ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * PI); ctx.clip();
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = fast ? "low" : "high";
            ctx.drawImage(rbuf, 0, 0, cw, ch);
            ctx.restore();
          }
        }
      }
      if (!fast && !glOn) {
        var g = ctx.createRadialGradient(cx - R * 0.28, cy - R * 0.32, R * 0.15, cx, cy, R);
        g.addColorStop(0, "rgba(255,255,255,.07)"); g.addColorStop(0.72, "rgba(255,255,255,0)"); g.addColorStop(1, "rgba(0,20,40,.18)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * PI); ctx.fill();
        var atm = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.06);
        atm.addColorStop(0, "rgba(150,196,230,0)");
        atm.addColorStop(0.72, "rgba(150,196,230,.28)");
        atm.addColorStop(1, "rgba(150,196,230,0)");
        ctx.fillStyle = atm; ctx.beginPath(); ctx.arc(cx, cy, R * 1.06, 0, 2 * PI); ctx.fill();
      }
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * PI);
      ctx.strokeStyle = "rgba(170,200,230,.45)"; ctx.lineWidth = fast ? 1.5 : 2.2; ctx.stroke();
      var stride = 1;
      project(stride); stampIso(); ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * PI); ctx.clip();
      byLayer.W.forEach(function (i) {
        var e = ents[i];
        if (e.name === "Украина") {
          if (!(litCountry(e) || markC.UA || washIso.UA)) return;
          projectFull(e);
          ctx.beginPath(); fillRings(e); ctx.fillStyle = fillCountry(); ctx.fill("evenodd");
          return;
        }
        if (!litCountry(e)) return;
        projectFull(e);
        ctx.beginPath(); fillRings(e); ctx.fillStyle = fillCountry(); ctx.fill("evenodd");
      });
      if (washIso.RU || markC.RU) {
        byLayer.R.forEach(function (i) {
          var e = ents[i];
          projectFull(e);
          ctx.beginPath(); fillRings(e); ctx.fillStyle = fillCountry(); ctx.fill("evenodd");
        });
      }
      ["R", "C", "G"].forEach(function (L) {
        byLayer[L].forEach(function (i) {
          var e = ents[i];
          if (!regionMarked(e)) return;
          projectFull(e);
          ctx.beginPath(); fillRings(e);
          ctx.fillStyle = fillRegion();
          ctx.fill("evenodd");
        });
      });
      ([[hoverEnt, "rgba(255,248,220,.66)"], [selEnt, "rgba(255,214,140,.72)"]] as [number, string][]).forEach(function (h) {
        if (h[0] < 0) return;
        var e = ents[h[0]], hi, host, hosts = hostEntities(e);
        for (hi = 0; hi < hosts.length; hi++) {
          host = hosts[hi];
          if (e.L !== "W" && host === e) continue;
          if (host.name === "Украина" && fillGeo("UA")) {
            ctx.fillStyle = e.L === "W" ? h[1] : "rgba(125,198,255,.48)";
            ctx.fill("evenodd");
            continue;
          }
          projectFull(host);
          ctx.beginPath(); fillRings(host);
          ctx.fillStyle = e.L === "W" ? h[1] : "rgba(125,198,255,.48)";
          ctx.fill("evenodd");
        }
        if (e.L === "W") return;
        if (e.name === "Украина" && fillGeo("UA")) {
          ctx.fillStyle = h[1]; ctx.fill("evenodd");
          return;
        }
        projectFull(e);
        ctx.beginPath(); fillRings(e); ctx.fillStyle = h[1]; ctx.fill("evenodd");
      });
      paintGlobeOverlays();
      (function strokeNets() {
        var layers = views.flat.netLayers();
        if (!layers) return;
        layers.forEach(function (L) {
          if (!views.flat.netOn(L.key)) return;
          var need = (L.key === "rv" ? [0.7, 1.15, 1.7, 2.3] : [1.05, 1.7, 2.6, 3.8])[L.rank || 0] || 4;
          if (zoom < need) return;
          views.flat.ensure(L);
          if (!L.gx) return;
          ctx.beginPath();
          ctx.lineCap = "round"; ctx.lineJoin = "round";
          for (var i = 0; i < L.n; i++) {
            var s = L.ps[i], m = L.pl[i], prev = null, j, la, lo, X, Y, Z, x1, zz, y2, zc, cur, t;
            for (j = 0; j < m; j++) {
              la = L.gy[s + j] * PI / 180; lo = L.gx[s + j] * PI / 180;
              X = Math.cos(la) * Math.sin(lo); Y = Math.sin(la); Z = Math.cos(la) * Math.cos(lo);
              x1 = X * cl - Z * sl; zz = X * sl + Z * cl; y2 = Y * cp - zz * sp; zc = Y * sp + zz * cp;
              cur = { x: cx + R * x1, y: cy - R * y2, z: zc };
              if (!prev) {
                prev = cur;
                if (cur.z > 0.03) ctx.moveTo(cur.x, cur.y);
                continue;
              }
              if (prev.z > 0.03 && cur.z > 0.03) {
                ctx.lineTo(cur.x, cur.y);
              } else if (prev.z > 0.03 || cur.z > 0.03) {
                t = (0.03 - prev.z) / ((cur.z - prev.z) || 1e-6);
                if (t < 0) t = 0; else if (t > 1) t = 1;
                var px = prev.x + (cur.x - prev.x) * t, py = prev.y + (cur.y - prev.y) * t;
                if (prev.z > 0.03) ctx.lineTo(px, py);
                else { ctx.moveTo(px, py); if (cur.z > 0.03) ctx.lineTo(cur.x, cur.y); }
              }
              prev = cur;
            }
          }
          ctx.strokeStyle = L.style.c; ctx.globalAlpha = L.style.a * 0.9; ctx.lineWidth = (L.style.w || 0.8) + zoom * 0.12;
          ctx.setLineDash([]); ctx.stroke();
          ctx.globalAlpha = 1;
        });
      })();
      var sh = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.15, cx, cy, R); sh.addColorStop(0, "rgba(255,255,255,.06)"); sh.addColorStop(0.65, "rgba(0,0,0,0)"); sh.addColorStop(1, "rgba(0,0,0,.30)");
      ctx.fillStyle = sh; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * PI); ctx.fill(); ctx.restore();
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * PI); ctx.strokeStyle = "rgba(0,0,0,.45)"; ctx.lineWidth = 1.5; ctx.stroke();
      if (hooks.paint) { ctx.setTransform(dpr, 0, 0, dpr, 0, 0); hooks.paint(ctx); }
    }
    function redraw() { if (mode === "globe") draw(hq(), false); }
    function schedule() { if (raf) return; raf = requestAnimationFrame(function () { raf = 0; if (mode !== "globe") return; var drag = moving || spinning; draw(drag ? 0.45 : hq(), drag); if (spinning) { lon0 += 0.25; schedule(); } }); }
    function settle() { clearTimeout(idle); idle = setTimeout(function () { moving = 0; if (!spinning) redraw(); }, 160); }
    function pick(px, py) {
      setCam(); var nx = (px - cx) / R, ny = (cy - py) / R, r2 = nx * nx + ny * ny; if (r2 >= 1) return -1;
      var nz = Math.sqrt(1 - r2), Y = ny * cp + nz * sp, z1 = -ny * sp + nz * cp, X = nx * cl + z1 * sl, Z = -nx * sl + z1 * cl;
      return pickLL(Math.atan2(X, Z) / D2R, Math.asin(Y) / D2R);
    }
    function local(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    function stopSpin() { spinning = false; }
    function llFromPx(px, py) {
      setCam(); var nx = (px - cx) / R, ny = (cy - py) / R, r2 = nx * nx + ny * ny; if (r2 >= 1) return null;
      var nz = Math.sqrt(1 - r2), Y = ny * cp + nz * sp, z1 = -ny * sp + nz * cp, X = nx * cl + z1 * sl, Z = -nx * sl + z1 * cl;
      return { lat: Math.asin(Math.max(-1, Math.min(1, Y))) * 180 / PI, lng: Math.atan2(X, Z) * 180 / PI };
    }
    var ptrs = {} as any, last = null, moved = 0, pinch = 0;
    cv.addEventListener("pointerdown", function (e) { ptrs[e.pointerId] = e; moved = 0; cv.setPointerCapture(e.pointerId); last = { x: e.clientX, y: e.clientY }; var ids = Object.keys(ptrs); if (ids.length === 2) pinch = pinchDist(ptrs[ids[0]], ptrs[ids[1]]); });
    cv.addEventListener("pointermove", function (e) {
      if (!ptrs[e.pointerId]) { hover(e); return; }
      ptrs[e.pointerId] = e; var ids = Object.keys(ptrs); stopSpin();
      if (ids.length === 2) { var d = pinchDist(ptrs[ids[0]], ptrs[ids[1]]); if (pinch) zoom = Math.max(1, Math.min(6, zoom * d / pinch)); pinch = d; moved = 99; moving = 1; schedule(); settle(); return; }
      var dx = e.clientX - last.x, dy = e.clientY - last.y; moved += Math.abs(dx) + Math.abs(dy);
      if (moved > 4) { cv.classList.add("drag"); tip.style.opacity = 0; }
      var kq = 57.3 / R; lon0 -= dx * kq; lat0 = Math.max(-85, Math.min(85, lat0 + dy * kq)); last = { x: e.clientX, y: e.clientY }; moving = 1; schedule(); settle(); if (hooks.move) hooks.move();
    });
    function end(e) { delete ptrs[e.pointerId]; pinch = 0; cv.classList.remove("drag"); var ids = Object.keys(ptrs); if (ids.length === 1) last = { x: ptrs[ids[0]].clientX, y: ptrs[ids[0]].clientY }; if (!ids.length) { moving = 0; redraw(); } }
    var gLastTap = 0, gLastPt = null, gTapTimer = 0;
    cv.addEventListener("pointerup", function (e) {
      var click = moved <= 4, p = local(e); end(e);
      if (click) {
        var now = Date.now();
        var near = gLastPt && Math.abs(p.x - gLastPt.x) < 32 && Math.abs(p.y - gLastPt.y) < 32;
        if (near && now - gLastTap < 320) {
          clearTimeout(gTapTimer); gLastTap = 0; gLastPt = null;
          zoom = Math.max(1, Math.min(6, zoom * 1.7));
          moving = 1; schedule(); settle();
          return;
        }
        gLastTap = now; gLastPt = p;
        clearTimeout(gTapTimer);
        gTapTimer = setTimeout(function () {
          var q = llFromPx(p.x, p.y); if (q && hooks.click) hooks.click({ lat: q.lat, lng: q.lng, x: p.x, y: p.y }); redraw();
        }, 280);
      }
      if (hooks.afterView) hooks.afterView();
    });
    cv.addEventListener("pointercancel", end);
    cv.addEventListener("pointerleave", function () { tip.style.opacity = 0; if (hoverEnt >= 0) { hoverEnt = -1; redraw(); } });
    cv.addEventListener("wheel", function (e) { e.preventDefault(); zoom = Math.max(1, Math.min(6, zoom * Math.exp(-e.deltaY * 0.0015))); moving = 1; schedule(); settle(); if (hooks.afterView) hooks.afterView(); }, { passive: false });
    function hover(e) {
      if (e.pointerType === "touch") return; var p = local(e), i = pick(p.x, p.y);
      if (i !== hoverEnt) { hoverEnt = i; schedule(); } showTip(tip, box, e, i);
    }
    var fly = 0;
    function flyTo(lo, la, z) {
      cancelAnimationFrame(fly); stopSpin();
      var a = { lon: lon0, lat: lat0, z: zoom }, t0 = performance.now(), dl = ((lo - a.lon + 540) % 360) - 180;
      (function step(now) {
        var t = Math.min(1, (now - t0) / 700), e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        lon0 = a.lon + dl * e; lat0 = a.lat + (la - a.lat) * e; zoom = a.z + (z - a.z) * e; draw(t < 1 ? 0.4 : hq(), t < 1); if (t < 1) fly = requestAnimationFrame(step);
      })(t0);
    }
    return {
      resize: resize, draw: redraw, flyTo: flyTo,
      zoomBy: function (f) { zoom = Math.max(1, Math.min(6, zoom * f)); redraw(); if (hooks.afterView) hooks.afterView(); },
      projectLL: function (lat, lng) {
        setCam(); var lo = lng * PI / 180, la = lat * PI / 180, X = Math.cos(la) * Math.sin(lo), Y = Math.sin(la), Z = Math.cos(la) * Math.cos(lo);
        var x1 = X * cl - Z * sl, zz = X * sl + Z * cl, y2 = Y * cp - zz * sp, z = Y * sp + zz * cp;
        if (z <= 0.02) return null; return { x: cx + R * x1, y: cy - R * y2 };
      },
      getSize: function () { return { x: cw, y: ch }; },
      getCenter: function () { return { lon: lon0, lat: lat0, z: zoom }; },
      setCenter: function (lon, lat, z) { lon0 = lon; lat0 = Math.max(-85, Math.min(85, lat)); zoom = Math.max(1, Math.min(6, z || 1)); },
      glance: function (lon, lat) { lon0 = lon; lat0 = Math.max(-70, Math.min(70, lat)); moving = 1; schedule(); settle(); }
    };
  })();

  // ===================== переключение режимов =====================
  function setMode(m) {
    if (m !== "flat" && m !== "globe") m = "flat";
    var from = views[mode], to = views[m], c = null, z = null;
    if (m !== mode) {
      c = from.getCenter();
      z = m === "globe" ? Math.min(6, 1 + Math.log(Math.max(1, c.z)) / Math.LN2 * 1.2) : Math.max(views.flat.kMin(), Math.pow(2, (c.z - 1) / 1.2));
    }
    $("flatBox").hidden = m !== "flat";
    $("globeBox").hidden = m !== "globe";
    root.style.background = m === "globe" ? "#16324a" : "#4e8cb2";
    mode = m; hoverEnt = -1;
    requestAnimationFrame(function () {
      to.resize();
      if (c) to.setCenter(c.lon, c.lat, z);
      to.draw();
    });
  }
  function tagOne(e) {
    if (e._tag || typeof countryAt !== "function") return;
    var iso = null, rid = null, lat = null, lng = null, r = e.r0;
    if (rCy[r] != null) { lat = Math.asin(Math.max(-1, Math.min(1, rCy[r]))) * 180 / PI; lng = Math.atan2(rCx[r], rCz[r]) * 180 / PI; }
    function probe(la, ln) {
      var id = countryAt(la, ln); if (!id) return;
      iso = id; if (typeof regionIn === "function") rid = regionIn(id, la, ln);
    }
    if (lat != null) probe(lat, lng);
    if (!iso) {
      var s0 = rStart[e.r0], n = rLen[e.r0], step = Math.max(1, Math.floor(n / 6)), t;
      for (t = 0; t < n && !iso; t += step) probe(LY[s0 + t] / 100, LX[s0 + t] / 100);
    }
    if (iso && !e.iso) e.iso = iso; if (rid) e.rid = rid; if (e.iso) e._tag = 1;
  }
  function regionMarked(e) {
    if (!e) return false;
    var iso = e.iso || (e.L === "R" ? "RU" : (e.L === "C" ? "CN" : ""));
    return regionMatches(markR, { name: e.name, rid: e.rid, iso: iso, layer: e.L });
  }
  function isoOfName(name) {
    var n = String(name || "").toLowerCase().replace(/ё/g, "е");
    if (!n) return "";
    return nameIso[n] || "";
  }
  function nameClose(a, b) {
    if (a === b) return true;
    if (!a || !b || a.length < 5 || b.length < 5) return false;
    var short = a.length <= b.length ? a : b, long = a.length <= b.length ? b : a;
    if (long.length - short.length > 8) return false;
    var at = long.indexOf(short);
    if (at < 0) return false;
    var before = at === 0 || /[\s\-(«]/.test(long.charAt(at - 1));
    var afterCh = long.charAt(at + short.length);
    var after = !afterCh || /[\s\-),»]/.test(afterCh);
    if (before && after) return true;
    return at === 0 && long.length - short.length <= 3;
  }
  function litCountry(e) {
    if (!e) return false;
    var iso = e.iso || isoOfName(e.name);
    if (iso && !e.iso) e.iso = iso;
    return !!(iso && washIso[iso]);
  }
  function overlayWanted(iso) {
    if (!iso || iso === "RU" || iso === "CN") return false;
    if (!washIso[iso] && !markC[iso]) return false;
    var list = byLayer.W || [], i, e, span = -1;
    for (i = 0; i < list.length; i++) {
      e = ents[list[i]];
      if ((e.iso || isoOfName(e.name)) !== iso) continue;
      span = Math.max(e.bb[2] - e.bb[0], e.bb[3] - e.bb[1]);
      break;
    }
    return span < 0 || span < 320;
  }
  var isoEpoch = 0, isoDone = -1;
  function stampIso() {
    if (isoDone === isoEpoch) return 0;
    isoDone = isoEpoch;
    var list = countryList;
    var by = {
      "россия": "RU", "российская федерация": "RU", "украина": "UA",
      "китай": "CN", "китайская народная республика": "CN",
      "соединенные штаты": "US", "соединенные штаты америки": "US", "сша": "US",
      "великобритания": "GB", "соединенное королевство": "GB",
      "беларусь": "BY", "белоруссия": "BY", "казахстан": "KZ", "турция": "TR", "таиланд": "TH",
      "франция": "FR", "германия": "DE", "италия": "IT", "испания": "ES",
      "польша": "PL", "япония": "JP", "индия": "IN", "вьетнам": "VN",
      "египет": "EG", "литва": "LT", "латвия": "LV", "эстония": "EE",
      "армения": "AM", "грузия": "GE", "молдова": "MD", "болгария": "BG",
      "финляндия": "FI", "швеция": "SE", "норвегия": "NO", "дания": "DK",
      "словения": "SI", "оаэ": "AE", "объединенные арабские эмираты": "AE",
      "индонезия": "ID", "малайзия": "MY", "иран": "IR", "бразилия": "BR",
      "канада": "CA", "австралия": "AU", "аргентина": "AR", "мексика": "MX"
    }, i, n, added = 0, k;
    if (list && list.length) {
      for (i = 0; i < list.length; i++) {
        n = String(list[i].n || "").toLowerCase().replace(/ё/g, "е");
        if (n && list[i].i) by[n] = list[i].i;
      }
    }
    ents.forEach(function (e) {
      var label = String((e.L === "W" ? e.name : (e.sub || e.name)) || "").toLowerCase().replace(/ё/g, "е");
      var iso = by[label] || "";
      if (!iso && e.L === "W" && label) {
        for (k in by) if (nameClose(label, k)) { iso = by[k]; break; }
      }
      if (e.L === "R" || label === "россия") iso = "RU";
      if (e.L === "C" || label.indexOf("китай") === 0) iso = "CN";
      if (iso && e.iso !== iso) { e.iso = iso; added++; }
    });
    nameIso = by;
    return added;
  }
  function rebuildWash() {
    washIso = {} as any;
    Object.keys(markC).forEach(function (id) { washIso[id] = 1; });
    ["R", "C", "G"].forEach(function (L) {
      (byLayer[L] || []).forEach(function (i) {
        var r = ents[i];
        if (!regionMarked(r)) return;
        if (r.iso && (r.L === "R" || r.L === "C")) washIso[r.iso] = 1;
        if (r.L === "R" || r.sub === "Россия") washIso.RU = 1;
        if (r.L === "C" || r.sub === "Китай") washIso.CN = 1;
      });
    });
  }
  var visitSig = "";
  function setVisited(countries, regions, tone) {
    visitTone = tone === "future" ? "future" : "past";
    var painted = countriesToPaint(countries || [], regions || []);
    var sig = visitTone + "|" + painted.join("\n") + "|" + (regions || []).join("\n");
    if (sig === visitSig) {
      if (stampIso()) { rebuildWash(); markRev++; views.flat.draw(); if (mode === "globe") views.globe.draw(); }
      return;
    }
    visitSig = sig;
    markC = {} as any; markR = {} as any; markRev++;
    (painted || []).forEach(function (id) {
      if (!id) return;
      markC[id] = 1;
      markC[String(id).toUpperCase()] = 1;
    });
    (regions || []).forEach(function (id) {
      if (!id) return;
      markR[id] = 1;
    });
    stampIso();
    rebuildWash();
    views.flat.draw();
    if (mode === "globe") views.globe.draw();
  }
  function buildFacade() {
    var pane = document.getElementById("atlas-html");
    var facade: any = { _isAtlas: true, _groups: [], _extras: [], _on: {}, _airports: null };
    facade._atlasApi = { setMode: setMode, setVisited: setVisited, redraw: function () { views[mode].draw(); } };
    function emit(name, ev?) { (facade._on[name] || []).forEach(function (fn) { try { fn(ev || {}); } catch (err) { console.error(err); } }); }
    var pending = 0;
    function afterView() {
      if (pending) return; pending = 1;
      requestAnimationFrame(function () { pending = 0; emit("move"); emit("moveend"); emit("zoomend"); });
    }
    hooks.afterView = afterView;
    hooks.move = function () { emit("move"); };
    hooks.click = function (p) { emit("click", { latlng: { lat: p.lat, lng: p.lng }, containerPoint: { x: p.x, y: p.y } }); emit("moveend"); };
    function project(lat, lng) {
      if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) return null;
      return mode === "globe" ? views.globe.projectLL(lat, lng) : views.flat.projectLL(lat, lng);
    }
    function size() { return (mode === "globe" ? views.globe : views.flat).getSize(); }
    function zoomFromK(k) { return Math.log(k / views.flat.kMin()) / Math.LN2 + 2; }
    function kFromZoom(z) { return views.flat.kMin() * Math.pow(2, (z || 2) - 2); }
    facade.project = project;
    facade.getZoom = function () { return mode === "globe" ? 2 + views.globe.getCenter().z * 1.4 : zoomFromK(views.flat.getK()); };
    facade.getMinZoom = function () { return 2; };
    facade.getMaxZoom = function () { return 9; };
    facade.zoomIn = function () { if (mode === "globe") views.globe.zoomBy(1.45); else { var s = size(); views.flat.zoomAt(s.x / 2, s.y / 2, 1.6); } };
    facade.zoomOut = function () { if (mode === "globe") views.globe.zoomBy(1 / 1.45); else { var s = size(); views.flat.zoomAt(s.x / 2, s.y / 2, 1 / 1.6); } };
    facade.setZoom = function (z) { var c = this.getCenter(); this.setView([c.lat, c.lng], z); };
    facade.getSize = function () { var s = size(); return { x: s.x, y: s.y }; };
    facade.getCenter = function () { var c = (mode === "globe" ? views.globe : views.flat).getCenter(); return { lat: c.lat, lng: c.lon }; };
    facade.getContainer = function () { return root; };
    facade.getPane = function (name) { return facade._panes && facade._panes[name] || null; };
    facade.createPane = function (name) { facade._panes = facade._panes || {}; var d = document.createElement("div"); facade._panes[name] = d; return d; };
    facade.invalidateSize = function () { views.flat.resize(); views.globe.resize(); views[mode].draw(); };
    facade.on = function (ev, fn) { (facade._on[ev] = facade._on[ev] || []).push(fn); return facade; };
    facade.latLngToContainerPoint = function (ll) {
      var lat = ll && ll.lat != null ? ll.lat : ll[0], lng = ll && ll.lng != null ? ll.lng : ll[1];
      var p = project(lat, lng); if (!p) return { x: 0, y: 0, hidden: true }; return p;
    };
    facade.containerPointToLatLng = function (pt) {
      if (mode === "globe") return { lat: 0, lng: 0 };
      return views.flat.unproject(pt.x, pt.y) || { lat: 0, lng: 0 };
    };
    function boundsOf() {
      var south = 90, north = -90, west = 180, east = -180, s = size(), pts, i, q, ok = 0;
      if (mode === "globe") {
        var c = views.globe.getCenter(), span = 70 / Math.max(1, c.z);
        south = c.lat - span; north = c.lat + span; west = c.lon - span; east = c.lon + span;
      } else {
        pts = [[8, 8], [s.x - 8, 8], [8, s.y - 8], [s.x - 8, s.y - 8], [s.x / 2, s.y / 2]];
        for (i = 0; i < pts.length; i++) {
          q = views.flat.unproject(pts[i][0], pts[i][1]); if (!q) continue; ok++;
          if (q.lat < south) south = q.lat; if (q.lat > north) north = q.lat;
          if (q.lng < west) west = q.lng; if (q.lng > east) east = q.lng;
        }
        if (!ok) { south = -50; north = 70; west = -160; east = 180; }
      }
      return {
        getSouth: function () { return south; }, getNorth: function () { return north; },
        getWest: function () { return west; }, getEast: function () { return east; },
        contains: function (ll) {
          var lat = Array.isArray(ll) ? +ll[0] : +ll.lat, lng = Array.isArray(ll) ? +ll[1] : +ll.lng;
          return lat >= south && lat <= north && lng >= west && lng <= east;
        }
      };
    }
    facade.getBounds = boundsOf;
    facade.glance = function (lat, lng) { if (mode === "globe") views.globe.glance(lng, lat); else views.flat.glance(lng, lat); };
    facade.setView = function (ll, zoom) {
      var lat = Array.isArray(ll) ? +ll[0] : +ll.lat, lng = Array.isArray(ll) ? +ll[1] : +ll.lng;
      if (mode === "globe") { views.globe.setCenter(lng, lat, Math.max(1, Math.min(6, (zoom - 2) / 1.3 + 1))); views.globe.draw(); }
      else views.flat.setCenter(lng, lat, kFromZoom(zoom));
      afterView();
    };
    facade.fitBounds = function (pts, opts) {
      opts = opts || {};
      var pad = opts.padding || [24, 24], padX = pad[0] || 20, padY = pad[1] == null ? padX : pad[1];
      var lls = [];
      function add(p) {
        if (!p) return;
        if (Array.isArray(p) && p.length && (Array.isArray(p[0]) || (p[0] && typeof p[0] === "object" && p[0].lat != null && p.length > 2))) { p.forEach(add); return; }
        if (Array.isArray(p)) lls.push([+p[0], +p[1]]);
        else if (p.lat != null) lls.push([+p.lat, +p.lng]);
      }
      add(pts);
      if (lls.length < 1) return;
      if (mode === "globe") {
        var la = 0, lo = 0; lls.forEach(function (p) { la += p[0]; lo += p[1]; });
        views.globe.flyTo(lo / lls.length, la / lls.length, Math.min(4, opts.maxZoom ? (opts.maxZoom - 2) / 1.5 + 1 : 2.4));
        afterView(); return;
      }
      var minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9, s = views.flat.getSize();
      lls.forEach(function (ll) {
        var f = views.flat.flatOf(ll[0], ll[1]); if (!f) return;
        if (f[0] < minX) minX = f[0]; if (f[1] < minY) minY = f[1]; if (f[0] > maxX) maxX = f[0]; if (f[1] > maxY) maxY = f[1];
      });
      if (!(minX <= maxX)) return;
      var vw = Math.max(48, s.x - padX * 2), vh = Math.max(48, s.y - padY * 2);
      var dw = Math.max(8, maxX - minX), dh = Math.max(8, maxY - minY);
      var nk = Math.min(vw / dw, vh / dh) * 4000 / s.x;
      var cap = kFromZoom(opts.maxZoom || 8);
      if (nk > cap) nk = cap;
      views.flat.setCenterFromFlat((minX + maxX) / 2, (minY + maxY) / 2, nk);
      afterView();
    };
    facade.setAirports = function () { facade._airports = null; };
    facade.regionAt = function (lat, lng) {
      if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) return null;
      var i = pickLL(Math.round(lng * 100), Math.round(lat * 100));
      if (i < 0) return null;
      var e = ents[i];
      return { layer: e.L, name: e.name || "", sub: e.sub || "", iso: entityIso(e) || e.iso || null };
    };
    facade.collectRegions = function (skip) {
      skip = skip || {};
      var out = [], seen = {} as any;
      ["R", "C", "G"].forEach(function (L) {
        (byLayer[L] || []).forEach(function (i) {
          var e = ents[i], iso = entityIso(e);
          if (!iso || !e.name || skip[iso]) return;
          var id = iso + ":" + e.name;
          if (seen[id]) return;
          seen[id] = 1;
          var rings = [], r, s, n, t, ring;
          for (r = e.r0; r < e.r1; r++) {
            s = rStart[r]; n = rLen[r]; ring = [];
            for (t = 0; t < n; t++) ring.push([LX[s + t] / 100, LY[s + t] / 100]);
            if (ring.length > 2) rings.push(ring);
          }
          if (!rings.length) return;
          out.push({
            id: id, n: e.name, c: iso,
            b: [e.bb[1] / 100, e.bb[0] / 100, e.bb[3] / 100, e.bb[2] / 100],
            p: rings
          });
        });
      });
      return out;
    };
    var netWait = {} as any;
    var netWant = { rd: false, rl: false };
    function refreshMap() { views.flat.draw(); if (mode === "globe") views.globe.draw(); }
    facade.setNetwork = function (opts) {
      opts = opts || {};
      function one(key, on) {
        netWant[key] = !!on;
        function ready(data) {
          if (data) views.flat.addNet(key, data);
          if (views.flat.warm) views.flat.warm(key);
          views.flat.setShow(key, !!netWant[key]);
          if(key==="rd" && window.__onRoads) window.__onRoads();
        }
        var bag = key === "rd" ? window.ATLAS_ROADS : window.ATLAS_RAILS;
        if (bag) { ready(bag); return; }
        if (netWait[key]) { views.flat.setShow(key, !!on); return; }
        netWait[key] = 1;
        var s = document.createElement("script");
        s.src = key === "rd" ? "geo/roads.js?v=46" : "geo/rails.js?v=46";
        s.onload = function () { ready(key === "rd" ? window.ATLAS_ROADS : window.ATLAS_RAILS); };
        s.onerror = function () { netWait[key] = 0; };
        document.head.appendChild(s);
      }
      if ("roads" in opts) one("rd", !!opts.roads);
      if ("rails" in opts) one("rl", !!opts.rails);
    };
    facade.prepareNetwork = function () { facade.setNetwork({ roads: false, rails: false }); };
    facade.traceNetwork = function (modeName, lat1, lng1, lat2, lng2) {
      if (!views.flat.trace) return null;
      return views.flat.trace(modeName === "train" ? "rl" : "rd", lat1, lng1, lat2, lng2);
    };
    facade.networkOn = function () { return { roads: views.flat.netOn("rd"), rails: views.flat.netOn("rl") }; };
    facade.setMode = function (m) { setMode(m); };
    facade.setVisited = setVisited;
    function redraw() { views[mode].draw(); }
    facade._paint = redraw;
    facade.addLayer = function (l) {
      if (!l) return facade;
      if (l._isGroup) {
        if (facade._groups.indexOf(l) < 0) facade._groups.push(l);
        l._map = facade;
        (l._layers || []).forEach(function (x) { if (x) x._map = facade; });
      } else { facade._extras.push(l); l._map = facade; }
      redraw(); return facade;
    };
    facade.removeLayer = function (l) {
      var i = facade._groups.indexOf(l); if (i >= 0) facade._groups.splice(i, 1);
      i = facade._extras.indexOf(l); if (i >= 0) facade._extras.splice(i, 1);
      if (l && l._el && l._el.parentNode) l._el.parentNode.removeChild(l._el);
      if (l && l._layers) l._layers.forEach(function (x) { if (x._el && x._el.parentNode) x._el.parentNode.removeChild(x._el); });
      redraw();
    };
    hooks.paint = function (ctx) { paintAll(ctx); };
    function eachFeat(fn) {
      facade._groups.forEach(function (g) { (g._layers || []).forEach(fn); });
      facade._extras.forEach(fn);
    }
    function llOf(p) {
      if (!p) return null;
      if (Array.isArray(p)) return [+p[0], +p[1]];
      if (p.lat != null) return [+p.lat, +p.lng];
      return null;
    }
    function paintAll(ctx) {
      ctx.save();
      eachFeat(function (f) { if (f && f.kind !== "marker") strokeFeat(ctx, f); });
      ctx.restore();
      eachFeat(function (f) { if (f && f.kind === "marker") placeMarker(f); });
    }
    function strokeFeat(ctx, f) {
      var st = f.style || {};
      if (f.kind === "line") {
        var pts = f.ll || [], started = false, i, ll, p;
        ctx.beginPath();
        for (i = 0; i < pts.length; i++) {
          ll = llOf(pts[i]); if (!ll) continue; p = project(ll[0], ll[1]);
          if (!p) { started = false; continue; }
          if (!started) { ctx.moveTo(p.x, p.y); started = true; } else ctx.lineTo(p.x, p.y);
        }
        if (!started) return;
        ctx.strokeStyle = st.color || "#38f";
        ctx.globalAlpha = st.opacity == null ? 1 : st.opacity;
        ctx.lineWidth = st.weight || 2; ctx.lineJoin = "round"; ctx.lineCap = "round";
        if (st.dashArray) ctx.setLineDash(String(st.dashArray).split(/[ ,]+/).map(Number)); else ctx.setLineDash([]);
        ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
      } else if (f.kind === "circleMarker" || f.kind === "circle") {
        var one = llOf(f.ll); if (!one) return; var q = project(one[0], one[1]); if (!q) return;
        var rad = st.radius || 4;
        if (f.kind === "circle") {
          var kk = mode === "globe" ? 6 : (views.flat.getSize().x / 4000 * views.flat.getK());
          var mPerPx = 10019 / Math.max(0.15, kk);
          rad = Math.max(3, (st.radius || 0) / mPerPx);
        }
        ctx.beginPath(); ctx.arc(q.x, q.y, rad, 0, Math.PI * 2);
        ctx.globalAlpha = st.fillOpacity == null ? 0.9 : st.fillOpacity;
        ctx.fillStyle = st.fillColor || st.color || "#fff"; ctx.fill();
        ctx.globalAlpha = st.opacity == null ? 1 : st.opacity;
        ctx.lineWidth = st.weight || 1; ctx.strokeStyle = st.color || "#fff"; ctx.stroke(); ctx.globalAlpha = 1;
      } else if (f.kind === "polygon") {
        var rings = f.ll || [];
        if (rings.length && Array.isArray(rings[0]) && typeof rings[0][0] === "number") rings = [rings];
        ctx.beginPath();
        rings.forEach(function (ring) {
          if (!ring || !ring.length) return;
          var on = false;
          for (var pi = 0; pi < ring.length; pi++) {
            var ll = llOf(ring[pi]); if (!ll) continue; var p = project(ll[0], ll[1]); if (!p) continue;
            if (!on) { ctx.moveTo(p.x, p.y); on = true; } else ctx.lineTo(p.x, p.y);
          }
          if (on) ctx.closePath();
        });
        if (st.fillOpacity) { ctx.globalAlpha = st.fillOpacity; ctx.fillStyle = st.fillColor || st.color || "#ccc"; ctx.fill(); }
        if (st.weight) { ctx.globalAlpha = st.opacity == null ? 1 : st.opacity; ctx.lineWidth = st.weight; ctx.strokeStyle = st.color || "#333"; ctx.stroke(); }
        ctx.globalAlpha = 1;
      }
    }
    function placeMarker(f) {
      var ll = llOf(f.ll), p = ll ? project(ll[0], ll[1]) : null;
      if (!f._el) {
        f._el = document.createElement("div");
        f._el.style.position = "absolute"; f._el.style.pointerEvents = "none"; f._el.style.zIndex = "3";
        var ic = f.style && f.style.icon; f._el.innerHTML = (ic && ic.options && ic.options.html) || "";
        pane.appendChild(f._el);
      }
      if (!p) { f._el.style.display = "none"; return; }
      f._el.style.display = "block"; f._el.style.left = p.x + "px"; f._el.style.top = p.y + "px";
    }
    /* фигуры маршрутов: свой слой карты, не Leaflet */
    function Feat(kind, ll, style) { this.kind = kind; this.ll = ll; this.style = style || {}; }
    Feat.prototype.addTo = function (t) { if (t && t.addLayer) t.addLayer(this); return this; };
    Feat.prototype.setLatLng = function (ll) { this.ll = ll; if (this._map && this._map._paint) this._map._paint(); return this; };
    Feat.prototype.bringToFront = function () { return this; };
    Feat.prototype.bringToBack = function () { return this; };
    function Group() { this._isGroup = true; this._layers = []; this._map = null; }
    Group.prototype.addTo = function (m) { m.addLayer(this); return this; };
    Group.prototype.addLayer = function (l) {
      this._layers.push(l);
      if (l) l._map = this._map;
      if (this._map) this._map._paint();
      return this;
    };
    Group.prototype.clearLayers = function () {
      this._layers.forEach(function (l) { if (l && l._el && l._el.parentNode) l._el.parentNode.removeChild(l._el); });
      this._layers.length = 0; if (this._map) this._map._paint();
    };
    Group.prototype.bringToFront = function () { return this; };
    Group.prototype.bringToBack = function () { return this; };
    Group.prototype.removeLayer = function (l) {
      var i = this._layers.indexOf(l); if (i >= 0) this._layers.splice(i, 1);
      if (l && l._el && l._el.parentNode) l._el.parentNode.removeChild(l._el);
      if (this._map) this._map._paint();
    };
    facade.line = function (ll, st) { return new Feat("line", ll, st); };
    facade.polygon = function (ll, st) { return new Feat("polygon", ll, st); };
    facade.circle = function (ll, st) { return new Feat("circle", ll, st); };
    facade.dot = function (ll, st) { return new Feat("circleMarker", ll, st); };
    facade.pin = function (ll, st) { return new Feat("marker", ll, st); };
    facade.group = function () { return new Group(); };
    facade.htmlIcon = function (opts) { return { options: opts || {} }; };
    facade.setCountryList = function (list) {
      countryList = list || null;
      isoEpoch++;
      stampIso();
      rebuildWash();
      views.flat.draw();
      if (mode === "globe") views.globe.draw();
    };
    return facade;
  }
  if (window.ResizeObserver) new ResizeObserver(function () { views[mode].resize(); views[mode].draw(); }).observe(root);
  window.addEventListener("resize", function () { views[mode].resize(); views[mode].draw(); });
  views.flat.resize(); views.flat.draw();
  return { createMap: buildFacade, setVisited: setVisited, setMode: setMode };
})();
export var createMap = api.createMap;
export var setVisited = api.setVisited;
export var setMode = api.setMode;

