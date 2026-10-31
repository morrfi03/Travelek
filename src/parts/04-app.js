/* map */
var map;
if(window.TravelekAtlas){
  window.__onRoads=function(){
    if(window.__roadsRouted) return;
    window.__roadsRouted=1;
    if(typeof render==="function") render();
  };
  map=window.TravelekAtlas.createMap();
  try{ if(map.prepareNetwork) map.prepareNetwork(); }catch(e){}
  map.setView([48, 37], 3.4);
}else{
map=L.map("map",{
  zoomControl:false,
  attributionControl:false,
  minZoom:2,
  maxZoom:16,
  maxBounds:[[-85,-180],[85,180]],
  maxBoundsViscosity:0.8,
  bounceAtZoomLimits:true,
  doubleClickZoom:true,
  scrollWheelZoom:true,
  touchZoom:true,
  tap:true
}).setView([45,20],4);
}
/* Dedicated top pane: route lines must never sit beneath country/night polygons. */
var routePane=map.getPane("routePane")||map.createPane("routePane");
routePane.style.zIndex="680";
routePane.style.pointerEvents="none";
try{ window.__travelekMap=map; }catch(e){}
var baseLayer=null, worldLayer=null;
function mapPalette(){
  var theme=document.documentElement.getAttribute("data-theme")||"dark";
  if(theme==="light") return {land:"#f4f1ea", edge:"#d5dee8", line:"#b7c3cf", ru:"#e7efe6"};
  return {land:"#1a2c3d", edge:"#24384c", line:"#8fb4ce", ru:"#203448"};
}
function smoothRing(ring){
  if(!ring||ring.length<4) return ring;
  var i;
  for(i=1;i<ring.length;i++){
    if(Math.abs(ring[i][0]-ring[i-1][0])>40) return ring;
  }
  var pts=ring.slice();
  var closed=Math.abs(pts[0][0]-pts[pts.length-1][0])<1e-5 && Math.abs(pts[0][1]-pts[pts.length-1][1])<1e-5;
  if(closed) pts.pop();
  if(pts.length<3) return ring;
  var pass, next, a, b, n=pts.length;
  for(pass=0; pass<2; pass++){
    next=[];
    for(i=0;i<n;i++){
      a=pts[i]; b=pts[(i+1)%n];
      next.push([a[0]*0.75+b[0]*0.25, a[1]*0.75+b[1]*0.25]);
      next.push([a[0]*0.25+b[0]*0.75, a[1]*0.25+b[1]*0.75]);
    }
    pts=next; n=pts.length;
  }
  pts.push([pts[0][0], pts[0][1]]);
  return pts;
}
function paintOn(group, poly, style, keepRaw){
  if(!poly||!poly.length) return;
  /* The first ring is the outer border; subsequent rings are holes. */
  var latlngs=poly.map(function(ring){
    if(!ring||ring.length<3) return [];
    var points=keepRaw ? ring : smoothRing(ring);
    return points.map(function(pt){ return [pt[1],pt[0]]; });
  }).filter(function(ring){ return ring.length>=3; });
  if(!latlngs.length) return;
  L.polygon(latlngs, style).addTo(group);
}
function drawWorld(){
  if(typeof map!=="undefined" && map && map._isAtlas) return;
  if(!worldLayer) worldLayer=L.layerGroup().addTo(map);
  worldLayer.clearLayers();
  if(typeof COUNTRY_LIST==="undefined" || !COUNTRY_LIST) return;
  var pal=mapPalette();
  var style={color:pal.line, weight:0.7, opacity:.9, lineJoin:"round", lineCap:"round", fillColor:pal.land, fillOpacity:1, interactive:false, smoothFactor:0};
  var ruStyle={color:pal.line, weight:0.85, opacity:1, lineJoin:"round", lineCap:"round", fillColor:pal.ru, fillOpacity:1, interactive:false, smoothFactor:0};
  var cnStyle={color:pal.line, weight:0.8, opacity:1, lineJoin:"round", lineCap:"round", fillColor:pal.land, fillOpacity:1, interactive:false, smoothFactor:0};
  var cover={HK:1,MO:1,AB:1,OS:1};
  /* Толстая обводка цветом заливки закрывает щели между соседними странами. */
  var landUnderlay={color:pal.land, weight:1.15, opacity:1, lineJoin:"round", lineCap:"round", fillColor:pal.land, fillOpacity:1, interactive:false, smoothFactor:0};
  var ruUnderlay={color:pal.ru, weight:1.15, opacity:1, lineJoin:"round", lineCap:"round", fillColor:pal.ru, fillOpacity:1, interactive:false, smoothFactor:0};
  COUNTRY_LIST.forEach(function(c){
    if(c.i==="RU" || typeof polysOf!=="function") return;
    polysOf(c).forEach(function(poly){ paintOn(worldLayer, poly, landUnderlay, true); });
  });
  var ruCountry=COUNTRY_LIST.find(function(c){ return c.i==="RU"; });
  if(ruCountry && typeof polysOf==="function"){
    polysOf(ruCountry).forEach(function(poly){ paintOn(worldLayer, poly, ruUnderlay, true); });
  }
  COUNTRY_LIST.forEach(function(c){
    if(c.i==="RU" || c.i==="CN" || cover[c.i]) return;
    if(typeof polysOf!=="function") return;
    polysOf(c).forEach(function(poly){ paintOn(worldLayer, poly, style, true); });
  });
  /* Силуэт страны под регионами закрывает щели между субъектами. */
  var ruBaseStyle={color:pal.ru, weight:0, opacity:0, fillColor:pal.ru, fillOpacity:1, interactive:false, smoothFactor:0};
  if(ruCountry && typeof polysOf==="function"){
    polysOf(ruCountry).forEach(function(poly){ paintOn(worldLayer, poly, ruBaseStyle, true); });
  }
  var regs=(typeof RUSSIA_REGIONS!=="undefined" && RUSSIA_REGIONS) ? RUSSIA_REGIONS : [];
  regs.forEach(function(reg){
    polysOf(reg).forEach(function(poly){ paintOn(worldLayer, poly, ruStyle, true); });
  });
  var cnBase={color:pal.land, weight:0, opacity:0, fillColor:pal.land, fillOpacity:1, interactive:false, smoothFactor:0};
  var cnCountry=COUNTRY_LIST.find(function(c){ return c.i==="CN"; });
  if(cnCountry && typeof polysOf==="function"){
    polysOf(cnCountry).forEach(function(poly){ paintOn(worldLayer, poly, cnBase, true); });
  }
  var cnRegs=(typeof CHINA_REGIONS!=="undefined" && CHINA_REGIONS) ? CHINA_REGIONS : [];
  cnRegs.forEach(function(reg){
    polysOf(reg).forEach(function(poly){ paintOn(worldLayer, poly, cnStyle, true); });
  });
  ["HK","MO","AB","OS"].forEach(function(id){
    var cap=COUNTRY_LIST.find(function(c){ return c.i===id; });
    if(!cap || typeof polysOf!=="function") return;
    polysOf(cap).forEach(function(poly){ paintOn(worldLayer, poly, style, true); });
  });
  try{ worldLayer.bringToBack(); }catch(e){}
  if(typeof countryLayer!=="undefined" && countryLayer) try{ countryLayer.bringToFront(); }catch(e){}
  if(typeof layer!=="undefined" && layer) try{ layer.bringToFront(); }catch(e){}
  if(typeof scheduleNet==="function") scheduleNet();
}
function makeBase(){
  drawWorld();
  return L.layerGroup();
}

var NET=null, netCv=null, netTimer=0, netLoading=false;
function decodePolyline(str, prec){
  var coords=[], i=0, lat=0, lng=0, shift, result, b, val, k;
  while(i<str.length){
    for(k=0;k<2;k++){
      shift=0; result=0;
      do{
        if(i>=str.length) break;
        b=str.charCodeAt(i++)-63;
        result|=(b&0x1f)<<shift;
        shift+=5;
      } while(b>=0x20);
      val=(result&1)?~(result>>1):(result>>1);
      if(k===0) lat+=val; else lng+=val;
    }
    coords.push(lat/prec, lng/prec);
  }
  return coords;
}
function decodeTier(text, prec){
  if(!text) return [];
  var parts=text.split("\n"), out=[], i, pts, j, minLa, maxLa, minLn, maxLn;
  for(i=0;i<parts.length;i++){
    if(!parts[i]) continue;
    pts=decodePolyline(parts[i], prec);
    if(pts.length<4) continue;
    minLa=maxLa=pts[0]; minLn=maxLn=pts[1];
    for(j=0;j<pts.length;j+=2){
      if(pts[j]<minLa) minLa=pts[j];
      if(pts[j]>maxLa) maxLa=pts[j];
      if(pts[j+1]<minLn) minLn=pts[j+1];
      if(pts[j+1]>maxLn) maxLn=pts[j+1];
    }
    out.push({bb:[minLa, minLn, maxLa, maxLn], pts:pts});
  }
  return out;
}
function ensureNet(){
  if((map && map._isAtlas) || netCv || !map) return;
  var pane=map.getPane("netPane");
  if(!pane) pane=map.createPane("netPane");
  pane.style.zIndex="460";
  pane.style.pointerEvents="none";
  netCv=document.createElement("canvas");
  netCv.className="net-cv";
  pane.appendChild(netCv);
  map.on("move zoom resize", scheduleNet);
  if(!NET) NET={roads:[], rails:[]};
}
function scheduleNet(){
  if(netTimer) return;
  netTimer=1;
  var run=function(){ netTimer=0; drawNet(); };
  if(window.requestAnimationFrame) requestAnimationFrame(run); else run();
}
function drawNet(){
  ensureNet();
  if(!netCv || !map) return;
  var size=map.getSize();
  var dpr=Math.min(window.devicePixelRatio||1, 2);
  if(netCv.width!==Math.round(size.x*dpr) || netCv.height!==Math.round(size.y*dpr)){
    netCv.width=Math.round(size.x*dpr);
    netCv.height=Math.round(size.y*dpr);
    netCv.style.width=size.x+"px";
    netCv.style.height=size.y+"px";
  }
  var topLeft=map.containerPointToLayerPoint([0,0]);
  if(window.L && L.DomUtil) L.DomUtil.setPosition(netCv, topLeft);
  var ctx=netCv.getContext("2d");
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,size.x,size.y);
  var z=map.getZoom();
  var b=map.getBounds();
  var south=b.getSouth(), north=b.getNorth(), west=b.getWest(), east=b.getEast();
  var theme=document.documentElement.getAttribute("data-theme")||"dark";
  ctx.lineJoin="round";
  ctx.lineCap="round";
  ctx.strokeStyle=theme==="light"?"rgba(72,48,28,.72)":"rgba(232,214,186,.92)";
  ctx.lineWidth=z>=6?1.25:1.05;
  ctx.beginPath();
  if(typeof REGIONS_BY!=="undefined" && REGIONS_BY){
    Object.keys(REGIONS_BY).forEach(function(code){
      var list=REGIONS_BY[code], i, reg, polys, k, ring, p, pt, on;
      for(i=0;i<list.length;i++){
        reg=list[i];
        if(z<5 && reg.b && (reg.b[2]-reg.b[0])<1.1 && Math.min(8, reg.b[3]-reg.b[1])<1.1) continue;
        if(reg.b && (reg.b[2]<south || reg.b[0]>north)) continue;
        polys=polysOf(reg);
        for(k=0;k<polys.length;k++){
          ring=polys[k][0];
          if(!ring||ring.length<2) continue;
          on=false;
          for(p=0;p<ring.length;p++){
            pt=map.latLngToContainerPoint([ring[p][1], ring[p][0]]);
            if(!on){ ctx.moveTo(pt.x, pt.y); on=true; }
            else ctx.lineTo(pt.x, pt.y);
          }
        }
      }
    });
  }
  ctx.stroke();
  function strokeLines(lines, color, width){
    if(!lines||!lines.length) return;
    ctx.beginPath();
    ctx.strokeStyle=color;
    ctx.lineWidth=width;
    var i, line, pts, j, pt, on, bb;
    for(i=0;i<lines.length;i++){
      line=lines[i]; bb=line.bb;
      if(bb[2]<south||bb[0]>north||bb[3]<west||bb[1]>east) continue;
      pts=line.pts; on=false;
      for(j=0;j<pts.length;j+=2){
        pt=map.latLngToContainerPoint([pts[j], pts[j+1]]);
        if(!on){ ctx.moveTo(pt.x, pt.y); on=true; }
        else ctx.lineTo(pt.x, pt.y);
      }
    }
    ctx.stroke();
  }
  if(NET){
    var rc=theme==="light"?"rgba(92,64,40,.8)":"rgba(214,164,96,.9)";
    var lc=theme==="light"?"rgba(40,48,58,.82)":"rgba(186,198,210,.9)";
    var ri=z>=8?3:z>=5?2:z>=3?1:0;
    var oi=z>=10?4:z>=8?3:z>=6?2:z>=4?1:0;
    var t;
    for(t=0;t<ri && t<NET.rails.length;t++) strokeLines(NET.rails[t], lc, t===0?1.35:0.9);
    for(t=0;t<oi && t<NET.roads.length;t++) strokeLines(NET.roads[t], rc, t===0?1.15:0.75);
  }
}
function strokeGlobeNet(ctx, projection){
  if(!NET || !projection) return;
  function stroke(lines, color, width){
    if(!lines) return;
    ctx.beginPath();
    ctx.strokeStyle=color;
    ctx.lineWidth=width;
    ctx.lineJoin="round";
    ctx.lineCap="round";
    var i, pts, j, xy, on;
    for(i=0;i<lines.length;i+= (lines.length>2500?2:1)){
      pts=lines[i].pts; on=false;
      for(j=0;j<pts.length;j+=2){
        try{ xy=projection([pts[j+1], pts[j]]); }catch(e){ xy=null; }
        if(!xy || isNaN(xy[0])){ on=false; continue; }
        if(!on){ ctx.moveTo(xy[0], xy[1]); on=true; }
        else ctx.lineTo(xy[0], xy[1]);
      }
    }
    ctx.stroke();
  }
  if(NET.rails && NET.rails[0]) stroke(NET.rails[0], "rgba(55,62,72,.72)", 0.8);
  if(globeScale>=1.35 && NET.roads && NET.roads[0]) stroke(NET.roads[0], "rgba(150,102,48,.7)", 0.7);
}

/* ——— Ночь на карте (терминатор Солнца) ——— */
var nightLayer=null, nightOn=true, globeOn=false;
function loadMapPrefs(){
  try{
    var p=JSON.parse(localStorage.getItem("travelek-mapprefs")||"{}");
    nightOn=true;
    if(typeof p.globe==="boolean") globeOn=p.globe;
  }catch(e){}
  nightOn=true;
}
function saveMapPrefs(){
  nightOn=true;
  try{localStorage.setItem("travelek-mapprefs",JSON.stringify({night:true,globe:globeOn}));}catch(e){}
  scheduleCloudSave();
}
function sunDeclination(date){
  var start=Date.UTC(date.getUTCFullYear(),0,0);
  var day=(date.getTime()-start)/86400000;
  return 23.44*Math.sin((2*Math.PI/365)*(day-81));
}
function buildNightLatLngs(date){
  /* полигон тёмной стороны Земли */
  var dec=sunDeclination(date)*Math.PI/180;
  var hour=date.getUTCHours()+date.getUTCMinutes()/60+date.getUTCSeconds()/3600;
  var subsolarLng=15*(12-hour); /* ° */
  var pts=[], lng, lat, tau, x, phi1, maxLat;
  for(lng=-180;lng<=180;lng+=3){
    tau=(lng-subsolarLng)*Math.PI/180;
    x=-Math.cos(tau)/Math.tan(dec+1e-9);
    if(x>1) lat=90; else if(x<-1) lat=-90;
    else lat=Math.asin(Math.max(-1,Math.min(1,x)))*180/Math.PI;
    /* севернее терминатора ночь зимой в С.полушарии зависит от знака dec */
    pts.push([lat, lng]);
  }
  /* замкнуть ночную сторону: от юга или севера */
  if(dec>=0){
    /* лето С: ночь на юге от терминатора */
    for(lng=180;lng>=-180;lng-=3) pts.push([-85,lng]);
  } else {
    for(lng=180;lng>=-180;lng-=3) pts.push([85,lng]);
  }
  return pts;
}

function applyGlobeEffect(){
  if(typeof map!=="undefined" && map && map._isAtlas){
    document.body.classList.remove("globe-on");
    var el=document.getElementById("map");
    if(el){ el.style.visibility="visible"; el.classList.remove("globe-mode"); }
    if(globeCv) globeCv.style.display="none";
    map.setMode(globeOn ? "globe" : "flat");
    return;
  }
  var el=document.getElementById("map");
  if(el) el.classList.remove("globe-mode");
  document.body.classList.toggle("globe-on", !!globeOn);
  if(el) el.style.visibility=globeOn?"hidden":"";
  if(!globeOn){
    if(globeCv) globeCv.style.display="none";
    return;
  }
  ensureGlobe(function(){
    globeCv.style.display="block";
    globeCv.style.zIndex="23";
    scheduleGlobe();
    setTimeout(function(){ if(globeOn) drawGlobe(); }, 50);
  });
}

var globeCv=null, globeRot={lng:40, lat:26}, globeScale=1, globeLand=null, globeSpin=0, globePtr=null, globeProjection=null, globeTapTimer=0;
function loadScriptOnce(src){
  if(window.d3 && d3.geoOrthographic && String(src).indexOf("d3-")>=0) return Promise.resolve();
  return new Promise(function(resolve, reject){
    var found=document.querySelector('script[data-src="'+src+'"]');
    if(found){
      if(found.getAttribute("data-ready")==="1") resolve();
      else found.addEventListener("load", function(){ resolve(); }, {once:true});
      return;
    }
    var s=document.createElement("script");
    s.src=src; s.async=false; s.setAttribute("data-src", src);
    s.onload=function(){ s.setAttribute("data-ready","1"); resolve(); };
    s.onerror=function(){ reject(new Error(src)); };
    document.body.appendChild(s);
  });
}
function ensureGlobe(done){
  if(!globeCv){
    globeCv=document.createElement("canvas");
    globeCv.id="globe";
    globeCv.style.width="100vw";
    globeCv.style.height="100dvh";
    globeCv.style.position="fixed";
    globeCv.style.left="0";
    globeCv.style.top="0";
    globeCv.style.zIndex="23";
    globeCv.style.touchAction="none";
    document.body.appendChild(globeCv);
    var hint=document.createElement("div");
    hint.id="globe-hint";
    hint.textContent=(typeof t==="function")?t("Тяните шар · +/− ближе"):"Тяните шар · +/− ближе";
    document.body.appendChild(hint);
    bindGlobePointer();
    window.addEventListener("resize", function(){ if(globeOn) scheduleGlobe(); });
    var sheetWatch=document.getElementById("sheet");
    if(sheetWatch && !sheetWatch._globeWatch){
      sheetWatch._globeWatch=1;
      sheetWatch.addEventListener("transitionend", function(){ if(globeOn) scheduleGlobe(); });
    }
  }
  if(window.d3 && d3.geoOrthographic && d3.geoPath){ done(); return; }
  loadScriptOnce("/vendor/d3-array.min.js").then(function(){
    return loadScriptOnce("/vendor/d3-geo.min.js");
  }).then(function(){ if(globeOn) done(); }).catch(function(e){ console.error(e); });
}
function globeRing(ring){
  var n=ring&&ring.length||0;
  if(n<4) return null;
  var keep=n>520?320:(n>200?200:n);
  var stride=n>keep?Math.ceil((n-1)/keep):1;
  var out=[], i;
  if(stride===1) out=ring.slice();
  else {
    for(i=0;i<n-1;i+=stride) out.push(ring[i]);
    out.push(ring[n-1]);
  }
  if(out.length<4) return null;
  var a=out[0], b=out[out.length-1];
  if(a[0]!==b[0] || a[1]!==b[1]) out.push([a[0], a[1]]);
  return out;
}
function orientLandRing(ring){
  if(!ring || ring.length<4 || !window.d3 || !d3.geoArea) return ring;
  var closed=ring.slice();
  var a=closed[0], b=closed[closed.length-1];
  if(a[0]!==b[0] || a[1]!==b[1]) closed.push([a[0], a[1]]);
  var geom={type:"Polygon", coordinates:[closed]};
  var area;
  try{ area=d3.geoArea(geom); }catch(e){ return ring; }
  if(area>2*Math.PI){
    closed.reverse();
    try{ area=d3.geoArea({type:"Polygon", coordinates:[closed]}); }catch(e){ return null; }
  }
  if(!(area>1e-7) || area>2*Math.PI) return null;
  return closed;
}
function globePolys(item){
  var out=[];
  if(!item || typeof polysOf!=="function") return out;
  polysOf(item).forEach(function(poly){
    (poly||[]).forEach(function(ring){
      var oriented=orientLandRing(ring);
      if(!oriented) return;
      var s=globeRing(oriented);
      if(!s) return;
      var geom={type:"Polygon", coordinates:[s]};
      if(window.d3 && d3.geoArea){
        var area;
        try{ area=d3.geoArea(geom); }catch(e){ return; }
        if(area>2*Math.PI){
          s=s.slice().reverse();
          geom={type:"Polygon", coordinates:[s]};
          try{ area=d3.geoArea(geom); }catch(e){ return; }
        }
        if(!(area>1e-7) || area>2*Math.PI) return;
      }
      out.push({id:item.i||item.id, geom:geom});
    });
  });
  return out;
}
function globePack(){
  var key=(COUNTRY_LIST?COUNTRY_LIST.length:0)+"|"+(typeof RUSSIA_REGIONS!=="undefined"&&RUSSIA_REGIONS?RUSSIA_REGIONS.length:0)+"|"+(typeof CHINA_REGIONS!=="undefined"&&CHINA_REGIONS?CHINA_REGIONS.length:0);
  if(globeLand && globeLand.key===key) return globeLand;
  var countries=[], ru=[], cn=[];
  (COUNTRY_LIST||[]).forEach(function(c){
    countries=countries.concat(globePolys(c));
  });
  if(typeof RUSSIA_REGIONS!=="undefined" && RUSSIA_REGIONS) RUSSIA_REGIONS.forEach(function(r){ ru=ru.concat(globePolys(r)); });
  if(typeof CHINA_REGIONS!=="undefined" && CHINA_REGIONS) CHINA_REGIONS.forEach(function(r){ cn=cn.concat(globePolys(r)); });
  globeLand={key:key, countries:countries, ru:ru, cn:cn};
  return globeLand;
}
function globeLayout(){
  var dpr=Math.min(window.devicePixelRatio||1, 2);
  var w=globeCv.clientWidth||window.innerWidth||800;
  var h=globeCv.clientHeight||window.innerHeight||600;
  if(w<50) w=window.innerWidth||800;
  if(h<50) h=window.innerHeight||600;
  if(globeCv.width!==Math.round(w*dpr) || globeCv.height!==Math.round(h*dpr)){
    globeCv.width=Math.round(w*dpr);
    globeCv.height=Math.round(h*dpr);
  }
  var ctx=globeCv.getContext("2d");
  ctx.setTransform(dpr,0,0,dpr,0,0);
  var sheet=document.getElementById("sheet");
  var desktop=window.matchMedia&&matchMedia("(min-width: 980px)").matches;
  var topBar=document.querySelector(".top");
  var top=topBar?Math.max(72, Math.round(topBar.getBoundingClientRect().bottom)+8):90;
  var sheetBox=sheet?sheet.getBoundingClientRect():null;
  var left=12, right=w-12, bottom=h-16;
  if(desktop && sheetBox && sheetBox.width>40) left=Math.max(12, Math.round(sheetBox.right)+10);
  else if(sheetBox && sheetBox.top>top+90) bottom=Math.round(sheetBox.top)-10;
  var availW=Math.max(140, right-left);
  var availH=Math.max(140, bottom-top);
  var R=Math.min(availW, availH)*0.48*globeScale;
  var cx=left+availW/2;
  var cy=top+availH/2;
  var projection=d3.geoOrthographic()
    .translate([cx, cy])
    .scale(R)
    .rotate([-globeRot.lng, -globeRot.lat])
    .clipAngle(90)
    .precision(0.7);
  globeProjection=projection;
  return {ctx:ctx, w:w, h:h, R:R, path:d3.geoPath(projection), projection:projection, c:[cx, cy]};
}
function paintGlobe(ctx, d, color, stroke){
  if(!d || d.length<6 || typeof Path2D!=="function") return false;
  try{
    var shape=new Path2D(d);
    if(stroke){ ctx.strokeStyle=color; ctx.stroke(shape); }
    else { ctx.fillStyle=color; ctx.fill(shape); }
    return true;
  }catch(e){ return false; }
}
function drawGlobe(){
  if(!globeOn || !globeCv || !window.d3 || !d3.geoOrthographic || !d3.geoPath) return;
  var view=globeLayout();
  var ctx=view.ctx, w=view.w, h=view.h, R=view.R, projection=view.projection, c=view.c;
  var pack;
  try{ pack=globePack(); }catch(err){ pack={countries:[],ru:[],cn:[]}; }
  ctx.clearRect(0,0,w,h);
  ctx.fillStyle="#05070f";
  ctx.fillRect(0,0,w,h);
  if(!globeCv._stars){
    var stars=[], si;
    for(si=0;si<80;si++) stars.push([Math.random(), Math.random(), Math.random()]);
    globeCv._stars=stars;
  }
  globeCv._stars.forEach(function(s){
    ctx.fillStyle="rgba(255,255,255,"+(0.28+s[2]*0.6)+")";
    ctx.fillRect(s[0]*w, s[1]*h, s[2]>0.7?1.7:1, s[2]>0.7?1.7:1);
  });
  var ocean=ctx.createRadialGradient(c[0]-R*0.28, c[1]-R*0.32, R*0.08, c[0], c[1], R);
  ocean.addColorStop(0,"#c5ecff");
  ocean.addColorStop(0.38,"#3eabe6");
  ocean.addColorStop(0.72,"#1c86cf");
  ocean.addColorStop(1,"#1574bc");
  ctx.beginPath();
  ctx.arc(c[0], c[1], R, 0, Math.PI*2);
  ctx.fillStyle=ocean;
  ctx.fill();
  var seen={};
  if(typeof visited!=="undefined" && visited && visited.forEach) visited.forEach(function(id){ seen[id]=1; });
  var geo=d3.geoPath(projection, ctx);
  ctx.save();
  ctx.beginPath();
  ctx.arc(c[0], c[1], R-0.4, 0, Math.PI*2);
  ctx.clip();
  function paintGeom(geom, fill, seal){
    if(!geom || !fill) return;
    ctx.beginPath();
    try{ geo(geom); }catch(err){ return; }
    ctx.lineJoin="round";
    ctx.lineCap="round";
    if(seal){
      ctx.lineWidth=seal;
      ctx.strokeStyle=fill;
      ctx.stroke();
    }
    ctx.fillStyle=fill;
    ctx.fill();
  }
  var i, part, list=pack.countries||[];
  for(i=0;i<list.length;i++){
    part=list[i];
    if(seen[part.id]) continue;
    paintGeom(part.geom, "#e4d0a4", 3.2);
  }
  for(i=0;i<list.length;i++){
    part=list[i];
    if(!seen[part.id]) continue;
    paintGeom(part.geom, "#e37b14", 3.2);
  }
  if(typeof visitedRegions!=="undefined" && visitedRegions && visitedRegions.length){
    var ron={};
    visitedRegions.forEach(function(id){ ron[id]=1; });
    function gold(parts){
      if(!parts) return;
      var k, p;
      for(k=0;k<parts.length;k++){
        p=parts[k];
        if(!ron[p.id]) continue;
        paintGeom(p.geom, "#e0b15a", 2.2);
      }
    }
    gold(pack.ru);
    gold(pack.cn);
    if(typeof REGIONS_BY!=="undefined" && REGIONS_BY){
      Object.keys(REGIONS_BY).forEach(function(code){
        if(code==="RU" || code==="CN") return;
        var list=REGIONS_BY[code], k, reg, parts, p;
        for(k=0;k<list.length;k++){
          reg=list[k];
          if(!ron[reg.id]) continue;
          if(!reg._gpolys) reg._gpolys=globePolys(reg);
          parts=reg._gpolys||[];
          for(p=0;p<parts.length;p++) paintGeom(parts[p].geom, "#e0b15a", 2.2);
        }
      });
    }
  }
  if(d3.geoGraticule10){
    ctx.beginPath();
    try{ geo(d3.geoGraticule10()); }catch(err){}
    ctx.strokeStyle="rgba(255,255,255,.28)";
    ctx.lineWidth=0.6;
    ctx.stroke();
  }
  if(typeof strokeGlobeNet==="function") strokeGlobeNet(ctx, projection);
  var routes=typeof filtered==="function"?filtered():(typeof ROUTES!=="undefined"?ROUTES:[]);
  routes.forEach(function(r){
    var g=typeof buildGeoSync==="function"?buildGeoSync(r):null;
    if(!g||!g.coords||g.coords.length<2) return;
    var line={type:"LineString", coordinates:g.coords.map(function(pt){ return [pt[1], pt[0]]; })};
    ctx.beginPath();
    try{ geo(line); }catch(err){ return; }
    ctx.lineCap="round";
    ctx.lineJoin="round";
    ctx.lineWidth=r.mode==="plane"?3.4:3.8;
    ctx.strokeStyle="rgba(255,255,255,.96)";
    ctx.stroke();
    ctx.lineWidth=r.mode==="plane"?1.7:2.1;
    ctx.strokeStyle=(typeof COLORS!=="undefined"&&COLORS[r.mode])?COLORS[r.mode]:"#101820";
    ctx.stroke();
  });
  ctx.restore();
  if(typeof tripPlay!=="undefined" && tripPlay.on && tripPlay.lat!=null && typeof placeFlyer==="function"){
    placeFlyer(tripPlay.lat, tripPlay.lng, tripPlay.mode, tripPlay.country);
  }
  var shine=ctx.createRadialGradient(c[0]-R*0.36, c[1]-R*0.4, R*0.02, c[0], c[1], R);
  shine.addColorStop(0,"rgba(255,255,255,.3)");
  shine.addColorStop(0.42,"rgba(255,255,255,0)");
  shine.addColorStop(1,"rgba(255,255,255,0)");
  ctx.beginPath();
  ctx.arc(c[0], c[1], R, 0, Math.PI*2);
  ctx.fillStyle=shine;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(c[0], c[1], R, 0, Math.PI*2);
  ctx.strokeStyle="rgba(236,246,255,.92)";
  ctx.lineWidth=2.6;
  ctx.stroke();
}
function scheduleGlobe(){
  if(typeof map!=="undefined" && map && map._isAtlas) return;
  if(scheduleGlobe.pending) return;
  scheduleGlobe.pending=1;
  var run=function(){ scheduleGlobe.pending=0; drawGlobe(); };
  if(window.requestAnimationFrame) requestAnimationFrame(run);
  else run();
}
function globeNudge(dx, dy){
  var R=Math.max(80, Math.min(window.innerWidth, window.innerHeight)*0.34*globeScale);
  var k=180/(Math.PI*R)*0.38;
  globeRot.lng-=dx*k;
  globeRot.lat=Math.max(-70, Math.min(70, globeRot.lat+dy*k));
}
function globeZoom(factor){
  globeScale=Math.max(0.45, Math.min(8, globeScale*factor));
  scheduleGlobe();
}
function globeFit(){
  globeScale=1;
  var list=typeof filtered==="function"?filtered():[];
  var slat=0, slng=0, n=0;
  list.forEach(function(r){
    var g=typeof buildGeoSync==="function"?buildGeoSync(r):null;
    if(!g||!g.a) return;
    slat+=g.a.lat; slng+=g.a.lng; n++;
    if(g.b){ slat+=g.b.lat; slng+=g.b.lng; n++; }
  });
  globeRot.lat=n?Math.max(-60, Math.min(60, slat/n)):26;
  globeRot.lng=n?slng/n:40;
  scheduleGlobe();
}
function globeHit(clientX, clientY){
  if(!globeProjection || !globeCv || typeof openVisitPrompt!=="function") return;
  var rect=globeCv.getBoundingClientRect();
  var ll;
  try{ ll=globeProjection.invert([clientX-rect.left, clientY-rect.top]); }catch(e){ return; }
  if(!ll || isNaN(ll[0]) || isNaN(ll[1])) return;
  openVisitPrompt(ll[1], ll[0]);
}
function bindGlobePointer(){
  globeCv.addEventListener("pointerdown", function(e){
    if(!globeOn) return;
    globeCv.setPointerCapture && globeCv.setPointerCapture(e.pointerId);
    globeSpin++;
    globePtr={x:e.clientX, y:e.clientY, x0:e.clientX, y0:e.clientY, vx:0, vy:0, id:globeSpin, moved:false};
    e.preventDefault();
  });
  globeCv.addEventListener("pointermove", function(e){
    if(!globePtr || !globeOn) return;
    var dx=e.clientX-globePtr.x, dy=e.clientY-globePtr.y;
    if(Math.hypot(e.clientX-globePtr.x0, e.clientY-globePtr.y0)>12){ globePtr.moved=true; globeMoved=true; }
    globePtr.x=e.clientX; globePtr.y=e.clientY;
    globePtr.vx=dx; globePtr.vy=dy;
    if(globePtr.moved){ globeNudge(dx, dy); scheduleGlobe(); }
  });
  function end(e){
    var p=globePtr;
    globePtr=null;
    globeSpin++;
    if(!p || p.moved || !e || e.type==="pointercancel") return;
    var x=e.clientX, y=e.clientY;
    if(globeTapTimer){ clearTimeout(globeTapTimer); globeTapTimer=0; return; }
    globeTapTimer=setTimeout(function(){ globeTapTimer=0; globeHit(x, y); }, 320);
  }
  globeCv.addEventListener("pointerup", end);
  globeCv.addEventListener("pointercancel", end);
  globeCv.addEventListener("wheel", function(e){
    if(!globeOn || globePtr) return;
    e.preventDefault();
    globeZoom(e.deltaY>0?0.92:1.08);
  }, {passive:false});
  globeCv.addEventListener("dblclick", function(e){
    if(!globeOn) return;
    if(globeTapTimer){ clearTimeout(globeTapTimer); globeTapTimer=0; }
    e.preventDefault();
    globeZoom(1.6);
  });
  var pinch=null, lastTap=0, globeMoved=false;
  globeCv.addEventListener("touchstart", function(e){
    if(!globeOn) return;
    if(e.touches.length===2){
      var a=e.touches[0], b=e.touches[1];
      pinch={dist:Math.hypot(a.clientX-b.clientX, a.clientY-b.clientY)||1, scale:globeScale};
      globePtr=null;
    }
  }, {passive:true});
  globeCv.addEventListener("touchmove", function(e){
    if(!globeOn || !pinch || e.touches.length<2) return;
    var a=e.touches[0], b=e.touches[1];
    var dist=Math.hypot(a.clientX-b.clientX, a.clientY-b.clientY)||1;
    var factor=dist/pinch.dist;
    if(factor>0.94 && factor<1.06) return;
    globeScale=Math.max(0.45, Math.min(8, pinch.scale*factor));
    scheduleGlobe();
    if(e.cancelable) e.preventDefault();
  }, {passive:false});
  globeCv.addEventListener("touchend", function(e){
    if(e.touches.length<2) pinch=null;
    if(globeMoved){ globeMoved=false; return; }
    if(e.changedTouches.length===1 && e.touches.length===0){
      var t=e.changedTouches[0];
      var now=Date.now();
      if(now-lastTap<300 && Math.abs((t.clientX)-(globeCv._tapX||t.clientX))<24){
        if(globeTapTimer){ clearTimeout(globeTapTimer); globeTapTimer=0; }
        globeZoom(1.6);
        lastTap=0;
      } else {
        lastTap=now;
        globeCv._tapX=t.clientX;
      }
    }
  });
}

function updateNightLayer(){
  if(!map) return;
  if(map._isAtlas){
    if(nightLayer){ try{ map.removeLayer(nightLayer); }catch(e){} nightLayer=null; }
    return;
  }
  if(nightLayer){ try{ map.removeLayer(nightLayer); }catch(e){} nightLayer=null; }
  if(!nightOn) return;
  var ll=buildNightLatLngs(new Date());
  nightLayer=L.polygon(ll,{
    color:"transparent", fillColor:"#000", fillOpacity:0.35,
    interactive:false, className:"night-poly"
  });
  nightLayer.addTo(map);
  stackMapLayers();
}
function stackMapLayers(){
  try{ if(worldLayer) worldLayer.bringToBack(); }catch(e){}
  try{ if(nightLayer) nightLayer.bringToFront(); }catch(e){}
  try{ if(typeof countryLayer!=="undefined" && countryLayer) countryLayer.bringToFront(); }catch(e){}
  try{ if(typeof hoverLayer!=="undefined" && hoverLayer) hoverLayer.bringToFront(); }catch(e){}
  try{ if(typeof layer!=="undefined" && layer) layer.bringToFront(); }catch(e){}
  try{ if(typeof labelsLayer!=="undefined" && labelsLayer) labelsLayer.bringToFront(); }catch(e){}
}
setInterval(function(){ if(nightOn) updateNightLayer(); }, 60000);

/* ——— Подписи городов по всему видимому миру ——— */
var labelRoutePts=[];
function collectLabelPts(routes){
  labelRoutePts=[];
  routes.forEach(function(r){
    var g=typeof buildGeoSync==="function"?buildGeoSync(r):null;
    if(!g||!g.a) return;
    labelRoutePts.push([g.a.lat,g.a.lng]);
    if(g.b) labelRoutePts.push([g.b.lat,g.b.lng]);
  });
}
function nearAnyRoute(lat,lng,maxKm){
  maxKm=maxKm||400;
  if(!labelRoutePts.length) return true;
  var i,d;
  for(i=0;i<labelRoutePts.length;i++){
    d=hav({lat:lat,lng:lng},{lat:labelRoutePts[i][0],lng:labelRoutePts[i][1]});
    if(d<=maxKm) return true;
  }
  return false;
}

var layer=L.layerGroup().addTo(map);
try{window.__travelekMapRoutesLayer=layer;}catch(e){}
var labelsLayer=L.layerGroup().addTo(map);
var selectedId=null, activeTab="future", sheetState="mid", selectedTripId=null, sheetMore={on:false}, cardMore={};
var lastBounds=null;

function fitAll(){
  if(lastBounds&&lastBounds.length){
    try{ map.fitBounds(lastBounds,{padding:[50,120],maxZoom:6}); }catch(e){}
  } else {
    map.setView([45,20],4);
  }
  selectedId=null;
}

var pickModeLabels=false;
var worldLabelCache=null;
function labelCityName(raw){
  var s=String(raw||"").replace(/\s+/g," ").trim();
  if(!s) return "";
  if(s.indexOf(" — ")>=0) return s.split(" — ")[0].trim();
  var cut=s.split(" / ")[0].trim();
  var stripped=cut.replace(/\s+(international airport|airport|airbase|аэропорт).*$/i,"").trim();
  if(stripped!==cut) return stripped;
  var parts=cut.split(" ");
  if(parts.length===2) return parts[0];
  if(parts.length>2) return parts.slice(0,-1).join(" ");
  return cut;
}
function buildWorldLabels(){
  if(worldLabelCache) return worldLabelCache;
  var out=[], seen={};
  function add(name, lat, lng){
    name=labelCityName(name);
    if(!name || name.length<2 || lat==null || lng==null || isNaN(lat) || isNaN(lng)) return;
    var key=name.toLowerCase();
    if(seen[key]) return;
    seen[key]=1;
    out.push({name:name, lat:+lat, lng:+lng});
  }
  (typeof CITIES!=="undefined"?CITIES:[]).forEach(function(c){ add(c.n, c.lat, c.lng); });
  (typeof STATIONS!=="undefined"?STATIONS:[]).forEach(function(c){ add(c.n||c.name, c.lat, c.lng); });
  (typeof PORTS!=="undefined"?PORTS:[]).forEach(function(c){ add(c.n||c.name, c.lat, c.lng); });
  (typeof AIRPORTS!=="undefined"?AIRPORTS:[]).forEach(function(c){ add(c.n, c.lat, c.lng); });
  CITY_LABELS.forEach(function(c){ add(c.name, c.lat, c.lng); });
  worldLabelCache=out;
  return out;
}
var UI={"en": {"Настройки": "Settings", "Тема": "Theme", "Тёмная": "Dark", "Светлая": "Light", "Как на устройстве": "System", "Язык": "Language", "Карта": "Map", "Глобус": "Globe", "Ночь на карте всегда включена. Глобус — шар: потяните, чтобы покрутить, двумя пальцами или +/− приблизьте. Железные дороги всегда по точной сети.": "Night on the map is always on. The globe is a sphere: drag to spin it, pinch or use +/− to zoom. Railways follow the real network.", "Сбросить мои маршруты": "Reset my routes", "Сброс — двойным нажатием.": "Reset needs a second tap.", "Нажмите ещё раз": "Tap again", "Пользовательское соглашение": "Terms of use", "Обработка персональных данных": "Privacy", "Сохранить настройки": "Save settings", "Закрыть": "Close", "Аккаунт": "Account", "Будущие": "Upcoming", "История": "History", "Ваши маршруты": "Your routes", "небо, км": "plane, km", "самолет, км": "plane, km", "поезд, км": "rail, km", "авто, км": "road, km", "Посещённые страны": "Countries visited", "Вы были тут?": "Were you here?", "Нет": "No", "Да, был(а)": "Yes, I was", "Ткните точку на карте": "Tap a point on the map", "Нет сети · карта из кэша": "Offline · cached map", "Войти": "Log in", "Выйти": "Log out", "Новый маршрут": "New route", "Самолёт": "Plane", "Поезд": "Train", "Авто": "Car", "Отмена": "Cancel", "Сохранить": "Save", "Дневник путешествий": "Travel diary", "самолёт, поезд и дорога": "plane, train and road", "Обновить по маршрутам": "Update from routes", "Найти страну…": "Find a country…", "Регион или город…": "Region or city…", "Считаются по маршрутам. Можно отметить и вручную.": "Counted from routes. You can also mark them yourself.", "Можно найти по городу.": "You can search by city.", "Ничего не найдено": "Nothing found", "Показать": "Show", "Скрыть": "Hide", "Имя": "Name", "Сохранить имя": "Save name", "Сменить пароль": "Change password", "Все аккаунты": "All accounts", "Новый аккаунт": "New account", "Создать аккаунт": "Create account", "Принимаю": "I accept", "пользовательское соглашение": "the terms of use", "и": "and", "политику обработки данных": "the privacy policy", "Каждый видит только свой дневник. Новый аккаунт создаёт только администратор.": "Each person sees only their own diary. Only the admin can create an account.", "Логин": "Username", "Пароль": "Password", "Тип": "Type", "Дата": "Date", "Время": "Time", "Откуда (аэропорт)": "From (airport)", "Куда (аэропорт)": "To (airport)", "Откуда (вокзал)": "From (station)", "Куда (вокзал)": "To (station)", "Откуда (порт / город)": "From (port / city)", "Куда (порт / город)": "To (port / city)", "Откуда (город / точка)": "From (city / point)", "Куда (город / точка)": "To (city / point)", "Только аэропорт: SVO, LED…": "Airport only: SVO, LED…", "Только вокзал…": "Station only…", "Город или 📍 на карте": "City or 📍 on the map", "Рейс": "Flight", "Поезд / номер": "Train / number", "Название (необязательно)": "Name (optional)", "Рейс / паром": "Sailing / ferry", "Комментарий (необязательно)": "Note (optional)", "Как ехали": "How you drove", "По дорогам": "By road", "Бездорожье (через точки)": "Off-road (via points)", "＋ Добавить маршрут": "＋ Add a route", "Тяните шар · +/− ближе": "Drag the globe · +/− to zoom", "Регионы России": "Regions of Russia", "Регионы Китая": "Regions of China", "стран": "countries", "регионов РФ": "Russian regions", "регионов Китая": "Chinese regions", "из": "of", "скоро": "soon", "км": "km", "Изменить": "Edit", "Удалить": "Delete", "Нет предстоящих маршрутов. Откройте «История» или добавьте новый.": "No upcoming routes. Open History or add one.", "В истории пока пусто": "Nothing in history yet", "Нет маршрутов": "No routes", "Администратор": "Admin", "Пользователь": "User", "админ · ": "admin · ", "маршрутов": "routes", "стран · ": "countries · ", "Пока только вы.": "Just you so far.", "Маршрутов пока нет": "No routes yet", "Список аккаунтов не загрузился.": "Could not load accounts.", "Нужно принять соглашение и политику": "Please accept the terms and the privacy policy", "Неверный логин или пароль": "Wrong username or password", "Пароль изменён": "Password changed", "Не удалось сменить пароль. Проверьте текущий.": "Could not change the password. Check the current one.", "Аккаунт создан. Теперь по этому логину можно войти с любого телефона.": "Account created. You can now log in from any phone.", "Не удалось создать": "Could not create the account", "Назад": "Back", "Дневник: ": "Diary: ", "Обработка данных": "Privacy", "Текущий пароль": "Current password", "Новый пароль, от 8 символов": "New password, 8+ characters", "Новый пароль ещё раз": "New password again", "Нажмите человека, чтобы открыть его дневник. Новый аккаунт сохраняется сразу на сайте, файл на GitHub для этого менять не нужно.": "Tap a person to open their diary. A new account is saved on the site at once — the GitHub file does not need to change.", "＋ Точка на карте": "＋ Point on the map", "Очистить точки": "Clear points", "Промежуточные точки (обойти лес/реку)": "Waypoints (around a forest or river)", "Для авто: 📍 — ткните точку на карте (Россия)": "For a car: 📍 — tap a point on the map", "Редактировать": "Edit", "Только администратор": "Admin only", "Только администратор может создавать аккаунты": "Only the admin can create accounts", "Карта или глобус": "Map or globe", "Все маршруты": "All routes", "Добавить": "Add", "день": "day", "дня": "days", "дней": "days", "час": "hour", "часа": "hours", "часов": "hours", "предстоящий": "upcoming", "предстоящих": "upcoming", "рейс": "flight", "рейса": "flights", "рейсов": "flights", "маршрут": "route", "маршрута": "routes", "мин": "min"}, "zh": {"Настройки": "设置", "Тема": "主题", "Тёмная": "深色", "Светлая": "浅色", "Как на устройстве": "跟随系统", "Язык": "语言", "Карта": "地图", "Глобус": "地球", "Ночь на карте всегда включена. Глобус — шар: потяните, чтобы покрутить, двумя пальцами или +/− приблизьте. Железные дороги всегда по точной сети.": "地图上的夜景始终开启。地球是个球体：拖动旋转，双指或 +/− 缩放。铁路按真实线路绘制。", "Сбросить мои маршруты": "清除我的路线", "Сброс — двойным нажатием.": "再点一次才会清除。", "Нажмите ещё раз": "再点一次", "Пользовательское соглашение": "用户协议", "Обработка персональных данных": "个人信息处理", "Сохранить настройки": "保存设置", "Закрыть": "关闭", "Аккаунт": "账户", "Будущие": "即将出发", "История": "历史", "Ваши маршруты": "您的路线", "небо, км": "飞行，公里", "поезд, км": "火车，公里", "авто, км": "驾车，公里", "Посещённые страны": "到过的国家", "Вы были тут?": "您来过这里吗？", "Нет": "否", "Да, был(а)": "是的，来过", "Ткните точку на карте": "点地图上的位置", "Нет сети · карта из кэша": "无网络 · 使用缓存地图", "Войти": "登录", "Выйти": "退出", "Новый маршрут": "新路线", "Самолёт": "飞机", "Поезд": "火车", "Авто": "汽车", "Отмена": "取消", "Сохранить": "保存", "Дневник путешествий": "旅行日记", "самолёт, поезд и дорога": "飞机、火车和公路", "Обновить по маршрутам": "按路线更新", "Найти страну…": "搜索国家…", "Регион или город…": "搜索地区或城市…", "Считаются по маршрутам. Можно отметить и вручную.": "按路线统计，也可以手动标记。", "Можно найти по городу.": "可以按城市查找。", "Ничего не найдено": "没有找到", "Показать": "显示", "Скрыть": "隐藏", "Имя": "名字", "Сохранить имя": "保存名字", "Сменить пароль": "修改密码", "Все аккаунты": "全部账户", "Новый аккаунт": "新账户", "Создать аккаунт": "创建账户", "Принимаю": "我接受", "пользовательское соглашение": "用户协议", "и": "和", "политику обработки данных": "个人信息政策", "Каждый видит только свой дневник. Новый аккаунт создаёт только администратор.": "每个人只能看到自己的日记。新账户只能由管理员创建。", "Логин": "登录名", "Пароль": "密码", "Тип": "类型", "Дата": "日期", "Время": "时间", "Откуда (аэропорт)": "出发（机场）", "Куда (аэропорт)": "到达（机场）", "Откуда (вокзал)": "出发（车站）", "Куда (вокзал)": "到达（车站）", "Откуда (порт / город)": "出发（港口 / 城市）", "Куда (порт / город)": "到达（港口 / 城市）", "Откуда (город / точка)": "出发（城市 / 地点）", "Куда (город / точка)": "到达（城市 / 地点）", "Только аэропорт: SVO, LED…": "仅限机场：SVO、LED…", "Только вокзал…": "仅限车站…", "Город или 📍 на карте": "城市或点地图 📍", "Рейс": "航班", "Поезд / номер": "车次", "Название (необязательно)": "名称（可选）", "Рейс / паром": "班次 / 渡轮", "Комментарий (необязательно)": "备注（可选）", "Как ехали": "怎么走的", "По дорогам": "沿公路", "Бездорожье (через точки)": "越野（经过地点）", "＋ Добавить маршрут": "＋ 添加路线", "Тяните шар · +/− ближе": "拖动地球 · +/− 缩放", "Регионы России": "俄罗斯地区", "Регионы Китая": "中国地区", "стран": "个国家", "регионов РФ": "个俄罗斯地区", "регионов Китая": "个中国地区", "из": "/", "скоро": "即将", "км": "公里", "Изменить": "编辑", "Удалить": "删除", "Нет предстоящих маршрутов. Откройте «История» или добавьте новый.": "没有即将出发的路线。打开「历史」或添加一条。", "В истории пока пусто": "历史里还是空的", "Нет маршрутов": "没有路线", "Администратор": "管理员", "Пользователь": "用户", "админ · ": "管理员 · ", "маршрутов": "条", "стран · ": "个国家 · ", "Пока только вы.": "目前只有您。", "Маршрутов пока нет": "还没有路线", "Список аккаунтов не загрузился.": "账户列表没有加载出来。", "Нужно принять соглашение и политику": "需要接受协议和隐私政策", "Неверный логин или пароль": "登录名或密码不正确", "Пароль изменён": "密码已修改", "Не удалось сменить пароль. Проверьте текущий.": "没能修改密码。请检查当前密码。", "Аккаунт создан. Теперь по этому логину можно войти с любого телефона.": "账户已创建。现在用这个登录名可以在任何手机上进入。", "Не удалось создать": "没能创建", "Назад": "返回", "Дневник: ": "日记：", "Обработка данных": "个人信息", "Текущий пароль": "当前密码", "Новый пароль, от 8 символов": "新密码，至少 8 位", "Новый пароль ещё раз": "再输入一次新密码", "Нажмите человека, чтобы открыть его дневник. Новый аккаунт сохраняется сразу на сайте, файл на GitHub для этого менять не нужно.": "点一个人即可打开他的日记。新账户会立刻保存在网站上，不必为此改 GitHub 上的文件。", "＋ Точка на карте": "＋ 地图上的点", "Очистить точки": "清除地点", "Промежуточные точки (обойти лес/реку)": "途经点（绕开森林或河流）", "Для авто: 📍 — ткните точку на карте (Россия)": "驾车：📍 — 在地图上点一个位置", "Редактировать": "编辑", "Только администратор": "仅管理员", "Только администратор может создавать аккаунты": "只有管理员能创建账户", "Карта или глобус": "地图或地球", "Все маршруты": "全部路线", "Добавить": "添加", "день": "天", "дня": "天", "дней": "天", "час": "小时", "часа": "小时", "часов": "小时", "предстоящий": "即将", "предстоящих": "即将", "рейс": "次", "рейса": "次", "рейсов": "次", "маршрут": "条", "маршрута": "条", "мин": "分钟"}};
var REGIONS={"en": {"Адыгея": "Adygea", "Алтайский край": "Altai Krai", "Амурская область": "Amur Oblast", "Архангельская область": "Arkhangelsk Oblast", "Астраханская область": "Astrakhan Oblast", "Белгородская область": "Belgorod Oblast", "Брянская область": "Bryansk Oblast", "Бурятия": "Buryatia", "Владимирская область": "Vladimir Oblast", "Волгоградская область": "Volgograd Oblast", "Вологодская область": "Vologda Oblast", "Воронежская область": "Voronezh Oblast", "Дагестан": "Dagestan", "Донецкая Народная Республика": "Donetsk People's Republic", "Еврейская автономная область": "Jewish Autonomous Oblast", "Забайкальский край": "Zabaykalsky Krai", "Запорожская область": "Zaporizhzhia Oblast", "Ивановская область": "Ivanovo Oblast", "Ингушетия": "Ingushetia", "Иркутская область": "Irkutsk Oblast", "Кабардино-Балкария": "Kabardino-Balkaria", "Калининградская область": "Kaliningrad Oblast", "Калмыкия": "Kalmykia", "Калужская область": "Kaluga Oblast", "Камчатский край": "Kamchatka Krai", "Карачаево-Черкесия": "Karachay-Cherkessia", "Карелия": "Karelia", "Кемеровская область": "Kemerovo Oblast", "Кировская область": "Kirov Oblast", "Костромская область": "Kostroma Oblast", "Краснодарский край": "Krasnodar Krai", "Красноярский край": "Krasnoyarsk Krai", "Курганская область": "Kurgan Oblast", "Курская область": "Kursk Oblast", "Ленинградская область": "Leningrad Oblast", "Липецкая область": "Lipetsk Oblast", "Луганская Народная Республика": "Lugansk People's Republic", "Магаданская область": "Magadan Oblast", "Марий Эл": "Mari El", "Мордовия": "Mordovia", "Москва": "Moscow", "Московская область": "Moscow Oblast", "Мурманская область": "Murmansk Oblast", "Ненецкий автономный округ": "Nenets Autonomous Okrug", "Нижегородская область": "Nizhny Novgorod Oblast", "Новгородская область": "Novgorod Oblast", "Новосибирская область": "Novosibirsk Oblast", "Омская область": "Omsk Oblast", "Оренбургская область": "Orenburg Oblast", "Орловская область": "Oryol Oblast", "Пензенская область": "Penza Oblast", "Пермский край": "Perm Krai", "Приморский край": "Primorsky Krai", "Псковская область": "Pskov Oblast", "Республика Алтай": "Altai Republic", "Республика Башкортостан": "Bashkortostan", "Республика Коми": "Komi Republic", "Республика Крым": "Republic of Crimea", "Республика Северная Осетия-Алания": "North Ossetia–Alania", "Ростовская область": "Rostov Oblast", "Рязанская область": "Ryazan Oblast", "Самарская область": "Samara Oblast", "Санкт-Петербург": "Saint Petersburg", "Саратовская область": "Saratov Oblast", "Сахалинская область": "Sakhalin Oblast", "Свердловская область": "Sverdlovsk Oblast", "Севастополь": "Sevastopol", "Смоленская область": "Smolensk Oblast", "Ставропольский край": "Stavropol Krai", "Тамбовская область": "Tambov Oblast", "Татарстан": "Tatarstan", "Тверская область": "Tver Oblast", "Томская область": "Tomsk Oblast", "Тульская область": "Tula Oblast", "Тыва": "Tuva", "Тюменская область": "Tyumen Oblast", "Удмуртия": "Udmurtia", "Ульяновская область": "Ulyanovsk Oblast", "Хабаровский край": "Khabarovsk Krai", "Хакасия": "Khakassia", "Ханты-Мансийский автономный округ — Югра": "Khanty-Mansi Autonomous Okrug — Yugra", "Херсонская область": "Kherson Oblast", "Челябинская область": "Chelyabinsk Oblast", "Чечня": "Chechnya", "Чувашия": "Chuvashia", "Чукотский автономный округ": "Chukotka Autonomous Okrug", "Якутия": "Yakutia", "Ямало-Ненецкий автономный округ": "Yamalo-Nenets Autonomous Okrug", "Ярославская область": "Yaroslavl Oblast", "Аньхой": "Anhui", "Внутренняя Монголия": "Inner Mongolia", "Ганьсу": "Gansu", "Гирин": "Jilin", "Гуандун": "Guangdong", "Гуанси-Чжуанский автономный район": "Guangxi", "Гуйчжоу": "Guizhou", "Ляонин": "Liaoning", "Нинся-Хуэйский автономный район": "Ningxia", "Пекин": "Beijing", "Синьцзян-Уйгурский автономный район": "Xinjiang", "Сычуань": "Sichuan", "Тайвань": "Taiwan", "Тибетский автономный район": "Tibet", "Тяньцзинь": "Tianjin", "Фуцзянь": "Fujian", "Хайнань": "Hainan", "Хубэй": "Hubei", "Хунань": "Hunan", "Хэбэй": "Hebei", "Хэйлунцзян": "Heilongjiang", "Хэнань": "Henan", "Цзянси": "Jiangxi", "Цзянсу": "Jiangsu", "Цинхай": "Qinghai", "Чжэцзян": "Zhejiang", "Чунцин": "Chongqing", "Шанхай": "Shanghai", "Шаньдун": "Shandong", "Шаньси": "Shanxi", "Шэньси": "Shaanxi", "Юньнань": "Yunnan"}, "zh": {"Адыгея": "阿迪格", "Алтайский край": "阿尔泰边疆区", "Амурская область": "阿穆尔州", "Архангельская область": "阿尔汉格尔斯克州", "Астраханская область": "阿斯特拉罕州", "Белгородская область": "别尔哥罗德州", "Брянская область": "布良斯克州", "Бурятия": "布里亚特", "Владимирская область": "弗拉基米尔州", "Волгоградская область": "伏尔加格勒州", "Вологодская область": "沃洛格达州", "Воронежская область": "沃罗涅日州", "Дагестан": "达吉斯坦", "Донецкая Народная Республика": "顿涅茨克人民共和国", "Еврейская автономная область": "犹太自治州", "Забайкальский край": "外贝加尔边疆区", "Запорожская область": "扎波罗热州", "Ивановская область": "伊万诺沃州", "Ингушетия": "印古什", "Иркутская область": "伊尔库茨克州", "Кабардино-Балкария": "卡巴尔达-巴尔卡尔", "Калининградская область": "加里宁格勒州", "Калмыкия": "卡尔梅克", "Калужская область": "卡卢加州", "Камчатский край": "堪察加边疆区", "Карачаево-Черкесия": "卡拉恰伊-切尔克斯", "Карелия": "卡累利阿", "Кемеровская область": "克麦罗沃州", "Кировская область": "基洛夫州", "Костромская область": "科斯特罗马州", "Краснодарский край": "克拉斯诺达尔边疆区", "Красноярский край": "克拉斯诺亚尔斯克边疆区", "Курганская область": "库尔干州", "Курская область": "库尔斯克州", "Ленинградская область": "列宁格勒州", "Липецкая область": "利佩茨克州", "Луганская Народная Республика": "卢甘斯克人民共和国", "Магаданская область": "马加丹州", "Марий Эл": "马里埃尔", "Мордовия": "莫尔多瓦", "Москва": "莫斯科", "Московская область": "莫斯科州", "Мурманская область": "摩尔曼斯克州", "Ненецкий автономный округ": "涅涅茨自治区", "Нижегородская область": "下诺夫哥罗德州", "Новгородская область": "诺夫哥罗德州", "Новосибирская область": "新西伯利亚州", "Омская область": "鄂木斯克州", "Оренбургская область": "奥伦堡州", "Орловская область": "奥廖尔州", "Пензенская область": "奔萨州", "Пермский край": "彼尔姆边疆区", "Приморский край": "滨海边疆区", "Псковская область": "普斯科夫州", "Республика Алтай": "阿尔泰共和国", "Республика Башкортостан": "巴什科尔托斯坦", "Республика Коми": "科米共和国", "Республика Крым": "克里米亚共和国", "Республика Северная Осетия-Алания": "北奥塞梯-阿兰", "Ростовская область": "罗斯托夫州", "Рязанская область": "梁赞州", "Самарская область": "萨马拉州", "Санкт-Петербург": "圣彼得堡", "Саратовская область": "萨拉托夫州", "Сахалинская область": "萨哈林州", "Свердловская область": "斯维尔德洛夫斯克州", "Севастополь": "塞瓦斯托波尔", "Смоленская область": "斯摩棱斯克州", "Ставропольский край": "斯塔夫罗波尔边疆区", "Тамбовская область": "坦波夫州", "Татарстан": "鞑靼斯坦", "Тверская область": "特维尔州", "Томская область": "托木斯克州", "Тульская область": "图拉州", "Тыва": "图瓦", "Тюменская область": "秋明州", "Удмуртия": "乌德穆尔特", "Ульяновская область": "乌里扬诺夫斯克州", "Хабаровский край": "哈巴罗夫斯克边疆区", "Хакасия": "哈卡斯", "Ханты-Мансийский автономный округ — Югра": "汉特-曼西自治区—尤格拉", "Херсонская область": "赫尔松州", "Челябинская область": "车里雅宾斯克州", "Чечня": "车臣", "Чувашия": "楚瓦什", "Чукотский автономный округ": "楚科奇自治区", "Якутия": "雅库特", "Ямало-Ненецкий автономный округ": "亚马尔-涅涅茨自治区", "Ярославская область": "雅罗斯拉夫尔州", "Аньхой": "安徽", "Внутренняя Монголия": "内蒙古", "Ганьсу": "甘肃", "Гирин": "吉林", "Гуандун": "广东", "Гуанси-Чжуанский автономный район": "广西", "Гуйчжоу": "贵州", "Ляонин": "辽宁", "Нинся-Хуэйский автономный район": "宁夏", "Пекин": "北京", "Синьцзян-Уйгурский автономный район": "新疆", "Сычуань": "四川", "Тайвань": "台湾", "Тибетский автономный район": "西藏", "Тяньцзинь": "天津", "Фуцзянь": "福建", "Хайнань": "海南", "Хубэй": "湖北", "Хунань": "湖南", "Хэбэй": "河北", "Хэйлунцзян": "黑龙江", "Хэнань": "河南", "Цзянси": "江西", "Цзянсу": "江苏", "Цинхай": "青海", "Чжэцзян": "浙江", "Чунцин": "重庆", "Шанхай": "上海", "Шаньдун": "山东", "Шаньси": "山西", "Шэньси": "陕西", "Юньнань": "云南"}};
var LEGAL_I18N={"ru": {"terms": "<p>Сервис «ТравелЕк» — личный дневник маршрутов: самолёт, поезд и автомобиль. Это не магазин и не платная услуга. Платы за вход нет.</p>\n      <h3>Аккаунт</h3>\n      <ul>\n        <li>Новый аккаунт создаёт только администратор и передаёт логин с паролем.</li>\n        <li>Нельзя входить в чужой дневник и передавать свой пароль другим людям.</li>\n        <li>Администратор может сменить пароль, ограничить доступ и удалить аккаунт.</li>\n      </ul>\n      <h3>Что вы добавляете</h3>\n      <ul>\n        <li>Маршруты, даты и отметки стран и регионов вы вносите сами. За их точность отвечаете вы.</li>\n        <li>Карта показывает границы в том виде, в каком они собраны для этого дневника. Это справочная схема, а не официальный документ.</li>\n        <li>Свои маршруты можно стереть двойным нажатием «Сбросить мои маршруты» в настройках.</li>\n      </ul>\n      <h3>Как есть</h3>\n      <p>Дневник даётся как есть. Администратор не обещает, что сервис будет работать без перерывов. Соглашение можно обновить: действующий текст открывается по ссылке в настройках и на экране входа. Вход с отмеченным согласием означает, что текст вам понятен и вы его принимаете.</p>", "privacy": "<p>Дневник обрабатывает только то, что нужно, чтобы пускать вас в свой аккаунт и показывать ваши маршруты. Рекламным сетям эти сведения не передаются.</p>\n      <h3>Какие данные</h3>\n      <ul>\n        <li>Логин, имя и хэш пароля.</li>\n        <li>Маршруты, отметки стран и регионов, статистика километров.</li>\n        <li>Технические записи в браузере: сессия входа и настройки карты.</li>\n      </ul>\n      <h3>Зачем и где лежат</h3>\n      <ul>\n        <li>Чтобы открыть ваш дневник и не смешивать его с чужим.</li>\n        <li>Копия хранится в браузере этого устройства и в общем хранилище дневников, чтобы тот же аккаунт открывался с другого устройства.</li>\n        <li>Администратор видит маршруты и сводную статистику аккаунтов, чтобы вести дневники и менять пароль, если вы попросите.</li>\n        <li>Пароль в открытом виде другим пользователям не показывается.</li>\n      </ul>\n      <h3>Срок и ваши права</h3>\n      <p>Данные хранятся, пока аккаунт нужен. Можно попросить администратора исправить имя, сменить пароль или удалить аккаунт вместе с маршрутами. Согласие даётся отметкой на экране входа. Если отозвать согласие, вход в дневник прекращается: без этих данных аккаунт не работает.</p>"}, "en": {"terms": "<p>Travelek is a personal diary of routes: plane, train and car. It is not a shop and not a paid service. Signing in is free.</p>\n<h3>Account</h3><ul>\n<li>Only the administrator creates a new account and gives out the username and password.</li>\n<li>Do not sign in to someone else's diary or give your password to other people.</li>\n<li>The administrator can change a password, limit access and delete an account.</li>\n</ul>\n<h3>What you add</h3><ul>\n<li>You enter routes, dates and country or region marks yourself. You are responsible for their accuracy.</li>\n<li>The map shows borders as they are drawn for this diary. It is a reference sketch, not an official document.</li>\n<li>You can erase your routes by double-tapping “Reset my routes” in settings.</li>\n</ul>\n<h3>As is</h3>\n<p>The diary is provided as is. The administrator does not promise uninterrupted service. The terms can be updated: the current text opens from settings and from the sign-in screen. Signing in with the box checked means you understand and accept the text.</p>", "privacy": "<p>The diary processes only what it needs to let you into your account and show your routes. This information is not sent to advertising networks.</p>\n<h3>Which data</h3><ul>\n<li>Username, name and a hash of the password.</li>\n<li>Routes, country and region marks, kilometre statistics.</li>\n<li>Technical notes in the browser: the sign-in session and map settings.</li>\n</ul>\n<h3>Why and where</h3><ul>\n<li>So your diary opens and is not mixed with someone else's.</li>\n<li>A copy is kept in this device's browser and in the shared diary storage, so the same account opens on another device.</li>\n<li>The administrator sees routes and summary statistics in order to run the diaries and change a password if you ask.</li>\n<li>The password is not shown in clear text to other users.</li>\n</ul>\n<h3>How long, and your rights</h3>\n<p>Data is kept while the account is needed. You can ask the administrator to correct the name, change the password or delete the account together with the routes. Consent is the tick on the sign-in screen. If you withdraw consent, you can no longer sign in: the account does not work without this data.</p>"}, "zh": {"terms": "<p>「旅行日记」是个人路线日记：飞机、火车和汽车。不是商店，也不是付费服务。登录不收费。</p>\n<h3>账户</h3><ul>\n<li>新账户只能由管理员创建，并由管理员把登录名和密码交给您。</li>\n<li>不能进入别人的日记，也不能把自己的密码交给别人。</li>\n<li>管理员可以修改密码、限制访问和删除账户。</li>\n</ul>\n<h3>您添加的内容</h3><ul>\n<li>路线、日期以及国家和地标记由您自己填写。内容是否准确由您负责。</li>\n<li>地图上的边界是为本日记整理的示意图，不是官方文件。</li>\n<li>可以在设置里对「清除我的路线」连点两次，删掉自己的路线。</li>\n</ul>\n<h3>按现状提供</h3>\n<p>日记按现状提供。管理员不保证服务从不中断。协议可以更新：现行文本在设置和登录页打开。勾选同意后登录，即表示您理解并接受该文本。</p>", "privacy": "<p>日记只处理让您进入自己的账户并显示路线所需要的信息。这些信息不会交给广告网络。</p>\n<h3>哪些数据</h3><ul>\n<li>登录名、名字和密码的哈希。</li>\n<li>路线、国家和地标记、公里统计。</li>\n<li>浏览器里的技术记录：登录会话和地图设置。</li>\n</ul>\n<h3>为什么、放在哪里</h3><ul>\n<li>为了打开您的日记，并且不和别人的混在一起。</li>\n<li>一份保存在这台设备的浏览器里，一份保存在日记的共享存储里，这样同一账户可以在另一台设备上打开。</li>\n<li>管理员能看到路线和汇总统计，以便管理日记，并在您要求时修改密码。</li>\n<li>密码不会以明文显示给其他用户。</li>\n</ul>\n<h3>保存多久，以及您的权利</h3>\n<p>在账户还需要时保存数据。您可以请管理员更正名字、修改密码，或连同路线一起删除账户。同意是登录页上的勾选。如果撤回同意，就不能再登录：没有这些数据，账户无法工作。</p>"}};
function t(s){
  var lang=currentLang();
  if(!s || lang==="ru") return s||"";
  var pack=UI[lang];
  return (pack && pack[s]!=null) ? pack[s] : s;
}
UI.en["Все годы"]="All years";
UI.zh["Все годы"]="全部年份";
UI.en["Проверяем…"]="Checking…";
UI.zh["Проверяем…"]="正在核对…";
UI.en["Считаем страны по маршрутам…"]="Counting countries from routes…";
UI.zh["Считаем страны по маршрутам…"]="正在按路线统计国家…";
UI.en["Показать поездку"]="Play the trips";
UI.zh["Показать поездку"]="播放行程";
UI.en["Стоп"]="Stop";
UI.zh["Стоп"]="停止";
UI.en["Убрать"]="Hide";
UI.zh["Убрать"]="关闭";
UI.en["Сейчас в пути"]="On the way";
UI.zh["Сейчас в пути"]="正在途中";
UI.en["нет железной дороги"]="no through railway";
UI.zh["нет железной дороги"]="没有直达铁路";
UI.en["нет автодороги"]="no through road";
UI.zh["нет автодороги"]="没有直达公路";
UI.en["регионов"]="regions";
UI.zh["регионов"]="个地区";

UI.en["Смотреть далее"]="See more";
UI.zh["Смотреть далее"]="查看更多";
UI.en["Смотреть все"]="See all";
UI.zh["Смотреть все"]="查看全部";
UI.en["Смотреть еще"]="See more";
UI.zh["Смотреть еще"]="查看更多";
UI.en["Вне поездок"]="Outside trips";
UI.zh["Вне поездок"]="行程之外";
UI.en["Укажите маршрут"]="Add a route";
UI.zh["Укажите маршрут"]="填写路线";
UI.en["Укажите страну"]="Add a country";
UI.zh["Укажите страну"]="填写国家";
UI.en["Добавить поездку"]="Add a trip";
UI.zh["Добавить поездку"]="添加行程";
UI.en["Добавить маршрут"]="Add route";
UI.zh["Добавить маршрут"]="添加路线";
UI.en["Маршруты"]="Routes";
UI.zh["Маршруты"]="路线";
UI.en["Страны"]="Countries";
UI.zh["Страны"]="国家";
UI.en["Откуда"]="From";
UI.zh["Откуда"]="出发";
UI.en["Куда"]="To";
UI.zh["Куда"]="到达";

UI.en["Прошлые"]="Past";
UI.zh["Прошлые"]="过去";
UI.en["Поездки"]="Trips";
UI.zh["Поездки"]="行程";
UI.en["Поездка"]="Trip";
UI.zh["Поездка"]="行程";
UI.en["Новая поездка"]="New trip";
UI.zh["Новая поездка"]="新行程";
UI.en["Название поездки"]="Trip name";
UI.zh["Название поездки"]="行程名称";
UI.en["Страны"]="Countries";
UI.zh["Страны"]="国家";
UI.en["Регионы"]="Regions";
UI.zh["Регионы"]="地区";
UI.en["Маршруты"]="Routes";
UI.zh["Маршруты"]="路线";
UI.en["Поездок пока нет"]="No trips yet";
UI.zh["Поездок пока нет"]="还没有行程";
UI.en["Удалить поездку"]="Delete trip";
UI.zh["Удалить поездку"]="删除行程";
UI.en["Отметьте страну, регион или маршрут"]="Pick a country, a region or a route";
UI.zh["Отметьте страну, регион или маршрут"]="请选择国家、地区或路线";
UI.en["Нет предстоящих маршрутов. Откройте «Прошлые» или добавьте новый."]="No upcoming routes. Open Past or add one.";
UI.zh["Нет предстоящих маршрутов. Откройте «Прошлые» или добавьте новый."]="没有即将出发的路线。打开「过去」或添加一条。";
UI.en["В прошлых пока пусто"]="Nothing in the past yet";
UI.zh["В прошлых пока пусто"]="过去里还是空的";
function regionLabel(name){
  var lang=currentLang();
  if(!name || lang==="ru") return name||"";
  var pack=REGIONS[lang];
  return (pack && pack[name]) || name;
}
function countryLabel(c){
  if(!c) return "";
  var lang=currentLang();
  if(lang==="ru") return c.n||c.i||"";
  var fix={AB:{en:"Abkhazia",zh:"阿布哈兹"},OS:{en:"South Ossetia",zh:"南奥塞梯"}};
  if(fix[c.i] && fix[c.i][lang]) return fix[c.i][lang];
  try{
    var dn=new Intl.DisplayNames([lang==="zh"?"zh-CN":lang],{type:"region"});
    var name=dn.of(c.i);
    if(name && name!==c.i) return name;
  }catch(e){}
  return c.n||c.i||"";
}
function ofCount(got, total, noun){
  var lang=currentLang();
  if(lang==="en") return got+" of "+total+" "+noun;
  if(lang==="zh") return got+"/"+total+" "+noun;
  return got+" из "+total+" "+noun;
}
function legalHtml(kind){
  var lang=currentLang();
  if(!LEGAL_I18N) return "";
  var pack=LEGAL_I18N[lang]||LEGAL_I18N.ru;
  return (pack && pack[kind]) || (LEGAL_I18N.ru && LEGAL_I18N.ru[kind]) || "";
}
function applyI18n(){
  var nodes=document.querySelectorAll("[data-i18n]"), i, el, key, input;
  for(i=0;i<nodes.length;i++){
    el=nodes[i];
    key=el.getAttribute("data-i18n");
    if(!key) continue;
    if(el.hasAttribute("data-i18n-ph") || el.tagName==="INPUT" || el.tagName==="TEXTAREA"){
      if(el.hasAttribute("data-i18n-ph")) el.placeholder=t(el.getAttribute("data-i18n-ph"));
      else if(el.getAttribute("placeholder")) el.placeholder=t(key);
    }
    if(el.tagName!=="INPUT" && el.tagName!=="TEXTAREA") el.textContent=t(key);
  }
  document.querySelectorAll("[data-i18n-ph]").forEach(function(el){
    el.placeholder=t(el.getAttribute("data-i18n-ph"));
  });
  document.querySelectorAll("[data-i18n-title]").forEach(function(el){
    var s=t(el.getAttribute("data-i18n-title"));
    el.title=s;
    if(el.hasAttribute("aria-label")) el.setAttribute("aria-label", s);
  });
  document.querySelectorAll("[data-eye]").forEach(function(btn){
    input=document.getElementById(btn.getAttribute("data-eye"));
    btn.textContent=(input && input.type==="text")?t("Скрыть"):t("Показать");
  });
  var hint=document.getElementById("globe-hint");
  if(hint) hint.textContent=t("Тяните шар · +/− ближе");
  var sw=document.getElementById("map-switch");
  if(sw) sw.setAttribute("aria-label", t("Карта или глобус"));
  var terms=document.getElementById("legal-terms");
  var privacy=document.getElementById("legal-privacy");
  if(terms && legalHtml("terms")) terms.innerHTML=legalHtml("terms");
  if(privacy && legalHtml("privacy")) privacy.innerHTML=legalHtml("privacy");
  var lang=currentLang();
  document.documentElement.lang=lang==="zh"?"zh-CN":lang;
}
function currentLang(){
  try{
    var l=localStorage.getItem("travelek-lang")||"ru";
    return (l==="en"||l==="zh")?l:"ru";
  }catch(e){ return "ru"; }
}
function labelText(c){
  var lang=currentLang();
  return (c&&(c[lang]||c.ru||c.en||c.zh||c.name))||"";
}
function escLabel(s){
  return String(s||"").replace(/[&<>"]/g, function(ch){
    if(ch==="&") return "\u0026amp;";
    if(ch==="<") return "\u0026lt;";
    if(ch===">") return "\u0026gt;";
    return "\u0026quot;";
  });
}
function syncLangButtons(){
  var lang=currentLang();
  var buttons=document.querySelectorAll("#lang-switch button");
  for(var i=0;i<buttons.length;i++) buttons[i].classList.toggle("on", buttons[i].getAttribute("data-lang")===lang);
}
function setLang(lang){
  if(lang!=="ru" && lang!=="en" && lang!=="zh") lang="ru";
  try{ localStorage.setItem("travelek-lang", lang); }catch(e){}
  syncLangButtons();
  applyI18n();
  if(typeof updateLabels==="function") updateLabels();
  if(typeof render==="function") render();
  if(typeof renderCountryUi==="function") renderCountryUi();
  if(typeof drawCityLabels==="function") drawCityLabels();
  if(window.__fillAccount && document.getElementById("account-panel") && document.getElementById("account-panel").classList.contains("on")){
    try{ window.__fillAccount(); }catch(e){}
  }
}
function drawCityLabels(){
  if(!labelsLayer || !map) return;
  if(map._isAtlas && map.getZoom()<5){ labelsLayer.clearLayers(); return; }
  labelsLayer.clearLayers();
  var z=map.getZoom();
  if(z<3.4) return;
  var theme=document.documentElement.getAttribute("data-theme")||"dark";
  var color=theme==="light"?"#142033":"#f7f9fc";
  var bg=theme==="light"?"rgba(255,255,255,.88)":"rgba(6,10,18,.72)";
  if(map && map._isAtlas){ color="#1f2a26"; bg="rgba(255,255,255,.92)"; }
  var list=(typeof PLACE_LABELS!=="undefined" && PLACE_LABELS && PLACE_LABELS.length)?PLACE_LABELS:[];
  if(!list.length) return;
  var b=map.getBounds();
  var center=map.getCenter();
  var showOther=z>=6.5 || pickModeLabels;
  var showRegion=z>=4.8 || pickModeLabels;
  var ranked=[], i, c, dist;
  for(i=0;i<list.length;i++){
    c=list[i];
    if(!c || c.lat==null || c.lng==null || !b.contains([+c.lat,+c.lng])) continue;
    if((c.k||0)!==0) continue;
    dist=(c.lat-center.lat)*(c.lat-center.lat)+(c.lng-center.lng)*(c.lng-center.lng);
    ranked.push({c:c, tier:c.k||0, dist:dist});
  }
  ranked.sort(function(a,d){
    if(a.tier!==d.tier) return a.tier-d.tier;
    return a.dist-d.dist;
  });
  var cell=z>=8?0.8:(z>=6.5?1.4:(z>=4.8?2.2:4));
  var used={};
  var maxLabels=pickModeLabels?20:(z>=8?12:(z>=6.5?8:6));
  var others=0, otherMax=z>=8?8:6;
  var n=0, gk, fs, name;
  for(i=0;i<ranked.length && n<maxLabels;i++){
    c=ranked[i].c;
    if((c.k||0)>=2){
      if(others>=otherMax) continue;
    }
    gk=Math.round(c.lat/cell)+"|"+Math.round(c.lng/cell);
    if(used[gk]) continue;
    name=labelText(c);
    if(!name) continue;
    used[gk]=1;
    if((c.k||0)>=2) others++;
    fs=(c.k||0)===0?12:((c.k||0)===1?11:10);
    L.marker([+c.lat,+c.lng],{interactive:false,keyboard:false,icon:L.divIcon({
      className:"city-lbl",
      html:'<div style="transform:translate(-50%,-115%);white-space:nowrap;font:'+((c.k||0)<2?"650":"520")+' '+fs+'px/1.15 -apple-system,BlinkMacSystemFont,sans-serif;color:'+color+';text-shadow:0 0 5px '+bg+',0 1px 2px '+bg+';opacity:.96;pointer-events:none">'+escLabel(name)+"</div>",
      iconSize:[0,0],iconAnchor:[0,0]
    })}).addTo(labelsLayer);
    n++;
  }
}

function applyTheme(pref){
  var mode=pref==="light"||pref==="dark"||pref==="system"?pref:"dark";
  try{localStorage.setItem("travelek-theme-pref", mode);}catch(e){}
  var theme=mode==="system"?(window.matchMedia&&matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"):mode;
  document.documentElement.setAttribute("data-theme",theme);
  try{localStorage.setItem("travelek-theme",theme);}catch(e){}
  scheduleCloudSave();
  var themeBtn=document.getElementById("theme-btn");
  if(themeBtn) themeBtn.textContent=theme==="light"?"☀️":"🌙";
  if(!(map && map._isAtlas)){
  if(baseLayer) map.removeLayer(baseLayer);
  baseLayer=makeBase().addTo(map);
  }
  var meta=document.querySelector('meta[name="theme-color"]');
  if(meta) meta.setAttribute("content",theme==="light"?"#f4f5f7":"#12151f");
  if(typeof render==="function") render();
  if(typeof updateNightLayer==="function") updateNightLayer();
  if(typeof updateLiveTrip==="function") updateLiveTrip();
}


function pluralRu(n, one, few, many){
  n=Math.abs(parseInt(n,10)||0)%100;
  var n1=n%10;
  if(n>10&&n<20) return many;
  if(n1>1&&n1<5) return few;
  if(n1===1) return one;
  return many;
}

function wordDays(n){
  n=Math.round(n);
  var lang=currentLang();
  if(lang==="en") return n+" "+(n===1?"day":"days");
  if(lang==="zh") return n+" 天";
  return n+" "+pluralRu(n,"день","дня","дней");
}
function wordHours(n){
  n=Math.round(n);
  var lang=currentLang();
  if(lang==="en") return n+" "+(n===1?"hour":"hours");
  if(lang==="zh") return n+" 小时";
  return n+" "+pluralRu(n,"час","часа","часов");
}
function formatTripDuration(r, km){
  if(r.duration && String(r.duration).trim()) return String(r.duration).trim();
  km=km||0;
  if(km<=0) return "";
  var speed=60;
  if(r.mode==="plane") speed=750;
  else if(r.mode==="train") speed=90;
  else if(r.mode==="car") speed=70;
  else if(r.mode==="ship") speed=25;
  else if(r.mode==="walk") speed=5;
  else if(r.mode==="bike") speed=15;
  var hours=km/speed;
  if(hours<0.75){
    var mins=Math.max(1, Math.round(hours*60));
    var lang=currentLang();
    if(lang==="en") return mins+" min";
    if(lang==="zh") return mins+" 分钟";
    return mins+" мин";
  }
  if(hours<24) return wordHours(Math.max(1, Math.round(hours)));
  return wordDays(Math.max(1, Math.round(hours/24)));
}
function isCoordLabel(s){
  return /точка\s*-?\d/i.test(String(s||"")) || /^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*$/.test(String(s||"").trim());
}
function nearestCityName(lat, lng, maxKm){
  maxKm=maxKm||80;
  if(typeof CITIES==="undefined"||!CITIES.length) return null;
  var best=null, bd=maxKm, i, d;
  for(i=0;i<CITIES.length;i++){
    d=hav({lat:lat,lng:lng}, CITIES[i]);
    if(d<bd){ bd=d; best=CITIES[i].n; }
  }
  return best;
}
function shortPlaceLabel(label, lat, lng){
  if(!label) return label;
  if(!isCoordLabel(label)) return label;
  var la=lat, ln=lng;
  if(la==null||ln==null){
    var m=String(label).match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
    if(m){ la=parseFloat(m[1]); ln=parseFloat(m[2]); }
  }
  if(la==null||isNaN(la)) return label;
  var name=nearestCityName(la, ln, 80);
  if(name) return "≈ "+name;
  return label;
}

function wordReis(n){ return n+" "+pluralRu(n,"рейс","рейса","рейсов"); }
function wordMarsh(n){ return n+" "+pluralRu(n,"маршрут","маршрута","маршрутов"); }

function filtered(){
  var tripIds=null;
  if(activeTab==="trips"){
    tripIds={};
    loadTrips().forEach(function(tp){
      if(selectedTripId && tp.id!==selectedTripId) return;
      (tp.routes||[]).forEach(function(id){ tripIds[id]=1; });
    });
  }
  return ROUTES.filter(function(r){
    if(tripIds){ if(!tripIds[r.id]) return false; }
    else if(selectedTripId){
      var only=null, trips=loadTrips(), ti;
      for(ti=0;ti<trips.length;ti++) if(trips[ti].id===selectedTripId) only=trips[ti];
      if(only && (only.routes||[]).indexOf(r.id)<0) return false;
    }
    else {
      var fut=isFuture(r);
      if(activeTab==="future") { if(!fut) return false; }
      else if(activeTab==="past") { if(fut) return false; }
    }
    if(activeTab!=="trips" && typeof yearFilter!=="undefined" && yearFilter!=="all" && (r.date||"").slice(0,4)!==yearFilter) return false;
    return true;
  }).slice().sort(function(a,b){ return ((a.date||"")+" "+(a.time||"")).localeCompare((b.date||"")+" "+(b.time||"")); });
}

function routeRepeatKey(r){
  function endpoint(code,name){
    return String(code||name||"").trim().toLowerCase().replace(/\s+/g," ");
  }
  var a=endpoint(r.fromCode,r.from), b=endpoint(r.toCode,r.to);
  if((!a||!b) && r.coords && r.coords.length>=2){
    var p=r.coords[0], q=r.coords[r.coords.length-1];
    a=[Number(p[0]).toFixed(2),Number(p[1]).toFixed(2)].join(",");
    b=[Number(q[0]).toFixed(2),Number(q[1]).toFixed(2)].join(",");
  }
  return [a,b].sort().join(" ⇄ ");
}
function render(){
  layer.clearLayers();
  if(typeof collectLabelPts==="function") collectLabelPts(typeof filtered==="function"?filtered():ROUTES);
  var list=filtered(), kmP=0, kmT=0, kmC=0, bounds=[];
  var kmW=0,kmB=0,kmS=0,nP=0,nT=0,nC=0,nW=0,nB=0,nS=0;
  /* статистика только по текущей вкладке */
  list.forEach(function(r){
    var g=buildGeoSync(r); if(!g) return;
    if(r.mode==="plane"){ kmP+=g.km; nP++; }
    else if(r.mode==="car"){ kmC+=g.km; nC++; }
    else if(r.mode==="walk"){ kmW+=g.km; nW++; }
    else if(r.mode==="bike"){ kmB+=g.km; nB++; }
    else if(r.mode==="ship"){ kmS+=g.km; nS++; }
    else { kmT+=g.km; nT++; }
  });
  document.getElementById("s-plane").textContent=Math.round(kmP).toLocaleString("ru-RU");
  document.getElementById("s-train").textContent=Math.round(kmT).toLocaleString("ru-RU");
  document.getElementById("s-car").textContent=Math.round(kmC).toLocaleString("ru-RU");
  if(window.__fillAccount && document.getElementById("account-panel") && document.getElementById("account-panel").classList.contains("on")) window.__fillAccount();
  var sw=document.getElementById("s-walk"); if(sw) sw.textContent=Math.round(kmW).toLocaleString("ru-RU");
  var sb=document.getElementById("s-bike"); if(sb) sb.textContent=Math.round(kmB).toLocaleString("ru-RU");
  var ss=document.getElementById("s-ship"); if(ss) ss.textContent=Math.round(kmS).toLocaleString("ru-RU");
  var el;
  var futN=ROUTES.filter(isFuture).length;
  var subEl=document.getElementById("subtitle");
  if(subEl) subEl.textContent=(function(){
    var total=ROUTES.length, fut=futN;
    if(!total) return t("Нет маршрутов");
    var s=total+" "+t(total===1?"маршрут":"маршрутов");
    if(fut) s+=" · "+fut+" "+t("предстоящих");
    return s;
  })();
  var fill=getComputedStyle(document.documentElement).getPropertyValue("--map-bg").trim()||"#0a0c10";
  var routeCounts={};
  ROUTES.forEach(function(r){var k=routeRepeatKey(r);if(k&&k!==" ⇄ ")routeCounts[k]=(routeCounts[k]||0)+1;});

  list.forEach(function(r){
    var g=buildGeoSync(r); if(!g||!g.coords) return;
    var fut=isFuture(r);
    var col=COLORS[r.mode]||COLORS.plane;
    if(fut&&r.mode==="plane") col=COLORS.future;
    var theme=document.documentElement.getAttribute("data-theme")||"dark";
    var casing=theme==="light"?"#ffffff":"#f4f8fc";
    var repeats=routeCounts[routeRepeatKey(r)]||1;
    var w=repeats>1?5.2:2.15;
    if(selectedId===r.id) w+=1.2;
    L.polyline(g.coords,{pane:"routePane",color:casing,weight:w+(repeats>1?2.8:1.5),opacity:.94,lineJoin:"round",lineCap:"round",interactive:false,smoothFactor:0}).addTo(layer);
    L.polyline(g.coords,{pane:"routePane",color:col,weight:w,opacity:1,dashArray:fut?"7 6":null,lineJoin:"round",lineCap:"round",interactive:false,smoothFactor:0}).addTo(layer);
    [g.coords[0],g.coords[g.coords.length-1]].forEach(function(p){
      L.circleMarker(p,{pane:"routePane",radius:5,color:casing,fillColor:col,fillOpacity:1,weight:2.5}).addTo(layer);
    });
    g.coords.forEach(function(c){bounds.push(c);});
  });
  if(typeof syncVisited==="function") syncVisited();
  if(typeof drawCountries==="function") drawCountries();
  try{layer.bringToFront();labelsLayer.bringToFront();}catch(e){}
  if(globeOn && typeof scheduleGlobe==="function") scheduleGlobe();
  if(typeof renderCountryUi==="function") renderCountryUi();

  /* load real roads then re-render once */
  var jobs=[], seenJob={};
  function addRoadJob(p, q){
    if(!p||!q) return;
    var k=roadKey(p,q);
    if(seenJob[k] || roadCache[k]) return;
    seenJob[k]=1;
    jobs.push({a:p,b:q});
  }
  list.forEach(function(r){
    var g=buildGeoSync(r);
    if(!g) return;
    if(g.hops && g.hops.length) g.hops.forEach(function(h){ addRoadJob(h[0], h[1]); });
    else if(g.needRoad) addRoadJob(place(r.from, r.fromCode), place(r.to, r.toCode));
  });
  if(jobs.length){
    var left=jobs.length;
    jobs.forEach(function(job){
      roadQueue.push({a:job.a, b:job.b, done:function(){ if(--left<=0) render(); }});
    });
    pumpRoads();
  }

  var el=document.getElementById("list");
  paintSheetList(el, list);
  lastBounds=bounds;
  /* не дёргаем карту при каждом render — только при смене вкладки / старте */
  if(bounds.length&&!selectedId&&!window.__mapInited){
    window.__mapInited=true;
    try{map.fitBounds(bounds,{padding:[40,100],maxZoom:5});}catch(e){}
  }
  if(typeof buildYearFilter==="function") buildYearFilter();
  var yf=document.getElementById("year-filter");
  if(yf) yf.style.display=activeTab==="trips"?"none":"";
  var add2=document.getElementById("add-btn-2");
  if(add2) add2.textContent=t("Добавить поездку");
}



/* init */
var savedPref="dark";
try{savedPref=localStorage.getItem("travelek-theme-pref")||localStorage.getItem("travelek-theme")||"dark";}catch(e){}
applyTheme(savedPref);
if(window.matchMedia){
  matchMedia("(prefers-color-scheme: light)").addEventListener("change", function(){
    if(localStorage.getItem("travelek-theme-pref")==="system") applyTheme("system");
  });
}
var themeBtnInit=document.getElementById("theme-btn");
if(themeBtnInit) themeBtnInit.onclick=function(){
  var cur=document.documentElement.getAttribute("data-theme")||"dark";
  applyTheme(cur==="dark"?"light":"dark");
};
document.getElementById("z-in").onclick=function(){map.zoomIn();};
document.getElementById("z-out").onclick=function(){map.zoomOut();};
document.getElementById("z-fit").onclick=function(){ fitAll(); render(); };
map.on("zoomend",drawCityLabels);
map.on("moveend",function(){ if(pickModeLabels||map.getZoom()>=3.4) drawCityLabels(); });
map.on("mousemove",function(e){
  if(pickTarget) return;
  showMapHover(e.latlng.lat,e.latlng.lng,e.containerPoint);
});
map.on("mouseout",function(){
  hoverKey="";
  if(hoverLayer) hoverLayer.clearLayers();
  var label=document.getElementById("map-hover-label");
  if(label) label.style.display="none";
});
map.on("click",function(e){
  if(pickTarget) finishPick(e.latlng);
  else openVisitPrompt(e.latlng.lat,e.latlng.lng);
});
var visitYesBtn=document.getElementById("visit-confirm-yes");
var visitNoBtn=document.getElementById("visit-confirm-no");
var visitModal=document.getElementById("visit-confirm");
if(visitYesBtn) visitYesBtn.addEventListener("click",confirmVisitedPlace);
if(visitNoBtn) visitNoBtn.addEventListener("click",closeVisitPrompt);
if(visitModal) visitModal.addEventListener("click",function(e){if(e.target===visitModal) closeVisitPrompt();});
var yearFilterEl=document.getElementById("year-filter");
if(yearFilterEl) yearFilterEl.addEventListener("click", function(e){
  var btn=e.target.closest && e.target.closest("#play-trips");
  if(!btn) return;
  e.preventDefault();
  e.stopPropagation();
  if(tripPlay.on) stopTripPlay();
  else startTripPlay();
});
document.addEventListener("keydown",function(e){if(e.key==="Escape") closeVisitPrompt();});
(function bindPinch(map){
  if(map && map._isAtlas) return;
  var el=map.getContainer();
  var startDist=0, startZoom=0, live=false;
  el.addEventListener("touchstart", function(e){
    if(e.touches.length!==2) return;
    live=true;
    var a=e.touches[0], b=e.touches[1];
    startDist=Math.hypot(a.clientX-b.clientX, a.clientY-b.clientY)||1;
    startZoom=map.getZoom();
  }, {passive:true});
  el.addEventListener("touchmove", function(e){
    if(!live || e.touches.length!==2) return;
    var a=e.touches[0], b=e.touches[1];
    var dist=Math.hypot(a.clientX-b.clientX, a.clientY-b.clientY)||1;
    var z=Math.max(map.getMinZoom(), Math.min(map.getMaxZoom(), startZoom+Math.log2(dist/startDist)));
    map.setZoom(z, {animate:false});
    if(e.cancelable) e.preventDefault();
  }, {passive:false});
  function end(){ live=false; }
  el.addEventListener("touchend", end);
  el.addEventListener("touchcancel", end);
})(map);

/* нижняя панель не должна «захватывать» карту */
var sheetElMap=document.getElementById("sheet");
L.DomEvent.disableClickPropagation(sheetElMap);
L.DomEvent.disableScrollPropagation(sheetElMap);

var tabs=document.querySelectorAll(".tab");
for(var ti=0;ti<tabs.length;ti++){
  tabs[ti].onclick=(function(t){return function(){
    for(var j=0;j<tabs.length;j++) tabs[j].classList.remove("on");
    t.classList.add("on"); activeTab=t.getAttribute("data-tab"); selectedId=null; sheetMore.on=false; render();
  };})(tabs[ti]);
}

/* sheet: плавный свайп */
var sheetEl=document.getElementById("sheet");

var handleWrap=document.getElementById("handle-wrap");
sheetEl=document.getElementById("sheet");
var dragY0=null, dragH0=0, dragging=false, didDrag=false;

function sheetHeights(){
  var vh=window.innerHeight||600;
  var topEl=document.querySelector(".top");
  var topBottom=topEl?Math.ceil(topEl.getBoundingClientRect().bottom):52;
  if(topBottom<36) topBottom=52;
  var full=Math.round(vh*0.9);
  var mid=Math.round(Math.min(vh*0.46, full-48));
  if(mid<160) mid=Math.min(160, full);
  return {
    collapsed: Math.min(104, Math.round(vh*0.14)),
    mid: mid,
    full: full
  };
}
function heightOfState(st){
  var h=sheetHeights();
  return h[st]||h.mid;
}
function nearestState(px){
  var h=sheetHeights();
  var states=["collapsed","mid","full"];
  var best="mid", bd=1e9, i;
  for(i=0;i<states.length;i++){
    var d=Math.abs(h[states[i]]-px);
    if(d<bd){ bd=d; best=states[i]; }
  }
  return best;
}
function setSheet(state){
  if(!sheetEl) return;
  if(window.matchMedia && matchMedia("(min-width: 980px)").matches){
    sheetState=state;
    sheetEl.classList.remove("collapsed","mid","full","low","dragging");
    sheetEl.style.height="";
    return;
  }
  sheetState=state;
  sheetEl.classList.remove("collapsed","mid","full","low","dragging");
  sheetEl.classList.add(state);
  sheetEl.style.height=heightOfState(state)+"px";
  document.body.classList.remove("sheet-collapsed","sheet-full");
  if(state==="collapsed") document.body.classList.add("sheet-collapsed");
  if(state==="full") document.body.classList.add("sheet-full");
  try{ map.invalidateSize(); }catch(e){}
  if(globeOn && typeof scheduleGlobe==="function") scheduleGlobe();
}
function onDragStart(y){
  if(!sheetEl) return;
  if(window.matchMedia && matchMedia("(min-width: 980px)").matches) return;
  dragY0=y;
  dragH0=sheetEl.getBoundingClientRect().height;
  dragging=true;
  didDrag=false;
  sheetEl.classList.add("dragging");
  sheetEl.style.transition="none";
}
function onDragMove(y){
  if(dragY0==null||!sheetEl) return;
  var dy=dragY0-y;
  if(Math.abs(y-dragY0)>8) didDrag=true;
  var h=sheetHeights();
  var nh=Math.max(h.collapsed, Math.min(h.full, dragH0+dy));
  sheetEl.style.height=nh+"px";
}
function onDragEnd(){
  if(dragY0==null||!sheetEl) return;
  var cur=sheetEl.getBoundingClientRect().height;
  var wasDrag=didDrag;
  dragY0=null;
  dragging=false;
  sheetEl.classList.remove("dragging");
  sheetEl.style.transition="";
  /* тап обрабатывает onclick ручки — иначе срабатывает дважды и панель не двигается */
  if(wasDrag) setSheet(nearestState(cur));
  else setSheet(sheetState);
}

function bindSheetDrag(el){
  if(!el) return;
  el.addEventListener("touchstart",function(e){
    if(e.touches.length!==1) return;
    onDragStart(e.touches[0].clientY);
  },{passive:true});
  el.addEventListener("touchmove",function(e){
    if(dragY0==null) return;
    onDragMove(e.touches[0].clientY);
    if(didDrag && e.cancelable) try{ e.preventDefault(); }catch(err){}
  },{passive:false});
  el.addEventListener("touchend",onDragEnd);
  el.addEventListener("touchcancel",onDragEnd);
  el.addEventListener("mousedown",function(e){
    onDragStart(e.clientY);
    e.preventDefault();
  });
}
bindSheetDrag(handleWrap);
/* свайп по блоку статистики тоже */
var statsEl=document.querySelector(".stats");
bindSheetDrag(statsEl);
var listElDrag=document.getElementById("list");
var listStartY=null;
if(listElDrag){
  listElDrag.addEventListener("touchstart", function(e){
    if(e.touches.length!==1 || listElDrag.scrollTop>2) return;
    listStartY=e.touches[0].clientY;
  }, {passive:true});
  listElDrag.addEventListener("touchmove", function(e){
    if(listStartY==null) return;
    var y=e.touches[0].clientY;
    if(y-listStartY>16 && listElDrag.scrollTop<=2){
      if(dragY0==null) onDragStart(listStartY);
      onDragMove(y);
      if(e.cancelable) try{ e.preventDefault(); }catch(err){}
    } else if(dragY0==null && listStartY-y>8) listStartY=null;
  }, {passive:false});
  listElDrag.addEventListener("touchend", function(){ if(dragY0!=null) onDragEnd(); listStartY=null; });
  listElDrag.addEventListener("touchcancel", function(){ if(dragY0!=null) onDragEnd(); listStartY=null; });
}

window.addEventListener("mousemove",function(e){
  if(dragY0==null) return;
  onDragMove(e.clientY);
});
window.addEventListener("mouseup",function(){ if(dragY0!=null) onDragEnd(); });


handleWrap.onclick=function(){
  if(didDrag){ didDrag=false; return; }
  if(sheetState==="collapsed") setSheet("mid");
  else if(sheetState==="mid") setSheet("full");
  else setSheet("mid");
};

function checkOnline(){
  var el=document.getElementById("offline-banner");
  if(!el){
    el=document.createElement("div");
    el.id="offline-banner";
    el.style.cssText="display:none;position:fixed;top:calc(8px + env(safe-area-inset-top));left:50%;transform:translateX(-50%);z-index:60;background:#c44;color:#fff;padding:8px 14px;border-radius:10px;font-size:12px;font-weight:600;max-width:90%;text-align:center";
    el.textContent="Нет сети — карта и авто-дороги могут не загрузиться";
    document.body.appendChild(el);
  }
  el.style.display=navigator.onLine?"none":"block";
}
window.addEventListener("online",checkOnline);
window.addEventListener("offline",checkOnline);
checkOnline();

(function(){
  var td=document.getElementById("set-theme-dark");
  var tl=document.getElementById("set-theme-light");
  if(td) td.onclick=function(){ applyTheme("dark"); };
  if(tl) tl.onclick=function(){ applyTheme("light"); };
  var ts=document.getElementById("set-theme-system");
  if(ts) ts.onclick=function(){ applyTheme("system"); };
  var langButtons=document.querySelectorAll("#lang-switch button");
  for(var li=0;li<langButtons.length;li++){
    langButtons[li].onclick=function(){ setLang(this.getAttribute("data-lang")); };
  }
  if(typeof syncLangButtons==="function") syncLangButtons();
  var ea=document.getElementById("set-export-all");
  if(ea) ea.onclick=function(){
    var payload={version:3,exported:new Date().toISOString(),extra:loadExtra(),deleted:loadDeleted(),trackSettings:loadTrackSettings(),appSettings:loadAppSettings(),countries:typeof loadVisited==="function"?loadVisited():[],regions:typeof manualRegions!=="undefined"?manualRegions.slice():[]};
    var blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
    var a=document.createElement("a"); a.href=URL.createObjectURL(blob);
    a.download="travelek-backup-"+new Date().toISOString().slice(0,10)+".json"; a.click();
  };
  var ia=document.getElementById("set-import-all");
  var iaf=document.getElementById("set-import-all-file");
  if(ia&&iaf){
    ia.onclick=function(){ iaf.click(); };
    iaf.onchange=function(ev){
      var f=ev.target.files&&ev.target.files[0]; if(!f) return;
      var reader=new FileReader();
      reader.onload=function(){
        try{
          var data=JSON.parse(reader.result);
          if(data.extra) saveExtra(data.extra);
          if(data.deleted) saveDeleted(data.deleted);
          if(data.trackSettings) saveTrackSettings(data.trackSettings);
          if(data.appSettings) saveAppSettings(data.appSettings);
          if(Array.isArray(data.countries) && typeof saveVisited==="function") saveVisited(data.countries);
          if(Array.isArray(data.regions)){ manualRegions=data.regions.slice(); if(typeof saveSets==="function") saveSets(); }
          deleted=loadDeleted();
          ROUTES=assembleRoutes();
          render(); alert("Дневник восстановлен");
        }catch(e){ alert("Файл не прочитан"); }
        ev.target.value="";
      };
      reader.readAsText(f);
    };
  }
  var rs=document.getElementById("set-reset");
  if(rs) rs.onclick=function(){
    var now=Date.now();
    if(!rs._armed || now-rs._armed>1600){
      rs._armed=now;
      rs.textContent=t("Нажмите ещё раз");
      clearTimeout(rs._timer);
      rs._timer=setTimeout(function(){
        rs._armed=0;
        rs.textContent=t("Сбросить мои маршруты");
      }, 1600);
      return;
    }
    rs._armed=0;
    rs.textContent=t("Сбросить мои маршруты");
    saveExtra([]); saveDeleted([]); deleted=[]; ROUTES=window.__TRAVELEK_PRIVATE?[]:BUILTIN.slice(); render();
  };
  var btn=document.getElementById("trim-spikes");
  if(btn) btn.onclick=function(){
    if(!window._editCoords||window._editCoords.length<3) return;
    var pts=window._editCoords, out=[pts[0]], i;
    for(i=1;i<pts.length-1;i++){
      var d1=hav({lat:pts[i-1][0],lng:pts[i-1][1]},{lat:pts[i][0],lng:pts[i][1]});
      var d2=hav({lat:pts[i][0],lng:pts[i][1]},{lat:pts[i+1][0],lng:pts[i+1][1]});
      if(d1>0.2&&d2>0.2) continue;
      out.push(pts[i]);
    }
    out.push(pts[pts.length-1]);
    window._editCoords=out;
    alert("Точек: "+pts.length+" → "+out.length);
  };
})();

/* form + autocomplete */
var modal=document.getElementById("modal");
var fFrom=document.getElementById("f-from"), fTo=document.getElementById("f-to");
var sugFrom=document.getElementById("sug-from"), sugTo=document.getElementById("sug-to");
var fMode=document.getElementById("f-mode");

var carWaypoints = []; /* [{lat,lng}, ...] для бездорожья */

function updateLabels(){
  var m=fMode.value;
  document.getElementById("lbl-from").textContent=m==="plane"?t("Откуда (аэропорт)"):(m==="train"?t("Откуда (вокзал)"):(m==="ship"?t("Откуда (порт / город)"):t("Откуда (город / точка)")));
  document.getElementById("lbl-to").textContent=m==="plane"?t("Куда (аэропорт)"):(m==="train"?t("Куда (вокзал)"):(m==="ship"?t("Куда (порт / город)"):t("Куда (город / точка)")));
  fFrom.placeholder=m==="plane"?t("Только аэропорт: SVO, LED…"):(m==="train"?t("Только вокзал…"):t("Город или 📍 на карте"));
  fTo.placeholder=fFrom.placeholder;
  var fw=document.getElementById("f-flight-wrap");
  var fl=document.getElementById("lbl-flight");
  var fi=document.getElementById("f-flight");
  if(m==="plane"){ fw.style.display=""; fl.textContent=t("Рейс"); fi.placeholder="SU 100"; }
  else if(m==="train"){ fw.style.display=""; fl.textContent=t("Поезд / номер"); fi.placeholder="Сапсан 756А"; }
  else if(m==="walk"||m==="bike"){ fw.style.display=""; fl.textContent=t("Название (необязательно)"); fi.placeholder=""; }
  else if(m==="ship"){ fw.style.display=""; fl.textContent=t("Рейс / паром"); fi.placeholder=""; }
  else { fw.style.display=""; fl.textContent=t("Комментарий (необязательно)"); fi.placeholder=""; }
  var showPick=(m==="car"||m==="ship"||m==="walk"||m==="bike");
  document.getElementById("pick-from").style.display=showPick?"":"none";
  document.getElementById("pick-to").style.display=showPick?"":"none";
  document.getElementById("pick-hint").style.display=showPick?"":"none";
  document.getElementById("car-mode-wrap").style.display=(m==="car")?"":"none";
  if(map && map.setNetwork) map.setNetwork({roads:false, rails:false});
  var ph=document.getElementById("pick-hint");
  if(ph){
    if(m==="ship") ph.textContent="Корабль: порты из списка или 📍 на воде; маршрут по фарватеру";
    else if(m==="car") ph.textContent="Авто: город или точка на карте";
    else if(m==="walk"||m==="bike") ph.textContent="Точка на карте 📍 или запись GPS (кнопка ●)";
  }
  syncWpPanel();
}
function syncWpPanel(){
  var show = (fMode.value==="car" && document.getElementById("f-car-path").value==="offroad") || fMode.value==="ship";
  document.getElementById("waypoints-wrap").style.display=show?"":"none";
  var el=document.getElementById("wp-list");
  if(!carWaypoints.length) el.textContent="Пока нет — добавьте точки, чтобы обойти препятствия";
  else el.innerHTML=carWaypoints.map(function(w,i){
    return (i+1)+") "+w.lat.toFixed(4)+", "+w.lng.toFixed(4);
  }).join("<br/>");
}
fMode.onchange=updateLabels;
document.getElementById("f-car-path").onchange=syncWpPanel;


/* выбор точки на карте для авто (Россия) */
var pickTarget=null, pickMarkers=[];
function clearPickMarkers(){
  pickMarkers.forEach(function(m){ try{map.removeLayer(m);}catch(e){} });
  pickMarkers=[];
}
function startPick(which){
  pickTarget=which;
  pickModeLabels=true;
  drawCityLabels();
  closeForm();
  var ban=document.getElementById("pick-banner");
  if(which==="from") ban.textContent="Ткните точку ОТКУДА на карте";
  else if(which==="to") ban.textContent="Ткните точку КУДА на карте";
  else ban.textContent="Промежуточная точка (обход)";
  ban.classList.add("on");
}
function finishPick(latlng){
  var la=latlng.lat, ln=latlng.lng;
  if(la<-85||la>85||ln<-180||ln>180){
    alert("Точка вне карты");
    return;
  }
  var label="Точка "+la.toFixed(4)+", "+ln.toFixed(4);
  var mk=L.circleMarker([la,ln],{radius:6,color:"#e0a040",fillColor:"#e0a040",fillOpacity:0.9}).addTo(map);
  pickMarkers.push(mk);
  if(pickTarget==="from") fFrom.value=label;
  else if(pickTarget==="to") fTo.value=label;
  else if(pickTarget==="wp"){
    carWaypoints.push({lat:la,lng:ln});
  }
  pickTarget=null;
  pickModeLabels=false;
  drawCityLabels();
  document.getElementById("pick-banner").classList.remove("on");
  openForm();
  if(fMode.value!=="walk"&&fMode.value!=="bike"&&fMode.value!=="ship") fMode.value="car";
  updateLabels();
  syncWpPanel();
}
document.getElementById("pick-from").onclick=function(){ startPick("from"); };
document.getElementById("pick-to").onclick=function(){ startPick("to"); };
document.getElementById("wp-add").onclick=function(){
  document.getElementById("f-car-path").value="offroad";
  startPick("wp");
};
document.getElementById("wp-clear").onclick=function(){
  carWaypoints=[];
  clearPickMarkers();
  syncWpPanel();
};

function bindSuggest(input, box, which){
  input.addEventListener("input",function(){
    var fromHint=(which==="to")?(document.getElementById("f-from")||{}).value:null;
    var items=searchCatalog(fMode.value, input.value, fromHint);
    if(!items.length){ box.classList.remove("on"); box.innerHTML=""; return; }
    box.innerHTML=items.map(function(it){
      var code=it.code?'<span class="code">'+it.code+"</span>":"";
      return "<div data-v=\""+it.value.replace(/"/g,"&quot;")+"\">"+code+it.label+"</div>";
    }).join("");
    box.classList.add("on");
    var divs=box.querySelectorAll("div");
    for(var i=0;i<divs.length;i++){
      divs[i].onclick=(function(d){return function(){
        input.value=d.getAttribute("data-v"); box.classList.remove("on");
      };})(divs[i]);
    }
  });
  input.addEventListener("blur",function(){ setTimeout(function(){box.classList.remove("on");},200); });
}
bindSuggest(fFrom,sugFrom,"from");
bindSuggest(fTo,sugTo,"to");

fFrom.addEventListener("change", function(){
  if(fMode.value==="plane"||fMode.value==="train"||fMode.value==="ship"){
    /* при смене «откуда» сбрасываем «куда», чтобы не оставить невозможную пару */
    if(fTo.value) { fTo.value=""; var st=document.getElementById("sug-to"); if(st){st.classList.remove("on");st.innerHTML="";} }
  }
});
;

function openForm(){ updateLabels(); modal.classList.add("on"); }
function closeForm(){ modal.classList.remove("on"); }
var addTop=document.getElementById("add-btn"); if(addTop) addTop.onclick=function(){ openTripWindow(); };
document.getElementById("add-btn-2").onclick=function(){ openTripWindow(); };
document.getElementById("f-cancel").onclick=closeForm;
modal.addEventListener("click",function(e){ if(e.target===modal) closeForm(); });

document.getElementById("f-save").onclick=function(){ saveCurrentForm(); };
function buildRouteFromForm(){
  var mode=fMode.value;
  var from=fFrom.value.trim(), to=fTo.value.trim();
  var date=document.getElementById("f-date").value;
  var time=document.getElementById("f-time").value;
  var flight=document.getElementById("f-flight").value.trim()||
    (mode==="plane"?"Flight":mode==="car"?"Авто":mode==="ship"?"Паром":mode==="walk"?"Прогулка":mode==="bike"?"Вело":"Train");
  if(!from||!to||!date){ alert("Укажите откуда, куда и дату"); return; }
  var pa=place(from), pb=place(to);
  if(!pa||!pb){
    alert(mode==="car"
      ? "Укажите город из списка или точку на карте (кнопка 📍)."
      : "Точка не найдена. Выберите из подсказок при вводе.");
    return;
  }
  if(mode==="plane"){
    var ca=airportCodeOf(pa), cb=airportCodeOf(pb);
    if(!ca||!cb){ alert("Нужны аэропорты с кодом IATA из подсказок."); return; }
    if(ca&&cb){
    var MOSC={SVO:1,DME:1,VKO:1,ZIA:1};
    if(String(ca).toUpperCase()===String(cb).toUpperCase()){ alert("Один и тот же аэропорт"); return; }
    if(!flightAllowed(ca,cb) && ca && cb){
      var MOSC={SVO:1,DME:1,VKO:1,ZIA:1};
      if(MOSC[String(ca).toUpperCase()]&&MOSC[String(cb).toUpperCase()]){
        alert("Между аэропортами Москвы регулярных пассажирских рейсов нет — это трансфер, не перелёт.");
        return;
      }
    }
    if(ca&&cb && String(ca).toUpperCase()!==String(cb).toUpperCase()){
      var METRO_HARD=[["SVO","DME","VKO","ZIA"],["FCO","CIA"],["MXP","LIN","BGY"],["PEK","PKX"],["PVG","SHA"]];
      var caU=String(ca).toUpperCase(), cbU=String(cb).toUpperCase(), hi,hg;
      for(hi=0;hi<METRO_HARD.length;hi++){
        hg=METRO_HARD[hi];
        if(hg.indexOf(caU)>=0 && hg.indexOf(cbU)>=0){
          alert("Между аэропортами одного города пассажирских рейсов нет (трансфер).");
          return;
        }
      }
    }
  }
  if(isStrictRoutes() && !flightAllowed(ca,cb)){
      if(!confirm("В базе нет такого рейса. Сохранить как свой маршрут?")) return;
    }
    var paw=typeof planeNavWarnings==="function"?planeNavWarnings(ca,cb,date):[];
    if(paw.length && !confirm("Авиация:\n• "+paw.join("\n• ")+"\n\nСохранить?")) return;
  }
  if(mode==="train"){
    if(isStrictRoutes() && !trainAllowed(from,to)){
      if(!confirm("Нет пути в ЖД-сети приложения. Сохранить свой маршрут?")) return;
    }
  }
  if(mode==="car"){
    if(!carAllowed(pa.label||from, pb.label||to)){
      alert("Между этими пунктами нет круглогодичной автодороги (изолированный район).");
      return;
    }
  }
  
  if(mode==="plane"){
    var isAir=function(p){
      if(!p) return false;
      for(var ai=0;ai<AIRPORTS.length;ai++){
        if(Math.abs(AIRPORTS[ai].lat-p.lat)<0.05 && Math.abs(AIRPORTS[ai].lng-p.lng)<0.05) return true;
        if(p.label && norm(p.label).indexOf(norm(AIRPORTS[ai].code))>=0) return true;
      }
      return false;
    };
    if(!isAir(pa)){ alert("Откуда: выберите аэропорт из списка"); return; }
    if(!isAir(pb)){ alert("Куда: выберите аэропорт из списка"); return; }
  }
  if(mode==="train"){
    var isSt=function(p){
      if(!p) return false;
      for(var si=0;si<STATIONS.length;si++){
        if(Math.abs(STATIONS[si].lat-p.lat)<0.08 && Math.abs(STATIONS[si].lng-p.lng)<0.08) return true;
        if(p.label && norm(p.label)===norm(STATIONS[si].n)) return true;
      }
      return false;
    };
    if(!isSt(pa)){ alert("Откуда: выберите вокзал/станцию из списка"); return; }
    if(!isSt(pb)){ alert("Куда: выберите вокзал/станцию из списка"); return; }
  }

  if(mode==="ship"){
    var pCheck=findPortByQuery(from)||findPortByQuery(norm(from));
    var pCheck2=findPortByQuery(to)||findPortByQuery(norm(to));
    /* если place вернул город без portId — перепривязать к порту */
    if(!pa.portId){
      var rp=findPortByQuery(from);
      if(rp){ pa={lat:rp.lat,lng:rp.lng,label:formatPortLabel(rp),portId:rp.id}; }
      else { alert("Откуда: выберите порт из списка (не город)"); return; }
    }
    if(!pb.portId){
      var rp2=findPortByQuery(to);
      if(rp2){ pb={lat:rp2.lat,lng:rp2.lng,label:formatPortLabel(rp2),portId:rp2.id}; }
      else { alert("Куда: выберите порт из списка (не город)"); return; }
    }
  }
  if(mode==="ship"){
    var nw=shipNavWarnings(pa,pb,date);
    if(nw.length){
      if(!confirm("Навигационные ограничения:\n• "+nw.join("\n• ")+"\n\nВсё равно сохранить?")) return;
    }
  }
  var prev=null,i;
  if(editingId){
    for(i=0;i<ROUTES.length;i++) if(ROUTES[i].id===editingId) prev=ROUTES[i];
  }
  var trip={id:editingId||("u"+Date.now()),mode:mode,flight:flight,from:pa.label||from,to:pb.label||to,date:date};
  if(time) trip.time=time;
  if(mode==="car"){
    trip.carPath=document.getElementById("f-car-path").value||"road";
    if(trip.carPath==="offroad" && carWaypoints.length) trip.waypoints=carWaypoints.slice();
    else if(prev && prev.waypoints) trip.waypoints=prev.waypoints;
  }
  if(mode==="ship" && carWaypoints.length){
    trip.waypoints=carWaypoints.slice();
  } else if(mode==="ship" && prev && prev.waypoints){
    trip.waypoints=prev.waypoints;
  }
  if(prev && prev.coords && prev.coords.length>=2){
    var coords=(window._editCoords&&window._editCoords.length)?window._editCoords.slice():prev.coords.slice();
    var tss=parseInt((document.getElementById("trim-start")||{}).value,10)||0;
    var tee=parseInt((document.getElementById("trim-end")||{}).value,10)||0;
    if(tss>0||tee>0){
      if(tss+tee>=coords.length){ alert("Обрезка слишком большая"); return; }
      coords=coords.slice(tss, coords.length-tee);
    }
    trip.coords=typeof simplifyTrack==="function"?simplifyTrack(coords,8):coords;
    trip.duration=pathKm(trip.coords).toFixed(1)+" км GPS";
  }
  if(mode==="plane"){
    var ca=airportCodeOf(pa), cb=airportCodeOf(pb);
    if(ca) trip.fromCode=ca; if(cb) trip.toCode=cb;
  }
  return trip;
}
function commitRoute(trip){
  if(!trip) return null;
  var extra=loadExtra().filter(function(x){ return x.id!==trip.id; });
  var i;
  if(editingId){
    var isBuiltin=false;
    for(i=0;i<BUILTIN.length;i++) if(BUILTIN[i].id===editingId) isBuiltin=true;
    if(isBuiltin && deleted.indexOf(editingId)<0){ deleted.push(editingId); saveDeleted(deleted); }
  }
  extra.push(trip); saveExtra(extra);
  ROUTES=assembleRoutes();
  return trip.id;
}
function saveCurrentForm(){
  var trip=buildRouteFromForm();
  if(!trip) return;
  commitRoute(trip);
  editingId=null;
  selectedTripId=null;
  document.getElementById("modal-title").textContent=t("Новый маршрут");
  closeForm(); fFrom.value=""; fTo.value=""; document.getElementById("f-flight").value=""; carWaypoints=[]; clearPickMarkers();
  setSheet("mid"); render();
}



var editingId=null;
function openEdit(id){
  var r=null,i;
  for(i=0;i<ROUTES.length;i++) if(ROUTES[i].id===id) r=ROUTES[i];
  if(!r) return;
  editingId=id;
  document.getElementById("modal-title").textContent=t("Редактировать");
  fMode.value=r.mode||"plane";
  updateLabels();
  fFrom.value=r.from||"";
  fTo.value=r.to||"";
  document.getElementById("f-date").value=r.date||"";
  document.getElementById("f-time").value=r.time||"";
  document.getElementById("f-flight").value=r.flight||"";
  if(r.mode==="car"){
    var cp=document.getElementById("f-car-path");
    if(cp) cp.value=r.carPath||(r.waypoints&&r.waypoints.length?"offroad":"road");
    carWaypoints=(r.waypoints&&r.waypoints.slice())||[];
    if(typeof syncWpPanel==="function") syncWpPanel();
  }
  var tw=document.getElementById("trim-wrap");
  if(tw){
    if(r.coords&&r.coords.length>=2){
      tw.style.display="";
      document.getElementById("trim-start").value=0;
      document.getElementById("trim-end").value=0;
      window._editCoords=r.coords.slice();
    } else { tw.style.display="none"; window._editCoords=null; }
  }
  openForm();
}
function openFormNew(){
  editingId=null;
  document.getElementById("modal-title").textContent=t("Новый маршрут");
  carWaypoints=[];
  fFrom.value=""; fTo.value="";
  document.getElementById("f-flight").value="";
  openForm();
}


/* ——— настройки треков ——— */
function loadTrackSettings(){
  try{
    var s=JSON.parse(localStorage.getItem("travelek-track-settings")||"{}");
    return {
      minDistM: s.minDistM!=null?s.minDistM:8,
      maxAccM: s.maxAccM!=null?s.maxAccM:50,
      highAccuracy: s.highAccuracy!==false
    };
  }catch(e){
    return {minDistM:8, maxAccM:50, highAccuracy:true};
  }
}
function saveTrackSettings(s){
  if(typeof safeSetItem==="function") safeSetItem("travelek-track-settings", JSON.stringify(s));
  else try{ localStorage.setItem("travelek-track-settings", JSON.stringify(s)); }catch(e){}
}
function openSettings(){
  var s=loadTrackSettings();
  var el;
  el=document.getElementById("set-min-dist"); if(el) el.value=s.minDistM;
  el=document.getElementById("set-max-acc"); if(el) el.value=s.maxAccM;
  el=document.getElementById("set-hi-acc"); if(el) el.checked=!!s.highAccuracy;
  var sr=document.getElementById("set-strict-routes");
  if(sr) sr.checked=isStrictRoutes();
  var nl=document.getElementById("set-nav-limits");
  if(nl) nl.checked=navLimitsOn();
  var nz=document.getElementById("set-nav-zones");
  if(nz) nz.checked=navZonesOn();
  if(typeof syncMapSwitch==="function") syncMapSwitch();
  if(typeof syncLangButtons==="function") syncLangButtons();
  document.getElementById("settings-panel").classList.add("on");
  if(typeof window.__fillAccount==="function") window.__fillAccount();
  var accountPanel=document.getElementById("account-panel");
  if(accountPanel) accountPanel.classList.remove("on");
  var trackPanel=document.getElementById("track-panel");
  if(trackPanel) trackPanel.classList.remove("on");
}
var settingsBtn=document.getElementById("settings-btn"); if(settingsBtn) settingsBtn.onclick=openSettings;
var accountSettings=document.getElementById("account-settings"); if(accountSettings) accountSettings.onclick=openSettings;
document.getElementById("set-close").onclick=function(){
  document.getElementById("settings-panel").classList.remove("on");
};
document.getElementById("set-save").onclick=function(){
  var minEl=document.getElementById("set-min-dist");
  var maxEl=document.getElementById("set-max-acc");
  var hiEl=document.getElementById("set-hi-acc");
  if(minEl && maxEl && hiEl){
    saveTrackSettings({
      minDistM: Math.max(3, parseFloat(minEl.value)||8),
      maxAccM: Math.max(10, parseFloat(maxEl.value)||50),
      highAccuracy: hiEl.checked
    });
  }
  var app=loadAppSettings();
  app.strictRoutes=true;
  var nl=document.getElementById("set-nav-limits");
  if(nl) app.navLimits=nl.checked;
  var nz=document.getElementById("set-nav-zones");
  if(nz) app.navZones=nz.checked;
  saveAppSettings(app);
  nightOn=true;
  saveMapPrefs();
  if(typeof updateNightLayer==="function") updateNightLayer();
  if(typeof applyGlobeEffect==="function") applyGlobeEffect();
  if(typeof drawNavZones==="function") drawNavZones();
  document.getElementById("settings-panel").classList.remove("on");
};
var setExport=document.getElementById("set-export");
if(setExport) setExport.onclick=function(){
  var extra=loadExtra();
  var tracks=extra.filter(function(r){ return r.coords && r.coords.length>=2; });
  var blob=new Blob([JSON.stringify({version:1, exported:new Date().toISOString(), tracks:tracks},null,2)],{type:"application/json"});
  var a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="travelek-tracks-"+new Date().toISOString().slice(0,10)+".json";
  a.click();
  setTimeout(function(){ URL.revokeObjectURL(a.href); }, 2000);
};
var setImportBtn=document.getElementById("set-import");
if(setImportBtn) setImportBtn.onclick=function(){
  var fin=document.getElementById("set-import-file");
  if(fin) fin.click();
};
var setImportFile=document.getElementById("set-import-file");
if(setImportFile) setImportFile.onchange=function(ev){
  var f=ev.target.files&&ev.target.files[0];
  if(!f) return;
  var reader=new FileReader();
  reader.onload=function(){
    try{
      var data=JSON.parse(reader.result);
      var tracks=data.tracks||data||[];
      if(!Array.isArray(tracks)) throw new Error("format");
      var extra=loadExtra();
      var ids={};
      extra.forEach(function(x){ ids[x.id]=1; });
      var n=0;
      tracks.forEach(function(t){
        if(!t.coords||t.coords.length<2) return;
        if(!t.id) t.id="imp"+Date.now()+"_"+n;
        if(ids[t.id]) t.id=t.id+"_c"+Date.now();
        if(!t.mode) t.mode="walk";
        if(!t.date) t.date=new Date().toISOString().slice(0,10);
        if(!t.from) t.from="Старт";
        if(!t.to) t.to="Финиш";
        extra.push(t); ids[t.id]=1; n++;
      });
      saveExtra(extra);
      ROUTES=assembleRoutes();
      render();
      alert("Импортировано треков: "+n);
    }catch(e){
      alert("Не удалось прочитать файл");
    }
    ev.target.value="";
  };
  reader.readAsText(f);
};

/* ——— GPS трек (пешком / вело / авто) ——— */
var trackWatch=null, trackPoints=[], trackLine=null, trackPosMarker=null, tracking=false;


function simplifyTrack(pts, minM){
  if(!pts||pts.length<3) return pts||[];
  minM = minM||15;
  var out=[pts[0]], i;
  for(i=1;i<pts.length-1;i++){
    var a=out[out.length-1], b=pts[i];
    if(hav({lat:a[0],lng:a[1]},{lat:b[0],lng:b[1]})*1000 >= minM) out.push(b);
  }
  out.push(pts[pts.length-1]);
  return out;
}
function trackDistKm(pts){
  var km=0,i;
  for(i=1;i<pts.length;i++)
    km+=hav({lat:pts[i-1][0],lng:pts[i-1][1]},{lat:pts[i][0],lng:pts[i][1]});
  return km;
}
function updateTrackLive(){
  var el=document.getElementById("track-live");
  if(!tracking){ el.textContent="Ожидание…"; return; }
  var km=trackDistKm(trackPoints);
  el.textContent="Точек: "+trackPoints.length+" · "+km.toFixed(2)+" км · идёт запись";
}
function drawTrackLive(){
  if(trackLine){ try{map.removeLayer(trackLine);}catch(e){} trackLine=null; }
  if(trackPoints.length>=2){
    var col=COLORS[document.getElementById("track-mode").value]||COLORS.car;
    trackLine=L.polyline(trackPoints,{color:col,weight:4,opacity:0.9}).addTo(map);
  }
  if(trackPoints.length){
    var p=trackPoints[trackPoints.length-1];
    if(trackPosMarker) trackPosMarker.setLatLng(p);
    else trackPosMarker=L.circleMarker(p,{radius:6,color:"#fff",weight:2,fillColor:"#c44",fillOpacity:1}).addTo(map);
  }
}
function startTracking(){
  if(!navigator.geolocation){
    alert("Геолокация недоступна в этом браузере");
    return;
  }
  trackPoints=[];
  tracking=true;
  document.getElementById("track-start").disabled=true;
  document.getElementById("track-stop").disabled=false;
  document.getElementById("track-btn").classList.add("rec");
  updateTrackLive();
  var ts=loadTrackSettings();
  var minKm=(ts.minDistM||8)/1000;
  var maxAcc=ts.maxAccM||50;
  trackWatch=navigator.geolocation.watchPosition(function(pos){
    var la=pos.coords.latitude, ln=pos.coords.longitude;
    var acc=pos.coords.accuracy||999;
    if(acc>maxAcc && trackPoints.length>3) return;
    if(trackPoints.length){
      var last=trackPoints[trackPoints.length-1];
      var d=hav({lat:last[0],lng:last[1]},{lat:la,lng:ln});
      if(d<minKm) return;
    }
    trackPoints.push([la,ln]);
    drawTrackLive();
    updateTrackLive();
    if(trackPoints.length===1) map.setView([la,ln], 15);
  }, function(err){
    alert("GPS: "+(err.message||"нет доступа. Разрешите геолокацию для Safari."));
    stopTracking(false);
  }, {enableHighAccuracy:!!ts.highAccuracy, maximumAge:2000, timeout:15000});
}
function stopTracking(save){
  if(trackWatch!=null){
    navigator.geolocation.clearWatch(trackWatch);
    trackWatch=null;
  }
  tracking=false;
  document.getElementById("track-start").disabled=false;
  document.getElementById("track-stop").disabled=true;
  document.getElementById("track-btn").classList.remove("rec");
  if(!save){ updateTrackLive(); return; }
  if(trackPoints.length<2){
    alert("Слишком мало точек. Пройдите/проехать ещё.");
    updateTrackLive();
    return;
  }
  var mode=document.getElementById("track-mode").value||"car";
  if(mode!=="plane"&&mode!=="train"&&mode!=="car") mode="car";
  var km=trackDistKm(trackPoints);
  var now=new Date();
  var date=now.toISOString().slice(0,10);
  var time=("0"+now.getHours()).slice(-2)+":"+("0"+now.getMinutes()).slice(-2);
  var trip={
    id:"t"+Date.now(),
    mode:mode,
    flight: "Авто-трек",
    from: "Старт "+trackPoints[0][0].toFixed(4)+", "+trackPoints[0][1].toFixed(4),
    to: "Финиш "+trackPoints[trackPoints.length-1][0].toFixed(4)+", "+trackPoints[trackPoints.length-1][1].toFixed(4),
    date:date,
    time:time,
    coords: simplifyTrack(trackPoints.slice(), (loadTrackSettings().minDistM||8)),
    duration: km.toFixed(1)+" км GPS"
  };
  var extra=loadExtra(); extra.push(trip); saveExtra(extra);
  ROUTES=assembleRoutes();
  if(trackLine){ try{map.removeLayer(trackLine);}catch(e){} trackLine=null; }
  if(trackPosMarker){ try{map.removeLayer(trackPosMarker);}catch(e){} trackPosMarker=null; }
  trackPoints=[];
  updateTrackLive();
  document.getElementById("track-panel").classList.remove("on");
  render();
  alert("Трек сохранён: "+km.toFixed(2)+" км");
}

var trackBtn=document.getElementById("track-btn");
if(trackBtn) trackBtn.onclick=function(){
  var p=document.getElementById("track-panel");
  if(p) p.classList.toggle("on");
};
var trackClose=document.getElementById("track-close");
if(trackClose) trackClose.onclick=function(){
  if(tracking){ if(!confirm("Остановить запись без сохранения?")) return; stopTracking(false); }
  var p=document.getElementById("track-panel");
  if(p) p.classList.remove("on");
};
var trackStart=document.getElementById("track-start");
if(trackStart) trackStart.onclick=function(){ startTracking(); };
var trackStop=document.getElementById("track-stop");
if(trackStop) trackStop.onclick=function(){ stopTracking(true); };


if(typeof ensureFlightPairs==="function") ensureFlightPairs();
if(ROUTES.length && !ROUTES.some(isFuture)){
  activeTab="past";
  var bootTabs=document.querySelectorAll(".tab");
  for(var bti=0;bti<bootTabs.length;bti++){
    if(bootTabs[bti].getAttribute("data-tab")==="past") bootTabs[bti].classList.add("on");
    else bootTabs[bti].classList.remove("on");
  }
}
loadMapPrefs();
setSheet("mid");
render();
if(typeof applyGlobeEffect==="function") applyGlobeEffect();
if(typeof drawNavZones==="function") drawNavZones();
setInterval(render,60000);

/* ——— гарантированные обработчики UI ——— */
(function(){
  function $(id){ return document.getElementById(id); }
  var ab=$("add-btn"); if(ab) ab.onclick=function(e){ e.stopPropagation(); openTripWindow(); };
  var ab2=$("add-btn-2"); if(ab2) ab2.onclick=function(e){ e.stopPropagation(); openTripWindow(); };
  var dl=$("download-file");
  if(dl){
    if(location.protocol==="file:") dl.style.display="none";
    dl.onclick=function(e){
      e.preventDefault();
      e.stopPropagation();
      fetch("/travelek.html").then(function(r){
        if(!r.ok) throw new Error("missing");
        return r.blob();
      }).then(function(blob){
        var file=new File([blob],"travelek.html",{type:"text/html"});
        if(navigator.canShare && navigator.canShare({files:[file]})){
          navigator.share({files:[file], title:"ТравелЕк"}).catch(function(){});
          return;
        }
        var a=document.createElement("a");
        a.href=URL.createObjectURL(blob);
        a.download="travelek.html";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }).catch(function(){
        alert("Не вышло скачать из этого окна. Откройте приложение в Safari или Chrome и нажмите «Скачать файл» ещё раз.");
      });
    };
  }
  var sb=$("settings-btn"); if(sb) sb.onclick=function(e){ e.stopPropagation(); if(typeof openSettings==="function") openSettings(); };
  var tb=$("theme-btn"); if(tb) tb.onclick=function(e){
    e.stopPropagation();
    var cur=document.documentElement.getAttribute("data-theme")||"dark";
    if(typeof applyTheme==="function") applyTheme(cur==="dark"?"light":"dark");
  };
  var tr=$("track-btn"); if(tr) tr.onclick=function(e){ e.stopPropagation(); var p=$("track-panel"); if(p) p.classList.toggle("on"); };
  var zf=$("z-fit"); if(zf) zf.onclick=function(){ if(map && map._isAtlas){ if(typeof fitAll==="function") fitAll(); return; } if(globeOn && typeof globeFit==="function"){ globeFit(); return; } if(typeof fitAll==="function") fitAll(); };
  var zi=$("z-in"); if(zi) zi.onclick=function(){ if(map && map._isAtlas){ map.zoomIn(); return; } if(globeOn && typeof globeZoom==="function"){ globeZoom(1.18); return; } map.zoomIn(); };
  var zo=$("z-out"); if(zo) zo.onclick=function(){ if(map && map._isAtlas){ map.zoomOut(); return; } if(globeOn && typeof globeZoom==="function"){ globeZoom(1/1.18); return; } map.zoomOut(); };
  var tabs=document.querySelectorAll(".tab");
  for(var i=0;i<tabs.length;i++){
    tabs[i].onclick=(function(t){return function(e){
      e.stopPropagation();
      for(var j=0;j<tabs.length;j++) tabs[j].classList.remove("on");
      t.classList.add("on");
      activeTab=t.getAttribute("data-tab");
      selectedId=null;
      if(typeof render==="function") render();
    };})(tabs[i]);
  }
})();

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
var COUNTRY_GRID=null;
function countryGrid(){
  if(COUNTRY_GRID && COUNTRY_GRID.src===COUNTRY_LIST) return COUNTRY_GRID;
  var cell={}, STEP=4, ci, polys, k, ring, t, lng, lat, s, n, w, e, id, la, lo, la0, la1, lo0, lo1;
  function put(key, id){
    var a=cell[key];
    if(!a){ cell[key]=[id]; return; }
    if(a[a.length-1]!==id && a.indexOf(id)<0) a.push(id);
  }
  for(ci=0; ci<COUNTRY_LIST.length; ci++){
    polys=polysOf(COUNTRY_LIST[ci]);
    for(k=0;k<polys.length;k++){
      ring=polys[k][0];
      if(!ring||ring.length<3) continue;
      s=90; n=-90; w=180; e=-180;
      for(t=0;t<ring.length;t++){
        lng=ring[t][0]; lat=ring[t][1];
        if(lat<s) s=lat; if(lat>n) n=lat; if(lng<w) w=lng; if(lng>e) e=lng;
      }
      id=ci+":"+k;
      la0=Math.floor(s/STEP); la1=Math.floor(n/STEP);
      lo0=Math.floor(w/STEP); lo1=Math.floor(e/STEP);
      if(e-w>180){ lo0=Math.floor(-180/STEP); lo1=Math.floor(180/STEP); }
      for(la=la0; la<=la1; la++) for(lo=lo0; lo<=lo1; lo++) put(la+":"+lo, id);
    }
  }
  COUNTRY_GRID={src:COUNTRY_LIST, cell:cell, step:STEP};
  return COUNTRY_GRID;
}
function gridHits(lat, lng){
  var g=countryGrid();
  return g.cell[Math.floor(lat/g.step)+":"+Math.floor(lng/g.step)]||[];
}
function hitCountry(lat, lng, want){
  var hits=gridHits(lat, lng), i, parts, c, polys;
  for(i=0;i<hits.length;i++){
    parts=hits[i].split(":");
    c=COUNTRY_LIST[+parts[0]];
    if(!c) continue;
    if(want){ if(c.i!==want) continue; }
    else if(c.i==="RU") continue;
    polys=polysOf(c);
    if(polyHas(polys[+parts[1]], lat, lng)) return c.i;
  }
  return null;
}
function countryAt(lat, lng){
  if(!COUNTRY_LIST) return null;
  if(hitCountry(lat, lng, "UA")) return "UA";
  var region=regionAtList(RUSSIA_REGIONS, lat, lng, 0.08);
  if(region) return "RU";
  if(hitCountry(lat, lng, "RU")) return "RU";
  var other=hitCountry(lat, lng, null);
  if(other) return other;
  var near=null, nearD=0.06, i, c, dlt;
  for(i=0;i<COUNTRY_LIST.length;i++){
    c=COUNTRY_LIST[i];
    if(c.i==="RU") continue;
    if(c.b && (lat<c.b[0]-nearD || lat>c.b[2]+nearD || lng<c.b[1]-nearD || lng>c.b[3]+nearD)) continue;
    dlt=regionEdgeDist(c, lat, lng);
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
  var hit=map && map.regionAt ? map.regionAt(lat,lng) : null;
  if(hit && hit.layer==="W"){
    var atlasId=hit.iso||"";
    if(hit.name==="Украина") atlasId="UA";
    if(!atlasId && hit.name){
      var ci;
      for(ci=0;ci<COUNTRY_LIST.length;ci++) if(COUNTRY_LIST[ci].n===hit.name){ atlasId=COUNTRY_LIST[ci].i; break; }
    }
    if(atlasId==="UA" || (!cid && atlasId)) cid=atlasId;
  }
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
  if(!COUNTRY_LIST) return;
  var autoC={}, autoR={};
  function regionIdByName(code, name){
    if(!code || !name) return null;
    var list=regionsFor(code)||[];
    var n=String(name).toLowerCase().replace(/ё/g,"е");
    var i, rn, id;
    for(i=0;i<list.length;i++){
      rn=String(list[i].n||"").toLowerCase().replace(/ё/g,"е");
      id=String(list[i].id||"");
      if(rn===n || id.toLowerCase().replace(/ё/g,"е")===n || id.toLowerCase().replace(/ё/g,"е")===(String(code).toLowerCase()+":"+n)) return list[i].id;
    }
    for(i=0;i<list.length;i++){
      rn=String(list[i].n||"").toLowerCase().replace(/ё/g,"е");
      if(rn.length>=4 && (n.indexOf(rn)>=0 || rn.indexOf(n)>=0)) return list[i].id;
    }
    return null;
  }
  function hit(lat, lng){
    if(lat==null || lng==null || isNaN(lat) || isNaN(lng)) return;
    var id=countryAt(lat, lng);
    var rid=id?regionIn(id, lat, lng):null;
    if((!id || !rid) && map && map.regionAt){
      var h=map.regionAt(lat, lng);
      if(h && h.layer && h.layer!=="W" && h.name){
        if(!id){
          if(h.sub==="Россия" || h.layer==="R") id="RU";
          else if(h.sub==="Китай" || h.layer==="C") id="CN";
          else if(h.iso) id=h.iso;
          else if(h.sub && COUNTRY_LIST){
            for(var ci=0; ci<COUNTRY_LIST.length; ci++) if(COUNTRY_LIST[ci].n===h.sub){ id=COUNTRY_LIST[ci].i; break; }
          }
        }
        if(!rid && id) rid=regionIdByName(id, h.name);
      }
    }
    if(id) autoC[id]=1;
    if(rid) autoR[rid]=1;
  }
  (typeof ROUTES!=="undefined"?ROUTES:[]).forEach(function(r){
    var fut=typeof isFuture==="function" && isFuture(r);
    if(activeTab==="future" && !fut) return;
    if(activeTab==="past" && fut) return;
    if(activeTab==="trips" && selectedTripId){
      var trip=null, trips=typeof loadTrips==="function"?loadTrips():[], ti, ids;
      for(ti=0;ti<trips.length;ti++) if(trips[ti].id===selectedTripId) trip=trips[ti];
      ids=trip&&trip.routes||[];
      if(ids.indexOf(r.id)<0) return;
    }
    var g=typeof buildGeoSync==="function"?buildGeoSync(r):null;
    if(g){
      if(g.a) hit(g.a.lat, g.a.lng);
      if(g.b) hit(g.b.lat, g.b.lng);
    }
    if(r.coords && r.coords.length>=2){
      hit(r.coords[0][0], r.coords[0][1]);
      var last=r.coords[r.coords.length-1];
      hit(last[0], last[1]);
    }
    if(typeof place==="function"){
      var a=place(r.from, r.fromCode), b=place(r.to, r.toCode);
      if(a) hit(a.lat, a.lng);
      if(b) hit(b.lat, b.lng);
    }
  });
  var next=[], seen={};
  function addC(id){
    if(!id || seen[id] || offCountries.indexOf(id)>=0) return;
    seen[id]=1; next.push(id);
  }
  var nextR=[], seenR={};
  function addR(id){
    if(!id || seenR[id] || offRegions.indexOf(id)>=0) return;
    seenR[id]=1; nextR.push(id);
  }
  function countryOfRegion(id){
    if(!id) return null;
    var rec=typeof regionRecord==="function"?regionRecord(id):null;
    if(rec && rec.c) return rec.c;
    var cut=String(id).indexOf(":");
    if(cut>0) return String(id).slice(0, cut);
    return "RU";
  }
  Object.keys(autoC).forEach(addC);
  if(activeTab==="past"){
    var futC={}, futR={};
    (ROUTES||[]).forEach(function(r){
      if(!(typeof isFuture==="function" && isFuture(r))) return;
      var bag=endpointBag(r);
      bag.countries.forEach(function(id){ futC[id]=1; });
      bag.regions.forEach(function(id){ futR[id]=1; });
    });
    manualCountries.forEach(function(id){ if(!futC[id]) addC(id); });
    manualRegions.forEach(function(id){
      if(futR[id]) return;
      addR(id);
      var c=countryOfRegion(id);
      if(c) addC(c);
    });
  }
  if(activeTab==="trips"){
    var trips=typeof loadTrips==="function"?loadTrips():[], ti;
    for(ti=0;ti<trips.length;ti++){
      if(selectedTripId && trips[ti].id!==selectedTripId) continue;
      (trips[ti].countries||[]).forEach(addC);
      (trips[ti].regions||[]).forEach(function(id){
        addR(id);
        var c=countryOfRegion(id);
        if(c) addC(c);
      });
    }
  }
  Object.keys(autoR).forEach(function(id){ var c=countryOfRegion(id); if(c && offCountries.indexOf(c)<0) addC(c); });
  visited=next;
  Object.keys(autoR).forEach(addR);
  visitedRegions=nextR;
  autoCountries=autoC;
  autoRegions=autoR;
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
  if(loose) return loose;
  if(q.length>=2){
    var wm=worldRegionMap(q);
    if(wm && wm[r.id]) return wm[r.id];
  }
  return null;
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
  if(count) count.textContent=String(activeTab==="future"?futurePlaces().countries.length:visited.length);
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
  var queue=[];
  function put(raw, lat, lng){
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
  function add(raw, lat, lng){
    if(!raw || lat==null || lng==null || isNaN(lat) || isNaN(lng)) return;
    queue.push([raw, lat, lng]);
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
  var qi=0;
  (function step(){
    var t0=Date.now();
    while(qi<queue.length && Date.now()-t0<12){
      put(queue[qi][0], queue[qi][1], queue[qi][2]);
      qi++;
    }
    if(qi<queue.length) setTimeout(step, 0);
  })();
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
  if(map && map.collectRegions){
    var have={}, code;
    for(code in REGIONS_BY) if(REGIONS_BY[code] && REGIONS_BY[code].length) have[code]=1;
    map.collectRegions(have).forEach(function(r){
      if(!r || !r.c || have[r.c]) return;
      (REGIONS_BY[r.c]=REGIONS_BY[r.c]||[]).push(r);
    });
  }
}
function bootGeo(){
  var left=5;
  function finish(){
    if(--left>0) return;
    indexRegions();
    bindRegionCities();
    syncVisited();
    if(typeof drawWorld==="function") drawWorld();
    drawCountries();
    renderCountryUi();
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
  }
  if(!countryLayer && typeof L!=="undefined" && typeof map!=="undefined") countryLayer=L.layerGroup().addTo(map);
  ensureHoverLayer();
  globeLand=null;
  loadGeo("./geo/countries.json?v=10").then(function(data){
    COUNTRY_LIST=normalizeCountries(data&&data.items);
    finish();
    if(typeof render==="function") render();
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
bootGeo();
setTimeout(loadWorldPlaces, 800);
function syncMapSwitch(){
  var sw=document.getElementById("map-switch");
  if(!sw) return;
  sw.classList.toggle("globe", !!globeOn);
  var buttons=sw.querySelectorAll("button");
  for(var i=0;i<buttons.length;i++){
    var on=buttons[i].getAttribute("data-view")===(globeOn?"globe":"map");
    buttons[i].classList.toggle("on", on);
    buttons[i].setAttribute("aria-pressed", on?"true":"false");
  }
}
function setMapView(globe){
  globeOn=!!globe;
  nightOn=true;
  saveMapPrefs();
  syncMapSwitch();
  var settings=document.getElementById("settings-panel");
  if(settings) settings.classList.remove("on");
  if(typeof applyGlobeEffect==="function") applyGlobeEffect();
  if(typeof updateNightLayer==="function") updateNightLayer();
}
function setRouteNetwork(opts){
  if(!map || !map.setNetwork) return;
  map.setNetwork(opts||{});
  var roads=document.getElementById("net-roads");
  var rails=document.getElementById("net-rails");
  if(roads && opts && "roads" in opts) roads.classList.toggle("on", !!opts.roads);
  if(rails && opts && "rails" in opts) rails.classList.toggle("on", !!opts.rails);
}
function bindNetToggles(){
  var roads=document.getElementById("net-roads");
  var rails=document.getElementById("net-rails");
  if(roads) roads.onclick=function(e){
    e.stopPropagation();
    setRouteNetwork({roads:!roads.classList.contains("on")});
  };
  if(rails) rails.onclick=function(e){
    e.stopPropagation();
    setRouteNetwork({rails:!rails.classList.contains("on")});
  };
}
bindNetToggles();
var mapSwitch=document.getElementById("map-switch");
if(mapSwitch) mapSwitch.onclick=function(e){
  var b=e.target.closest("button");
  if(!b) return;
  setMapView(b.getAttribute("data-view")==="globe");
};
syncMapSwitch();
function openLegal(which){
  var panel=document.getElementById("legal-panel");
  if(!panel) return;
  panel.classList.add("on");
  var terms=document.getElementById("legal-terms");
  var privacy=document.getElementById("legal-privacy");
  if(terms) terms.hidden=which==="privacy";
  if(privacy) privacy.hidden=which!=="privacy";
  var title=document.getElementById("legal-title");
  if(title) title.textContent=which==="privacy"?t("Обработка данных"):t("Пользовательское соглашение");
}
document.querySelectorAll("[data-legal]").forEach(function(btn){
  btn.addEventListener("click", function(e){
    e.preventDefault();
    e.stopPropagation();
    openLegal(btn.getAttribute("data-legal"));
  });
});
var legalClose=document.getElementById("legal-close");
if(legalClose) legalClose.onclick=function(){ document.getElementById("legal-panel").classList.remove("on"); };
var legalOk=document.getElementById("legal-ok");
if(legalOk) legalOk.onclick=function(){
  var box=document.getElementById("file-login-legal");
  if(box) box.checked=true;
  document.getElementById("legal-panel").classList.remove("on");
};
var countriesOpen=document.getElementById("countries-open");
if(countriesOpen) countriesOpen.onclick=function(e){
  e.stopPropagation();
  regionScope="";
  var p=document.getElementById("countries-panel");
  if(p) p.classList.add("on");
  var s=document.getElementById("settings-panel"); if(s) s.classList.remove("on");
  var t=document.getElementById("track-panel"); if(t) t.classList.remove("on");
  renderCountryUi();
};
var countriesClose=document.getElementById("countries-close");
if(countriesClose) countriesClose.onclick=function(){
  regionScope="";
  document.getElementById("countries-panel").classList.remove("on");
};
var regionsBack=document.getElementById("regions-back");
if(regionsBack) regionsBack.onclick=function(){
  regionScope="";
  var qEl=document.getElementById("country-q");
  if(qEl) qEl.value="";
  renderCountryUi();
};
var countryQ=document.getElementById("country-q");
if(countryQ) countryQ.oninput=function(){ renderCountryUi(); };
var countryList=document.getElementById("country-list");
if(countryList) countryList.onclick=function(e){
  var open=e.target.closest("[data-open]");
  if(open){ regionScope=open.getAttribute("data-open")||"RU"; var qEl=document.getElementById("country-q"); if(qEl) qEl.value=""; renderCountryUi(); return; }
  var b=e.target.closest("[data-iso]");
  if(!b) return;
  toggleCountry(b.getAttribute("data-iso"));
};
if(countryList){
  var swipe=null;
  countryList.addEventListener("pointerdown", function(e){
    var row=e.target.closest("button.on");
    if(!row) return;
    swipe={row:row, x:e.clientX, y:e.clientY, dx:0, id:row.getAttribute("data-iso")||row.getAttribute("data-open")};
  });
  countryList.addEventListener("pointermove", function(e){
    if(!swipe) return;
    var dx=e.clientX-swipe.x, dy=e.clientY-swipe.y;
    if(Math.abs(dy)>12 && Math.abs(dy)>Math.abs(dx)){ swipe.row.style.transform=""; swipe=null; return; }
    if(dx>0) dx=0;
    if(dx<-110) dx=-110;
    swipe.dx=dx;
    swipe.row.style.transform="translateX("+dx+"px)";
  });
  function endSwipe(){
    if(!swipe) return;
    var id=swipe.id, dx=swipe.dx, row=swipe.row;
    swipe=null;
    if(dx<-64 && id){ countryList._swiped=1; unvisitCountry(id); return; }
    row.style.transform="";
  }
  countryList.addEventListener("pointerup", endSwipe);
  countryList.addEventListener("pointercancel", endSwipe);
  countryList.addEventListener("click", function(e){
    if(!countryList._swiped) return;
    countryList._swiped=0;
    e.preventDefault();
    e.stopPropagation();
  }, true);
}
var regionList=document.getElementById("region-list");
if(regionList) regionList.onclick=function(e){
  var b=e.target.closest("[data-reg]");
  if(!b) return;
  toggleRegion(b.getAttribute("data-reg"));
};
var countryPicked=document.getElementById("country-picked");
if(countryPicked) countryPicked.onclick=function(e){
  var b=e.target.closest("button");
  if(!b) return;
  toggleCountry(b.getAttribute("data-drop"));
};
var fromRoutes=document.getElementById("countries-from-routes");
if(fromRoutes) fromRoutes.onclick=function(){
  var n=countriesFromRoutes();
  var st=regionStats();
  var cst=chinaStats();
  alert("По маршрутам: "+n+" стран"+(st.total?(", Россия "+st.got+" из "+st.total):"")+(cst.total?(", Китай "+cst.got+" из "+cst.total):""));
};
window.__travelekStats=function(){
  var kmP=0, kmT=0, kmC=0, i, r, g;
  for(i=0;i<(ROUTES||[]).length;i++){
    r=ROUTES[i];
    g=typeof buildGeoSync==="function"?buildGeoSync(r):null;
    if(!g) continue;
    if(r.mode==="plane") kmP+=g.km||0;
    else if(r.mode==="car") kmC+=g.km||0;
    else kmT+=g.km||0;
  }
  var st=regionStats();
  return {routes:ROUTES.length, countries:visited.length, regions:st, plane:Math.round(kmP), train:Math.round(kmT), car:Math.round(kmC)};
};
window.__packStats=function(pack){
  function arr(key){
    try{ var a=JSON.parse((pack&&pack[key])||"[]"); return Array.isArray(a)?a:[]; }
    catch(e){ return []; }
  }
  var del=arr("travelek-del");
  var routes=arr("travelek-extra").filter(function(r){ return r && del.indexOf(r.id)<0; });
  var kmP=0, kmT=0, kmC=0, autoC={}, autoR={};
  function hit(lat, lng){
    if(typeof countryAt!=="function") return;
    var id=countryAt(lat, lng);
    if(!id) return;
    autoC[id]=1;
    if(id==="RU" && typeof regionAt==="function"){
      var rid=regionAt(lat, lng);
      if(rid) autoR[rid]=1;
    } else if(id==="CN" && typeof chinaRegionAt==="function"){
      var cid=chinaRegionAt(lat, lng);
      if(cid) autoR[cid]=1;
    }
  }
  routes.forEach(function(r){
    var g=typeof buildGeoSync==="function"?buildGeoSync(r):null;
    if(g){
      if(r.mode==="plane") kmP+=g.km||0;
      else if(r.mode==="car") kmC+=g.km||0;
      else kmT+=g.km||0;
      if(g.coords){
        var step=Math.max(1, Math.floor(g.coords.length/24));
        for(var i=0;i<g.coords.length;i+=step) hit(g.coords[i][0], g.coords[i][1]);
      }
    }
    if(typeof place==="function"){
      var a=place(r.from, r.fromCode), b=place(r.to, r.toCode);
      if(a) hit(a.lat, a.lng);
      if(b) hit(b.lat, b.lng);
    }
  });
  var offC=arr("travelek-countries-off"), offR=arr("travelek-regions-off");
  var countries={}, regions={};
  Object.keys(autoC).forEach(function(id){ if(offC.indexOf(id)<0) countries[id]=1; });
  arr("travelek-countries").forEach(function(id){ if(offC.indexOf(id)<0) countries[id]=1; });
  Object.keys(autoR).forEach(function(id){ if(offR.indexOf(id)<0) regions[id]=1; });
  arr("travelek-regions").forEach(function(id){ if(offR.indexOf(id)<0) regions[id]=1; });
  var ruRegs=0;
  Object.keys(regions).forEach(function(id){
    if(String(id).indexOf("CN:")===0){ if(offC.indexOf("CN")<0) countries.CN=1; }
    else ruRegs++;
  });
  if(ruRegs && offC.indexOf("RU")<0) countries.RU=1;
  return {
    routesList:routes,
    routes:routes.length,
    countries:Object.keys(countries).length,
    regions:ruRegs,
    kmPlane:Math.round(kmP),
    kmTrain:Math.round(kmT),
    kmCar:Math.round(kmC)
  };
};



function loadTrips(){
  try{ var a=JSON.parse(localStorage.getItem("travelek-trips")||"[]"); return Array.isArray(a)?a:[]; }
  catch(e){ return []; }
}
function saveTrips(list){
  if(typeof safeSetItem==="function") safeSetItem("travelek-trips", JSON.stringify(list||[]));
  else try{ localStorage.setItem("travelek-trips", JSON.stringify(list||[])); }catch(e){}
}
function countryOfRid(rid){
  var rec=typeof regionRecord==="function"?regionRecord(rid):null;
  if(rec && rec.c) return rec.c;
  var s=String(rid||""), cut=s.indexOf(":");
  return cut>0?s.slice(0,cut):"RU";
}
function futurePlaces(){
  var countries=[], regions=[], sc={}, sr={};
  (ROUTES||[]).forEach(function(r){
    if(typeof isFuture==="function" && !isFuture(r)) return;
    var bag=endpointBag(r);
    bag.countries.forEach(function(id){ if(!sc[id]){ sc[id]=1; countries.push(id); } });
    bag.regions.forEach(function(id){ if(!sr[id]){ sr[id]=1; regions.push(id); } });
  });
  return {countries:countries, regions:regions};
}
function endpointBag(r){
  var countries=[], regions=[], sc={}, sr={};
  function hit(lat, lng){
    if(lat==null || lng==null || isNaN(lat) || isNaN(lng) || typeof countryAt!=="function") return;
    lat=+lat; lng=+lng;
    var cid=typeof countryAt==="function"?countryAt(lat, lng):null;
    var rid=cid && typeof regionIn==="function"?regionIn(cid, lat, lng):null;
    if(!rid && typeof regionAt==="function") rid=regionAt(lat, lng);
    if(!rid && typeof chinaRegionAt==="function") rid=chinaRegionAt(lat, lng);
    if((!cid || !rid) && typeof map!=="undefined" && map && map.regionAt){
      var h=map.regionAt(lat, lng);
      if(h && h.layer && h.layer!=="W" && h.name){
        if(!cid){
          if(h.sub==="Россия" || h.layer==="R") cid="RU";
          else if(h.sub==="Китай" || h.layer==="C") cid="CN";
          else if(h.iso) cid=h.iso;
          else if(h.sub && typeof COUNTRY_LIST!=="undefined" && COUNTRY_LIST){
            for(var ci=0; ci<COUNTRY_LIST.length; ci++) if(COUNTRY_LIST[ci].n===h.sub){ cid=COUNTRY_LIST[ci].i; break; }
          }
        }
        if(!rid && cid && typeof regionRecord==="function"){
          var list=typeof regionsFor==="function"?regionsFor(cid):null, ri, rn, want=String(h.name).toLowerCase().replace(/ё/g,"е");
          if(list) for(ri=0;ri<list.length;ri++){
            rn=String(list[ri].n||"").toLowerCase().replace(/ё/g,"е");
            if(rn===want || rn.indexOf(want)>=0 || want.indexOf(rn)>=0){ rid=list[ri].id; break; }
          }
        }
      }
    }
    if(!cid && rid && typeof countryOfRid==="function") cid=countryOfRid(rid);
    if(cid && !sc[cid]){ sc[cid]=1; countries.push(cid); }
    if(rid && !sr[rid]){ sr[rid]=1; regions.push(rid); }
  }
  function hitPt(pt){ if(pt) hit(pt.lat, pt.lng); }
  function hitPair(p){
    if(!p) return;
    if(p.lat!=null) hit(p.lat, p.lng);
    else hit(p[0], p[1]);
  }
  if(r && r.coords && r.coords.length){
    hitPair(r.coords[0]);
    hitPair(r.coords[r.coords.length-1]);
  }
  if(typeof buildGeoSync==="function"){
    try{
      var g=buildGeoSync(r);
      if(g){ hitPt(g.a); hitPt(g.b); }
    }catch(e){}
  }
  if(typeof place==="function"){
    hitPt(place(r.from, r.fromCode));
    hitPt(place(r.to, r.toCode));
  }
  return {countries:countries, regions:regions};
}
function placeRows(tab){
  var rows=[], seen={};
  function add(key, title, sub){
    if(!key || seen[key]) return;
    seen[key]=1;
    rows.push({key:key, title:title, sub:sub||""});
  }
  if(tab==="future"){
    (ROUTES||[]).forEach(function(r){
      if(typeof isFuture==="function" && !isFuture(r)) return;
      var bag=endpointBag(r);
      bag.regions.forEach(function(rid){
        var rec=regionRecord(rid), c=countryRecord(countryOfRid(rid));
        add(rid, rec?regionLabel(rec.n):rid, c?countryLabel(c):"");
      });
      bag.countries.forEach(function(cid){
        var has=bag.regions.some(function(rid){ return countryOfRid(rid)===cid; });
        if(has) return;
        var c=countryRecord(cid);
        add(cid, c?countryLabel(c):cid, "");
      });
    });
    return rows;
  }
  (visitedRegions||[]).forEach(function(rid){
    var rec=regionRecord(rid), c=countryRecord(countryOfRid(rid));
    add(rid, rec?regionLabel(rec.n):rid, c?countryLabel(c):"");
  });
  (visited||[]).forEach(function(cid){
    var has=false, i;
    for(i=0;i<(visitedRegions||[]).length;i++) if(countryOfRid(visitedRegions[i])===cid){ has=true; break; }
    if(has) return;
    var c=countryRecord(cid);
    add(cid, c?countryLabel(c):cid, "");
  });
  return rows;
}
function modeColor(mode){ return (typeof COLORS!=="undefined" && COLORS[mode]) || "#1d4ed8"; }
function cmpDate(a, b){ return ((a&&a.date||"")+" "+(a&&a.time||"")).localeCompare((b&&b.date||"")+" "+(b&&b.time||"")); }
function routeText(r){
  return '<div class="route-line" data-route-edit="'+r.id+'" style="color:'+modeColor(r.mode)+'">'+
    '<button type="button" class="route-x" data-route-del="'+r.id+'" title="'+t("Удалить")+'">×</button>'+
    escLabel((r.from||"")+" → "+(r.to||""))+(r.date?" · "+escLabel(r.date):"")+'</div>';
}
function deleteRoute(id){
  if(!id) return;
  if(deleted.indexOf(id)<0){ deleted.push(id); saveDeleted(deleted); }
  saveExtra(loadExtra().filter(function(x){ return x.id!==id; }));
  ROUTES=assembleRoutes();
  if(selectedId===id) selectedId=null;
  render();
}
function routeCardHtml(r){
  var fut=isFuture(r), g=buildGeoSync(r), km=g?Math.round(g.km):0;
  var bc=r.mode==="plane"?"pl":(r.mode==="car"?"car":(r.mode==="walk"?"wk":(r.mode==="bike"?"bk":(r.mode==="ship"?"sh":"tr"))));
  var fromL=g&&g.a?shortPlaceLabel(r.from, g.a.lat, g.a.lng):shortPlaceLabel(r.from);
  var toL=g&&g.b?shortPlaceLabel(r.to, g.b.lat, g.b.lng):shortPlaceLabel(r.to);
  var dur=formatTripDuration(r, km);
  var kmNote=g&&g.railMiss?(" · "+t("нет железной дороги")):(g&&g.roadMiss?(" · "+t("нет автодороги")):(km?" · "+km.toLocaleString(currentLang()==="en"?"en":"ru-RU")+" "+t("км"):""));
  return '<div class="row '+(selectedId===r.id?"on ":"")+(fut?"future":"")+'" data-id="'+r.id+'">'+
    '<button type="button" class="edit" data-edit="'+r.id+'" title="'+t("Изменить")+'">✎</button>'+
    '<button type="button" class="del" data-del="'+r.id+'" title="'+t("Удалить")+'">×</button>'+
    '<div class="title" style="color:'+modeColor(r.mode)+'">'+fromL+" → "+toL+"</div>"+
    '<div class="meta"><span class="badge '+bc+'">'+(r.flight||r.mode)+"</span>"+
    (fut?'<span class="badge fut">'+t("скоро")+'</span>':"")+" "+(r.date||"")+
    (r.time?" · "+r.time:"")+kmNote+(dur?" · "+dur:"")+"</div></div>";
}
function tripYear(tp, tab){
  var routes=tripRoutesFor(tp, tab), y="", i, d;
  for(i=0;i<routes.length;i++){
    d=(routes[i].date||"").slice(0,4);
    if(d && (!y || (tab==="future"?d<y:d>y))) y=d;
  }
  return y;
}
function tripSortKey(tp, tab){
  var routes=tripRoutesFor(tp, tab==="trips"?null:tab), d="", i;
  for(i=0;i<routes.length;i++) if(routes[i].date && (!d || routes[i].date<d)) d=routes[i].date;
  return d||"9999-99-99";
}
function paintSheetList(el, list){
  if(!el) return;
  var tab=activeTab;
  var nowY=String(new Date().getFullYear());
  var trips=loadTrips().filter(function(tp){ return tab==="trips" || tripInTab(tp, tab); });
  var groups={}, order=[], html="", i, tp, y;
  for(i=0;i<trips.length;i++){
    tp=trips[i];
    y=tripYear(tp, tab)||nowY;
    if(tab==="future" && y<nowY) continue;
    if(!groups[y]){ groups[y]=[]; order.push(y); }
    groups[y].push(tp);
  }
  order.sort(function(a,b){ return tab==="future"?a.localeCompare(b):b.localeCompare(a); });
  var looseBy={}, usedIds=tab==="trips"?null:usedRouteIds();
  if(usedIds){
    list.forEach(function(r){
      if(usedIds[r.id]) return;
      var ry=(r.date||"").slice(0,4)||nowY;
      if(tab==="future" && ry<nowY) return;
      if(!groups[ry]){ groups[ry]=[]; order.push(ry); }
      (looseBy[ry]=looseBy[ry]||[]).push(r);
    });
    order.sort(function(a,b){ return tab==="future"?a.localeCompare(b):b.localeCompare(a); });
  }
  for(i=0;i<order.length;i++){
    y=order[i];
    groups[y].sort(function(a,b){ return tripSortKey(a, tab).localeCompare(tripSortKey(b, tab)); });
    html+='<div class="year">'+y+'</div>';
    groups[y].forEach(function(one){ html+=tripCard(one, tab==="trips"?null:tab); });
    (looseBy[y]||[]).sort(cmpDate).forEach(function(r){ html+=routeText(r); });
  }
  var loose=tab==="trips"?"":looseBlock(tab, list);
  if(!html && !loose){
    el.innerHTML='<div class="empty"><p>'+(tab==="future"?t("Нет предстоящих маршрутов. Откройте «Прошлые» или добавьте новый."):(tab==="trips"?t("Поездок пока нет"):t("В прошлых пока пусто")))+'</p></div>';
    return;
  }
  el.innerHTML=html+loose;
  el.querySelectorAll("[data-route-edit]").forEach(function(line){
    line.onclick=function(ev){
      if(ev.target.closest("[data-route-del]")) return;
      ev.stopPropagation();
      openEdit(line.getAttribute("data-route-edit"));
    };
  });
  el.querySelectorAll("[data-route-del]").forEach(function(btn){
    btn.onclick=function(ev){
      ev.stopPropagation();
      ev.preventDefault();
      deleteRoute(btn.getAttribute("data-route-del"));
    };
  });
  el.querySelectorAll("[data-all]").forEach(function(btn){
    btn.onclick=function(ev){
      ev.stopPropagation();
      var card=btn.closest("[data-card]");
      cardMore[card?card.getAttribute("data-card"):""]=true;
      render();
    };
  });
  if(tab==="trips"){
    el.querySelectorAll("[data-card]").forEach(function(card){
      card.onclick=function(ev){
        if(ev.target.closest("[data-all],[data-show],[data-route-edit],[data-route-del]")) return;
        openTripWindow({tripId:card.getAttribute("data-card")});
      };
    });
  } else {
    el.querySelectorAll("[data-card]").forEach(function(card){
      card.onclick=function(ev){
        if(ev.target.closest("[data-all],[data-show],[data-route-edit],[data-route-del]")) return;
        var id=card.getAttribute("data-card");
        if(!id || id==="loose") return;
        selectedTripId=selectedTripId===id?null:id;
        render();
      };
    });
  }
  el.querySelectorAll("[data-show]").forEach(function(btn){
    btn.onclick=function(ev){
      ev.stopPropagation();
      selectedTripId=btn.getAttribute("data-show");
      render();
      if(typeof startTripPlay==="function") startTripPlay();
    };
  });
}
function routeById(id){
  var i;
  for(i=0;i<(ROUTES||[]).length;i++) if(ROUTES[i].id===id) return ROUTES[i];
  return null;
}
function routeKm(r){
  if(!r) return 0;
  var key=r.mode+"|"+r.from+"|"+r.to+"|"+(r.date||"");
  if(r._kmKey===key) return r._km;
  var g=typeof buildGeoSync==="function"?buildGeoSync(r):null;
  r._km=g?g.km:0;
  r._kmKey=key;
  return r._km;
}
function usedRouteIds(){
  var set={}, trips=loadTrips(), i, j, ids;
  for(i=0;i<trips.length;i++){
    ids=trips[i].routes||[];
    for(j=0;j<ids.length;j++) set[ids[j]]=1;
  }
  return set;
}
function kmOf(routes){
  var p=0,t=0,c=0,i,r,km;
  for(i=0;i<routes.length;i++){
    r=routes[i]; km=routeKm(r);
    if(r.mode==="plane") p+=km;
    else if(r.mode==="car"||r.mode==="walk"||r.mode==="bike") c+=km;
    else t+=km;
  }
  return {plane:Math.round(p),train:Math.round(t),car:Math.round(c)};
}
function tripRoutesFor(tp, tab){
  var ids=tp.routes||[], out=[], i, r;
  for(i=0;i<ids.length;i++){
    r=routeById(ids[i]);
    if(!r) continue;
    if(tab==="future" && !isFuture(r)) continue;
    if(tab==="past" && isFuture(r)) continue;
    out.push(r);
  }
  return out;
}
function tripInTab(tp, tab){
  if(tripRoutesFor(tp, tab).length) return true;
  if((tp.routes||[]).length) return false;
  return tab==="past" && ((tp.countries||[]).length||(tp.regions||[]).length);
}
function tripPlaces(tp, routes, onlyRoutes){
  var countries=onlyRoutes?[]:(tp.countries||[]).slice(), regions=onlyRoutes?[]:(tp.regions||[]).slice(), i, bag;
  for(i=0;i<routes.length;i++){
    bag=endpointBag(routes[i]);
    bag.countries.forEach(function(id){ if(countries.indexOf(id)<0) countries.push(id); });
    bag.regions.forEach(function(id){ if(regions.indexOf(id)<0) regions.push(id); });
  }
  return {countries:countries, regions:regions};
}
function fmtKm(n){ return n.toLocaleString(currentLang()==="en"?"en":"ru-RU"); }
function statRow(km){
  function cell(n, label){ return '<div><b>'+fmtKm(n)+'</b><span>'+label+'</span></div>'; }
  return '<div class="f-kms">'+cell(km.plane,t("самолет, км"))+cell(km.train,t("поезд, км"))+cell(km.car,t("авто, км"))+'</div>';
}
function countriesBlock(countries, regions, expanded){
  var groups={}, order=[], i, id, g, rid, cid;
  function ensure(code){
    if(!code) return null;
    if(!groups[code]){ groups[code]={id:code, regs:[]}; order.push(code); }
    return groups[code];
  }
  for(i=0;i<countries.length;i++) ensure(countries[i]);
  for(i=0;i<(regions||[]).length;i++){
    rid=regions[i]; cid=countryOfRid(rid); g=ensure(cid);
    if(g && g.regs.indexOf(rid)<0) g.regs.push(rid);
  }
  var html="", shown=0, rec, regs, ri, names, cut;
  for(i=0;i<order.length;i++){
    if(!expanded && shown>=3){
      html+='<button type="button" class="more-link" data-all="1">'+t("Смотреть все")+'</button>';
      break;
    }
    id=order[i]; rec=countryRecord(id);
    regs=groups[id].regs;
    html+='<div class="f-country">'+escLabel(rec?countryLabel(rec):id)+'</div>';
    if(regs.length){
      cut=expanded?regs.length:Math.min(3, regs.length);
      names=[];
      for(ri=0;ri<cut;ri++){
        var rr=regionRecord(regs[ri]);
        names.push(escLabel(rr?regionLabel(rr.n):regs[ri]));
      }
      if(!expanded && regs.length>3) html+='<button type="button" class="more-link" data-all="1">'+t("Смотреть все")+'</button>';
      html+='<div class="f-regs">'+names.join("<br>")+'</div>';
    }
    shown++;
  }
  return {html:html, n:order.length};
}
function tripCard(tp, tab){
  var routes=tripRoutesFor(tp, tab).slice().sort(cmpDate);
  var places=tripPlaces(tp, routes, tab==="past" || tab==="future");
  var block=countriesBlock(places.countries, places.regions, !!cardMore[tp.id]);
  return '<article class="f-card'+(selectedTripId===tp.id?" on":"")+'" data-card="'+tp.id+'"><h4>'+escLabel(tp.title||t("Поездка"))+'</h4>'+routes.map(routeText).join("")+statRow(kmOf(routes))+'<div class="f-count">'+block.n+" "+t("стран")+'</div>'+block.html+'<button type="button" class="more-link" data-show="'+tp.id+'">'+t("Показать")+'</button></article>';
}
function looseBlock(tab, list){
  var used=usedRouteIds(), routes=[], i, tripCountries={}, countries=[], regions=[], seen={};
  loadTrips().forEach(function(tp){ (tp.countries||[]).forEach(function(id){ tripCountries[id]=1; }); (tp.regions||[]).forEach(function(id){ tripCountries[id]=1; }); });
  for(i=0;i<list.length;i++) if(!used[list[i].id]) routes.push(list[i]);
  if(tab==="past"){
    (visited||[]).forEach(function(id){ if(!tripCountries[id]) countries.push(id); });
    (visitedRegions||[]).forEach(function(id){ if(!tripCountries[id] && !tripCountries[countryOfRid(id)]) regions.push(id); });
  }
  routes.forEach(function(r){
    var bag=endpointBag(r);
    bag.countries.forEach(function(id){ if(!tripCountries[id] && countries.indexOf(id)<0 && !seen[id]){ seen[id]=1; countries.push(id); } });
    bag.regions.forEach(function(id){ if(!tripCountries[id] && regions.indexOf(id)<0) regions.push(id); });
  });
  if(!routes.length && !countries.length) return "";
  var block=countriesBlock(countries, regions, !!cardMore.loose);
  return '<article class="f-card" data-card="loose"><h4>'+t("Вне поездок")+'</h4>'+statRow(kmOf(routes))+'<div class="f-count">'+block.n+" "+t("стран")+'</div>'+block.html+'</article>';
}
var tw={id:null, title:"", routes:[], countries:[], regions:[], focus:""};
function closeTripWindow(){
  var w=document.getElementById("trip-window");
  if(w) w.classList.remove("on");
  var adsbBox=document.getElementById("tw-adsb");
  if(adsbBox){ adsbBox.hidden=true; adsbBox.innerHTML=""; }
  if(selectedTripId){ selectedTripId=null; if(typeof render==="function") render(); }
}
function openTripWindow(seed){
  seed=seed||{};
  var existing=null, all=loadTrips(), i;
  if(seed.tripId){ for(i=0;i<all.length;i++) if(all[i].id===seed.tripId) existing=all[i]; }
  tw={id:existing?existing.id:null, title:existing?(existing.title||""):"", routes:[], countries:(existing&&existing.countries||[]).slice(), regions:(existing&&existing.regions||[]).slice(), focus:"", freeAll:false};
  if(existing){
    (existing.routes||[]).forEach(function(id){
      var r=null, k;
      for(k=0;k<(ROUTES||[]).length;k++) if(ROUTES[k].id===id) r=ROUTES[k];
      if(r) tw.routes.push({saved:true, id:r.id, mode:r.mode, from:r.from, to:r.to, date:r.date, time:r.time||"", fromCode:r.fromCode||"", toCode:r.toCode||"", coords:r.coords||null});
    });
    tw.routes.forEach(function(r){ absorbRoute(routeById(r.id)||r); });
  }
  var name=document.getElementById("tw-name");
  if(name) name.value=tw.title||"";
  ["tw-from","tw-to","tw-time"].forEach(function(id){ var n=document.getElementById(id); if(n) n.value=""; });
  var dt=document.getElementById("tw-date");
  if(dt && !existing) dt.value="";
  var del=document.getElementById("tw-delete");
  if(del) del.hidden=!existing;
  var title=document.getElementById("tw-title");
  if(title) title.textContent=existing?t("Поездка"):t("Добавить поездку");
  paintTripWindow();
  var w=document.getElementById("trip-window");
  if(w) w.classList.add("on");
  if(typeof applyI18n==="function") applyI18n();
}
function paintTripWindow(){
  var taken={}, trips=loadTrips(), ti, tj, ids;
  for(ti=0;ti<trips.length;ti++){
    if(tw.id && trips[ti].id===tw.id) continue;
    ids=trips[ti].routes||[];
    for(tj=0;tj<ids.length;tj++) taken[ids[tj]]=1;
  }
  var free=(ROUTES||[]).filter(function(r){
    if(taken[r.id]) return false;
    return !tw.routes.some(function(x){ return x.id===r.id; });
  });
  free.sort(cmpDate);
  var show=tw.freeAll?free:free.slice(0,2);
  var freeBox=document.getElementById("tw-free");
  if(freeBox){
    freeBox.innerHTML=show.map(function(r){
      return '<button type="button" data-take="'+r.id+'" style="color:'+modeColor(r.mode)+'">'+escLabel((r.from||"")+" → "+(r.to||""))+'<div class="meta">'+(r.date||"")+"</div></button>";
    }).join("");
  }
  var more=document.getElementById("tw-free-more");
  if(more) more.hidden=!!tw.freeAll || free.length<=2;
  var box=document.getElementById("tw-routes");
  if(box){
    var ordered=tw.routes.map(function(r,i){ return {r:r,i:i}; }).sort(function(a,b){ return cmpDate(a.r,b.r); });
    box.innerHTML=ordered.map(function(item){
      var r=item.r;
      return '<button type="button" data-drop-route="'+item.i+'" style="color:'+modeColor(r.mode)+'">'+escLabel((r.from||"")+" → "+(r.to||""))+'<div class="meta">'+(r.date||"")+"</div> ×</button>";
    }).join("");
  }
  var picked=document.getElementById("tw-picked");
  if(picked){
    var bits=tw.countries.map(function(id){
      var c=countryRecord(id);
      return '<button type="button" data-drop-c="'+id+'">'+escLabel(c?countryLabel(c):id)+" ×</button>";
    });
    tw.regions.forEach(function(id){
      var rec=regionRecord(id);
      bits.push('<button type="button" class="on" data-drop-r="'+escLabel(id)+'">'+escLabel(rec?regionLabel(rec.n):id)+" ×</button>");
    });
    picked.innerHTML=bits.join("");
  }
  var row=document.getElementById("tw-regions");
  var regs=tw.focus && typeof regionsFor==="function"?regionsFor(tw.focus):null;
  if(row){
    if(!regs || !regs.length){ row.hidden=true; row.innerHTML=""; }
    else {
      row.hidden=false;
      row.innerHTML=regs.map(function(r){
        var on=tw.regions.indexOf(r.id)>=0;
        return '<button type="button" class="'+(on?"on":"")+'" data-reg="'+escLabel(r.id)+'">'+escLabel(regionLabel(r.n))+(on?" ✓":"")+"</button>";
      }).join("");
    }
  }
}
function previewTripPlaces(){
  var fromEl=document.getElementById("tw-from"), toEl=document.getElementById("tw-to");
  if(!fromEl || !toEl) return;
  var from=fromEl.value.trim(), to=toEl.value.trim();
  if(!from || !to) return;
  absorbRoute({from:from, to:to});
  paintTripWindow();
}
function absorbRoute(r){
  var bag=endpointBag(r);
  bag.countries.forEach(function(id){ if(tw.countries.indexOf(id)<0) tw.countries.push(id); });
  bag.regions.forEach(function(id){ if(tw.regions.indexOf(id)<0) tw.regions.push(id); });
  if(bag.countries.length) tw.focus=bag.countries[bag.countries.length-1];
  var marked=false;
  bag.countries.forEach(function(id){
    if((visited||[]).indexOf(id)>=0 || manualCountries.indexOf(id)>=0) return;
    offCountries=offCountries.filter(function(x){ return x!==id; });
    manualCountries.push(id);
    marked=true;
  });
  bag.regions.forEach(function(id){
    if((visitedRegions||[]).indexOf(id)>=0 || manualRegions.indexOf(id)>=0) return;
    offRegions=offRegions.filter(function(x){ return x!==id; });
    manualRegions.push(id);
    marked=true;
  });
  if(marked){
    saveSets();
    syncVisited();
    if(typeof drawCountries==="function") drawCountries();
    if(typeof renderCountryUi==="function") renderCountryUi();
  }
}
function adsbShift(date, days){
  var p=String(date||"").split("-");
  var t=new Date(Date.UTC(+p[0], (+p[1]||1)-1, (+p[2]||1)+days));
  var m=t.getUTCMonth()+1, d=t.getUTCDate();
  return t.getUTCFullYear()+"-"+(m<10?"0":"")+m+"-"+(d<10?"0":"")+d;
}
function adsbNote(text){
  var box=document.getElementById("tw-adsb");
  if(!box) return;
  box.hidden=!text;
  box.innerHTML=text?'<p class="more-link">'+text+"</p>":"";
}
function adsbFetch(url, opt){
  var ctrl=typeof AbortController!=="undefined"?new AbortController():null;
  var timer=setTimeout(function(){ if(ctrl) ctrl.abort(); }, 12000);
  var o=opt||{};
  if(ctrl) o.signal=ctrl.signal;
  return fetch(url, o).then(function(r){
    clearTimeout(timer);
    if(!r.ok) throw new Error("adsb");
    return r.json();
  }, function(e){ clearTimeout(timer); throw e; });
}
function adsbWanted(trip){
  if(!trip || trip.mode!=="plane" || !trip.date || trip.date<"2025-01-01") return false;
  var now=new Date();
  var today=now.getFullYear()+"-"+(now.getMonth()<9?"0":"")+(now.getMonth()+1)+"-"+(now.getDate()<10?"0":"")+now.getDate();
  return trip.date<=today;
}
function adsbSearch(a, b, date){
  var body={
    match:{and:[
      {endpoint_within:{mode:"start", geometry:{type:"Circle", coordinates:[a.lng, a.lat], radius:20000}}},
      {endpoint_within:{mode:"end", geometry:{type:"Circle", coordinates:[b.lng, b.lat], radius:20000}}}
    ]},
    start_from:adsbShift(date,-1)+"T00:00:00Z",
    end_date:adsbShift(date,2)+"T00:00:00Z",
    window_days:3,
    limit:15,
    include_path:false
  };
  return adsbFetch("https://adsb.aero/api/v1/query", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(body)
  }).then(function(data){
    var list=(data&&data.flights)||[];
    var exact=list.filter(function(f){ return String(f.start_ts||"").slice(0,10)===date; });
    if(exact.length) return exact;
    var prev=adsbShift(date,-1), next=adsbShift(date,1);
    return list.filter(function(f){
      var d=String(f.start_ts||"").slice(0,10);
      return d===prev || d===next;
    });
  });
}
function adsbMins(ts){
  var m=String(ts||"").match(/T(\d{2}):(\d{2})/);
  return m?(+m[1])*60+(+m[2]):null;
}
function adsbPath(path){
  var segs=path&&path.coordinates, pts=[], i, j, p, last;
  if(!segs) return null;
  for(i=0;i<segs.length;i++){
    for(j=0;j<(segs[i]||[]).length;j++){
      p=segs[i][j];
      if(!p || p.length<2 || isNaN(p[0]) || isNaN(p[1])) continue;
      if(last && Math.abs(last[0]-p[1])<0.01 && Math.abs(last[1]-p[0])<0.01) continue;
      last=[p[1], p[0]];
      pts.push(last);
    }
  }
  if(pts.length<2) return null;
  if(pts.length>100){
    var step=Math.ceil(pts.length/100), slim=[pts[0]], k;
    for(k=step;k<pts.length-1;k+=step) slim.push(pts[k]);
    slim.push(pts[pts.length-1]);
    pts=slim;
  }
  return pts;
}
function adsbApply(trip, flight){
  if(!flight) return Promise.resolve(trip);
  if(flight.callsign) trip.flight=String(flight.callsign).trim();
  var tm=String(flight.start_ts||"").slice(11,16);
  if(tm && !trip.time) trip.time=tm;
  if(flight.start_ts && flight.end_ts){
    var ms=Date.parse(flight.end_ts)-Date.parse(flight.start_ts);
    if(ms>0){
      var mins=Math.round(ms/60000);
      trip.duration=Math.floor(mins/60)+"ч "+(mins%60)+"м";
    }
  }
  if(!flight.flight_id) return Promise.resolve(trip);
  return adsbFetch("https://adsb.aero/api/v1/flights/"+encodeURI(flight.flight_id)).then(function(full){
    var body=(full&&full.flight)||full||{};
    var coords=adsbPath(body.path||full.path);
    if(coords) trip.coords=coords;
    return trip;
  }).catch(function(){ return trip; });
}
function adsbChoose(list, time){
  if(!list.length) return Promise.resolve(null);
  var best=null, bestD=1e9, i, tm, d, want;
  if(list.length===1) return Promise.resolve(list[0]);
  if(time){
    want=time.split(":");
    want=(+want[0])*60+(+want[1]||0);
    for(i=0;i<list.length;i++){
      tm=adsbMins(list[i].start_ts);
      if(tm==null) continue;
      d=Math.abs(tm-want);
      if(d>720) d=1440-d;
      if(d<bestD){ bestD=d; best=list[i]; }
    }
    if(best && bestD<=180) return Promise.resolve(best);
  }
  var box=document.getElementById("tw-adsb");
  if(!box) return Promise.resolve(list[0]);
  return new Promise(function(resolve){
    var html="<p class=\"more-link\">Несколько рейсов. Выберите свой или оставьте свой маршрут.</p>";
    list.slice(0,8).forEach(function(f, n){
      var when=String(f.start_ts||"").slice(11,16);
      html+='<button type="button" data-adsb="'+n+'">'+escLabel(f.callsign||"Рейс")+(when?" · "+when+" UTC":"")+"</button>";
    });
    html+='<button type="button" data-adsb="mine">Оставить как я указал</button>';
    box.innerHTML=html;
    box.hidden=false;
    box.onclick=function(e){
      var b=e.target.closest&&e.target.closest("[data-adsb]");
      if(!b || !box.contains(b)) return;
      var key=b.getAttribute("data-adsb");
      box.onclick=null;
      box.hidden=true;
      box.innerHTML="";
      resolve(key==="mine"?null:list[+key]||null);
    };
  });
}
function enrichFlight(trip){
  if(!adsbWanted(trip)) return Promise.resolve(trip);
  var a=place(trip.from, trip.fromCode), b=place(trip.to, trip.toCode);
  if(!a||!b) return Promise.resolve(trip);
  var btn=document.getElementById("tw-add-route");
  var old=btn?btn.textContent:"";
  if(btn){ btn.disabled=true; btn.textContent="Ищем рейс…"; }
  return adsbSearch(a, b, trip.date).catch(function(){ return []; }).then(function(list){
    if(btn){ btn.disabled=false; btn.textContent=old||"Добавить маршрут"; }
    if(!list || !list.length){
      adsbNote("В архиве такого рейса нет — оставлен ваш маршрут");
      return trip;
    }
    return adsbChoose(list, trip.time).then(function(flight){
      if(!flight){ adsbNote("Оставлен ваш маршрут"); return trip; }
      return adsbApply(trip, flight).then(function(done){
        adsbNote("Взят рейс "+(done.flight||""));
        return done;
      });
    });
  });
}
function bindTripWindow(){
  var w=document.getElementById("trip-window");
  if(!w || w._bound) return;
  w._bound=1;
  function sug(input, box, modeOf, which){
    input.addEventListener("input", function(){
      var mode=modeOf();
      var hint=which==="to"?(document.getElementById("tw-from")||{}).value:null;
      var items=searchCatalog(mode, input.value, hint);
      if(!items.length){ box.classList.remove("on"); box.innerHTML=""; return; }
      box.innerHTML=items.map(function(it){
        var code=it.code?'<span class="code">'+it.code+"</span>":"";
        return '<div data-v="'+String(it.value).replace(/"/g,"&quot;")+'">'+code+it.label+"</div>";
      }).join("");
      box.classList.add("on");
      box.querySelectorAll("div").forEach(function(d){
        d.onclick=function(){ input.value=d.getAttribute("data-v"); box.classList.remove("on"); if(typeof previewTripPlaces==="function") previewTripPlaces(); };
      });
    });
    input.addEventListener("blur", function(){ setTimeout(function(){ box.classList.remove("on"); previewTripPlaces(); }, 180); });
  }
  sug(document.getElementById("tw-from"), document.getElementById("tw-sug-from"), function(){ return document.getElementById("tw-mode").value; }, "from");
  sug(document.getElementById("tw-to"), document.getElementById("tw-sug-to"), function(){ return document.getElementById("tw-mode").value; }, "to");
  var cIn=document.getElementById("tw-country"), cBox=document.getElementById("tw-sug-country");
  cIn.addEventListener("input", function(){
    var q=cIn.value.trim().toLowerCase();
    var items=!q||!COUNTRY_LIST?[]:COUNTRY_LIST.filter(function(c){
      return countryLabel(c).toLowerCase().indexOf(q)>=0 || String(c.i).toLowerCase().indexOf(q)>=0;
    }).slice(0,8);
    if(!items.length){ cBox.classList.remove("on"); cBox.innerHTML=""; return; }
    cBox.innerHTML=items.map(function(c){ return '<div data-iso="'+c.i+'">'+escLabel(countryLabel(c))+"</div>"; }).join("");
    cBox.classList.add("on");
    cBox.querySelectorAll("div").forEach(function(d){
      d.onclick=function(){
        var id=d.getAttribute("data-iso");
        if(tw.countries.indexOf(id)<0) tw.countries.push(id);
        tw.focus=id;
        cIn.value=""; cBox.classList.remove("on");
        paintTripWindow();
      };
    });
  });
  function addDraftRoute(){
    var fromEl=document.getElementById("tw-from"), toEl=document.getElementById("tw-to");
    var from=fromEl?fromEl.value.trim():"", to=toEl?toEl.value.trim():"";
    var dateEl=document.getElementById("tw-date");
    var date=dateEl?dateEl.value:"";
    if(!from && !to && !date) return Promise.resolve(true);
    editingId=null;
    fMode.value=document.getElementById("tw-mode").value;
    fFrom.value=from;
    fTo.value=to;
    document.getElementById("f-date").value=date;
    document.getElementById("f-time").value=document.getElementById("tw-time").value;
    document.getElementById("f-flight").value="";
    var made=buildRouteFromForm();
    if(!made) return Promise.resolve(false);
    var both=document.getElementById("tw-both");
    var backDateEl=document.getElementById("tw-date-back");
    if(both && both.checked && !(backDateEl && backDateEl.value)){
      alert("Укажите дату обратно");
      return Promise.resolve(false);
    }
    function pushOne(m){ tw.routes.push(m); absorbRoute(m); }
    function clearFields(){
      if(fromEl) fromEl.value="";
      if(toEl) toEl.value="";
    }
    return enrichFlight(made).then(function(out){
      pushOne(out);
      if(!(both && both.checked)){ clearFields(); return true; }
      var back={id:"u"+(Date.now()+1), mode:out.mode, flight:out.mode==="plane"?"Flight":out.flight, from:out.to, to:out.from, date:backDateEl.value};
      if(out.toCode) back.fromCode=out.toCode;
      if(out.fromCode) back.toCode=out.fromCode;
      return enrichFlight(back).then(function(ret){
        pushOne(ret);
        clearFields();
        return true;
      });
    });
  }
  document.getElementById("tw-add-route").onclick=function(){
    addDraftRoute().then(function(ok){ if(ok) paintTripWindow(); });
  };
  w.addEventListener("click", function(e){
    var take=e.target.closest&&e.target.closest("[data-take]");
    var rr=e.target.closest&&e.target.closest("[data-drop-route]");
    var cc=e.target.closest&&e.target.closest("[data-drop-c]");
    var rg=e.target.closest&&e.target.closest("[data-drop-r]");
    var reg=e.target.closest&&e.target.closest("[data-reg]");
    if(take){
      var got=routeById(take.getAttribute("data-take"));
      if(got){
        tw.routes.push({saved:true, id:got.id, mode:got.mode, from:got.from, to:got.to, date:got.date, time:got.time||"", fromCode:got.fromCode||"", toCode:got.toCode||"", coords:got.coords||null});
        absorbRoute(got);
        paintTripWindow();
      }
    } else if(rr){ tw.routes.splice(+rr.getAttribute("data-drop-route"),1); paintTripWindow(); }
    else if(cc){
      var id=cc.getAttribute("data-drop-c");
      tw.countries=tw.countries.filter(function(x){ return x!==id; });
      tw.regions=tw.regions.filter(function(rid){ return countryOfRid(rid)!==id; });
      if(tw.focus===id) tw.focus=tw.countries.length?tw.countries[tw.countries.length-1]:"";
      paintTripWindow();
    } else if(rg){
      var rid=rg.getAttribute("data-drop-r");
      tw.regions=tw.regions.filter(function(x){ return x!==rid; });
      paintTripWindow();
    } else if(reg){
      var idr=reg.getAttribute("data-reg");
      var at=tw.regions.indexOf(idr);
      if(at>=0) tw.regions.splice(at,1); else tw.regions.push(idr);
      paintTripWindow();
    }
  });
  document.getElementById("tw-close").onclick=closeTripWindow;
  var bothBox=document.getElementById("tw-both"), backDate=document.getElementById("tw-date-back");
  if(bothBox && backDate) bothBox.onchange=function(){ backDate.hidden=!bothBox.checked; };
  var freeMore=document.getElementById("tw-free-more");
  if(freeMore) freeMore.onclick=function(){ tw.freeAll=true; paintTripWindow(); };
  document.getElementById("tw-save").onclick=function(){
    addDraftRoute().then(function(ok){
    if(!ok) return;
    if(!tw.routes.length && !tw.countries.length && !tw.regions.length){
      alert(t("Отметьте страну, регион или маршрут"));
      return;
    }
    var ids=[], i, bag;
    for(i=0;i<tw.routes.length;i++){
      if(tw.routes[i].saved){ ids.push(tw.routes[i].id); continue; }
      var id=commitRoute(tw.routes[i]);
      if(id) ids.push(id);
    }
    for(i=0;i<tw.routes.length;i++){
      bag=endpointBag(routeById(tw.routes[i].id)||tw.routes[i]);
      bag.countries.forEach(function(cid){ if(tw.countries.indexOf(cid)<0) tw.countries.push(cid); });
      bag.regions.forEach(function(rid){ if(tw.regions.indexOf(rid)<0) tw.regions.push(rid); });
    }
    var nameEl=document.getElementById("tw-name");
    var title=nameEl?nameEl.value.trim():"";
    if(!title){
      title=tw.countries.map(function(id){ var c=countryRecord(id); return c?countryLabel(c):id; }).slice(0,3).join(", ");
      if(!title && tw.routes.length) title=(tw.routes[0].from||"")+" → "+(tw.routes[0].to||"");
      if(!title) title=t("Поездка");
    }
    var list=loadTrips().filter(function(tp){ return tp.id!==tw.id; });
    var tid=tw.id||("j"+Date.now());
    list.unshift({id:tid, title:title, countries:tw.countries.slice(), regions:tw.regions.slice(), routes:ids});
    saveTrips(list);
    activeTab="trips";
    document.querySelectorAll(".tab").forEach(function(tab){ tab.classList.toggle("on", tab.getAttribute("data-tab")==="trips"); });
    closeTripWindow();
    render();
    });
  };
  document.getElementById("tw-delete").onclick=function(){
    if(!tw.id) return;
    if(!confirm(t("Удалить поездку")+"?")) return;
    saveTrips(loadTrips().filter(function(tp){ return tp.id!==tw.id; }));
    if(selectedTripId===tw.id) selectedTripId=null;
    closeTripWindow();
    render();
  };
}
bindTripWindow();


})();

(function accountUi(){
  if(window.__TRAVELEK_READONLY) document.body.classList.add("ro");
  var banner=document.getElementById("view-banner");
  if(banner && window.__TRAVELEK_READONLY){
    banner.hidden=false;
    banner.innerHTML='<span>'+t("Дневник: ")+(window.__TRAVELEK_VIEW_NAME||t("Пользователь"))+'</span>';
    var back=document.createElement("button");
    back.type="button";
    back.textContent=t("К своей карте");
    back.onclick=function(){ if(window.__exitView) window.__exitView(); };
    banner.appendChild(back);
  }
  var panel=document.getElementById("account-panel");
  var btn=document.getElementById("account-btn");
  if(btn && panel) btn.onclick=function(e){
    e.stopPropagation();
    var s=document.getElementById("settings-panel");
    if(s) s.classList.remove("on");
    panel.classList.add("on");
    fillAccount();
  };
  var close=document.getElementById("account-close");
  if(close && panel) close.onclick=function(){ panel.classList.remove("on"); };
  function statBox(n, label){ return '<div><b>'+n+'</b><span>'+label+'</span></div>'; }
  function diaryTotals(){
    try{
      if(typeof window.__travelekStats==="function") return window.__travelekStats();
    }catch(e){}
    return {routes:0, countries:0, regions:{got:0,total:0}, plane:0, train:0, car:0};
  }
  function paintAccounts(){
    if(typeof window.__paintAccounts==="function") window.__paintAccounts();
  }
  function fillAccount(){
    paintAccounts();
    if(window.__ensureOwner) window.__ensureOwner();
    var me=window.__TRAVELEK_ME||{};
    var loginNow=String(me.login||me.email||me.name||"").toLowerCase().replace(/@travelek\.app$/,"");
    var adminOk=me.role==="admin" || loginNow==="admin" || String(me.name||"").toLowerCase()==="admin";
    if(!adminOk){
      try{
        var stored=JSON.parse(localStorage.getItem("travelek-users")||"[]");
        for(var si=0;si<stored.length;si++){
          if(!stored[si]) continue;
          var storedLogin=String(stored[si].login||stored[si].email||"").toLowerCase().replace(/@travelek\.app$/,"");
          var same=stored[si].id===me.id || storedLogin===loginNow;
          if(same && (stored[si].role==="admin" || storedLogin==="admin")) adminOk=true;
        }
      }catch(e){}
    }
    var usersBox=document.getElementById("users-box");
    if(usersBox) usersBox.style.display="block";
    var accountsCard=document.getElementById("accounts-card");
    if(accountsCard) accountsCard.style.display="block";
    var openAcc=document.getElementById("open-accounts");
    if(openAcc) openAcc.style.display="flex";
    var err=document.getElementById("acct-err");
    if(err && !adminOk) err.textContent="";
    var who=document.getElementById("account-who");
    if(who) who.textContent=(me.role==="admin"?t("Администратор"):t("Пользователь"))+(me.email?(" · "+String(me.email).replace(/@travelek\.app$/,"")):"");
    paintAccounts();
    var nowLine=document.getElementById("acc-pass-now");
    if(nowLine && nowLine.closest(".passline")) nowLine.closest(".passline").hidden=me.role==="admin";
    var name=document.getElementById("acc-name");
    if(name && !name.value) name.value=me.name||"";
    var tot=diaryTotals();
    var box=document.getElementById("account-stats");
    try{
      if(box) box.innerHTML=statBox(tot.countries,t("стран"))+statBox(ofCount((tot.regions&&tot.regions.got)||0, (tot.regions&&tot.regions.total)||0, "").replace(/\s+$/,""),t("регионов РФ"))+statBox((tot.plane||0).toLocaleString(currentLang()==="en"?"en":"ru-RU"),t("самолет, км"))+statBox((tot.train||0).toLocaleString(currentLang()==="en"?"en":"ru-RU"),t("поезд, км"))+statBox((tot.car||0).toLocaleString(currentLang()==="en"?"en":"ru-RU"),t("авто, км"))+statBox(String(tot.routes),t("маршрутов"));
    }catch(e){}
  }
  window.__fillAccount=fillAccount;
  paintAccounts();
  var must=document.getElementById("must-pass");
  if(must && window.__TRAVELEK_ME && window.__TRAVELEK_ME.mustChange) must.classList.add("on");
  var mustSave=document.getElementById("must-pass-save");
  if(mustSave) mustSave.onclick=function(){
    var a=document.getElementById("must-pass-1").value;
    var b=document.getElementById("must-pass-2").value;
    var err=document.getElementById("must-pass-err");
    if(a.length<8){ if(err) err.textContent="Минимум 8 символов"; return; }
    if(a!==b){ if(err) err.textContent="Пароли не совпадают"; return; }
    if(!window.__setOwnPassword) return;
    window.__setOwnPassword(a).then(function(){ if(must) must.classList.remove("on"); }).catch(function(){ if(err) err.textContent="Не удалось сохранить"; });
  };
  var list=document.getElementById("admin-list");
  if(list) list.onclick=function(e){
    var del=e.target.closest("[data-del]");
    if(del){
      e.preventDefault();
      e.stopPropagation();
      var who=del.getAttribute("data-login")||"этот аккаунт";
      if(!confirm("Удалить "+who+"? Его дневник тоже сотрётся.")) return;
      if(!window.__adminDelete) return;
      window.__adminDelete(del.getAttribute("data-del")).then(function(){ fillAccount(); }).catch(function(err){ alert(err&&err.message?err.message:"Не удалось удалить"); });
      return;
    }
    var pass=e.target.closest("[data-pass]");
    if(pass){
      e.preventDefault();
      e.stopPropagation();
      var login=pass.getAttribute("data-login")||"пользователя";
      var p1=window.prompt("Новый пароль для "+login+". Минимум 8 символов");
      if(!p1) return;
      var p2=window.prompt("Повторите пароль для "+login);
      if(p1!==p2){ alert("Пароли не совпадают"); return; }
      if(!window.__adminSetPassword) return;
      window.__adminSetPassword(pass.getAttribute("data-pass"), p1).then(function(){
        alert("Пароль для "+login+" изменён. Со следующего входа действует новый.");
      }).catch(function(err){ alert(err&&err.message?err.message:"Не удалось сменить пароль"); });
      return;
    }
    var b=e.target.closest("[data-user]");
    if(!b || !window.__openDiary) return;
    window.__openDiary(b.getAttribute("data-user"));
  };
  var nameSave=document.getElementById("acc-name-save");
  if(nameSave) nameSave.onclick=function(){
    var name=(document.getElementById("acc-name").value||"").trim();
    if(!name || typeof window.__cloudRename!=="function") return;
    window.__cloudRename(name).then(function(){
      if(window.__TRAVELEK_ME) window.__TRAVELEK_ME.name=name;
      alert("Имя сохранено");
    }).catch(function(e){ alert(e && e.message ? e.message : "Не сохранилось"); });
  };
  var passSave=document.getElementById("acc-pass-save");
  if(passSave) passSave.onclick=function(){
    var now=document.getElementById("acc-pass-now").value;
    var next=document.getElementById("acc-pass").value;
    var next2=document.getElementById("acc-pass2").value;
    if(next!==next2){ alert("Новые пароли не совпадают"); return; }
    if((window.__TRAVELEK_ME&&window.__TRAVELEK_ME.role)==="admin" && window.__setOwnPassword){
      window.__setOwnPassword(next).then(function(){
        document.getElementById("acc-pass").value="";
        document.getElementById("acc-pass2").value="";
        alert(t("Пароль изменён"));
      }).catch(function(){ alert("Пароль короче 8 символов"); });
      return;
    }
    if(!window.__changePassword) return;
    window.__changePassword(now, next).then(function(){
      document.getElementById("acc-pass-now").value="";
      document.getElementById("acc-pass").value="";
      document.getElementById("acc-pass2").value="";
      alert(t("Пароль изменён"));
    }).catch(function(){ alert(t("Не удалось сменить пароль. Проверьте текущий.")); });
  };
  var create=document.getElementById("new-user");
  if(create) create.onclick=function(){
    if(typeof window.__cloudCreate!=="function"){ alert(t("Список аккаунтов не загрузился.")); return; }
    var login=document.getElementById("new-login").value;
    var pass=document.getElementById("new-pass").value;
    var pass2=document.getElementById("new-pass2").value;
    if(pass!==pass2){ alert("Пароли не совпадают"); return; }
    window.__cloudCreate(login, pass, login).then(function(){
      document.getElementById("new-login").value="";
      document.getElementById("new-pass").value="";
      document.getElementById("new-pass2").value="";
      alert(t("Аккаунт создан. Теперь по этому логину можно войти с любого телефона."));
      fillAccount();
    }).catch(function(e){
      var msg=e && e.message ? t(e.message) : t("Не удалось создать");
      var err=document.getElementById("acct-err");
      if(err) err.textContent=msg;
      alert(msg);
    });
  };
  var out=document.getElementById("account-logout");
  if(out) out.onclick=function(){ if(window.__signOut) window.__signOut(); };
  var moreAcc=document.getElementById("accounts-more");
  if(moreAcc) moreAcc.onclick=function(){
    var box=document.getElementById("admin-list");
    if(!box) return;
    var on=box.classList.toggle("open");
    moreAcc.textContent=on?t("Свернуть"):t("Показать все");
  };
  var openAccounts=document.getElementById("open-accounts");
  if(openAccounts) openAccounts.onclick=function(){
    var s=document.getElementById("settings-panel");
    if(s) s.classList.remove("on");
    var panel=document.getElementById("account-panel");
    if(panel) panel.classList.add("on");
    fillAccount();
  };
  document.querySelectorAll("[data-eye]").forEach(function(btn){
    btn.addEventListener("click", function(){
      var input=document.getElementById(btn.getAttribute("data-eye"));
      if(!input) return;
      var show=input.type==="password";
      input.type=show?"text":"password";
      btn.textContent=show?t("Скрыть"):t("Показать");
    });
  });
  if(typeof applyI18n==="function") applyI18n();
})();

