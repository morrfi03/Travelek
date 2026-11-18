
import { ATLAS_G as G } from "../geo/atlas-data.js";
import { countriesToPaint, regionMatches } from "./visit.js";
var api = (function () {
  var PI = Math.PI, D2R = PI / 18000;
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
  function ringInsideDNR_LNR(ring) {
    if (!ring || ring.length < 3) return false;
    var cx = 0, cy = 0, i;
    for (i = 0; i < ring.length; i++) { cx += ring[i][0]; cy += ring[i][1]; }
    cx /= ring.length; cy /= ring.length;
    var lo = cx * 100, la = cy * 100;
    var names = ["Донецкая Народная Республика", "Луганская Народная Республика"];
    for (var ni = 0; ni < names.length; ni++) {
      for (var ei = 0; ei < byLayer.R.length; ei++) {
        var e = ents[byLayer.R[ei]];
        if (e.name === names[ni] && inside(e, lo, la)) return true;
      }
    }
    return false;
  }
  function traceFlat(ctx, iso){
    var rings=countryRings(iso), r, i, p;
    if(!rings.length) return false;
    ctx.beginPath();
    for(r=0;r<rings.length;r++){
      if (iso === "UA" && ringInsideDNR_LNR(rings[r])) continue;
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
