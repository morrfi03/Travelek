var visited=[];
var visitedRegions=[];
var manualCountries=[];
var offCountries=[];
var manualRegions=[];
var offRegions=[];
var autoCountries={};
var autoRegions={};
var regionScope="";
var countryLayer=null;
var COUNTRY_LIST=null;
var RUSSIA_REGIONS=null;
var CHINA_REGIONS=null;
function loadArr(key){
  try{ var a=JSON.parse(localStorage.getItem(key)||"[]"); return Array.isArray(a)?a:[]; }
  catch(e){ return []; }
}
function saveSets(){
  var pack=function(key, list){
    var s=JSON.stringify(list);
    if(typeof safeSetItem==="function") safeSetItem(key, s);
    else try{ localStorage.setItem(key, s); }catch(e){}
  };
  pack("travelek-countries", manualCountries);
  pack("travelek-countries-off", offCountries);
  pack("travelek-regions", manualRegions);
  pack("travelek-regions-off", offRegions);
}
function loadVisited(){ return manualCountries.slice(); }
function saveVisited(list){
  manualCountries=Array.isArray(list)?list.filter(function(x){ return typeof x==="string"; }):[];
  saveSets();
  if(typeof syncVisited==="function") syncVisited();
}
manualCountries=loadArr("travelek-countries");
offCountries=loadArr("travelek-countries-off");
function canonRegion(id){
  var alias={
    "Карачаево-Черкесская Республика":"Карачаево-Черкесия",
    "Республика Карелия":"Карелия",
    "Кемеровская область — Кузбасс":"Кемеровская область",
    "Республика Хакасия":"Хакасия",
    "Республика Адыгея":"Адыгея",
    "Чеченская Республика":"Чечня",
    "Чувашская Республика":"Чувашия",
    "Республика Дагестан":"Дагестан",
    "Республика Ингушетия":"Ингушетия",
    "Кабардино-Балкарская Республика":"Кабардино-Балкария",
    "Республика Калмыкия":"Калмыкия",
    "Республика Марий Эл":"Марий Эл",
    "Республика Мордовия":"Мордовия",
    "Республика Северная Осетия — Алания":"Республика Северная Осетия-Алания",
    "Республика Саха (Якутия)":"Якутия",
    "Республика Татарстан":"Татарстан",
    "Республика Тыва":"Тыва",
    "Удмуртская Республика":"Удмуртия",
    "Республика Бурятия":"Бурятия"
  };
  return alias[id]||id;
}
manualRegions=loadArr("travelek-regions").map(canonRegion);
offRegions=loadArr("travelek-regions-off");
function reloadVisited(){
  manualCountries=loadArr("travelek-countries");
  offCountries=loadArr("travelek-countries-off");
  manualRegions=loadArr("travelek-regions").map(canonRegion);
  offRegions=loadArr("travelek-regions-off");
  if(typeof syncVisited==="function") syncVisited();
  if(typeof drawCountries==="function") drawCountries();
  if(typeof renderCountryUi==="function") renderCountryUi();
  if(typeof render==="function") render();
}
window.__reloadVisited=reloadVisited;
(function migrateDiaryPlaces(){
  var iso={"FRA":"FR","NOR":"NO","KOS":"RS","XK":"RS","XKX":"RS"};
  var beforeC=manualCountries.join("\n"), beforeO=offCountries.join("\n"), beforeR=manualRegions.join("\n"), beforeRO=offRegions.join("\n");
  var hadTw=false;
  function mapC(id){
    if(id==="CN-TW"||id==="TW"||id==="TWN"){ hadTw=true; return "CN"; }
    return iso[id]||id;
  }
  function uniq(list){
    return list.filter(function(id,i,a){ return id && a.indexOf(id)===i; });
  }
  manualCountries=uniq(manualCountries.map(mapC));
  offCountries=uniq(offCountries.map(function(id){
    if(id==="CN-TW"||id==="TW"||id==="TWN") return "CN";
    return iso[id]||id;
  }));
  function mapR(id){
    if(id==="Тайвань"||id==="CN-TW"||id==="TW"||id==="TWN") return "CN:Тайвань";
    return id;
  }
  manualRegions=manualRegions.map(mapR);
  offRegions=offRegions.map(mapR);
  if(hadTw && manualRegions.indexOf("CN:Тайвань")<0) manualRegions.push("CN:Тайвань");
  if(beforeC!==manualCountries.join("\n")||beforeO!==offCountries.join("\n")||beforeR!==manualRegions.join("\n")||beforeRO!==offRegions.join("\n")) saveSets();
})();
function ringHas(ring, lat, lng){
  var inside=false, j=ring.length-1, i, xi, yi, xj, yj, den;
  for(i=0;i<ring.length;i++){
    xi=ring[i][0]; yi=ring[i][1]; xj=ring[j][0]; yj=ring[j][1];
    den=(yj-yi)||1e-12;
    if((yi>lat)!==(yj>lat) && lng < (xj-xi)*(lat-yi)/den+xi) inside=!inside;
    j=i;
  }
  return inside;
}
function polysOf(c){
  if(!c||!c.p||!c.p.length||!c.p[0]||!c.p[0][0]) return [];
  if(Array.isArray(c.p[0][0][0])) return c.p;
  return c.p.map(function(ring){ return [ring]; });
}
function polyHas(poly, lat, lng){
  if(!poly||!poly.length||!ringHas(poly[0], lat, lng)) return false;
  return true;
}
function countryAt(lat, lng){
  if(!COUNTRY_LIST) return null;
  var i, c, k, polys, region;
  region=regionAtList(RUSSIA_REGIONS, lat, lng, 0.08);
  if(region) return "RU";
  for(i=0;i<COUNTRY_LIST.length;i++){
    c=COUNTRY_LIST[i];
    if(c.i!=="RU") continue;
    polys=polysOf(c);
    for(k=0;k<polys.length;k++){ if(polyHas(polys[k], lat, lng)) return "RU"; }
  }
  for(i=0;i<COUNTRY_LIST.length;i++){
    c=COUNTRY_LIST[i];
    if(c.i==="RU") continue;
    polys=polysOf(c);
    for(k=0;k<polys.length;k++){ if(polyHas(polys[k], lat, lng)) return c.i; }
  }
  var near=null, nearD=0.06;
  for(i=0;i<COUNTRY_LIST.length;i++){
    c=COUNTRY_LIST[i];
    if(c.i==="RU") continue;
    if(c.b && (lat<c.b[0]-nearD || lat>c.b[2]+nearD || lng<c.b[1]-nearD || lng>c.b[3]+nearD)) continue;
    var dlt=regionEdgeDist(c, lat, lng);
    if(dlt<nearD){ nearD=dlt; near=c.i; }
  }
  return near;
}
function regionEdgeDist(reg, lat, lng){
  var polys=polysOf(reg), best=1e9, k, ring, i, a, b, dx, dy, den, t, d;
  for(k=0;k<polys.length;k++){
    ring=polys[k][0];
    if(!ring) continue;
    for(i=1;i<ring.length;i++){
      a=ring[i-1]; b=ring[i];
      dx=b[0]-a[0]; dy=b[1]-a[1];
      den=dx*dx+dy*dy;
      if(!den) d=Math.hypot(lng-a[0], lat-a[1]);
      else {
        t=Math.max(0, Math.min(1, ((lng-a[0])*dx+(lat-a[1])*dy)/den));
        d=Math.hypot(lng-(a[0]+t*dx), lat-(a[1]+t*dy));
      }
      if(d<best) best=d;
    }
  }
  return best;
}
function regionAtList(list, lat, lng, snap){
  if(!list) return null;
  var best=null, bestA=1e18, i, reg, b, area, polys, k, wraps;
  for(i=0;i<list.length;i++){
    reg=list[i];
    b=reg.b;
    wraps=b && (b[3]-b[1])>180;
    if(b){
      if(lat<b[0] || lat>b[2]) continue;
      if(!wraps && (lng<b[1] || lng>b[3])) continue;
    }
    polys=polysOf(reg);
    for(k=0;k<polys.length;k++){
      if(polyHas(polys[k], lat, lng)){
        area=(b[2]-b[0])*Math.min(360, b[3]-b[1]);
        if(area<bestA){ bestA=area; best=reg.id; }
        break;
      }
    }
  }
  if(!snap) return best;
  var near=null, nearD=snap, nearA=1e18, dlt;
  for(i=0;i<list.length;i++){
    reg=list[i];
    b=reg.b;
    if(!b) continue;
    wraps=b && (b[3]-b[1])>180;
    if(lat<b[0]-snap || lat>b[2]+snap) continue;
    if(!wraps && (lng<b[1]-snap || lng>b[3]+snap)) continue;
    dlt=regionEdgeDist(reg, lat, lng);
    area=(b[2]-b[0])*Math.min(360, Math.abs(b[3]-b[1]));
    if(dlt<=snap && (dlt<nearD-1e-6 || (Math.abs(dlt-nearD)<0.02 && area<nearA))){
      nearD=dlt; near=reg.id; nearA=area;
    }
  }
  if(near && (!best || nearA<bestA*0.5)) return near;
  return best;
}
function regionAt(lat, lng){ return regionAtList(RUSSIA_REGIONS, lat, lng, 0.11); }
function chinaRegionAt(lat, lng){ return regionAtList(CHINA_REGIONS, lat, lng, 0.11); }
function regionsFor(code){
  return (typeof REGIONS_BY!=="undefined" && REGIONS_BY && REGIONS_BY[code]) || null;
}
function regionIn(code, lat, lng){
  var list=regionsFor(code);
  if(!list) return null;
  return regionAtList(list, lat, lng, 0.2);
}

var hoverLayer=null, hoverKey="", pendingVisit=null;
function ensureHoverLayer(){
  if(!hoverLayer && typeof L!=="undefined" && typeof map!=="undefined") hoverLayer=L.layerGroup().addTo(map);
  return hoverLayer;
}
function countryRecord(id){
  if(!COUNTRY_LIST) return null;
  for(var i=0;i<COUNTRY_LIST.length;i++) if(COUNTRY_LIST[i].i===id) return COUNTRY_LIST[i];
  return null;
}
function regionRecord(id){
  if(!id || typeof REGIONS_BY==="undefined" || !REGIONS_BY) return null;
  var code, list, j;
  for(code in REGIONS_BY){
    list=REGIONS_BY[code];
    for(j=0;j<list.length;j++) if(list[j].id===id) return list[j];
  }
  return null;
}
function showMapHover(lat,lng,containerPoint){
  if(map && map._isAtlas) return;
  var cid=countryAt(lat,lng);
  var been=visited && visited.indexOf(cid)>=0;
  var rid=been && cid ? regionIn(cid, lat, lng) : null;
  var key=(cid||"")+"|"+(rid||"");
  var label=document.getElementById("map-hover-label");
  if(key===hoverKey){
    if(label && cid && containerPoint){label.style.display="block";label.style.left=(containerPoint.x+14)+"px";label.style.top=(containerPoint.y+14)+"px";}
    return;
  }
  hoverKey=key;
  var hl=ensureHoverLayer();
  if(hl) hl.clearLayers();
  if(!cid){
    if(label) label.style.display="none";
    return;
  }
  var c=countryRecord(cid);
  var cStyle={color:"#78b9ff",weight:2.2,opacity:.95,fillColor:"#5ba3ff",fillOpacity:.10,lineJoin:"round",interactive:false,smoothFactor:0};
  if(c && hl && typeof polysOf==="function") polysOf(c).forEach(function(poly){paintOn(hl,poly,cStyle,true);});
  var reg=rid?regionRecord(rid):null;
  if(reg && hl){
    var rStyle={color:"#72c6ff",weight:2.8,opacity:1,fillColor:"#3189ff",fillOpacity:.43,lineJoin:"round",interactive:false,smoothFactor:0};
    polysOf(reg).forEach(function(poly){paintOn(hl,poly,rStyle,true);});
  }
  if(label){
    label.textContent=reg?(regionLabel(reg.n)+" · "+(c?countryLabel(c):cid)):(c?countryLabel(c):cid);
    label.style.display="block";
    if(containerPoint){label.style.left=(containerPoint.x+14)+"px";label.style.top=(containerPoint.y+14)+"px";}
  }
  /* Keep route strokes above the hover polygons; labels may sit above routes. */
  try{if(typeof layer!=="undefined"&&layer)layer.bringToFront();}catch(e){}
}
function openVisitPrompt(lat,lng){
  if(pickTarget || !COUNTRY_LIST || !COUNTRY_LIST.length) return;
  var cid=countryAt(lat,lng);
  if(!cid) return;
  var been=visited && visited.indexOf(cid)>=0;
  var regs=regionsFor(cid);
  var rid=been && regs ? regionIn(cid, lat, lng) : null;
  if(rid && visitedRegions && visitedRegions.indexOf(rid)>=0) return;
  if(!rid && been) return;
  var c=countryRecord(cid), reg=rid?regionRecord(rid):null;
  pendingVisit={countryId:cid, regionId:rid, name:reg?(regionLabel(reg.n)+" · "+(c?countryLabel(c):cid)):(c?countryLabel(c):cid)};
  var modal=document.getElementById("visit-confirm");
  var title=document.getElementById("visit-confirm-title");
  var desc=document.getElementById("visit-confirm-desc");
  if(title) title.textContent=t("Вы были тут?");
  if(desc) desc.textContent=pendingVisit.name;
  if(modal) modal.classList.add("on");
}
function closeVisitPrompt(){
  var modal=document.getElementById("visit-confirm");
  if(modal) modal.classList.remove("on");
  pendingVisit=null;
}
function confirmVisitedPlace(){
  if(!pendingVisit) return;
  var cid=pendingVisit.countryId, rid=pendingVisit.regionId;
  if(rid){
    offRegions=offRegions.filter(function(id){return id!==rid;});
    if(manualRegions.indexOf(rid)<0) manualRegions.push(rid);
    if(manualCountries.indexOf(cid)<0) manualCountries.push(cid);
  }else if(manualCountries.indexOf(cid)<0) manualCountries.push(cid);
  offCountries=offCountries.filter(function(id){return id!==cid;});
  saveSets();
  syncVisited();
  closeVisitPrompt();
  hoverKey="";
  if(typeof drawCountries==="function") drawCountries();
  if(typeof renderCountryUi==="function") renderCountryUi();
  if(typeof render==="function") render();
}
function syncVisited(){
  if(!COUNTRY_LIST || typeof tabPlaces!=="function") return;
  var p=tabPlaces(typeof activeTab==="undefined"?"past":activeTab);
  visited=p.countries;
  visitedRegions=p.regions;
  autoCountries={};
  autoRegions={};
  visited.forEach(function(id){ autoCountries[id]=1; });
  visitedRegions.forEach(function(id){ autoRegions[id]=1; });
}
function paintPoly(poly, style){
  if(!poly||!poly[0]) return;
  var latlngs=poly.map(function(ring){
    return ring.map(function(pt){ return [pt[1], pt[0]]; });
  });
  L.polygon(latlngs, style).addTo(countryLayer);
}
function drawCountries(){
  if(map && map._isAtlas && map.setVisited){
    if(countryLayer) countryLayer.clearLayers();
    map.setVisited(visited||[], visitedRegions||[]);
    return;
  }
  countryLayer.clearLayers();
  var on={}, i;
  for(i=0;i<visited.length;i++) on[visited[i]]=1;
  var amber={color:"rgba(70,100,120,.35)", weight:0, opacity:0, lineJoin:"round", fillColor:"#5d7e96", fillOpacity:.22, interactive:false, smoothFactor:0};
  var gold={color:"#9a4d00", weight:0, opacity:0, lineJoin:"round", fillColor:"#c4622d", fillOpacity:.34, interactive:false, smoothFactor:0};
  var regional={};
  if(typeof REGIONS_BY!=="undefined" && REGIONS_BY) Object.keys(REGIONS_BY).forEach(function(code){ if(REGIONS_BY[code] && REGIONS_BY[code].length) regional[code]=1; });
  COUNTRY_LIST.forEach(function(c){
    var been=!!on[c.i];
    if(!been && regional[c.i] && visitedRegions){
      for(var ri=0;ri<visitedRegions.length;ri++) if(countryOfRid(visitedRegions[ri])===c.i){ been=true; break; }
    }
    if(!been) return;
    polysOf(c).forEach(function(poly){ paintPoly(poly, amber); });
  });
  function paintVisited(list){
    if(!list || !visitedRegions.length) return;
    var ron={};
    visitedRegions.forEach(function(id){ ron[id]=1; });
    list.forEach(function(reg){
      if(!ron[reg.id]) return;
      polysOf(reg).forEach(function(poly){ paintPoly(poly, gold); });
    });
  }
  if(typeof REGIONS_BY!=="undefined" && REGIONS_BY){
    Object.keys(REGIONS_BY).forEach(function(code){ paintVisited(REGIONS_BY[code]); });
  } else {
    paintVisited(RUSSIA_REGIONS);
    paintVisited(CHINA_REGIONS);
  }
  try{ if(worldLayer) worldLayer.bringToBack(); countryLayer.bringToFront(); }catch(e){}
  if(typeof stackMapLayers==="function") stackMapLayers();
}
function countVisitedRegions(list){
  var total=list?list.length:0, got=0, i;
  if(list) for(i=0;i<list.length;i++) if(visitedRegions && visitedRegions.indexOf(list[i].id)>=0) got++;
  return {total:total, got:got};
}
function regionStatsFor(code){
  return countVisitedRegions(regionsFor(code));
}
function regionStats(){
  return countVisitedRegions(RUSSIA_REGIONS);
}
function chinaStats(){
  return countVisitedRegions(CHINA_REGIONS);
}
function regionMatches(r, q){
  if(!q) return "";
  if(r.n.toLowerCase().indexOf(q)>=0) return "";
  var cs=r._cities||[], i, loose=null, name;
  for(i=0;i<cs.length;i++){
    name=cs[i].toLowerCase();
    if(name.indexOf(q)<0) continue;
    if(name===q || name.indexOf(q)===0) return cs[i];
    if(!loose) loose=cs[i];
  }
  return loose;
}
function pctOf(got, total){
  if(!total) return "0%";
  return Math.round(100*got/total)+"%";
}
function renderCountryUi(){
  if(typeof visited==="undefined" || !visited) return;
  var count=document.getElementById("countries-count");
  var st=regionStats();
  var cst=chinaStats();
  if(count) count.textContent=!COUNTRY_LIST?"…":String(visited.length);
  if(!COUNTRY_LIST) return;
  var countryTotal=COUNTRY_LIST?COUNTRY_LIST.length:0;
  var countryPct=pctOf(visited.length, countryTotal);
  var pctSub=ofCount(visited.length, countryTotal, t("стран"));
  var pctHtml="<b>"+countryPct+"</b><span>"+pctSub+"</span>";
  var pctEl=document.getElementById("countries-pct");
  if(pctEl) pctEl.innerHTML=pctHtml;
  var topPct=document.getElementById("top-pct");
  if(topPct) topPct.innerHTML="<b>"+countryPct+"</b><span>"+pctSub+"</span>";
  var cp=document.getElementById("countries-progress");
  if(cp) cp.textContent=countryPct+" · "+pctSub;
  var rp=document.getElementById("region-progress");
  var line=document.getElementById("visit-line");
  var stats=document.getElementById("visit-stats");
  var title=document.getElementById("countries-title");
  var hint=document.getElementById("countries-hint");
  var back=document.getElementById("regions-back");
  var qEl=document.getElementById("country-q");
  var picked=document.getElementById("country-picked");
  var list=document.getElementById("country-list");
  var regions=document.getElementById("region-list");
  var fromBtn=document.getElementById("countries-from-routes");
  var scopeList=regionScope?regionsFor(regionScope):null;
  var scopeStats=regionScope?regionStatsFor(regionScope):st;
  if(back) back.hidden=!regionScope;
  if(title){
    var scopeCountry=regionScope?countryRecord(regionScope):null;
    title.textContent=regionScope?(scopeCountry?countryLabel(scopeCountry):regionScope):t("Посещённые страны");
  }
  if(regionScope){
    var scopeNoun=t("регионов");
    var scopeLine=ofCount(scopeStats.got, scopeStats.total, scopeNoun);
    if(hint) hint.textContent=scopeLine+" · "+t("Можно найти по городу.");
    if(stats){ stats.hidden=false; stats.innerHTML="<b>"+pctOf(scopeStats.got, scopeStats.total)+"</b><span>"+scopeLine+"</span>"; }
    if(rp) rp.textContent=scopeLine;
    if(line) line.textContent=pctOf(scopeStats.got, scopeStats.total)+" · "+scopeLine;
  } else {
    if(hint) hint.textContent=t("Считаются по маршрутам. Смахните страну влево, чтобы убрать.");
    if(stats){ stats.hidden=false; stats.innerHTML=pctHtml; }
    if(rp) rp.textContent="";
    if(line) line.textContent=countryPct+" · "+pctSub;
  }
  if(qEl && document.activeElement!==qEl) qEl.placeholder=regionScope?t("Регион или город…"):t("Найти страну…");
  else if(qEl && !qEl.value) qEl.placeholder=regionScope?t("Регион или город…"):t("Найти страну…");
  if(picked) picked.style.display=regionScope?"none":"";
  if(list) list.style.display=regionScope?"none":"";
  if(regions) regions.style.display=regionScope?"block":"none";
  if(fromBtn) fromBtn.style.display=regionScope?"none":"";
  if(!COUNTRY_LIST) return;
  var openLabel=document.querySelector("#countries-open span");
  if(openLabel) openLabel.textContent=activeTab==="future"?t("Страны, ожидающие вас"):t("Посещённые страны");
  var countriesPanel=document.getElementById("countries-panel");
  if(!countriesPanel || !countriesPanel.classList.contains("on")) return;
  if(activeTab==="future"){
    if(title) title.textContent=t("Страны, ожидающие вас");
    if(hint) hint.textContent=t("Страны и регионы из будущих маршрутов.");
    if(picked) picked.style.display="none";
    if(regions) regions.style.display="none";
    if(list){
      var fp=futurePlaces();
      var block=countriesBlock(fp.countries, fp.regions, true);
      list.style.display="block";
      list.innerHTML=block.html || '<p class="hint">'+t("Пока пусто")+'</p>';
    }
    return;
  }
  var q=(qEl&&qEl.value||"").trim().toLowerCase();
  if(regionScope && regions && scopeList){
    var rowsR=scopeList.filter(function(r){ return regionMatches(r, q)!==null; });
    rowsR.sort(function(a,b){
      var as=visitedRegions.indexOf(a.id)>=0?0:1, bs=visitedRegions.indexOf(b.id)>=0?0:1;
      if(as!==bs) return as-bs;
      return regionLabel(a.n).localeCompare(regionLabel(b.n), currentLang()==="zh"?"zh":currentLang());
    });
    regions.innerHTML=rowsR.map(function(r){
      var on=visitedRegions.indexOf(r.id)>=0;
      var city=q?regionMatches(r, q):"";
      var sub=city?'<small style="display:block;color:var(--muted);font-weight:500">'+city+'</small>':"";
      return '<button type="button" class="'+(on?"on":"")+'" data-reg="'+r.id+'"><span>'+regionLabel(r.n)+sub+'</span><span>'+(on?"✓":"")+'</span></button>';
    }).join("") || '<p class="hint">'+t("Ничего не найдено")+'</p>';
    return;
  }
  if(!picked||!list) return;
  var by={};
  COUNTRY_LIST.forEach(function(c){ by[c.i]=countryLabel(c); });
  picked.innerHTML=visited.map(function(id){
    return '<button type="button" data-drop="'+id+'">'+(by[id]||id)+' ×</button>';
  }).join("");
  var rows=COUNTRY_LIST.filter(function(c){
    if(!q) return true;
    return (c.n||"").toLowerCase().indexOf(q)>=0 || countryLabel(c).toLowerCase().indexOf(q)>=0 || c.i.toLowerCase().indexOf(q)>=0;
  });
  rows.sort(function(a,b){
    var as=visited.indexOf(a.i)>=0?0:1, bs=visited.indexOf(b.i)>=0?0:1;
    if(as!==bs) return as-bs;
    if(a.i==="RU") return -1;
    if(b.i==="RU") return 1;
    if(a.i==="CN") return -1;
    if(b.i==="CN") return 1;
    return countryLabel(a).localeCompare(countryLabel(b), currentLang()==="zh"?"zh":currentLang());
  });
  if(q) rows=rows.slice(0,80);
  list.innerHTML=rows.map(function(c){
    var on=visited.indexOf(c.i)>=0;
    var regs=regionsFor(c.i);
    if(regs && regs.length){
      var rs=regionStatsFor(c.i);
      return '<button type="button" class="'+(on?"on":"")+'" data-open="'+c.i+'"><span>'+countryLabel(c)+'</span><span>'+pctOf(rs.got, rs.total)+" · "+ofCount(rs.got, rs.total, t("регионов"))+'</span></button>';
    }
    return '<button type="button" class="'+(on?"on":"")+'" data-iso="'+c.i+'"><span>'+countryLabel(c)+'</span><span>'+(on?"✓":"")+'</span></button>';
  }).join("") || '<p class="hint">'+t("Ничего не найдено")+'</p>';
}
function refreshVisitUi(){
  syncVisited();
  drawCountries();
  renderCountryUi();
  if(globeOn && typeof scheduleGlobe==="function") scheduleGlobe();
}
function toggleCountry(id){
  if(!id) return;
  if(visited.indexOf(id)>=0){
    if(offCountries.indexOf(id)<0) offCountries.push(id);
    manualCountries=manualCountries.filter(function(x){ return x!==id; });
  } else {
    offCountries=offCountries.filter(function(x){ return x!==id; });
    if(manualCountries.indexOf(id)<0) manualCountries.push(id);
  }
  saveSets();
  refreshVisitUi();
}
function unvisitCountry(id){
  if(!id) return;
  if(offCountries.indexOf(id)<0) offCountries.push(id);
  manualCountries=manualCountries.filter(function(x){ return x!==id; });
  var seen={}, regs=regionsFor(id)||[], i, rid;
  for(i=0;i<regs.length;i++) seen[regs[i].id]=1;
  (visitedRegions||[]).forEach(function(x){ if(countryOfRid(x)===id) seen[x]=1; });
  for(rid in seen) if(offRegions.indexOf(rid)<0) offRegions.push(rid);
  manualRegions=manualRegions.filter(function(x){ return countryOfRid(x)!==id; });
  saveSets();
  refreshVisitUi();
  if(typeof render==="function") render();
}
function toggleRegion(id){
  if(!id) return;
  if(visitedRegions.indexOf(id)>=0){
    if(offRegions.indexOf(id)<0) offRegions.push(id);
    manualRegions=manualRegions.filter(function(x){ return x!==id; });
  } else {
    offRegions=offRegions.filter(function(x){ return x!==id; });
    if(manualRegions.indexOf(id)<0) manualRegions.push(id);
    offCountries=offCountries.filter(function(x){ return x!==(id.indexOf("CN:")===0?"CN":"RU"); });
  }
  saveSets();
  refreshVisitUi();
}
function countriesFromRoutes(){
  refreshVisitUi();
  return visited.length;
}
var PLACE_CITIES=[
  {n:"Донецк",lat:48.0159,lng:37.8028},{n:"Луганск",lat:48.574,lng:39.3078},
  {n:"Мариуполь",lat:47.097,lng:37.543},{n:"Мелитополь",lat:46.849,lng:35.366},
  {n:"Херсон",lat:46.635,lng:32.617},{n:"Геническ",lat:46.175,lng:34.799},
  {n:"Бердянск",lat:46.767,lng:36.783},{n:"Запорожье",lat:47.839,lng:35.140},
  {n:"Гуанчжоу",lat:23.13,lng:113.26},{n:"Чэнду",lat:30.67,lng:104.07},
  {n:"Сиань",lat:34.34,lng:108.94},{n:"Ухань",lat:30.59,lng:114.31},
  {n:"Харбин",lat:45.80,lng:126.53},{n:"Шэньян",lat:41.81,lng:123.43},
  {n:"Чунцин",lat:29.56,lng:106.55},{n:"Тяньцзинь",lat:39.13,lng:117.20},
  {n:"Нанкин",lat:32.06,lng:118.80},{n:"Ханчжоу",lat:30.27,lng:120.15},
  {n:"Куньмин",lat:25.04,lng:102.71},{n:"Урумчи",lat:43.83,lng:87.62},
  {n:"Лхаса",lat:29.65,lng:91.12},{n:"Хайкоу",lat:20.02,lng:110.35},
  {n:"Наньнин",lat:22.82,lng:108.32},{n:"Чанша",lat:28.23,lng:112.94},
  {n:"Чжэнчжоу",lat:34.75,lng:113.65},{n:"Цзинань",lat:36.65,lng:117.12},
  {n:"Фучжоу",lat:26.07,lng:119.30},{n:"Хэфэй",lat:31.82,lng:117.23},
  {n:"Наньчан",lat:28.68,lng:115.86},{n:"Тайюань",lat:37.87,lng:112.55},
  {n:"Хух-Хото",lat:40.84,lng:111.75},{n:"Иньчуань",lat:38.49,lng:106.23},
  {n:"Синин",lat:36.62,lng:101.78},{n:"Ланьчжоу",lat:36.06,lng:103.83},
  {n:"Гуйян",lat:26.65,lng:106.63},{n:"Шицзячжуан",lat:38.04,lng:114.51},
  {n:"Чанчунь",lat:43.82,lng:125.32},{n:"Тайбэй",lat:25.03,lng:121.57},
  {n:"Циндао",lat:36.10,lng:120.30},{n:"Сямэнь",lat:24.48,lng:118.09},
  {n:"Далянь",lat:38.91,lng:121.61},{n:"Сучжоу",lat:31.30,lng:120.59},
  {n:"Шэньчжэнь",lat:22.63,lng:114.12},{n:"Пекин",lat:39.90,lng:116.41},
  {n:"Шанхай",lat:31.23,lng:121.47}
];
function normalizeCountries(items){
  var iso={"FRA":"FR","NOR":"NO"};
  return (items||[]).map(function(c){
    if(iso[c.i]) c.i=iso[c.i];
    if(c.i==="CN") c.n="Китай";
    return c;
  }).filter(function(c){ return c && c.i && c.i!=="KOS" && c.i!=="TW" && c.i!=="TWN"; });
}
function bindRegionCities(){
  var lists=[], code;
  if(typeof REGIONS_BY!=="undefined" && REGIONS_BY){
    for(code in REGIONS_BY) lists.push(REGIONS_BY[code]);
  } else lists=[RUSSIA_REGIONS, CHINA_REGIONS];
  var i, by={};
  for(i=0;i<lists.length;i++){
    if(!lists[i]) continue;
    lists[i].forEach(function(r){ r._cities=[]; by[r.id]=r; });
  }
  var seen={};
  function add(raw, lat, lng){
    if(!raw || lat==null || lng==null || isNaN(lat) || isNaN(lng)) return;
    var cid=typeof countryAt==="function"?countryAt(lat, lng):null;
    var id=cid?regionIn(cid, lat, lng):(regionAt(lat, lng)||chinaRegionAt(lat, lng));
    var reg=id&&by[id];
    if(!reg || reg._cities.length>=48) return;
    var full=String(raw).replace(/\s+/g," ").trim();
    var names=[full];
    var cut=full.split(/\s+/)[0];
    if(cut && cut.length>=3 && cut!==full) names.push(cut);
    names.forEach(function(name){
      var key=id+"|"+name.toLowerCase();
      if(seen[key] || name.toLowerCase()===reg.n.toLowerCase()) return;
      seen[key]=1;
      if(reg._cities.length<48) reg._cities.push(name);
    });
  }
  function walk(arr, key){
    if(!arr) return;
    for(var j=0;j<arr.length;j++) add(arr[j][key]||arr[j].n||arr[j].name, arr[j].lat, arr[j].lng);
  }
  walk(PLACE_CITIES,"n");
  walk(typeof CITIES!=="undefined"?CITIES:null,"n");
  walk(typeof CITY_LABELS!=="undefined"?CITY_LABELS:null,"name");
  walk(typeof AIRPORTS!=="undefined"?AIRPORTS:null,"n");
  walk(typeof STATIONS!=="undefined"?STATIONS:null,"n");
  walk(typeof PORTS!=="undefined"?PORTS:null,"n");
}
function loadGeo(url){
  return fetch(url).then(function(r){
    if(!r.ok) throw new Error(url);
    return r.json();
  });
}
var PLACE_LABELS=[];
var WORLD_REGIONS=null;
var REGIONS_BY={};
function indexRegions(){
  REGIONS_BY={};
  function add(list, code){
    (list||[]).forEach(function(r){
      if(!r.c) r.c=code || (String(r.id).indexOf(":")>0?String(r.id).split(":")[0]:code);
      if(!r.c) return;
      (REGIONS_BY[r.c]=REGIONS_BY[r.c]||[]).push(r);
    });
  }
  add(RUSSIA_REGIONS, "RU");
  add(CHINA_REGIONS, "CN");
  add(WORLD_REGIONS, "");
}
function bootGeo(){
  var left=5;
  function finish(){
    if(--left>0) return;
    indexRegions();
    bindRegionCities();
    if(typeof drawWorld==="function") drawWorld();
    if(typeof drawCityLabels==="function") drawCityLabels();
    if(typeof absorbRoute==="function" && tw && document.getElementById("trip-window") && document.getElementById("trip-window").classList.contains("on")){
      if(tw.routes) tw.routes.forEach(function(r){ absorbRoute(routeById(r.id)||r); });
      if(typeof previewTripPlaces==="function") previewTripPlaces();
      else if(typeof paintTripWindow==="function") paintTripWindow();
    }
    globeLand=null;
    if(globeOn && typeof scheduleGlobe==="function") scheduleGlobe();
    if(typeof scheduleNet==="function") scheduleNet();
    if(window.__fillAccount && document.getElementById("account-panel") && document.getElementById("account-panel").classList.contains("on")) window.__fillAccount();
    if(typeof render==="function") render();
  }
  if(!countryLayer && typeof L!=="undefined" && typeof map!=="undefined") countryLayer=L.layerGroup().addTo(map);
  ensureHoverLayer();
  globeLand=null;
  loadGeo("./geo/countries.json?v=8").then(function(data){
    COUNTRY_LIST=normalizeCountries(data&&data.items);
    finish();
  }).catch(function(){ COUNTRY_LIST=COUNTRY_LIST||[]; finish(); });
  loadGeo("./geo/russia.json?v=8").then(function(data){
    RUSSIA_REGIONS=((data&&data.items)||[]).map(function(r){ r.id=r.id||r.n; r.c="RU"; return r; });
    finish();
  }).catch(function(){ RUSSIA_REGIONS=[]; finish(); });
  loadGeo("./geo/china.json?v=8").then(function(data){
    CHINA_REGIONS=((data&&data.items)||[]).map(function(r){ r.id=r.id||("CN:"+r.n); r.c="CN"; return r; });
    finish();
  }).catch(function(){ CHINA_REGIONS=[]; finish(); });
  loadGeo("./geo/regions.json?v=8").then(function(data){
    WORLD_REGIONS=((data&&data.items)||[]).map(function(r){ r.id=r.id||((r.c||"")+" "+r.n); return r; });
    finish();
  }).catch(function(){ WORLD_REGIONS=[]; finish(); });
  loadGeo("./geo/labels.json?v=1").then(function(data){
    PLACE_LABELS=Array.isArray(data)?data:((data&&data.items)||[]);
    finish();
  }).catch(function(){ PLACE_LABELS=[]; finish(); });
}
