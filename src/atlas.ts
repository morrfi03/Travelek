
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
