import { STATIONS, densify, hav, shipCoords } from "./01-catalog.js";
import { ROUTES, bindRail, place } from "./02-cloud.js";
import { datedPast, isFuture } from "../when.js";
import { ui } from "../screen.js";
export { datedPast, isFuture };
"use strict";
/* geometry */
function flightArc(a,b,n){
  n=n||96;
  var rad=Math.PI/180, toDeg=180/Math.PI;
  function vec(lat,lng){
    lat*=rad; lng*=rad;
    return [Math.cos(lat)*Math.cos(lng),Math.cos(lat)*Math.sin(lng),Math.sin(lat)];
  }
  var u=vec(a.lat,a.lng), v=vec(b.lat,b.lng);
  var dot=Math.max(-1,Math.min(1,u[0]*v[0]+u[1]*v[1]+u[2]*v[2]));
  var omega=Math.acos(dot), sinOmega=Math.sin(omega);
  if(omega<1e-5) return [[a.lat,a.lng],[b.lat,b.lng]];
  var out=[], prevLng=a.lng, i,t,x,y,z,lat,lng,p,q;
  for(i=0;i<=n;i++){
    t=i/n;
    if(Math.abs(sinOmega)<1e-7){ p=1-t; q=t; }
    else { p=Math.sin((1-t)*omega)/sinOmega; q=Math.sin(t*omega)/sinOmega; }
    x=p*u[0]+q*v[0]; y=p*u[1]+q*v[1]; z=p*u[2]+q*v[2];
    lat=Math.atan2(z,Math.sqrt(x*x+y*y))*toDeg;
    lng=Math.atan2(y,x)*toDeg;
    while(lng-prevLng>180) lng-=360;
    while(lng-prevLng<-180) lng+=360;
    out.push([lat,lng]); prevLng=lng;
  }
  out[0]=[a.lat,a.lng]; out[out.length-1]=[b.lat,b.lng];
  return out;
}
/* rail graph */
var RAIL_NODES = {} as any;
STATIONS.forEach(function(s){ RAIL_NODES[s.id]=[s.lat,s.lng]; });
/* intermediate rail points */
[["klin",56.333,36.730],["bologoe",57.880,34.092],["okulovka",58.381,33.301],["chudovo",59.125,31.659],["malaya_vish",59.541,30.878],["vyshny",57.585,34.563],["podolsk",55.431,37.545],["serpukhov",54.916,37.411],["orekhovo",55.807,38.967],["kovrov",56.357,41.319],["dzerzhinsk",56.238,43.460]].forEach(function(x){ RAIL_NODES[x[0]]=[x[1],x[2]]; });

var RAIL_EDGES = [
  ["msk_len","tver"],
  ["tver","spb_mos"],
  ["msk_kaz","vladimir"],
  ["vladimir","nn"],
  ["nn","cheboksary"],
  ["cheboksary","kazan"],
  ["kazan","izhevsk"],
  ["izhevsk","perm"],
  ["perm","ekb"],
  ["ekb","tyumen"],
  ["tyumen","omsk"],
  ["omsk","nsk"],
  ["nsk","kras"],
  ["kras","irk"],
  ["irk","ulanude"],
  ["ulanude","chita"],
  ["chita","khabarovsk"],
  ["khabarovsk","vl"],
  ["nsk","barnaul"],
  ["nsk","tomsk"],
  ["nsk","kemerovo"],
  ["kemerovo","novokuz"],
  ["kras","abakan"],
  ["khabarovsk","komsomolsk"],
  ["khabarovsk","blagov"],
  ["msk_kur","tula"],
  ["tula","orel"],
  ["orel","kursk"],
  ["kursk","belgorod"],
  ["msk_pav","ryazan"],
  ["ryazan","voronezh"],
  ["voronezh","rostov"],
  ["rostov","krasnodar"],
  ["krasnodar","sochi"],
  ["sochi","adler"],
  ["adler","psou"],
  ["psou","gagra"],
  ["gagra","pitsunda"],
  ["pitsunda","gudauta"],
  ["gudauta","newathos"],
  ["newathos","sukhum"],
  ["sukhum","ochamchira"],
  ["ochamchira","gal"],
  ["ochamchira","tkvarcheli"],
  ["rostov","mineral"],
  ["mineral","stavropol"],
  ["msk_pav","tambov"],
  ["tambov","saratov"],
  ["saratov","volgograd"],
  ["volgograd","astrakhan"],
  ["msk_bel","smolensk"],
  ["smolensk","minsk"],
  ["minsk","brest"],
  ["msk_bel","bryansk"],
  ["bryansk","gomel"],
  ["msk_kie","kaluga"],
  ["msk_yar","yar"],
  ["yar","vologda"],
  ["vologda","cherepovets"],
  ["spb_mos","petrozavodsk"],
  ["petrozavodsk","murmansk"],
  ["yar","kostroma"],
  ["kostroma","ivanovo"],
  ["vologda","arkhangelsk"],
  ["msk_kaz","ryazan"],
  ["msk_kaz","penza"],
  ["penza","samara"],
  ["samara","syzran"],
  ["syzran","samara"],
  ["samara","ufa"],
  ["ufa","chelyabinsk"],
  ["chelyabinsk","kurgan"],
  ["kurgan","tyumen"],
  ["samara","saratov"],
  ["msk_east","vladimir"],
  ["msk_east","nn"],
  ["tula","msk_east"],
  ["mil_c","mil_l"],
  ["mil_c","bergamo"],
  ["mil_l","bergamo"],
  ["mil_c","brescia"],
  ["brescia","verona"],
  ["verona","vicenza"],
  ["vicenza","padova"],
  ["padova","mestre"],
  ["mestre","venice"],
  ["padova","bologna"],
  ["bologna","florence"],
  ["florence","arezzo"],
  ["arezzo","orvieto"],
  ["orvieto","rome"],
  ["rome","latina"],
  ["latina","formia"],
  ["formia","naples"],
  ["mil_c","turin"],
  ["mil_c","genoa"],
  ["genoa","pisa"],
  ["pisa","florence"],
  ["bologna","verona"],
  ["beijing","beijing_s"],
  ["beijing_s","tianjin"],
  ["beijing_s","shanghai"],
  ["beijing_s","zhengzhou"],
  ["zhengzhou","wuhan"],
  ["wuhan","changsha"],
  ["changsha","guangzhou"],
  ["guangzhou","shenzhen"],
  ["shanghai","hangzhou"],
  ["shanghai","nanjing"],
  ["nanjing","wuhan"],
  ["beijing","xian"],
  ["xian","chengdu"],
  ["shanghai","shanghai_h"],
  ["msk_len","klin"],
  ["klin","tver"],
  ["tver","vyshny"],
  ["vyshny","bologoe"],
  ["bologoe","okulovka"],
  ["okulovka","chudovo"],
  ["chudovo","malaya_vish"],
  ["malaya_vish","spb_mos"],
  ["msk_kur","podolsk"],
  ["podolsk","serpukhov"],
  ["serpukhov","tula"],
  ["msk_kaz","orekhovo"],
  ["orekhovo","vladimir"],
  ["vladimir","kovrov"],
  ["kovrov","dzerzhinsk"],
  ["dzerzhinsk","nn"],
  ["minsk","orsha"],
  ["orsha","vitebsk"],
  ["minsk","gomel"],
  ["minsk","baranovichi"],
  ["baranovichi","brest"],
  ["minsk","grodno"],
  ["minsk","mogilev"],
  ["smolensk","orsha"],
  ["astana","karaganda"],
  ["karaganda","almaty"],
  ["astana","shymkent"],
  ["tashkent","samarkand"],
  ["spb_mos","volhovstroy"],
  ["volhovstroy","luga"],
  ["luga","dno"],
  ["dno","novosokolniki"],
  ["novosokolniki","velikie_luki"],
  ["minsk","molodechno"],
  ["minsk","zhlobin"],
  ["zhlobin","gomel"],
  ["ekb","pyshma"],
  ["pyshma","tyumen"],
  ["tyumen","yalutorovsk"],
  ["yalutorovsk","ishim"],
  ["ishim","nazyvaevsk"],
  ["nazyvaevsk","omsk"],
  ["omsk","kalachinsk"],
  ["kalachinsk","tatarsk"],
  ["tatarsk","barabinsk"],
  ["barabinsk","chulym"],
  ["chulym","nsk"],
  ["nsk","bolotnoe"],
  ["bolotnoe","yurga"],
  ["yurga","taiga"],
  ["taiga","anzhero"],
  ["anzhero","mariinsk"],
  ["mariinsk","bogotol"],
  ["bogotol","achinsk"],
  ["achinsk","kras"],
  ["kras","kansk"],
  ["kansk","taishet"],
  ["taishet","nizhneudinsk"],
  ["nizhneudinsk","tulun"],
  ["tulun","zima"],
  ["zima","cheremkhovo"],
  ["cheremkhovo","irk"],
  ["irk","slyudyanka"],
  ["slyudyanka","ulanude"],
  ["ulanude","petrovsk"],
  ["petrovsk","khilok"],
  ["khilok","chita"],
  ["chita","mogocha"],
  ["mogocha","skovorodino"],
  ["skovorodino","belogorsk"],
  ["belogorsk","birobidzhan"],
  ["birobidzhan","khabarovsk"],
  ["khabarovsk","ussuriysk"],
  ["ussuriysk","vl"],
];
[
  ["w_warsaw",52.229,21.012],["w_berlin",52.525,13.369],["w_hamburg",53.553,10.006],
  ["w_copenhagen",55.673,12.565],["w_stockholm",59.330,18.058],["w_oslo",59.911,10.753],
  ["w_frankfurt",50.107,8.663],["w_cologne",50.943,6.958],["w_amsterdam",52.379,4.900],
  ["w_brussels",50.835,4.336],["w_paris",48.844,2.374],["w_london",51.528,-0.134],
  ["w_lyon",45.760,4.860],["w_prague",50.083,14.436],["w_vienna",48.185,16.376],
  ["w_budapest",47.500,19.083],["w_munich",48.140,11.558],["w_zurich",47.378,8.540],
  ["w_bucharest",44.446,26.075],["w_sofia",42.712,23.321],["w_istanbul",41.015,28.977],
  ["w_belgrade",44.809,20.456],["w_athens",37.992,23.720],["w_madrid",40.407,-3.691],
  ["w_barcelona",41.379,2.140],["w_lisbon",38.714,-9.139],["w_helsinki",60.172,24.941],
  ["w_kyiv",50.440,30.489],["w_lviv",49.840,24.030],["w_krakow",50.068,19.947],
  ["w_ulaanbaatar",47.918,106.917],["w_harbin",45.761,126.625],["w_urumqi",43.780,87.580],
  ["w_ankara",39.936,32.844],["w_tehran",35.689,51.389],["w_ashgabat",37.960,58.326],
  ["w_nanning",22.817,108.366],["w_hanoi",21.025,105.841],["w_bangkok",13.740,100.517],
  ["w_kualalumpur",3.140,101.693],["w_singapore",1.290,103.852],
  ["w_delhi",28.642,77.221],["w_mumbai",18.970,72.819],["w_kolkata",22.585,88.343],
  ["w_tokyo",35.681,139.767],["w_nagoya",35.171,136.882],["w_osaka",34.703,135.496],
  ["w_hiroshima",34.397,132.475],["w_fukuoka",33.590,130.420],
  ["w_seoul",37.555,126.970],["w_busan",35.115,129.041],
  ["w_nyc",40.750,-73.994],["w_boston",42.355,-71.061],["w_washington",38.897,-77.006],
  ["w_atlanta",33.749,-84.388],["w_miami",25.761,-80.192],["w_chicago",41.878,-87.630],
  ["w_denver",39.739,-104.990],["w_slc",40.760,-111.891],["w_sf",37.776,-122.420],
  ["w_la",34.056,-118.236],["w_dallas",32.776,-96.797],["w_seattle",47.606,-122.332],
  ["w_vancouver",49.283,-123.115],["w_portland",45.515,-122.678],
  ["w_toronto",43.653,-79.384],["w_montreal",45.501,-73.567],["w_mexicocity",19.432,-99.133],
  ["w_saopaulo",-23.534,-46.626],["w_rio",-22.903,-43.209],["w_brasilia",-15.794,-47.882],
  ["w_buenosaires",-34.604,-58.382],["w_santiago",-33.448,-70.669],
  ["w_bogota",4.711,-74.072],["w_quito",-0.180,-78.468],["w_lima",-12.046,-77.043],
  ["w_cairo",30.063,31.246],["w_alexandria",31.200,29.918],["w_tripoli",32.887,13.191],
  ["w_tunis",36.800,10.181],["w_algiers",36.753,3.059],["w_casablanca",33.573,-7.590],
  ["w_marrakech",31.630,-8.009],["w_johannesburg",-26.198,28.042],["w_durban",-29.858,31.029],
  ["w_capetown",-33.925,18.424],["w_nairobi",-1.292,36.822],["w_mombasa",-4.043,39.668],
  ["w_lagos",6.455,3.384],["w_abuja",9.057,7.495],
  ["w_sydney",-33.868,151.209],["w_melbourne",-37.813,144.963],["w_brisbane",-27.470,153.026],
  ["w_adelaide",-34.928,138.601],["w_perth",-31.952,115.861]
].forEach(function(x){ if(!RAIL_NODES[x[0]]) RAIL_NODES[x[0]]=[x[1],x[2]]; });
[
  ["brest","w_warsaw"],["w_warsaw","w_berlin"],["w_berlin","w_hamburg"],["w_hamburg","w_copenhagen"],
  ["w_copenhagen","w_stockholm"],["w_stockholm","w_oslo"],["w_berlin","w_frankfurt"],
  ["w_frankfurt","w_cologne"],["w_cologne","w_amsterdam"],["w_amsterdam","w_brussels"],
  ["w_brussels","w_paris"],["w_frankfurt","w_paris"],["w_paris","w_london"],["w_paris","w_lyon"],
  ["w_lyon","mil_c"],["w_berlin","w_prague"],["w_prague","w_vienna"],["w_vienna","w_budapest"],
  ["w_vienna","w_munich"],["w_munich","w_frankfurt"],["w_munich","w_zurich"],["w_zurich","mil_c"],
  ["w_budapest","w_bucharest"],["w_bucharest","w_sofia"],["w_sofia","w_istanbul"],
  ["w_budapest","w_belgrade"],["w_belgrade","w_sofia"],["w_sofia","w_athens"],
  ["w_madrid","w_barcelona"],["w_barcelona","w_lyon"],["w_madrid","w_lisbon"],
  ["w_helsinki","spb_fin"],["msk_kie","w_kyiv"],["w_kyiv","w_lviv"],["w_lviv","w_warsaw"],
  ["w_warsaw","w_krakow"],["w_krakow","w_vienna"],
  ["omsk","astana"],["shymkent","tashkent"],["ulanude","w_ulaanbaatar"],["w_ulaanbaatar","beijing"],
  ["vl","w_harbin"],["w_harbin","beijing"],["xian","w_urumqi"],["w_urumqi","almaty"],
  ["w_istanbul","w_ankara"],["w_ankara","w_tehran"],["w_tehran","w_ashgabat"],["w_ashgabat","tashkent"],
  ["guangzhou","w_nanning"],["w_nanning","w_hanoi"],["w_bangkok","w_kualalumpur"],["w_kualalumpur","w_singapore"],
  ["w_delhi","w_mumbai"],["w_delhi","w_kolkata"],
  ["w_tokyo","w_nagoya"],["w_nagoya","w_osaka"],["w_osaka","w_hiroshima"],["w_hiroshima","w_fukuoka"],
  ["w_seoul","w_busan"],
  ["w_nyc","w_boston"],["w_nyc","w_washington"],["w_washington","w_atlanta"],["w_atlanta","w_miami"],
  ["w_nyc","w_chicago"],["w_chicago","w_denver"],["w_denver","w_slc"],["w_slc","w_sf"],
  ["w_sf","w_la"],["w_la","w_dallas"],["w_dallas","w_chicago"],["w_seattle","w_vancouver"],
  ["w_seattle","w_portland"],["w_portland","w_sf"],["w_chicago","w_toronto"],["w_toronto","w_montreal"],
  ["w_nyc","w_montreal"],
  ["w_saopaulo","w_rio"],["w_saopaulo","w_brasilia"],
  ["w_cairo","w_alexandria"],["w_tunis","w_tripoli"],["w_tripoli","w_cairo"],
  ["w_tunis","w_algiers"],["w_algiers","w_casablanca"],["w_casablanca","w_marrakech"],
  ["w_johannesburg","w_durban"],["w_johannesburg","w_capetown"],["w_nairobi","w_mombasa"],
  ["w_lagos","w_abuja"],
  ["w_sydney","w_melbourne"],["w_sydney","w_brisbane"],["w_melbourne","w_adelaide"],
  ["w_adelaide","w_sydney"],["w_adelaide","w_perth"],
  ["msk_len","msk_kaz"],["msk_kaz","msk_yar"],["msk_yar","msk_kur"],["msk_kur","msk_pav"],
  ["msk_pav","msk_bel"],["msk_bel","msk_kie"],["msk_kie","msk_east"],["msk_rig","msk_bel"],
  ["spb_mos","spb_fin"],["spb_fin","spb_viteb"],["spb_viteb","spb_lad"],["spb_lad","spb_balt"]
].forEach(function(e){ RAIL_EDGES.push(e); });
(function linkOrphanStations(){
  var linked= {} as any, i, id, xy, best, bd, k, d;
  for(i=0;i<RAIL_EDGES.length;i++){ linked[RAIL_EDGES[i][0]]=1; linked[RAIL_EDGES[i][1]]=1; }
  for(id in RAIL_NODES){
    if(!Object.prototype.hasOwnProperty.call(RAIL_NODES,id) || linked[id]) continue;
    xy=RAIL_NODES[id]; best=null; bd=1e9;
    for(k in linked){
      if(!RAIL_NODES[k]) continue;
      d=hav({lat:xy[0],lng:xy[1]},{lat:RAIL_NODES[k][0],lng:RAIL_NODES[k][1]});
      if(d<bd){ bd=d; best=k; }
    }
    if(best && bd<=80){ RAIL_EDGES.push([id, best]); linked[id]=1; }
  }
})();
var RAIL_ADJ= {} as any;
RAIL_EDGES.forEach(function(e){
  (RAIL_ADJ[e[0]]=RAIL_ADJ[e[0]]||[]).push(e[1]);
  (RAIL_ADJ[e[1]]=RAIL_ADJ[e[1]]||[]).push(e[0]);
});

var NO_ROAD = {
  "Норильск":1,"Дудинка":1,"Хатанга":1,"Игарка":1,"Тикси":1,"Певек":1,
  "Анадырь":1,"Билибино":1,"Провидения":1,"Эвено-Бытантай":1,
  "Мирный":1,"Удачный":1,"Полярный":1,"Сретенск":1
};
export function carAllowed(nameA, nameB){
  var a=(nameA||"").split(",")[0].trim();
  var b=(nameB||"").split(",")[0].trim();
  // strip extra
  function base(n){
    n=n.replace(/\s*\([^)]*\)/g,"").trim();
    return n;
  }
  a=base(a); b=base(b);
  if(NO_ROAD[a]||NO_ROAD[b]) return false;
  return true;
}
export function trainAllowed(from, to){
  var a=place(from), b=place(to);
  if(!a||!b) return false;
  var path=railPath(railNear(a), railNear(b));
  return !!(path && path.length>=2);
}



function nearestRailInfo(pt){
  if(!pt) return null;
  var best=null,bd=1e9,k,xy,d;
  for(k in RAIL_NODES){
    xy=RAIL_NODES[k]; d=hav(pt,{lat:xy[0],lng:xy[1]});
    if(d<bd){bd=d;best=k;}
  }
  return best?{id:best,d:bd}:null;
}
function nearestRail(pt){
  var info=nearestRailInfo(pt);
  return info?info.id:null;
}
function railNear(pt){
  var info=nearestRailInfo(pt);
  if(!info || info.d>450) return null;
  return info.id;
}
function railPath(fk,tk){
  if(!fk||!tk) return null;
  if(fk===tk) return [fk];
  /* кратчайший по километрам, не по числу станций — иначе петли через узлы */
  var dist={} as any, prev={} as any, open=[fk], i, u, neigh, v, xy, d, nd;
  dist[fk]=0; prev[fk]=null;
  while(open.length){
    u=open[0];
    for(i=1;i<open.length;i++) if(dist[open[i]]<dist[u]) u=open[i];
    open.splice(open.indexOf(u),1);
    if(u===tk) break;
    neigh=RAIL_ADJ[u]||[];
    xy=RAIL_NODES[u];
    for(i=0;i<neigh.length;i++){
      v=neigh[i];
      if(!RAIL_NODES[v]||!xy) continue;
      d=hav({lat:xy[0],lng:xy[1]},{lat:RAIL_NODES[v][0],lng:RAIL_NODES[v][1]});
      nd=dist[u]+d;
      if(dist[v]==null || nd<dist[v]){ dist[v]=nd; prev[v]=u; if(open.indexOf(v)<0) open.push(v); }
    }
  }
  if(dist[tk]==null) return null;
  var path=[tk];
  while(path[path.length-1]!==fk) path.push(prev[path[path.length-1]]);
  path.reverse();
  return path;
}
/* убирает разворот: точка, после которой путь идёт назад */
function hasLongChord(coords, maxKm){
  if(!coords || coords.length<2) return false;
  var i, d;
  for(i=1;i<coords.length;i++){
    d=hav({lat:coords[i-1][0],lng:coords[i-1][1]},{lat:coords[i][0],lng:coords[i][1]});
    if(d > maxKm) return true;
  }
  return false;
}
function trimLoops(coords){
  if(!coords || coords.length<4) return coords;
  var out=[coords[0]], i, a, b, c, ab, bc, dot;
  for(i=1;i<coords.length-1;i++){
    a=out[out.length-1]; b=coords[i]; c=coords[i+1];
    ab=[b[0]-a[0], b[1]-a[1]]; bc=[c[0]-b[0], c[1]-b[1]];
    dot=ab[0]*bc[0]+ab[1]*bc[1];
    if(dot<0){
      var lab=Math.sqrt(ab[0]*ab[0]+ab[1]*ab[1])||1;
      var lbc=Math.sqrt(bc[0]*bc[0]+bc[1]*bc[1])||1;
      if(dot/(lab*lbc)<-0.5) continue;
    }
    out.push(b);
  }
  out.push(coords[coords.length-1]);
  return out;
}
function trainPlan(from, to){
  var a=place(from), b=place(to);
  if(!a||!b) return null;
  var keys=null, as=railCandidates(a), bs=railCandidates(b), i, j, path;
  for(i=0;i<as.length && !keys;i++){
    for(j=0;j<bs.length;j++){
      path=railPath(as[i].id, bs[j].id);
      if(path && path.length>=2){ keys=path; break; }
    }
  }
  var pts;
  if(keys&&keys.length>=2){
    pts=keys.map(function(k){ return [RAIL_NODES[k][0], RAIL_NODES[k][1]]; });
    pts[0]=[a.lat,a.lng]; pts[pts.length-1]=[b.lat,b.lng];
  } else return {coords:null, hops:[], a:a, b:b, linked:false};
  var coords=[], hops=[], p, q, d, key, cached, seg;
  function append(line){
    var s=0, last;
    if(coords.length && line.length){
      last=coords[coords.length-1];
      if(Math.abs(last[0]-line[0][0])<1e-4 && Math.abs(last[1]-line[0][1])<1e-4) s=1;
    }
    for(;s<line.length;s++) coords.push(line[s]);
  }
  for(i=1;i<pts.length;i++){
    p={lat:pts[i-1][0], lng:pts[i-1][1]};
    q={lat:pts[i][0], lng:pts[i][1]};
    d=hav(p,q);
    if(needsBridge(p,q)){ append(stitchBridge(p,q).coords); continue; }
    key=roadKey(p,q);
    var traced=ui.map && ui.map.traceNetwork && ui.map.traceNetwork("train", p.lat, p.lng, q.lat, q.lng);
    if(traced && traced.length>=2){ append(traced); continue; }
    cached=roadCache[key];
    if(d>=55 && cached && cached!=="fail" && cached!=="pending"){
      append(cached);
      continue;
    }
    if(d>=55 && cached==null) hops.push([p,q]);
    if(d<22){ append(densify([[p.lat,p.lng],[q.lat,q.lng]], 8)); }
    else if(d<40){ append([[p.lat,p.lng],[q.lat,q.lng]]); }
    /* longer hops stay as hops for real routing; no sea chord */
  }
  if(coords.length<2) coords=pts;
  return {coords:coords, hops:hops, a:a, b:b, linked:true};
}
function trainCoords(from,to){
  var plan=trainPlan(from,to);
  return plan?plan.coords:null;
}
var CRIMEA_BRIDGE=[
  [45.3602,36.4904],[45.3510,36.5082],[45.3404,36.5308],[45.3286,36.5562],
  [45.3160,36.5834],[45.3022,36.6110],[45.2874,36.6418],[45.2716,36.6732],
  [45.2552,36.6990],[45.2386,36.7152],[45.2234,36.7188]
];
function abkhazIndex(p){
  if(!p) return -1;
  var line=[[43.585,39.723],[43.443,39.910],[43.394,40.011],[43.298,40.259],[43.163,40.339],[43.105,40.632],[43.087,40.812],[43.003,41.023],[42.858,41.128],[42.712,41.468],[42.628,41.737]];
  var best=-1, bd=40, i, d;
  for(i=0;i<line.length;i++){
    d=hav(p,{lat:line[i][0],lng:line[i][1]});
    if(d<bd){ bd=d; best=i; }
  }
  return best;
}
function abkhazPath(a,b){
  /* disabled: connectors from place to the coastal polyline became sea chords */
  return null;
  var line=[[43.585,39.723],[43.443,39.910],[43.394,40.011],[43.298,40.259],[43.163,40.339],[43.105,40.632],[43.087,40.812],[43.003,41.023],[42.858,41.128],[42.712,41.468],[42.628,41.737]];
  var ia=abkhazIndex(a), ib=abkhazIndex(b), coords, i, step, da, db;
  if(ia<0 || ib<0 || ia===ib) return null;
  /* only use coastal special if both ends are close to the line — otherwise the connector becomes a sea chord */
  da=hav(a,{lat:line[ia][0],lng:line[ia][1]});
  db=hav(b,{lat:line[ib][0],lng:line[ib][1]});
  if(da>28 || db>28) return null;
  coords=[[a.lat,a.lng]];
  step=ia<ib?1:-1;
  for(i=ia;i!==ib;i+=step) coords.push(line[i].slice());
  coords.push(line[ib].slice());
  coords.push([b.lat,b.lng]);
  return coords;
}
function inCrimea(p){
  return !!(p && p.lat>44.25 && p.lat<46.25 && p.lng>32.4 && p.lng<36.62);
}
function needsBridge(a,b){
  if(!a||!b) return false;
  return (inCrimea(a)&&!inCrimea(b)) || (inCrimea(b)&&!inCrimea(a));
}
function bridgeLine(a,b){
  var line=CRIMEA_BRIDGE.slice();
  if(a && b && a.lng>b.lng) line.reverse();
  return line;
}
function stitchBridge(a,b,leg?){
  var line=bridgeLine(a,b);
  var enter={lat:line[0][0],lng:line[0][1]};
  var leave={lat:line[line.length-1][0],lng:line[line.length-1][1]};
  var coords=[], i;
  function add(part){
    if(!part) return;
    for(i=0;i<part.length;i++){
      if(coords.length){
        var last=coords[coords.length-1];
        if(Math.abs(last[0]-part[i][0])<1e-4 && Math.abs(last[1]-part[i][1])<1e-4) continue;
      }
      coords.push(part[i]);
    }
  }
  add(leg?leg(a,enter):[[a.lat,a.lng],[enter.lat,enter.lng]]);
  add(line);
  add(leg?leg(leave,b):[[leave.lat,leave.lng],[b.lat,b.lng]]);
  return {coords:coords, enter:enter, leave:leave};
}
function railCandidates(pt){
  var out=[], k, xy, d;
  for(k in RAIL_NODES){
    xy=RAIL_NODES[k];
    d=hav(pt,{lat:xy[0],lng:xy[1]});
    if(d<=450) out.push({id:k,d:d});
  }
  out.sort(function(p,q){ return p.d-q.d; });
  return out.slice(0,6);
}

/* OSRM roads worldwide. Long hops are split so a failed request does not become one straight line. */
export var roadCache= {} as any;
var roadWait= {} as any;
export var roadQueue=[];
var roadActive=0;
export function roadKey(a,b){ return a.lat.toFixed(3)+","+a.lng.toFixed(3)+";"+b.lat.toFixed(3)+","+b.lng.toFixed(3); }
function osrmUrls(a,b){
  var path=a.lng+","+a.lat+";"+b.lng+","+b.lat;
  var overview=hav(a,b)>900?"simplified":"full";
  var q="?overview="+overview+"&geometries=geojson&steps=false";
  return [
    "https://router.project-osrm.org/route/v1/driving/"+path+q,
    "https://routing.openstreetmap.de/routed-car/route/v1/driving/"+path+q
  ];
}
function fetchOsrm(a,b,cb){
  var urls=osrmUrls(a,b), i=0;
  function next(){
    if(i>=urls.length){ cb(null); return; }
    var url=urls[i++];
    fetch(url).then(function(r){ if(!r.ok) throw new Error("http"); return r.json(); }).then(function(data){
      var geom=data&&data.code==="Ok"&&data.routes&&data.routes[0]&&data.routes[0].geometry;
      if(geom&&geom.coordinates&&geom.coordinates.length>=2){
        cb(geom.coordinates.map(function(c){ return [c[1],c[0]]; }));
      } else next();
    }).catch(function(){ next(); });
  }
  next();
}
function stitchLines(left, right){
  if(!left||left.length<2) return right||left;
  if(!right||right.length<2) return left;
  var out=left.slice(), i=0, last=out[out.length-1];
  if(Math.abs(last[0]-right[0][0])<1e-3 && Math.abs(last[1]-right[0][1])<1e-3) i=1;
  for(;i<right.length;i++) out.push(right[i]);
  return out;
}
function routeSmart(a,b,depth,cb){
  var d=hav(a,b);
  if(d<18){ cb([[a.lat,a.lng],[b.lat,b.lng]]); return; }
  fetchOsrm(a,b,function(coords){
    if(coords&&coords.length>=2){ cb(coords); return; }
    if(depth>=3 || d<160){
      cb(null);
      return;
    }
    var midPt=flightArc(a,b,2)[1];
    var mid={lat:midPt[0], lng:midPt[1]};
    routeSmart(a, mid, depth+1, function(left){
      routeSmart(mid, b, depth+1, function(right){ cb(stitchLines(left, right)); });
    });
  });
}
function fetchRoad(a,b,cb){
  var key=roadKey(a,b);
  var hit=roadCache[key];
  if(hit==="fail"){ cb(null); return; }
  if(hit && hit!=="pending"){ cb(hit); return; }
  (roadWait[key]=roadWait[key]||[]).push(cb);
  if(hit==="pending") return;
  roadCache[key]="pending";
  function finish(coords){
    var ok=coords&&coords.length>=2;
    roadCache[key]=ok?coords:"fail";
    var waits=roadWait[key]||[];
    delete roadWait[key];
    waits.forEach(function(fn){ try{ fn(ok?coords:null); }catch(e){} });
  }
  routeSmart(a,b,0,finish);
}
export function pumpRoads(){
  while(roadActive<3 && roadQueue.length){
    var job=roadQueue.shift();
    roadActive++;
    fetchRoad(job.a, job.b, function(){
      roadActive--;
      try{ job.done(); }catch(e){}
      pumpRoads();
    });
  }
}


/* ——— Сейчас в пути ——— */
function estimateTripHours(r, km){
  km=km||0;
  var sp=60;
  if(r.mode==="plane") sp=750;
  else if(r.mode==="train") sp=90;
  else if(r.mode==="car") sp=70;
  else if(r.mode==="ship") sp=25;
  else if(r.mode==="walk") sp=5;
  else if(r.mode==="bike") sp=15;
  return Math.max(0.5, km/sp);
}
function tripStart(r){
  if(!r.date) return null;
  var start=new Date(r.date);
  if(isNaN(start.getTime())) return null;
  return start;
}
export function updateLiveTrip(){
  var now=Date.now();
  var live=null, best=1e18;
  ROUTES.forEach(function(r){
    var start=tripStart(r);
    if(!start) return;
    var g=typeof buildGeoSync==="function"?buildGeoSync(r):null;
    if(!g||!g.km) return;
    var hours=estimateTripHours(r, g.km);
    var end=start.getTime()+hours*3600*1000;
    if(now>=start.getTime() && now<=end){
      var t=(now-start.getTime())/(end-start.getTime());
      if(t<best){ best=t; live={r:r, t:t, g:g}; }
    }
  });
  return live;
}
function pointAlong(coords, t){
  if(!coords||coords.length<2) return null;
  var total=0, segs=[], i;
  for(i=1;i<coords.length;i++){
    var d=hav({lat:coords[i-1][0],lng:coords[i-1][1]},{lat:coords[i][0],lng:coords[i][1]});
    segs.push(d); total+=d;
  }
  if(total<=0) return coords[0];
  var target=total*Math.max(0,Math.min(1,t)), acc=0;
  for(i=0;i<segs.length;i++){
    if(acc+segs[i]>=target){
      var f=(target-acc)/segs[i];
      return [
        coords[i][0]+(coords[i+1][0]-coords[i][0])*f,
        coords[i][1]+(coords[i+1][1]-coords[i][1])*f
      ];
    }
    acc+=segs[i];
  }
  return coords[coords.length-1];
}

var liveMarker=null;
export var modeFilter="all"; /* all | plane | train | car */
export function setModeFilter(m){ modeFilter=m||"all"; }
export function stopLive(){
  if(liveMarker){ try{ ui.map.removeLayer(liveMarker); }catch(e){} liveMarker=null; }
}
function modeIcon(mode){
  var icons={plane:"✈️",train:"🚂",car:"🚗",walk:"🚶",bike:"🚴",ship:"🚢"};
  return icons[mode]||"•";
}
export function startLive(){
  stopLive();
  var info=updateLiveTrip();
  if(!info) return;
  var pt=pointAlong(info.g.coords, info.t);
  if(!pt) return;
  var icon=ui.map.htmlIcon({
    className:"live-marker",
    html:'<div style="font-size:28px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.5))">'+modeIcon(info.r.mode)+'</div>',
    iconSize:[32,32],
    iconAnchor:[16,16]
  });
  liveMarker=ui.map.marker(pt, {icon:icon, pane:"routePane", interactive:false}).addTo(ui.map);
}
/* trip playback */
var tripPlay={on:false, t:0, mode:null, country:null, lat:null, lng:null, heading:0};
export { tripPlay };
function headingDeg(a,b){
  if(!a||!b) return 0;
  var dLng=(b.lng-a.lng)*Math.PI/180;
  var y=Math.sin(dLng)*Math.cos(b.lat*Math.PI/180);
  var x=Math.cos(a.lat*Math.PI/180)*Math.sin(b.lat*Math.PI/180)-Math.sin(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.cos(dLng);
  return (Math.atan2(y,x)*180/Math.PI+360)%360;
}
export function startTripPlay(mode, country){
  tripPlay.on=true; tripPlay.t=0; tripPlay.mode=mode; tripPlay.country=country;
}
export function stopTripPlay(){
  tripPlay.on=false;
  if(tripPlay.marker){ try{ ui.map.removeLayer(tripPlay.marker); }catch(e){} tripPlay.marker=null; }
  window.__tripMarker=null;
}
function placeFlyer(lat, lng, mode, country){
  if(!ui.map) return;
  var html='<div class="flyer '+mode+'" style="transform:rotate('+tripPlay.heading+'deg)">'+modeIcon(mode)+'</div>';
  var icon=ui.map.htmlIcon({className:"flyer-wrap", html:html, iconSize:[36,36], iconAnchor:[18,18]});
  if(tripPlay.marker){
    tripPlay.marker.setLatLng([lat,lng]);
    if(tripPlay.marker.setIcon) tripPlay.marker.setIcon(icon);
  } else {
    tripPlay.marker=ui.map.marker([lat,lng], {icon:icon, pane:"routePane", interactive:false, zIndexOffset:1000}).addTo(ui.map);
  }
  window.__tripMarker=tripPlay.marker;
  tripPlay.lat=lat; tripPlay.lng=lng;
}
export function tickTripPlay(){
  if(!tripPlay.on) return;
  var routes=ROUTES.filter(function(r){ return r.mode===tripPlay.mode && (!tripPlay.country || (r.country||"")===tripPlay.country); });
  if(!routes.length){ stopTripPlay(); return; }
  var r=routes[Math.floor(tripPlay.t*routes.length)%routes.length];
  var g=buildGeoSync(r);
  if(!g||!g.coords||g.coords.length<2) return;
  var frac=(tripPlay.t*8)%1;
  var pt=pointAlong(g.coords, frac);
  if(pt){
    var ahead=pointAlong(g.coords, Math.min(1, frac+0.02));
    if(ahead) tripPlay.heading=headingDeg({lat:pt[0],lng:pt[1]}, ahead?{lat:ahead[0],lng:ahead[1]}:null);
    placeFlyer(pt[0], pt[1], tripPlay.mode, tripPlay.country);
  }
  tripPlay.t+=0.002;
  if(tripPlay.t>1) tripPlay.t=0;
}

/* year filter */
export var yearFilter=null;
export function buildYearFilter(){
  var el=document.getElementById("year-filter");
  if(!el) return;
  var years={};
  ROUTES.forEach(function(r){
    if(r.date){
      var y=String(r.date).slice(0,4);
      if(y && y!=="0000") years[y]=1;
    }
  });
  var list=Object.keys(years).sort().reverse();
  el.innerHTML="";
  var all=document.createElement("button");
  all.textContent="Все";
  all.className="year-btn"+(yearFilter==null?" on":"");
  all.onclick=function(){ yearFilter=null; if(typeof render==="function") render(); };
  el.appendChild(all);
  list.forEach(function(y){
    var b=document.createElement("button");
    b.textContent=y;
    b.className="year-btn"+(yearFilter===y?" on":"");
    b.onclick=function(){ yearFilter=y; if(typeof render==="function") render(); };
    el.appendChild(b);
  });
}

/* path km */
export function pathKm(coords){
  if(!coords||coords.length<2) return 0;
  var km=0, i;
  for(i=1;i<coords.length;i++)
    km+=hav({lat:coords[i-1][0],lng:coords[i-1][1]},{lat:coords[i][0],lng:coords[i][1]});
  return km;
}

export function buildGeoSync(r){
  var sig=[r.mode,r.from,r.to,r.fromCode||"",r.toCode||"",r.date||"",r.carPath||"",(r.waypoints&&r.waypoints.length)||0,(r.coords&&r.coords.length)||0,window.__roadGen||0].join("|");
  if(r._geo && r._geoSig===sig && r._geo.coords && !r._geo.needRoad) return r._geo;
  var g=computeGeo(r);
  if(g && g.coords && !g.needRoad){ r._geo=g; r._geoSig=sig; }
  return g;
}
function computeGeo(r){
  /* GPS-трек: готовые координаты */
  if(r.coords && r.coords.length>=2){
    var km=pathKm(r.coords);
    var a: any ={lat:r.coords[0][0],lng:r.coords[0][1],label:r.from||"Старт"};
    var b: any ={lat:r.coords[r.coords.length-1][0],lng:r.coords[r.coords.length-1][1],label:r.to||"Финиш"};
    return {coords:r.coords, km:km, a:a, b:b, needRoad:false};
  }
  var a=place(r.from,r.fromCode), b=place(r.to,r.toCode);
  if(!a||!b) return null;
  var coords;
  if(r.mode==="plane"){
    coords=flightArc(a,b,80);
    return {coords:coords, km:hav(a,b), a:a, b:b};
  }
  if(r.mode==="ship"){
    if(r.waypoints && r.waypoints.length){
      var pts=[[a.lat,a.lng]];
      for(var wi=0;wi<r.waypoints.length;wi++) pts.push([r.waypoints[wi].lat,r.waypoints[wi].lng]);
      pts.push([b.lat,b.lng]);
      coords=densify(pts, 6);
    } else {
      coords=shipCoords(a,b);
    }
    return {coords:coords, km:pathKm(coords), a:a, b:b, needRoad:false};
  }
  if(r.mode==="train"){
    var plan=trainPlan(r.from, r.to);
    if(!plan || !plan.linked || !plan.coords) return {coords:null, km:0, a:plan&&plan.a, b:plan&&plan.b, needRoad:false, railMiss:true};
    return {coords:trimLoops(plan.coords), km:pathKm(plan.coords), a:plan.a, b:plan.b, needRoad:plan.hops.length>0, hops:plan.hops};
  }
  /* car: roads via OSRM or offroad via waypoints */
  if(r.carPath==="offroad" || (r.waypoints && r.waypoints.length)){
    var pts=[[a.lat,a.lng]];
    var wps=r.waypoints||[];
    for(var wi=0;wi<wps.length;wi++) pts.push([wps[wi].lat,wps[wi].lng]);
    pts.push([b.lat,b.lng]);
    coords=densify(pts, 8);
    return {coords:coords, km:pathKm(coords), a:a, b:b, needRoad:false};
  }
  var key=roadKey(a,b);
  if(needsBridge(a,b)){
    function land(p,q){
      var k=roadKey(p,q), cachedLeg=roadCache[k];
      if(cachedLeg && cachedLeg!=="fail" && cachedLeg!=="pending") return cachedLeg;
      if(hav(p,q) < 14) return densify([[p.lat,p.lng],[q.lat,q.lng]], 8);
      return null;
    }
    var via=stitchBridge(a,b,land);
    var hops=[];
    if(!roadCache[roadKey(a,via.enter)]) hops.push([a,via.enter]);
    if(!roadCache[roadKey(via.leave,b)]) hops.push([via.leave,b]);
    return {coords:via.coords, km:pathKm(via.coords), a:a, b:b, needRoad:hops.length>0, hops:hops};
  }
  var coast=abkhazPath(a,b);
  if(coast) return {coords:coast, km:pathKm(coast), a:a, b:b, needRoad:false};
  if(ui.map && ui.map.traceNetwork){
    var along=ui.map.traceNetwork("car", a.lat, a.lng, b.lat, b.lng);
    if(along && along.length>=2 && !hasLongChord(along, 32)) return {coords:trimLoops(along), km:pathKm(along), a:a, b:b, needRoad:false};
  }
  var cached=roadCache[key];
  if(cached && cached!=="fail" && cached!=="pending"){
    var trimmed=trimLoops(cached);
    coords = hasLongChord(trimmed, 80) ? null : trimmed;
  }
  else if(cached==="fail"){
    if(ui.map && ui.map.traceNetwork){
      var again=ui.map.traceNetwork("car", a.lat, a.lng, b.lat, b.lng);
      if(again && again.length>=2 && !hasLongChord(again, 32)) return {coords:trimLoops(again), km:pathKm(again), a:a, b:b, needRoad:false};
    }
    coords=null;
    return {coords:null, km:0, a:a, b:b, needRoad:false, roadMiss:true};
  } else {
    coords=null;
  }
  return {coords:coords, km:coords?pathKm(coords):0, a:a, b:b, needRoad:!coords, hops:coords?[]:[[a,b]]};
}

export var COLORS={plane:"#1d4ed8",train:"#15803d",car:"#c2410c",walk:"#7c3aed",bike:"#0f766e",ship:"#0369a1",future:"#6d28d9"};
var ICONS={plane:"✈️",train:"🚂",car:"🚗",walk:"🚶",bike:"🚴",ship:"🚢"};
/* подписи на карте — крупные города, не все 150+ */
export var CITY_LABELS = [
  {name:"Москва",lat:55.76,lng:37.62},{name:"Санкт-Петербург",lat:59.93,lng:30.34},
  {name:"Казань",lat:55.80,lng:49.11},{name:"Екатеринбург",lat:56.84,lng:60.61},
  {name:"Новосибирск",lat:55.01,lng:82.94},{name:"Владивосток",lat:43.12,lng:131.89},
  {name:"Сочи",lat:43.60,lng:39.73},{name:"Калининград",lat:54.71,lng:20.45},
  {name:"Минск",lat:53.90,lng:27.56},{name:"Ереван",lat:40.18,lng:44.51},
  {name:"Дубай",lat:25.20,lng:55.27},{name:"Абу-Даби",lat:24.45,lng:54.38},
  {name:"Милан",lat:45.46,lng:9.19},{name:"Рим",lat:41.90,lng:12.50},
  {name:"Неаполь",lat:40.85,lng:14.27},{name:"Венеция",lat:45.44,lng:12.32},
  {name:"Флоренция",lat:43.77,lng:11.26},{name:"Пекин",lat:39.90,lng:116.41},
  {name:"Шанхай",lat:31.23,lng:121.47},{name:"Бангкок",lat:13.76,lng:100.50},
  {name:"Пхукет",lat:7.88,lng:98.39},{name:"Стамбул",lat:41.01,lng:28.98}
];


bindRail(railNear, railPath);
