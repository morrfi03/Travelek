/* geometry */
function hav(a,b){
  var R=6371,t=Math.PI/180,dLat=(b.lat-a.lat)*t,dLng=(b.lng-a.lng)*t;
  var x=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(a.lat*t)*Math.cos(b.lat*t)*Math.sin(dLng/2)*Math.sin(dLng/2);
  return 2*R*Math.asin(Math.min(1,Math.sqrt(x)));
}
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
function densify(coords, stepKm){
  if(!coords||coords.length<2) return coords;
  var out=[coords[0]],i,j,a,b,d,n,f;
  for(i=1;i<coords.length;i++){
    a={lat:coords[i-1][0],lng:coords[i-1][1]}; b={lat:coords[i][0],lng:coords[i][1]};
    d=hav(a,b); n=Math.max(1,Math.round(d/stepKm));
    for(j=1;j<=n;j++){ f=j/n; out.push([a.lat+(b.lat-a.lat)*f, a.lng+(b.lng-a.lng)*f]); }
  }
  return out;
}

/* rail graph */
var RAIL_NODES = {};
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
  var linked={}, i, id, xy, best, bd, k, d;
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
var RAIL_ADJ={};
RAIL_EDGES.forEach(function(e){
  (RAIL_ADJ[e[0]]=RAIL_ADJ[e[0]]||[]).push(e[1]);
  (RAIL_ADJ[e[1]]=RAIL_ADJ[e[1]]||[]).push(e[0]);
});

var NO_ROAD = {
  "Норильск":1,"Дудинка":1,"Хатанга":1,"Игарка":1,"Тикси":1,"Певек":1,
  "Анадырь":1,"Билибино":1,"Провидения":1,"Эвено-Бытантай":1,
  "Мирный":1,"Удачный":1,"Полярный":1,"Сретенск":1
};
function carAllowed(nameA, nameB){
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
function trainAllowed(from, to){
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
  var q=[fk],prev={},seen={}; prev[fk]=null; seen[fk]=1;
  while(q.length){
    var u=q.shift(), neigh=RAIL_ADJ[u]||[],i,v;
    for(i=0;i<neigh.length;i++){
      v=neigh[i]; if(seen[v]) continue;
      seen[v]=1; prev[v]=u; q.push(v);
      if(v===tk){
        var path=[tk];
        while(path[path.length-1]!==fk) path.push(prev[path[path.length-1]]);
        path.reverse(); return path;
      }
    }
  }
  return null;
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
    var traced=map && map.traceNetwork && map.traceNetwork("train", p.lat, p.lng, q.lat, q.lng);
    if(traced && traced.length>=2){ append(traced); continue; }
    cached=roadCache[key];
    if(d>=55 && cached && cached!=="fail" && cached!=="pending"){
      append(cached);
      continue;
    }
    seg=densify([[p.lat,p.lng],[q.lat,q.lng]], d>240?22:14);
    append(seg);
    if(d>=55 && cached==null) hops.push([p,q]);
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
  var line=[[43.585,39.723],[43.443,39.910],[43.394,40.011],[43.298,40.259],[43.163,40.339],[43.105,40.632],[43.087,40.812],[43.003,41.023],[42.858,41.128],[42.712,41.468],[42.628,41.737]];
  var ia=abkhazIndex(a), ib=abkhazIndex(b), coords, i, step;
  if(ia<0 || ib<0 || ia===ib) return null;
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
function stitchBridge(a,b,leg){
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
var roadCache={};
var roadWait={};
var roadQueue=[];
var roadActive=0;
function roadKey(a,b){ return a.lat.toFixed(3)+","+a.lng.toFixed(3)+";"+b.lat.toFixed(3)+","+b.lng.toFixed(3); }
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
function pumpRoads(){
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
function tripWindow(r){
  if(!r.date) return null;
  var t0=r.time||"00:00";
  if(t0.length===5) t0+=":00";
  var start=new Date(r.date+"T"+t0);
  if(isNaN(start.getTime())) return null;
  var end;
  if(r.arrDate||r.arrTime){
    var t1=r.arrTime||r.time||"23:59";
    if(t1.length===5) t1+=":00";
    end=new Date((r.arrDate||r.date)+"T"+t1);
  } else {
    var g=typeof buildGeoSync==="function"?buildGeoSync(r):null;
    var h=estimateTripHours(r, g?g.km:0);
    end=new Date(start.getTime()+h*3600000);
  }
  if(isNaN(end.getTime())) end=new Date(start.getTime()+4*3600000);
  return {start:start,end:end};
}
function isInProgress(r){
  var w=tripWindow(r); if(!w) return false;
  if(liveHidden(r.id)) return false;
  var now=new Date();
  if(now<w.start || now>w.end) return false;
  /* Без времени прибытия длинная оценка не должна висеть карточкой несколько суток. */
  if(!(r.arrDate||r.arrTime)){
    var hours=(w.end.getTime()-w.start.getTime())/36e5;
    if(hours>16) return false;
  }
  return true;
}
function liveHidden(id){
  if(!id) return false;
  try{ return JSON.parse(localStorage.getItem("travelek-live-hide")||"[]").indexOf(id)>=0; }catch(e){ return false; }
}
function hideLive(ids){
  var cur=[];
  try{ cur=JSON.parse(localStorage.getItem("travelek-live-hide")||"[]"); }catch(e){}
  ids.forEach(function(id){ if(id && cur.indexOf(id)<0) cur.push(id); });
  try{ localStorage.setItem("travelek-live-hide", JSON.stringify(cur.slice(-80))); }catch(e){}
}
function tripProgress(r){
  var w=tripWindow(r); if(!w) return 0;
  var now=Date.now();
  var p=(now-w.start.getTime())/(w.end.getTime()-w.start.getTime());
  return Math.max(0, Math.min(1, p));
}
function pointAlong(coords, t){
  if(!coords||coords.length<2) return null;
  t=Math.max(0,Math.min(1,t));
  var total=0, seg=[], i;
  for(i=1;i<coords.length;i++){
    var d=hav({lat:coords[i-1][0],lng:coords[i-1][1]},{lat:coords[i][0],lng:coords[i][1]});
    seg.push(d); total+=d;
  }
  if(total<=0) return coords[0];
  var need=total*t, acc=0;
  for(i=0;i<seg.length;i++){
    if(acc+seg[i]>=need){
      var f=(need-acc)/seg[i];
      return [
        coords[i][0]+(coords[i+1][0]-coords[i][0])*f,
        coords[i][1]+(coords[i+1][1]-coords[i][1])*f
      ];
    }
    acc+=seg[i];
  }
  return coords[coords.length-1];
}
var liveMarker=null;

var yearFilter="all"; /* all | 2026 | ... */
var modeFilter="all"; /* all | plane | train | car */
var liveMarkers=[];
var animMarkers={}; /* id -> marker for animated past trips when selected */
var notifAsked=false;

function updateLiveTrip(){
  var box=document.getElementById("live-trip");
  if(!box) return;
  var live=ROUTES.filter(isInProgress);
  liveMarkers.forEach(function(m){ try{ map.removeLayer(m); }catch(e){} });
  liveMarkers=[];
  if(liveMarker){ try{ map.removeLayer(liveMarker); }catch(e){} liveMarker=null; }
  if(!live.length){
    box.classList.remove("on"); box.innerHTML="";
    return;
  }
  var icons={plane:"✈️",train:"🚂",car:"🚗",walk:"🚶",bike:"🚴",ship:"🚢"};
  var htmlL='<div class="lt-title"><span>'+t("Сейчас в пути")+" · "+live.length+'</span><button type="button" id="live-hide">'+t("Убрать")+"</button></div><div class=\"lt-list\">";
  live.forEach(function(r, idx){
    var g=buildGeoSync(r);
    var p=tripProgress(r);
    var pct=Math.round(p*100);
    var fromL=typeof shortPlaceLabel==="function"?shortPlaceLabel(r.from, g&&g.a&&g.a.lat, g&&g.a&&g.a.lng):r.from;
    var toL=typeof shortPlaceLabel==="function"?shortPlaceLabel(r.to, g&&g.b&&g.b.lat, g&&g.b&&g.b.lng):r.to;
    htmlL+='<div class="lt-item">'+(icons[r.mode]||"")+" "+fromL+" → "+toL+
      '<div class="lt-meta">'+pct+"%"+(g?" · ~"+Math.round(g.km*(1-p))+" км":"")+"</div>"+
      '<div class="lt-bar"><i style="width:'+pct+'%"></i></div></div>';
    if(g&&g.coords&&map){
      var pt=pointAlong(g.coords, p);
      if(pt){
        var mk=L.circleMarker(pt,{radius:idx===0?8:6,color:"#fff",weight:2,fillColor:idx===0?"#6af":"#9cf",fillOpacity:1});
        mk.addTo(map);
        liveMarkers.push(mk);
      }
    }
  });
  htmlL+="</div>";
  box.innerHTML=htmlL;
  box.classList.add("on");
  var hideBtn=document.getElementById("live-hide");
  if(hideBtn) hideBtn.onclick=function(ev){
    ev.stopPropagation();
    hideLive(live.map(function(r){ return r.id; }));
    updateLiveTrip();
  };
}

/* Анимация выбранного / текущего рейса по времени */
function animateRouteOnMap(r){
  if(!r||!map) return;
  var g=buildGeoSync(r); if(!g||!g.coords||g.coords.length<2) return;
  var id=r.id;
  if(animMarkers[id]){ try{ map.removeLayer(animMarkers[id]); }catch(e){} }
  var t=isInProgress(r)?tripProgress(r):(isFuture(r)?0:1);
  var pt=pointAlong(g.coords, t);
  if(!pt) return;
  var col=r.mode==="plane"?"#5b9fff":(r.mode==="train"?"#3dd68c":(r.mode==="car"?"#f5a623":"#8af"));
  animMarkers[id]=L.circleMarker(pt,{radius:7,color:"#fff",weight:2,fillColor:col,fillOpacity:1}).addTo(map);
}
function clearAnimMarkers(){
  Object.keys(animMarkers).forEach(function(id){
    try{ map.removeLayer(animMarkers[id]); }catch(e){}
  });
  animMarkers={};
}

/* Напоминание за час (Notification API) */
function checkTripReminders(){
  if(!("Notification" in window)) return;
  if(Notification.permission==="denied") return;
  if(Notification.permission==="default" && !notifAsked){
    notifAsked=true;
    try{ Notification.requestPermission(); }catch(e){}
    return;
  }
  if(Notification.permission!=="granted") return;
  var now=Date.now();
  ROUTES.forEach(function(r){
    if(!r.date) return;
    var w=tripWindow(r); if(!w) return;
    var ms=w.start.getTime()-now;
    if(ms>50*60*1000 && ms<70*60*1000){
      var key="notif-"+r.id+"-"+r.date;
      try{ if(localStorage.getItem(key)) return; localStorage.setItem(key,"1"); }catch(e){}
      var from=r.from||"", to=r.to||"";
      try{
        new Notification("Скоро выезд",{
          body:(r.mode||"")+": "+from+" → "+to+(r.time?" в "+r.time:""),
          tag:key
        });
      }catch(e){}
    }
  });
}

/* Фильтр по году */
function routeYear(r){
  return (r.date||"").slice(0,4);
}
function buildYearFilter(){
  var el=document.getElementById("year-filter");
  if(!el) return;
  var years={}, i;
  var nowY=String(new Date().getFullYear());
  ROUTES.forEach(function(r){
    var y=routeYear(r);
    if(!y) return;
    if(activeTab==="future" && (y<nowY || !isFuture(r))) return;
    if(activeTab==="past" && isFuture(r)) return;
    years[y]=1;
  });
  var list=Object.keys(years).sort();
  if(activeTab!=="future") list.reverse();
  var h='<button type="button" id="play-trips" class="play-trips'+(tripPlay.on?" on":"")+'" data-i18n="'+(tripPlay.on?"Стоп":"Показать поездку")+'">'+t(tripPlay.on?"Стоп":"Показать поездку")+"</button>";
  h+='<button type="button" data-y="all" class="'+(yearFilter==="all"?"on":"")+'">'+t("Все годы")+"</button>";
  list.forEach(function(y){
    h+='<button type="button" data-y="'+y+'" class="'+(yearFilter===y?"on":"")+'">'+y+"</button>";
  });
  el.innerHTML=h;
  var btns=el.querySelectorAll("button");
  for(i=0;i<btns.length;i++){
    if(btns[i].id==="play-trips") continue;
    btns[i].onclick=(function(b){ return function(){
      yearFilter=b.getAttribute("data-y");
      var wasPlaying=tripPlay.on;
      buildYearFilter();
      render();
      if(wasPlaying) startTripPlay();
    };})(btns[i]);
  }
}

var tripPlay={on:false, raf:0, marker:null, timer:0, gen:0};
function tripPlayRoutes(){
  var pool=ROUTES, ids=null, trips, i;
  if(selectedTripId){
    trips=loadTrips(); ids={};
    for(i=0;i<trips.length;i++) if(trips[i].id===selectedTripId) (trips[i].routes||[]).forEach(function(id){ ids[id]=1; });
    pool=ROUTES.filter(function(r){ return ids[r.id]; });
  } else if(activeTab==="future") pool=ROUTES.filter(isFuture);
  else if(activeTab==="past") pool=ROUTES.filter(function(r){ return !isFuture(r); });
  return pool.filter(function(r){
    if(!selectedTripId && typeof yearFilter!=="undefined" && yearFilter!=="all" && (r.date||"").slice(0,4)!==yearFilter) return false;
    if(typeof modeFilter!=="undefined" && modeFilter!=="all" && r.mode!==modeFilter) return false;
    return true;
  }).slice().sort(function(a,b){
    return ((a.date||"")+" "+(a.time||"")).localeCompare((b.date||"")+" "+(b.time||""));
  });
}
function tripDurationMs(r, g){
  var km=g&&g.km||400;
  var base=r.mode==="plane"?2200:(r.mode==="train"?2800:(r.mode==="ship"?2600:2000));
  var extra=Math.min(1600, km*(r.mode==="plane"?0.12:0.35));
  return Math.max(1600, Math.min(4200, base+extra));
}
var VEHICLE_MESH={};
function vtri(out, a, b, c, col){
  out.push([a[0],a[1],a[2], b[0],b[1],b[2], c[0],c[1],c[2], col]);
}
function vquad(out, a, b, c, d, col){
  vtri(out, a, b, c, col);
  vtri(out, a, c, d, col);
}
function vbox(out, x, y, z, sx, sy, sz, col){
  var x0=x-sx/2, x1=x+sx/2, y0=y-sy/2, y1=y+sy/2, z0=z-sz/2, z1=z+sz/2;
  var p=[[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0]];
  vquad(out, p[0], p[1], p[2], p[3], col);
  vquad(out, p[5], p[4], p[7], p[6], col);
  vquad(out, p[3], p[2], p[6], p[7], col);
  vquad(out, p[4], p[5], p[1], p[0], col);
  vquad(out, p[1], p[5], p[6], p[2], col);
  vquad(out, p[4], p[0], p[3], p[7], col);
}
function vehicleMesh(mode){
  if(VEHICLE_MESH[mode]) return VEHICLE_MESH[mode];
  var o=[], W=0xf7f8fb, BLUE=0x1f4f97, RED=0xc8102e, GLASS=0x9ecff0, STEEL=0xb7c3ce, DARK=0x2a3038;
  if(mode==="train"){
    vbox(o, 0, 0.72, 3.15, 1.55, 1.35, 3.3, 0xc1121f);
    vbox(o, 0, 0.78, 5.05, 1.35, 1.05, 1.15, 0x9a1018);
    vbox(o, 0, 1.05, 3.2, 1.35, 0.42, 2.4, GLASS);
    vbox(o, 0, 0.95, 4.85, 1.15, 0.38, 0.7, GLASS);
    vbox(o, 0, 1.42, 3.1, 1.35, 0.12, 3.1, 0x5c656e);
    vbox(o, 0, 0.62, -0.55, 1.48, 1.22, 3.5, 0x8e1c24);
    vbox(o, 0, 0.95, -0.55, 1.28, 0.36, 2.6, GLASS);
    vbox(o, 0, 1.28, -0.55, 1.32, 0.1, 3.3, 0x5c656e);
    vbox(o, 0, 0.62, -4.25, 1.48, 1.22, 3.5, 0x8e1c24);
    vbox(o, 0, 0.95, -4.25, 1.28, 0.36, 2.6, GLASS);
    vbox(o, 0, 1.28, -4.25, 1.32, 0.1, 3.3, 0x5c656e);
    [-1.4,1.4].forEach(function(z){ vbox(o, -0.62, 0.08, z, 0.38, 0.38, 0.38, DARK); vbox(o, 0.62, 0.08, z, 0.38, 0.38, 0.38, DARK); });
    [-0.5,-4.2].forEach(function(z){ vbox(o, -0.58, 0.08, z, 0.36, 0.36, 0.36, DARK); vbox(o, 0.58, 0.08, z, 0.36, 0.36, 0.36, DARK); });
    vbox(o, 0, 0.55, 5.55, 0.9, 0.28, 0.12, 0xf6e27a);
  } else if(mode==="car"){
    vbox(o, 0, 0.48, 0.15, 1.55, 0.62, 2.7, 0xe6e1d4);
    vbox(o, 0, 0.95, -0.15, 1.38, 0.52, 1.45, GLASS);
    vbox(o, 0, 0.78, -0.15, 1.42, 0.22, 1.55, 0xfbfbfb);
    vbox(o, 0, 0.42, 1.15, 1.48, 0.42, 0.7, 0xd9d3c4);
    vbox(o, 0, 0.38, -1.15, 1.48, 0.4, 0.55, 0xd0c9b8);
    vbox(o, -0.78, 0.22, 0.85, 0.38, 0.46, 0.46, DARK);
    vbox(o, 0.78, 0.22, 0.85, 0.38, 0.46, 0.46, DARK);
    vbox(o, -0.78, 0.22, -0.85, 0.38, 0.46, 0.46, DARK);
    vbox(o, 0.78, 0.22, -0.85, 0.38, 0.46, 0.46, DARK);
    vbox(o, -0.42, 0.48, 1.48, 0.22, 0.16, 0.08, 0xf6e27a);
    vbox(o, 0.42, 0.48, 1.48, 0.22, 0.16, 0.08, 0xf6e27a);
    vbox(o, 0, 0.62, 0.15, 1.58, 0.08, 2.2, RED);
  } else if(mode==="ship"){
    vbox(o, 0, 0.25, 0, 1.6, 0.45, 5.2, 0xf4f7fb);
    vbox(o, 0, 0.05, 0.2, 1.9, 0.28, 4.2, 0x1a6ea8);
    vbox(o, 0, 0.85, -0.4, 1.2, 0.7, 1.8, W);
    vbox(o, 0, 1.55, -0.4, 0.12, 1.1, 0.12, STEEL);
  } else if(mode==="bike"){
    vbox(o, 0, 0.35, 0.7, 0.12, 0.7, 0.9, 0x234e8c);
    vbox(o, -0.55, 0.15, 0.9, 0.12, 0.55, 0.55, DARK);
    vbox(o, 0.55, 0.15, 0.9, 0.12, 0.55, 0.55, DARK);
    vbox(o, -0.55, 0.15, -0.8, 0.12, 0.55, 0.55, DARK);
    vbox(o, 0.55, 0.15, -0.8, 0.12, 0.55, 0.55, DARK);
  } else if(mode==="walk"){
    vbox(o, 0, 1.15, 0, 0.55, 0.85, 0.35, 0x1f4f97);
    vbox(o, 0, 1.85, 0, 0.38, 0.38, 0.38, 0xf0c7a4);
    vbox(o, 0, 0.45, 0.1, 0.22, 0.7, 0.22, 0x243044);
    vbox(o, 0.28, 0.45, -0.05, 0.22, 0.7, 0.22, 0x243044);
  } else {
    vbox(o, 0, 0.35, 0.2, 1.15, 1.15, 7.6, W);
    vbox(o, 0, 0.28, 4.5, 0.72, 0.78, 1.7, W);
    vbox(o, 0, 0.15, 0.4, 10.6, 0.16, 2.05, 0xe7eef6);
    vbox(o, 0, 0.22, 0.15, 1.2, 0.14, 6.4, BLUE);
    vbox(o, 0, 0.42, -3.55, 3.5, 0.12, 1.05, W);
    vbox(o, 0, 1.25, -3.55, 0.16, 1.85, 1.25, BLUE);
    vbox(o, 0, 1.25, -3.05, 0.18, 1.9, 0.28, RED);
    vbox(o, -2.15, -0.05, 0.55, 0.72, 0.72, 2.15, STEEL);
    vbox(o, 2.15, -0.05, 0.55, 0.72, 0.72, 2.15, STEEL);
    vbox(o, 0, 0.55, 1.6, 0.7, 0.32, 0.9, GLASS);
    vbox(o, 0, 0.15, 5.15, 0.2, 0.2, 0.2, RED);
  }
  VEHICLE_MESH[mode]=o;
  return o;
}
function paintVehicle(cv, mode, heading){
  if(!cv) return;
  var w=180, h=180, dpr=2;
  if(cv.width!==w*dpr){ cv.width=w*dpr; cv.height=h*dpr; }
  var ctx=cv.getContext("2d");
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,w,h);
  ctx.save();
  ctx.translate(w/2, h/2+8);
  ctx.fillStyle="rgba(10,16,28,.18)";
  ctx.beginPath();
  ctx.ellipse(0, 34, 36, 9, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.rotate((((heading||0)-90)*Math.PI)/180);
  if(mode==="train") drawTrainIcon(ctx);
  else if(mode==="car") drawCarIcon(ctx);
  else if(mode==="ship") drawShipIcon(ctx);
  else drawPlaneIcon(ctx);
  ctx.restore();
}
function drawPlaneIcon(ctx){
  ctx.save();
  ctx.fillStyle="#f4f7fb";
  ctx.strokeStyle="#243044";
  ctx.lineWidth=1.4;
  ctx.beginPath();
  ctx.moveTo(46,0);
  ctx.quadraticCurveTo(18,-7,-28,-6.5);
  ctx.lineTo(-40,-5);
  ctx.lineTo(-34,0);
  ctx.lineTo(-40,5);
  ctx.lineTo(-28,6.5);
  ctx.quadraticCurveTo(18,7,46,0);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.fillStyle="#1f4f97";
  ctx.beginPath();
  ctx.moveTo(8,0); ctx.lineTo(-6,-34); ctx.lineTo(-16,-30); ctx.lineTo(-4,0); ctx.lineTo(-16,30); ctx.lineTo(-6,34); ctx.closePath();
  ctx.fill();
  ctx.fillStyle="#c8102e";
  ctx.beginPath();
  ctx.moveTo(-30,0); ctx.lineTo(-42,-16); ctx.lineTo(-24,-5); ctx.lineTo(-24,5); ctx.lineTo(-42,16); ctx.closePath();
  ctx.fill();
  ctx.fillStyle="#d7e4f2";
  ctx.beginPath();
  ctx.ellipse(16,0,8,3.2,0,0,Math.PI*2);
  ctx.fill();
  ctx.restore();
}
function drawTrainIcon(ctx){
  ctx.save();
  ctx.fillStyle="#e10600";
  roundRect(ctx,-46,-16,92,32,12);
  ctx.fill();
  ctx.fillStyle="#f4f7fb";
  roundRect(ctx,-40,-10,34,14,5);
  ctx.fill();
  ctx.fillStyle="#9ec9ee";
  roundRect(ctx,2,-9,28,12,4);
  ctx.fill();
  ctx.fillStyle="#1c2430";
  ctx.beginPath(); ctx.arc(-24,16,6,0,Math.PI*2); ctx.arc(22,16,6,0,Math.PI*2); ctx.fill();
  ctx.fillStyle="#f6e27a";
  ctx.beginPath(); ctx.arc(40,0,4,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle="rgba(255,255,255,.85)";
  ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(-46,-4); ctx.lineTo(36,-4); ctx.stroke();
  ctx.restore();
}
function drawCarIcon(ctx){
  ctx.save();
  ctx.fillStyle="#f7f4ee";
  ctx.strokeStyle="#2a3038";
  ctx.lineWidth=1.3;
  ctx.beginPath();
  ctx.moveTo(-34,8);
  ctx.lineTo(-28,-2);
  ctx.quadraticCurveTo(-10,-4, -6,-14);
  ctx.lineTo(16,-14);
  ctx.quadraticCurveTo(28,-12, 34,-2);
  ctx.lineTo(40,8);
  ctx.quadraticCurveTo(40,16, 30,16);
  ctx.lineTo(-24,16);
  ctx.quadraticCurveTo(-40,16, -34,8);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.fillStyle="#9ecff0";
  ctx.beginPath();
  ctx.moveTo(-4,-4); ctx.lineTo(2,-11); ctx.lineTo(18,-11); ctx.lineTo(26,-4); ctx.closePath();
  ctx.fill();
  ctx.fillStyle="#c8102e";
  ctx.fillRect(-30,6,58,3);
  ctx.fillStyle="#1c2430";
  ctx.beginPath(); ctx.arc(-18,16,6.5,0,Math.PI*2); ctx.arc(20,16,6.5,0,Math.PI*2); ctx.fill();
  ctx.fillStyle="#d9dee6";
  ctx.beginPath(); ctx.arc(-18,16,2.4,0,Math.PI*2); ctx.arc(20,16,2.4,0,Math.PI*2); ctx.fill();
  ctx.restore();
}
function drawShipIcon(ctx){
  ctx.save();
  ctx.fillStyle="#f4f7fb";
  ctx.beginPath();
  ctx.moveTo(-40,6); ctx.quadraticCurveTo(0,22, 42,4); ctx.lineTo(30,-2); ctx.lineTo(-28,-2); ctx.closePath();
  ctx.fill();
  ctx.fillStyle="#1a6ea8";
  roundRect(ctx,-16,-18,22,18,3); ctx.fill();
  ctx.restore();
}
function roundRect(ctx, x, y, w, h, r){
  var rr=Math.min(r, w/2, h/2);
  ctx.beginPath();
  ctx.moveTo(x+rr, y);
  ctx.arcTo(x+w, y, x+w, y+h, rr);
  ctx.arcTo(x+w, y+h, x, y+h, rr);
  ctx.arcTo(x, y+h, x, y, rr);
  ctx.arcTo(x, y, x+w, y, rr);
  ctx.closePath();
}
function tripIconSvg(mode){
  if(mode==="train") return '<svg viewBox="0 0 48 48"><path fill="currentColor" d="M16 5h16c4 0 8 3 8 8v18c0 4-3 7-7 8l2 6h-5l-2-6H20l-2 6h-5l2-6c-4-1-7-4-7-8V13c0-5 4-8 8-8z"/><rect x="18" y="12" width="12" height="8" rx="2" fill="#fff"/><circle cx="19" cy="29" r="2" fill="#fff"/><circle cx="29" cy="29" r="2" fill="#fff"/></svg>';
  if(mode==="car") return '<svg viewBox="0 0 48 48"><path fill="currentColor" d="M17 6h14l3 9v15c0 2-2 4-4 4v6h-5v-6h-2v6h-5v-6c-2 0-4-2-4-4V15l3-9z"/><rect x="18" y="16" width="12" height="7" rx="2" fill="#fff"/></svg>';
  if(mode==="ship") return '<svg viewBox="0 0 48 48"><path fill="currentColor" d="M24 6 28 16h8l-6 8 2 12H16l2-12-6-8h8z"/><path fill="currentColor" d="M8 38c4 3 8 3 12 0s8-3 12 0 8 3 12 0v4H8z"/></svg>';
  if(mode==="bike") return '<svg viewBox="0 0 48 48"><circle cx="16" cy="32" r="7" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="34" cy="32" r="7" fill="none" stroke="currentColor" stroke-width="3"/><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" d="M16 32 24 14h8M24 14l8 18"/></svg>';
  if(mode==="walk") return '<svg viewBox="0 0 48 48"><circle cx="24" cy="9" r="4" fill="currentColor"/><path fill="currentColor" d="M21 16h7l2 9-5 2v7h-5v-8l-4-2 5-8z"/></svg>';
  return '<svg viewBox="0 0 48 48"><path fill="currentColor" d="M22 3h4l1.5 14H40l2 4-14.5 3V36l4 3v3l-6-2-6 2v-3l4-3V24L8 21l2-4h12.5z"/></svg>';
}
function tripColor(mode){
  if(mode==="train") return "#12a06a";
  if(mode==="car") return "#e37b14";
  if(mode==="ship") return "#1493b8";
  if(mode==="walk") return "#7c6af7";
  if(mode==="bike") return "#e85d4c";
  return "#3b82f6";
}
function countryNameAt(lat, lng){
  if(typeof countryAt!=="function") return "";
  var id=countryAt(lat, lng);
  if(!id) return "";
  var rec=typeof countryRecord==="function"?countryRecord(id):null;
  if(rec && typeof countryLabel==="function") return countryLabel(rec);
  return (rec&&(rec.n||rec.i))||id;
}
function routeCountryNames(r){
  var g=buildGeoSync(r), names=[];
  function add(p){
    if(!p) return;
    var n=countryNameAt(p.lat, p.lng);
    if(n && names.indexOf(n)<0) names.push(n);
  }
  if(!g) return names;
  add(g.a);
  add(g.b);
  return names;
}
function ensureTripFlyer(){
  var el=document.getElementById("trip-flyer");
  if(!el){
    el=document.createElement("div");
    el.id="trip-flyer";
    el.innerHTML='<div class="trip-card"><div class="trip-country"></div><canvas class="trip-model" width="180" height="180"></canvas></div>';
    document.body.appendChild(el);
  }
  if(!document.getElementById("trip-banner")){
    var ban=document.createElement("div");
    ban.id="trip-banner";
    document.body.appendChild(ban);
  }
  return el;
}
function headingDeg(a, b){
  if(!a||!b) return tripPlay.heading||0;
  var rad=Math.PI/180;
  var y=Math.sin((b.lng-a.lng)*rad)*Math.cos(b.lat*rad);
  var x=Math.cos(a.lat*rad)*Math.sin(b.lat*rad)-Math.sin(a.lat*rad)*Math.cos(b.lat*rad)*Math.cos((b.lng-a.lng)*rad);
  var deg=Math.atan2(y, x)*180/Math.PI;
  return isNaN(deg)?(tripPlay.heading||0):deg;
}
function placeFlyer(lat, lng, mode, country){
  var el=ensureTripFlyer();
  var x=null, y=null, visible=false;
  if(typeof map!=="undefined" && map && map._isAtlas){
    var ptA=map.latLngToContainerPoint([lat, lng]);
    var boxA=map.getContainer().getBoundingClientRect();
    if(ptA && !ptA.hidden){ x=boxA.left+ptA.x; y=boxA.top+ptA.y; visible=true; }
  } else if(typeof globeOn!=="undefined" && globeOn && globeCv && globeProjection){
    var xy=null;
    try{ xy=globeProjection([lng, lat]); }catch(e){}
    if(xy){
      var rect=globeCv.getBoundingClientRect();
      x=rect.left+xy[0];
      y=rect.top+xy[1];
      visible=true;
    }
  } else if(typeof map!=="undefined" && map){
    var pt=map.latLngToContainerPoint([lat, lng]);
    var box=map.getContainer().getBoundingClientRect();
    x=box.left+pt.x;
    y=box.top+pt.y;
    visible=true;
  }
  el.classList.toggle("on", !!visible && x!=null);
  if(!visible || x==null) return;
  el.style.left=Math.round(x)+"px";
  el.style.top=Math.round(y)+"px";
  el.style.setProperty("--trip-c", tripColor(mode));
  var cv=el.querySelector(".trip-model");
  var qh=Math.round((tripPlay.heading||0)/4)*4;
  if(cv && (tripPlay.iconMode!==mode || tripPlay.modelH!==qh)){
    paintVehicle(cv, mode, tripPlay.heading||0);
    tripPlay.iconMode=mode;
    tripPlay.modelH=qh;
  }
  var chip=el.querySelector(".trip-country");
  if(chip){
    chip.textContent=country||"";
    chip.style.display=country?"block":"none";
  }
}
function updateTripBanner(){
  var ban=document.getElementById("trip-banner");
  if(!ban) return;
  var year=yearFilter==="all"?t("Все годы"):String(yearFilter);
  var bits=[year];
  if(tripPlay.country) bits.push(tripPlay.country);
  if((tripPlay.countryTotal||0)>1) bits.push(ofCount(tripPlay.seenCount||0, tripPlay.countryTotal, t("стран")));
  ban.textContent=bits.join(" · ");
  ban.classList.add("on");
}
function hideTripChrome(){
  var el=document.getElementById("trip-flyer");
  if(el) el.classList.remove("on");
  var ban=document.getElementById("trip-banner");
  if(ban) ban.classList.remove("on");
}
function fitYearJourney(routes){
  if(typeof globeOn!=="undefined" && globeOn){
    var slat=0, slng=0, n=0;
    routes.forEach(function(r){
      var g=buildGeoSync(r);
      if(!g||!g.a) return;
      slat+=g.a.lat; slng+=g.a.lng; n++;
      if(g.b){ slat+=g.b.lat; slng+=g.b.lng; n++; }
    });
    if(n){
      globeRot.lat=Math.max(-60, Math.min(60, slat/n));
      globeRot.lng=slng/n;
      if(globeScale<1.2) globeScale=1.2;
      if(typeof scheduleGlobe==="function") scheduleGlobe();
    }
    return;
  }
  if(!map) return;
  var pts=[];
  routes.forEach(function(r){
    var g=buildGeoSync(r), i, step;
    if(!g||!g.coords) return;
    step=Math.max(1, Math.floor(g.coords.length/18));
    for(i=0;i<g.coords.length;i+=step) pts.push(g.coords[i]);
  });
  if(pts.length<2) return;
  var wide=window.matchMedia&&matchMedia("(min-width:980px)").matches;
  try{
    map.fitBounds(pts, wide
      ? {paddingTopLeft:[400,88], paddingBottomRight:[48,88], maxZoom:5, animate:true}
      : {paddingTopLeft:[16,84], paddingBottomRight:[16,240], maxZoom:5, animate:true});
  }catch(e){}
}
function setPlayButton(on){
  var btn=document.getElementById("play-trips");
  if(!btn) return;
  btn.classList.toggle("on", !!on);
  btn.setAttribute("data-i18n", on?"Стоп":"Показать поездку");
  btn.textContent=t(on?"Стоп":"Показать поездку");
}
function stopTripPlay(){
  tripPlay.on=false;
  if(tripPlay.raf){ cancelAnimationFrame(tripPlay.raf); tripPlay.raf=0; }
  if(tripPlay.timer){ clearTimeout(tripPlay.timer); tripPlay.timer=0; }
  if(tripPlay.warmTimer){ clearTimeout(tripPlay.warmTimer); tripPlay.warmTimer=0; }
  if(tripPlay.marker){ try{ map.removeLayer(tripPlay.marker); }catch(e){} tripPlay.marker=null; }
  window.__tripMarker=null;
  hideTripChrome();
  setPlayButton(false);
}
function startTripPlay(){
  stopTripPlay();
  var gen=++tripPlay.gen;
  var routes=tripPlayRoutes().filter(function(r){
    var g=buildGeoSync(r);
    return g&&g.coords&&g.coords.length>=2;
  });
  if(!routes.length) return;
  var bag=[], seen={};
  routes.forEach(function(r){
    routeCountryNames(r).forEach(function(n){ if(!seen[n]){ seen[n]=1; bag.push(n); } });
  });
  tripPlay.on=true;
  tripPlay.seen={};
  tripPlay.seenCount=bag.length;
  tripPlay.country="";
  tripPlay.countryTotal=bag.length;
  tripPlay.popCountry="";
  tripPlay.iconMode="";
  tripPlay.heading=0;
  setPlayButton(true);
  ensureTripFlyer();
  updateTripBanner();
  if(map && !map.__tripMove){
    map.__tripMove=1;
    map.on("move", function(){
      if(tripPlay.on && tripPlay.lat!=null) placeFlyer(tripPlay.lat, tripPlay.lng, tripPlay.mode, tripPlay.country);
    });
  }
  var started=false;
  function begin(){
    if(started || !tripPlay.on || tripPlay.gen!==gen) return;
    started=true;
    fitYearJourney(routes);
    var idx=0;
    function playOne(){
      if(!tripPlay.on) return;
      if(idx>=routes.length){ stopTripPlay(); return; }
      var r=routes[idx++];
      var g=buildGeoSync(r);
      if(!g||!g.coords||g.coords.length<2){ playOne(); return; }
      var ms=tripDurationMs(r, g);
      if(routes.length>6) ms=Math.max(1300, Math.round(ms*0.7));
      var t0=performance.now();
      function frame(now){
        if(!tripPlay.on) return;
        var t=Math.min(1,(now-t0)/ms);
        var pt=pointAlong(g.coords, t);
        var ahead=pointAlong(g.coords, Math.min(1, t+0.035));
        if(pt){
          tripPlay.heading=headingDeg({lat:pt[0],lng:pt[1]}, ahead?{lat:ahead[0],lng:ahead[1]}:null);
          if(!r._stopLabel){
            var stops=routeCountryNames(r);
            r._stopLabel=stops.length>1?stops[0]+" → "+stops[stops.length-1]:(stops[0]||"");
          }
          tripPlay.country=r._stopLabel;
          if(!tripPlay.sampleAt || now-tripPlay.sampleAt>400){
            tripPlay.sampleAt=now;
            updateTripBanner();
          }
          tripPlay.lat=pt[0];
          tripPlay.lng=pt[1];
          tripPlay.mode=r.mode;
          placeFlyer(pt[0], pt[1], r.mode, tripPlay.country);
          if(map && map.glance && (!tripPlay.lookAt || now-tripPlay.lookAt>350)){
            tripPlay.lookAt=now;
            map.glance(pt[0], pt[1]);
          }
        }
        if(t<1) tripPlay.raf=requestAnimationFrame(frame);
        else tripPlay.timer=setTimeout(playOne, 460);
      }
      tripPlay.raf=requestAnimationFrame(frame);
    }
    playOne();
  }
  var hops=[], seenH={};
  routes.forEach(function(r){
    var g=buildGeoSync(r);
    (g&&g.hops||[]).forEach(function(h){
      var k=roadKey(h[0], h[1]);
      if(seenH[k]) return;
      if(roadCache[k] && roadCache[k]!=="pending") return;
      seenH[k]=1;
      hops.push(h);
    });
  });
  if(!hops.length) begin();
  else {
    var left=hops.length;
    tripPlay.warmTimer=setTimeout(begin, 2500);
    hops.forEach(function(h){
      roadQueue.push({a:h[0], b:h[1], done:function(){
        if(--left<=0){ clearTimeout(tripPlay.warmTimer); tripPlay.warmTimer=0; begin(); }
      }});
    });
    pumpRoads();
  }
}

/* Кластеры точек на малом зуме */
function drawEndpointClusters(list){
  if(!map||!layer) return;
  var z=map.getZoom();
  if(z>=6) return; /* на крупном зуме обычные маркеры из render */
  var cell=z<=3?8:z<=4?4:2; /* градусы */
  var buckets={}, key, i, r, g, pts;
  list.forEach(function(r){
    g=buildGeoSync(r); if(!g||!g.a) return;
    pts=[[g.a.lat,g.a.lng],[g.b.lat,g.b.lng]];
    pts.forEach(function(p){
      key=Math.round(p[0]/cell)*cell+","+Math.round(p[1]/cell)*cell;
      if(!buckets[key]) buckets[key]={n:0,lat:0,lng:0};
      buckets[key].n++;
      buckets[key].lat+=p[0];
      buckets[key].lng+=p[1];
    });
  });
  Object.keys(buckets).forEach(function(k){
    var b=buckets[k];
    if(b.n<2) return;
    var la=b.lat/b.n, ln=b.lng/b.n;
    var icon=L.divIcon({
      className:"",
      html:'<div class="marker-cluster">'+b.n+"</div>",
      iconSize:[32,32], iconAnchor:[16,16]
    });
    L.marker([la,ln],{icon:icon,interactive:false}).addTo(layer);
  });
}

setInterval(updateLiveTrip, 20000);
setInterval(checkTripReminders, 60000);


/* ——— Офлайн: кэш тайлов + SW ——— */
function updateOfflinePill(){
  var pill=document.getElementById("offline-pill");
  if(!pill) return;
  if(navigator.onLine===false) pill.classList.add("on");
  else pill.classList.remove("on");
}
window.addEventListener("online", updateOfflinePill);
window.addEventListener("offline", updateOfflinePill);
updateOfflinePill();

function installTileCache(){
  if(!("caches" in window)) return;
  /* кэш тайлов — caches API + SW */
}

(function(){
  function cacheTileUrl(url){
    if(!window.caches||!url||!(/arcgisonline|yandex\.net/i.test(url))) return;
    caches.open("travelek-tiles-v1").then(function(c){
      c.match(url).then(function(hit){
        if(hit) return;
        fetch(url,{mode:"cors",credentials:"omit"}).then(function(r){
          if(r&&r.ok) c.put(url,r.clone());
        }).catch(function(){});
      });
    });
  }
  function bindTiles(){
    if(typeof map==="undefined" || !map || !map.on){ setTimeout(bindTiles, 40); return; }
    if(map.__tilesBound) return;
    map.__tilesBound=1;
    map.on("tileload", function(e){
      try{ if(e.tile && e.tile.src) cacheTileUrl(e.tile.src); }catch(err){}
    });
  }
  bindTiles();
})();

function registerOfflineSW(){
  if(!("serviceWorker" in navigator)) return;
  var swCode = [
    "var CACHE='travelek-tiles-v1';",
    "self.addEventListener('install',function(e){ self.skipWaiting(); });",
    "self.addEventListener('activate',function(e){ e.waitUntil(self.clients.claim()); });",
    "self.addEventListener('fetch',function(e){",
    "  var u=e.request.url;",
    "  if(/arcgisonline\\.com/i.test(u) || /yandex\\.net/i.test(u) || /tile/i.test(u) && /\\/\\d+\\/\\d+\\/\\d+/.test(u)){",
    "    e.respondWith(caches.open(CACHE).then(function(c){",
    "      return c.match(e.request).then(function(hit){",
    "        if(hit) return hit;",
    "        return fetch(e.request).then(function(res){",
    "          if(res && res.ok) c.put(e.request, res.clone());",
    "          return res;",
    "        }).catch(function(){ return hit || Response.error(); });",
    "      });",
    "    }));",
    "  }",
    "});"
  ].join("\\n");
  try{
    var blob=new Blob([swCode.replace(/\\\\n/g,"\\n")],{type:"text/javascript"});
    var url=URL.createObjectURL(blob);
    navigator.serviceWorker.register(url).catch(function(){
      /* blob SW может не работать без HTTPS/same-origin — ок */
    });
  }catch(e){}
}
/* Кэш тайлов на лету через плагин Leaflet (перехват img) */


function isFuture(r){
  var end=r.arrDate||r.date, t=r.arrTime||r.time||"23:59";
  if(!end) return false;
  return new Date(end+"T"+t) > new Date();
}

function pathKm(coords){
  var km=0,i;
  for(i=1;i<coords.length;i++)
    km+=hav({lat:coords[i-1][0],lng:coords[i-1][1]},{lat:coords[i][0],lng:coords[i][1]});
  return km;
}

function buildGeoSync(r){
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
    var a={lat:r.coords[0][0],lng:r.coords[0][1],label:r.from||"Старт"};
    var b={lat:r.coords[r.coords.length-1][0],lng:r.coords[r.coords.length-1][1],label:r.to||"Финиш"};
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
    return {coords:plan.coords, km:pathKm(plan.coords), a:plan.a, b:plan.b, needRoad:plan.hops.length>0, hops:plan.hops};
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
      return densify([[p.lat,p.lng],[q.lat,q.lng]], 16);
    }
    var via=stitchBridge(a,b,land);
    var hops=[];
    if(!roadCache[roadKey(a,via.enter)]) hops.push([a,via.enter]);
    if(!roadCache[roadKey(via.leave,b)]) hops.push([via.leave,b]);
    return {coords:via.coords, km:pathKm(via.coords), a:a, b:b, needRoad:hops.length>0, hops:hops};
  }
  var coast=abkhazPath(a,b);
  if(coast) return {coords:coast, km:pathKm(coast), a:a, b:b, needRoad:false};
  if(map && map.traceNetwork){
    var along=map.traceNetwork("car", a.lat, a.lng, b.lat, b.lng);
    if(along && along.length>=2) return {coords:along, km:pathKm(along), a:a, b:b, needRoad:false};
  }
  var cached=roadCache[key];
  if(cached==="fail"){
    coords=densify([[a.lat,a.lng],[b.lat,b.lng]], Math.max(8, Math.round(hav(a,b)/40)));
    return {coords:coords, km:hav(a,b), a:a, b:b, needRoad:false, roadMiss:hav(a,b)>100};
  }
  if(cached && cached!=="fail" && cached!=="pending") coords=cached;
  else coords=densify([[a.lat,a.lng],[b.lat,b.lng]],15);
  return {coords:coords, km:pathKm(coords), a:a, b:b, needRoad:cached==null, hops:cached==null?[[a,b]]:[]};
}

var COLORS={plane:"#1d4ed8",train:"#15803d",car:"#c2410c",walk:"#7c3aed",bike:"#0f766e",ship:"#0369a1",future:"#6d28d9"};
var ICONS={plane:"✈️",train:"🚂",car:"🚗",walk:"🚶",bike:"🚴",ship:"🚢"};
/* подписи на карте — крупные города, не все 150+ */
var CITY_LABELS = [
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

