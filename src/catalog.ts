import { nameHas, norm } from "./text.js";
import { WORLD } from "./world.js";

"use strict";

export function hav(a,b){
  var R=6371,t=Math.PI/180,dLat=(b.lat-a.lat)*t,dLng=(b.lng-a.lng)*t;
  var x=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(a.lat*t)*Math.cos(b.lat*t)*Math.sin(dLng/2)*Math.sin(dLng/2);
  return 2*R*Math.asin(Math.min(1,Math.sqrt(x)));
}
export function densify(coords, stepKm){
  if(!coords||coords.length<2) return coords;
  var out=[coords[0]],i,j,a,b,d,n,f;
  for(i=1;i<coords.length;i++){
    a={lat:coords[i-1][0],lng:coords[i-1][1]}; b={lat:coords[i][0],lng:coords[i][1]};
    d=hav(a,b); n=Math.max(1,Math.round(d/stepKm));
    for(j=1;j<=n;j++){ f=j/n; out.push([a.lat+(b.lat-a.lat)*f, a.lng+(b.lng-a.lng)*f]); }
  }
  return out;
}

if(window.__travelekMap){
  try{ window.__travelekMap.remove(); }catch(e){}
  window.__travelekMap=null;
}

/* Зум только у карты и глобуса. Остальной экран не масштабируется. */
(function(){
  var meta=document.querySelector('meta[name="viewport"]');
  if(meta) meta.setAttribute("content","width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover");
  function onMap(t){
    if(!t || !t.closest) return false;
    return !!(t.closest("#map") || t.closest("#globe") || t.id==="map" || t.id==="globe");
  }
  ["gesturestart","gesturechange","gestureend"].forEach(function(type){
    document.addEventListener(type, function(e){ e.preventDefault(); }, {passive:false});
  });
  document.addEventListener("touchmove", function(e){
    if(e.touches && e.touches.length>1 && !onMap(e.target) && e.cancelable) e.preventDefault();
  }, {passive:false});
  var lastTouchEnd=0;
  document.addEventListener("touchend", function(e){
    var now=Date.now();
    if(!onMap(e.target) && now-lastTouchEnd<=300) e.preventDefault();
    lastTouchEnd=now;
  }, {passive:false});
})();

/* ===== Каталоги ===== */
export var AIRPORTS = [];

var FLIGHT_PAIRS = {
  "AAQ-DME":1,
  "AAQ-LED":1,
  "AAQ-SVO":1,
  "AAQ-VKO":1,
  "ABA-DME":1,
  "ABA-LED":1,
  "ABA-SVO":1,
  "ABA-VKO":1,
  "AER-DME":1,
  "AER-KRR":1,
  "AER-LED":1,
  "AER-MRV":1,
  "AER-ROV":1,
  "AER-SVO":1,
  "AER-SVX":1,
  "AER-VKO":1,
  "ALA-SVO":1,
  "ARH-DME":1,
  "ARH-LED":1,
  "ARH-SVO":1,
  "ARH-VKO":1,
  "ASF-DME":1,
  "ASF-LED":1,
  "ASF-SVO":1,
  "ASF-VKO":1,
  "AYT-SVO":1,
  "BAX-DME":1,
  "BAX-LED":1,
  "BAX-SVO":1,
  "BAX-VKO":1,
  "BGY-BLQ":1,
  "BGY-CIA":1,
  "BGY-FCO":1,
  "BGY-FLR":1,
  "BGY-GOA":1,
  "BGY-NAP":1,
  "BGY-PSA":1,
  "BGY-TRN":1,
  "BGY-VCE":1,
  "BKK-HKT":1,
  "BKK-SVO":1,
  "BLQ-CIA":1,
  "BLQ-FCO":1,
  "BLQ-GOA":1,
  "BLQ-LIN":1,
  "BLQ-MXP":1,
  "BLQ-NAP":1,
  "BLQ-PSA":1,
  "BLQ-TRN":1,
  "BLQ-VCE":1,
  "BQS-DME":1,
  "BQS-LED":1,
  "BQS-SVO":1,
  "BQS-VKO":1,
  "CAN-CTU":1,
  "CAN-HAK":1,
  "CAN-HGH":1,
  "CAN-PEK":1,
  "CAN-PKX":1,
  "CAN-PVG":1,
  "CAN-SHA":1,
  "CAN-SYX":1,
  "CAN-SZX":1,
  "CAN-TFU":1,
  "CAN-XIY":1,
  "CEK-DME":1,
  "CEK-LED":1,
  "CEK-SVO":1,
  "CEK-VKO":1,
  "CIA-FLR":1,
  "CIA-GOA":1,
  "CIA-LIN":1,
  "CIA-MXP":1,
  "CIA-NAP":1,
  "CIA-PSA":1,
  "CIA-TRN":1,
  "CIA-VCE":1,
  "CSY-DME":1,
  "CSY-LED":1,
  "CSY-SVO":1,
  "CSY-VKO":1,
  "CTU-PEK":1,
  "CTU-PVG":1,
  "DME-DWC":1,
  "DME-DXB":1,
  "DME-EGO":1,
  "DME-GDX":1,
  "DME-GOJ":1,
  "DME-GRV":1,
  "DME-GSV":1,
  "DME-HTA":1,
  "DME-IJK":1,
  "DME-IKT":1,
  "DME-KEJ":1,
  "DME-KGD":1,
  "DME-KHV":1,
  "DME-KJA":1,
  "DME-KRR":1,
  "DME-KUF":1,
  "DME-KZN":1,
  "DME-LED":1,
  "DME-MCX":1,
  "DME-MMK":1,
  "DME-MQF":1,
  "DME-MRV":1,
  "DME-NBC":1,
  "DME-NJC":1,
  "DME-NSK":1,
  "DME-NUX":1,
  "DME-OMS":1,
  "DME-OVB":1,
  "DME-PEE":1,
  "DME-PKC":1,
  "DME-REN":1,
  "DME-ROV":1,
  "DME-SCW":1,
  "DME-SGC":1,
  "DME-SIP":1,
  "DME-STW":1,
  
  "DME-SVX":1,
  "DME-TJM":1,
  "DME-TOF":1,
  "DME-UFA":1,
  "DME-ULY":1,
  "DME-UUS":1,
  
  "DME-VOG":1,
  "DME-VOZ":1,
  "DME-VVO":1,
  "DME-YKS":1,
  
  "DXB-SVO":1,
  "EGO-LED":1,
  "EGO-SVO":1,
  "EGO-VKO":1,
  "EVN-MXP":1,
  "EVN-NAP":1,
  "FCO-FLR":1,
  "FCO-GOA":1,
  "FCO-LIN":1,
  "FCO-MXP":1,
  "FCO-NAP":1,
  "FCO-PSA":1,
  "FCO-TRN":1,
  "FCO-VCE":1,
  "FLR-GOA":1,
  "FLR-LIN":1,
  "FLR-MXP":1,
  "FLR-NAP":1,
  "FLR-TRN":1,
  "FLR-VCE":1,
  "FRU-SVO":1,
  "GDX-LED":1,
  "GDX-SVO":1,
  "GDX-VKO":1,
  "GOA-LIN":1,
  "GOA-MXP":1,
  "GOA-NAP":1,
  "GOA-PSA":1,
  "GOA-TRN":1,
  "GOA-VCE":1,
  "GOJ-LED":1,
  "GOJ-SVO":1,
  "GOJ-VKO":1,
  "GRV-LED":1,
  "GRV-SVO":1,
  "GRV-VKO":1,
  "GSV-LED":1,
  "GSV-SVO":1,
  "GSV-VKO":1,
  "GYD-SVO":1,
  "HAK-PEK":1,
  "HAK-PVG":1,
  "HAK-SVO":1,
  "HGH-PEK":1,
  "HGH-PVG":1,
  "HTA-LED":1,
  "HTA-SVO":1,
  "HTA-VKO":1,
  "IJK-LED":1,
  "IJK-SVO":1,
  "IJK-VKO":1,
  "IKT-KJA":1,
  "IKT-LED":1,
  "IKT-OVB":1,
  "IKT-SVO":1,
  "IKT-VKO":1,
  "IKT-VVO":1,
  "IST-SVO":1,
  "KEJ-LED":1,
  "KEJ-SVO":1,
  "KEJ-VKO":1,
  "KGD-LED":1,
  "KGD-SVO":1,
  "KGD-VKO":1,
  "KHV-LED":1,
  "KHV-SVO":1,
  "KHV-VKO":1,
  "KHV-VVO":1,
  "KJA-LED":1,
  "KJA-OVB":1,
  "KJA-SVO":1,
  "KJA-VKO":1,
  "KRR-LED":1,
  "KRR-SVO":1,
  "KRR-VKO":1,
  "KUF-LED":1,
  "KUF-SVO":1,
  "KUF-VKO":1,
  "KZN-LED":1,
  "KZN-SVO":1,
  "KZN-SVX":1,
  "KZN-VKO":1,
  "LED-MCX":1,
  "LED-MMK":1,
  "LED-MQF":1,
  "LED-MRV":1,
  "LED-NBC":1,
  "LED-NJC":1,
  "LED-NSK":1,
  "LED-NUX":1,
  "LED-OMS":1,
  "LED-OVB":1,
  "LED-PEE":1,
  "LED-PKC":1,
  "LED-REN":1,
  "LED-ROV":1,
  "LED-SCW":1,
  "LED-SGC":1,
  "LED-SIP":1,
  "LED-STW":1,
  "LED-SVO":1,
  "LED-SVX":1,
  "LED-TJM":1,
  "LED-TOF":1,
  "LED-UFA":1,
  "LED-ULY":1,
  "LED-UUS":1,
  "LED-VKO":1,
  "LED-VOG":1,
  "LED-VOZ":1,
  "LED-VVO":1,
  "LED-YKS":1,
  "LED-ZIA":1,
  "LIN-NAP":1,
  "LIN-PSA":1,
  "LIN-TRN":1,
  "LIN-VCE":1,
  "MCX-SVO":1,
  "MCX-VKO":1,
  "MMK-SVO":1,
  "MMK-VKO":1,
  "MQF-SVO":1,
  "MQF-VKO":1,
  "MRV-SVO":1,
  "MRV-VKO":1,
  "MSQ-SVO":1,
  "MXP-NAP":1,
  "MXP-PSA":1,
  "MXP-TRN":1,
  "MXP-VCE":1,
  "NAP-PSA":1,
  "NAP-TRN":1,
  "NAP-VCE":1,
  "NBC-SVO":1,
  "NBC-VKO":1,
  "NJC-SVO":1,
  "NJC-VKO":1,
  "NQZ-SVO":1,
  "NSK-SVO":1,
  "NSK-VKO":1,
  "NUX-SVO":1,
  "NUX-SVX":1,
  "NUX-VKO":1,
  "OMS-OVB":1,
  "OMS-SVO":1,
  "OMS-VKO":1,
  "OVB-SVO":1,
  "OVB-SVX":1,
  "OVB-VKO":1,
  "PEE-SVO":1,
  "PEE-VKO":1,
  "PEK-PVG":1,
  "PEK-SHA":1,
  "PEK-SVO":1,
  "PEK-SYX":1,
  "PEK-SZX":1,
  "PEK-TFU":1,
  "PEK-XIY":1,
  "PKC-SVO":1,
  "PKC-VKO":1,
  "PKX-PVG":1,
  "PSA-TRN":1,
  "PSA-VCE":1,
  "PVG-SYX":1,
  "PVG-SZX":1,
  "PVG-TFU":1,
  "PVG-XIY":1,
  "REN-SVO":1,
  "REN-VKO":1,
  "ROV-SVO":1,
  "ROV-VKO":1,
  "SCW-SVO":1,
  "SCW-VKO":1,
  "SGC-SVO":1,
  "SGC-SVX":1,
  "SGC-VKO":1,
  "SIP-SVO":1,
  "SIP-VKO":1,
  "STW-SVO":1,
  "STW-VKO":1,
  "SVO-SVX":1,
  "SVO-TAS":1,
  "SVO-TBS":1,
  "SVO-TFU":1,
  "SVO-TJM":1,
  "SVO-TOF":1,
  "SVO-UFA":1,
  "SVO-ULY":1,
  "SVO-UUS":1,
  
  "SVO-VOG":1,
  "SVO-VOZ":1,
  "SVO-VVO":1,
  "SVO-YKS":1,
  
  "SVX-UFA":1,
  "SVX-VKO":1,
  "TJM-VKO":1,
  "TOF-VKO":1,
  "TRN-VCE":1,
  "UFA-VKO":1,
  "ULY-VKO":1,
  "UUS-VKO":1,
  "VKO-VOG":1,
  "VKO-VOZ":1,
  "VKO-VVO":1,
  "VKO-YKS":1,
  
};

export function airportCodeOf(p){
  if(!p) return null;
  for(var i=0;i<AIRPORTS.length;i++){
    var a=AIRPORTS[i];
    if(Math.abs(a.lat-p.lat)<0.02 && Math.abs(a.lng-p.lng)<0.02) return a.code;
  }
  var m=(p.label||"").match(/\(([A-Z]{3})\)/);
  if(m) return m[1];
  return null;
}

/* ——— Авиация и ЖД: ориентиры сети ——— */
var AIR_HUBS = ["SVO","DME","VKO","ZIA","LED","AER","OVB","SVX","KZN","KRR","ROV","UFA","CEK","KJA","IKT","VVO","MRV","KGD"];
/* Доп. реальные внутренние пары (хаб–хаб и популярные) */
var EXTRA_FLIGHT_PAIRS = [
  "AER-LED","AER-KZN","AER-SVX","AER-OVB","AER-UFA","AER-KUF","AER-GOJ",
  "LED-KZN","LED-SVX","LED-OVB","LED-KGD","LED-MMK","LED-ARH","LED-KJA","LED-IKT",
  "OVB-KJA","OVB-IKT","OVB-VVO","OVB-SVX","OVB-KZN","KJA-IKT","IKT-VVO","KHV-VVO",
  "SVX-OVB","SVX-KZN","SVX-AER","UFA-SVX","UFA-KZN","OMS-OVB","OMS-SVX",
  "KRR-AER","KRR-LED","ROV-AER","MRV-AER","MRV-LED","VOG-SVO","ASF-SVO",
  "KGD-LED","KGD-SVO","SGC-SVX","SGC-OVB","NUX-SVX","YKS-SVO","YKS-OVB",
  "PKC-SVO","UUS-SVO","HTA-SVO","GDX-SVO","ABA-OVB","BAX-OVB","KEJ-OVB",
  "MSQ-SVO","MSQ-LED","EVN-SVO","EVN-LED","TBS-SVO","GYD-SVO","ALA-SVO","NQZ-SVO","TAS-SVO",
  "DXB-SVO","DXB-DME","IST-SVO","AYT-SVO","BKK-SVO","HKT-SVO","PEK-SVO","PVG-SVO",
  "DLM-SVO","DLM-DME","DLM-VKO","DLM-LED","DLM-AER","DLM-KZN","DLM-SVX","DLM-OVB","DLM-KRR","DLM-ROV","DLM-UFA","DLM-MRV","DLM-IST","DLM-SAW","DLM-AYT",
  "BKK-HAK","HKT-TFU","DME-UTP","SVO-UTP","VKO-UTP"
];
export function ensureFlightPairs(){
  if(typeof FLIGHT_PAIRS==="undefined") window.FLIGHT_PAIRS= {} as any;
  EXTRA_FLIGHT_PAIRS.forEach(function(p){
    var parts=p.split("-");
    if(parts.length!==2) return;
    var k=[parts[0],parts[1]].sort().join("-");
    FLIGHT_PAIRS[k]=1;
  });
}
ensureFlightPairs();

/* Временные/операционные риски аэропортов (не блок, а предупреждение) */
var AIR_RISK = {
  ROV:"Юг: возможны ограничения воздушного пространства",
  KRR:"Юг: возможны ограничения / восстановление после закрытий",
  AAQ:"Юг: возможны ограничения",
  EGO:"Центр/юг: возможные ограничения",
  BQS:"Дальний Восток: погода",
  GDZ:"Юг: возможные ограничения",
  SIP:"Возможны особые условия полётов"
};
export function planeNavWarnings(codeA, codeB, dateStr){
  var w=[], c;
  [codeA,codeB].forEach(function(c){
    if(c && AIR_RISK[c]) w.push(c+": "+AIR_RISK[c]);
  });
  return w;
}

/* ЖД: типы линий для подсказки */
var RAIL_NOTES = {
  sapsan:"Сапсан: Москва (Ленинградский) — СПб (Московский), ~4 ч",
  transsib:"Транссиб: Москва — Владивосток через Казань/Екб/НСК/Иркутск",
  south:"Юг: Москва — Воронеж — Ростов — Сочи / Адлер",
  west:"Запад: Москва — Смоленск — Минск"
};

var AIR_BY=null;
function airByCode(code){
  var j;
  if(!AIR_BY && typeof AIRPORTS!=="undefined"){
    AIR_BY= {} as any;
    for(j=0;j<AIRPORTS.length;j++) if(AIRPORTS[j].code) AIR_BY[AIRPORTS[j].code]=AIRPORTS[j];
  }
  if(AIR_BY && AIR_BY[code]) return AIR_BY[code];
  if(typeof WORLD!=="undefined" && WORLD.byCode && WORLD.byCode[code]) return WORLD.byCode[code];
  return null;
}

export function getPointsForMode(mode){
  function air(a){ return {n:a.n, name:a.n, lat:a.lat, lng:a.lng, code:a.code}; }
  function city(c){ return {n:c.n, name:c.n, lat:c.lat, lng:c.lng}; }
  if(mode==="plane") return (AIRPORTS||[]).map(air);
  if(mode==="train") return (CITIES||[]).map(city);
  if(mode==="car") return (CITIES||[]).map(city).concat((AIRPORTS||[]).map(air));
  return (CITIES||[]).map(city);
}

export function flightAllowed(codeA, codeB){
  if(!codeA||!codeB) return false;
  codeA=String(codeA).toUpperCase(); codeB=String(codeB).toUpperCase();
  if(codeA===codeB) return false;
  /* аэропорты одного города / агломерации — трансфер, не рейс */
  var METRO=[
    ["SVO","DME","VKO","ZIA"],
    ["FCO","CIA"],
    ["MXP","LIN","BGY"],
    ["LHR","LGW","STN","LTN","LCY"],
    ["CDG","ORY","BVA"],
    ["IST","SAW"],
    ["BKK","DMK"],
    ["HND","NRT"],
    ["ICN","GMP"],
    ["JFK","EWR","LGA"],
    ["PEK","PKX"],
    ["PVG","SHA"],
    ["BER","SXF","TXL"],
    ["OSA","KIX","ITM"],
    ["SEL","ICN","GMP"]
  ];
  var i,g;
  for(i=0;i<METRO.length;i++){
    g=METRO[i];
    if(g.indexOf(codeA)>=0 && g.indexOf(codeB)>=0) return false;
  }
  var k=[codeA,codeB].sort().join("-");
  var A=airByCode(codeA), B=airByCode(codeB);
  if(!FLIGHT_PAIRS[k] && (!A||!B)) return false;
  /* слишком короткое плечо (<90 км) — почти наверняка не авиа */
  if(A&&B && typeof hav==="function" && hav(A,B)<90) return false;
  return true;
}


export var STATIONS = [];

/* Города РФ для авто (центры + крупные) */



export var PORTS = [];

/* алиасы: «Ярославль» → речной порт */
export var PORT_ALIASES={
  "ярославль":"yar","мышкин":"myshkin","углич":"uglich","рыбинск":"rybinsk","кострома":"kostroma",
  "плёс":"ples","плес":"ples","кинешма":"kinema","нижегород":"nn","нижний":"nn","нижний новгород":"nn",
  "казань":"kazan","чебоксары":"cheboksary","самара":"samara","саратов":"saratov","волгоград":"volgograd",
  "астрахань":"ast","пермь":"perm","тольятти":"tolyatti","ульяновск":"ulyanovsk","болагар":"bolgar","болгар":"bolgar",
  "москва":"msk_north","северн":"msk_north","дубна":"dubna","тверь":"tver_r",
  "петербург":"spb_river","санкт":"spb_river","спб":"spb_river","питер":"spb_river",
  "валаам":"valaam","кижи":"kizhi","мандроги":"mandrogi","петрозаводск":"petrozavodsk",
  "ростов":"rostov","азов":"azov","каляч":"kalach","калач":"kalach",
  "красноярск":"kras_river","енисейск":"yeniseysk","игарка":"igarka","дудинка":"dudinka",
  "якутск":"yakutsk","хабаровск":"khabarovsk","благовещенск":"blagov",
  "омск":"omsk","новосибирск":"nsk_river","барнаул":"barnaul","сургут":"surgut","тобольск":"tobolsk",
  "архангельск":"arh","мурманск":"mmk","сочи":"sochi","новороссийск":"nvr",
  "колома":"kolomna","коломна":"kolomna","рязань":"ryazan_r","муром":"murom",
  "череповец":"cherepovets","вытегра":"vytegra","шлиссельбург":"shlisselburg",
  "березники":"berezniki","соликамск":"solikamsk","чистополь":"chistopol","елабуга":"yelabuga",
  "сыктывкар":"syktyvkar","котлас":"kotlas","устюг":"velikoustyug"
};

PORT_ALIASES["калязин"]="kalyazin";PORT_ALIASES["кимры"]="kimry";
PORT_ALIASES["жигулевск"]="zhigulevsk";PORT_ALIASES["жигулёвск"]="zhigulevsk";
PORT_ALIASES["волгодонск"]="volgodonsk";PORT_ALIASES["ейск"]="yeisk";PORT_ALIASES["геленджик"]="gelendzhik";
PORT_ALIASES["адлер"]="adler_port";PORT_ALIASES["листвянка"]="listvyanka";PORT_ALIASES["байкал"]="listvyanka";
PORT_ALIASES["братск"]="bratsk";PORT_ALIASES["иркутск"]="irkutsk_r";PORT_ALIASES["дмитров"]="dmitrov";
PORT_ALIASES["зеленодольск"]="zelenodolsk";PORT_ALIASES["свияжск"]="sviyazhsk";

export function portCityKey(n){
  /* «Ярославль (речной)» → ярославль */
  var s=norm(n).replace(/\s*\(.*?\)\s*/g," ").replace(/\s+/g," ").trim();
  return s;
}

export function isPassengerPort(p){
  if(!p||!p.id) return false;
  var n=p.n||"";
  if(/фарватер|центр|^Балтика|^Каспий|^Чёрное|^Азовское|^Ладога|^Онега|^Японское|^Баренцево|^Белое|\bморе\b/i.test(n)) return false;
  return true;
}
export function formatPortLabel(p){
  var n=p.n||"";
  if(/\((речной|порт|морской|море)\)/i.test(n)) return n;
  if(/порт|морской|речной/i.test(n)) return n;
  /* явные морские */
  if(/сочи|новоросс|анапа|туапсе|севастопол|ялта|керчь|феодоси|мурманск|владивосток|калининград|баку|актау|махачкал/i.test(n))
    return n.indexOf("(")>=0?n:(n+" (порт)");
  return n.indexOf("(")>=0?n:(n+" (речной)");
}

export function findPortByQuery(q){
  q=norm(q);
  if(!q) return null;
  if(PORT_ALIASES[q] && PORT_BY_ID[PORT_ALIASES[q]] && isPassengerPort(PORT_BY_ID[PORT_ALIASES[q]]))
    return PORT_BY_ID[PORT_ALIASES[q]];
  var i,p,best=null;
  for(i=0;i<PORTS.length;i++){
    p=PORTS[i];
    if(!isPassengerPort(p)) continue;
    var nk=norm(p.n), ck=portCityKey(p.n);
    if(nk===q || ck===q || norm(formatPortLabel(p))===q) return p;
    if(ck.indexOf(q)===0 && q.length>=3) return p;
    if((nameHas(nk, q) || nameHas(ck, q)) && q.length>=3 && (!best || nk.length<norm(best.n).length)) best=p;
  }
  return best;
}

export var PORT_BY_ID= {} as any;
PORTS.forEach(function(p){ if(p.id) PORT_BY_ID[p.id]=p; });
var PORT_EDGES=[
  /* Волго-Балт / Ладога / Онега */
  ["spb","spb_river"],["spb","kronstadt"],["spb_river","shlisselburg"],["shlisselburg","novaya_ladoga"],
  ["shlisselburg","ladoga"],["ladoga","valaam"],["ladoga","sortavala"],["ladoga","priozersk"],["ladoga","novaya_ladoga"],
  ["novaya_ladoga","lodeynoe"],["lodeynoe","mandrogi"],["mandrogi","petrozavodsk"],["petrozavodsk","onega"],
  ["onega","kizhi"],["onega","vytegra"],["vytegra","cherepovets"],["cherepovets","sheksna"],["sheksna","goritsy"],["goritsy","kirillov"],
  ["cherepovets","rybinsk"],["onega","belomorsk"],["belomorsk","white"],["white","arh"],
  ["spb","baltic1"],["baltic1","baltic2"],["kgd","baltic2"],
  /* Канал Москвы → Волга */
  ["msk_north","khimki"],["msk_south","msk_north"],["khimki","dubna"],["dubna","konakovo"],["konakovo","tver_r"],
  ["tver_r","uglich"],["dubna","uglich"],
  /* Волга сплошная */
  ["uglich","myshkin"],["myshkin","rybinsk"],["rybinsk","volga_n1"],["volga_n1","tutayev"],["tutayev","yar"],["rybinsk","yar"],["myshkin","yar"],["uglich","yar"],
  ["yar","kostroma"],["kostroma","ples"],["ples","kinema"],["kinema","yurevets"],["yurevets","volga_n2"],["volga_n2","gorodec"],["gorodec","balakhna"],["balakhna","nn"],["kinema","nn"],["ples","yar"],
  ["nn","makarievo"],["makarievo","kozmodemyansk"],["kozmodemyansk","cheboksary"],["cheboksary","volga_m1"],["volga_m1","sviyazhsk"],["sviyazhsk","kazan"],["cheboksary","kazan"],
  ["kazan","bolgar"],["bolgar","ulyanovsk"],["ulyanovsk","tolyatti"],["tolyatti","volga_m2"],["volga_m2","samara"],["samara","syzran"],
  ["syzran","khvalynsk"],["khvalynsk","balakovo"],["balakovo","volga_s1"],["volga_s1","saratov"],["saratov","engels"],["saratov","kamyshin"],
  ["kamyshin","volga_s2"],["volga_s2","volgograd"],["volgograd","akhtubinsk"],["akhtubinsk","volga_s3"],["volga_s3","ast"],
  /* Кама */
  ["solikamsk","berezniki"],["berezniki","perm"],["perm","kama_f1"],["kama_f1","chaikovsky"],["chaikovsky","sarapul"],["sarapul","nabchelny"],["nabchelny","yelabuga"],["yelabuga","nizhnekamsk"],["nizhnekamsk","kama_f2"],["kama_f2","chistopol"],["chistopol","kazan"],
  /* Ока → Волга */
  ["msk_south","kolomna"],["kolomna","ryazan_r"],["ryazan_r","kasimov"],["kasimov","oka_f1"],["oka_f1","murom"],["murom","nn"],
  /* Дон */
  ["volgograd","kalach"],["kalach","don_f1"],["don_f1","don_f2"],["don_f2","rostov"],["rostov","azov"],["azov","azov_sea"],["azov_sea","taganrog"],["azov_sea","kerch"],
  /* Чёрное */
  ["nvr","black1"],["anapa","black1"],["tuapse","black1"],["sochi","black1"],["sevastopol","black1"],["ydne","black1"],["feodosia","black1"],["kerch","black1"],["black1","black2"],["sochi","tuapse"],["ydne","sevastopol"],
  /* Каспий */
  ["ast","caspian1"],["mcx","caspian1"],["baku","caspian1"],["aktau","caspian1"],
  /* Сев. Двина */
  ["velikoustyug","kotlas"],["kotlas","sevdvina_f"],["sevdvina_f","arh"],["arh","severodvinsk"],["arh","white"],["mmk","barents"],
  /* Обь-Иртыш */
  ["biysk","barnaul"],["barnaul","nsk_river"],["nsk_river","ob_f1"],["ob_f1","tomsk_r"],["omsk","tobolsk"],["tyumen_r","tobolsk"],["tobolsk","khanty"],["khanty","surgut"],["surgut","nizhnevartovsk"],["surgut","ob_f2"],["ob_f2","salekhard"],
  /* Енисей */
  ["abakan","minusinsk"],["minusinsk","kras_river"],["kras_river","divnogorsk"],["kras_river","kazachinskoe"],["kazachinskoe","lesosibirsk"],["lesosibirsk","yeniseysk"],["yeniseysk","yartsevo"],["yartsevo","yen_f1"],["yen_f1","turukhansk"],["turukhansk","yen_f2"],["yen_f2","igarka"],["igarka","dudinka"],
  /* Лена */
  ["ustkut","kirensk"],["kirensk","lensk"],["lensk","olekminsk"],["olekminsk","lena_f1"],["lena_f1","pokrovsk"],["pokrovsk","yakutsk"],
  /* Амур */
  ["blagov","amur_f1"],["amur_f1","khabarovsk"],["khabarovsk","komsomolsk"],["komsomolsk","nikolaevsk"],["khabarovsk","japan_sea"],["vvo","japan_sea"],
  ["tver_r","kalyazin"],["kalyazin","uglich"],["kimry","dubna"],["rzhev","staritsa"],["staritsa","tver_r"],
  ["yar","tutayev"],["kostroma","nerekhta"],["nn","chkalovsk"],["nn","puchezh"],["cheboksary","vasilsursk"],
  ["kazan","zelenodolsk"],["zelenodolsk","volzhsk"],["kazan","zvenigovo"],["bolgar","tetyushi"],["ulyanovsk","sengeley"],
  ["tolyatti","zhigulevsk"],["samara","oktyabrsk"],["balakovo","volsk"],["saratov","marks"],["volgograd","dubovka"],
  ["ast","narimanov"],["kalach","tsimlyansk"],["tsimlyansk","volgodonsk"],["volgodonsk","ustdonetsk"],["ustdonetsk","semikarakorsk"],
  ["semikarakorsk","aksay"],["aksay","rostov"],["azov","yeisk"],["kerch","taman"],["taman","temryuk"],
  ["nvr","gelendzhik"],["sochi","adler_port"],["black1","gelendzhik"],["black1","adler_port"],
  ["sevastopol","evpatoria"],["ydne","feodosia"],["kerch","feodosia"],
  ["irkutsk_r","listvyanka"],["listvyanka","baikal_c"],["baikal_c","severobaikalsk"],["bratsk","angara_f"],["angara_f","ustilimsk"],
  ["msk_north","dmitrov"],["dmitrov","dubna"],["yar","yar2"],["msk_north","msk_tech"],["spb_river","spb2"],
  ["kazan","kazan2"],["nn","nizhny2"],["samara","samara2"],["volgograd","volgograd2"],["ast","astrakhan2"]

];
var PORT_ADJ= {} as any;
PORT_EDGES.forEach(function(e){
  (PORT_ADJ[e[0]]=PORT_ADJ[e[0]]||[]).push(e[1]);
  (PORT_ADJ[e[1]]=PORT_ADJ[e[1]]||[]).push(e[0]);
});
function nearestPort(p){
  var best=null,bd=1e9,i;
  for(i=0;i<PORTS.length;i++){
    var pr=PORTS[i];
    if(!pr.id) continue;
    if(/фарватер|центр|^Балтика|^Каспий|^Чёрное|^Азовское|^Ладога|^Онега|^Японское|^Баренцево|^Белое|море/.test(pr.n)) continue;
    var d=hav(p,pr);
    if(d<bd){ bd=d; best=pr; }
  }
  return best;
}
export function portPath(idA, idB){
  if(!idA||!idB) return null;
  if(idA===idB) return [idA];
  var q=[idA], prev= {} as any, seen= {} as any; seen[idA]=1; prev[idA]=null;
  while(q.length){
    var u=q.shift(), nb=PORT_ADJ[u]||[], i;
    for(i=0;i<nb.length;i++){
      var v=nb[i];
      if(seen[v]) continue;
      seen[v]=1; prev[v]=u;
      if(v===idB){
        var path=[], x=idB;
        while(x){ path.push(x); x=prev[x]; }
        path.reverse();
        return path;
      }
      q.push(v);
    }
  }
  return null;
}
export function shipCoords(a, b){
  var pa=a.portId && PORT_BY_ID[a.portId] ? PORT_BY_ID[a.portId] : nearestPort(a);
  var pb=b.portId && PORT_BY_ID[b.portId] ? PORT_BY_ID[b.portId] : nearestPort(b);
  if(pa && pb){
    var ids=portPath(pa.id, pb.id);
    if(ids && ids.length>=1){
      var pts=[[a.lat,a.lng]], i, pr;
      for(i=0;i<ids.length;i++){
        pr=PORT_BY_ID[ids[i]];
        if(pr) pts.push([pr.lat,pr.lng]);
      }
      pts.push([b.lat,b.lng]);
      return densify(pts, 5);
    }
  }
  var waterIds=["baltic1","baltic2","black1","black2","caspian1","ladoga","onega","azov_sea","volga_n1","volga_n2","volga_m1","volga_m2","volga_s1","volga_s2","volga_s3","don_f1","don_f2","ob_f1","ob_f2","yen_f1","yen_f2","lena_f1","amur_f1"];
  var wa=null,wb=null,da=1e9,db=1e9,i,w,d;
  for(i=0;i<waterIds.length;i++){
    w=PORT_BY_ID[waterIds[i]]; if(!w) continue;
    d=hav(a,w); if(d<da){ da=d; wa=w; }
    d=hav(b,w); if(d<db){ db=d; wb=w; }
  }
  if(wa && wb){
    var ids2=portPath(wa.id, wb.id);
    var pts=[[a.lat,a.lng],[wa.lat,wa.lng]];
    if(ids2){ for(i=0;i<ids2.length;i++){ w=PORT_BY_ID[ids2[i]]; if(w) pts.push([w.lat,w.lng]); } }
    pts.push([wb.lat,wb.lng],[b.lat,b.lng]);
    return densify(pts, 5);
  }
  var midLat=(a.lat+b.lat)/2, midLng=(a.lng+b.lng)/2;
  if(midLat>55 && midLng>18 && midLng<35){ midLat=59.0; midLng=22.5; }
  else if(midLat>41 && midLat<48 && midLng>27 && midLng<42){ midLat=43.2; midLng=34.5; }
  else if(midLat>36 && midLat<48 && midLng>46 && midLng<55){ midLat=42.5; midLng=50.5; }
  return densify([[a.lat,a.lng],[midLat,midLng],[b.lat,b.lng]], 6);
}



export var CITIES = [];
export function loadCatalog(){
  var fn=loadCatalog as any;
  if(fn.p) return fn.p;
  fn.p=import("./catalog-data.js").then(function(m){
    function take(dst, src){ var i; for(i=0;i<src.length;i++) dst.push(src[i]); }
    take(AIRPORTS, m.AIRPORTS);
    take(STATIONS, m.STATIONS);
    take(PORTS, m.PORTS);
    take(CITIES, m.CITIES);
    PORTS.forEach(function(p){ if(p.id) PORT_BY_ID[p.id]=p; });
    AIR_BY=null;
  });
  return fn.p;
}


export var BUILTIN = [
  {id:"f1",mode:"plane",flight:"W4 6927",from:"Неаполь (NAP)",to:"Ереван (EVN)",fromCode:"NAP",toCode:"EVN",date:"2026-09-28",time:"06:00"},
  {id:"f2",mode:"plane",flight:"SU 1861",from:"Ереван (EVN)",to:"Москва (SVO)",fromCode:"EVN",toCode:"SVO",date:"2026-09-28",time:"19:45"},
  {id:"p1",mode:"plane",flight:"W4 6456",from:"Ереван (EVN)",to:"Милан (MXP)",fromCode:"EVN",toCode:"MXP",date:"2026-09-17",duration:"4ч 40м"},
  {id:"p2",mode:"plane",flight:"SU 1966",from:"Москва (SVO)",to:"Ереван (EVN)",fromCode:"SVO",toCode:"EVN",date:"2026-09-17",duration:"4ч 19м"},
  {id:"p3",mode:"plane",flight:"B2 977",from:"Минск (MSQ)",to:"Москва (SVO)",fromCode:"MSQ",toCode:"SVO",date:"2026-07-06",duration:"1ч 47м"},
  {id:"p4",mode:"plane",flight:"B2 978",from:"Москва (SVO)",to:"Минск (MSQ)",fromCode:"SVO",toCode:"MSQ",date:"2026-07-03",duration:"1ч 31м"},
  {id:"p5",mode:"plane",flight:"3U 3887",from:"Чэнду (TFU)",to:"Москва (SVO)",fromCode:"TFU",toCode:"SVO",date:"2026-04-12",duration:"8ч 2м"},
  {id:"p6",mode:"plane",flight:"3U 3932",from:"Пхукет (HKT)",to:"Чэнду (TFU)",fromCode:"HKT",toCode:"TFU",date:"2026-04-11",duration:"3ч 43м"},
  {id:"p7",mode:"plane",flight:"FD 4114",from:"Бангкок (BKK)",to:"Пхукет (HKT)",fromCode:"BKK",toCode:"HKT",date:"2026-04-04",duration:"1ч 30м"},
  {id:"p8",mode:"plane",flight:"HU 721",from:"Хайкоу (HAK)",to:"Бангкок (BKK)",fromCode:"HAK",toCode:"BKK",date:"2026-03-31",duration:"2ч 8м"},
  {id:"p9",mode:"plane",flight:"HU 766",from:"Москва (SVO)",to:"Хайкоу (HAK)",fromCode:"SVO",toCode:"HAK",date:"2026-03-30",duration:"8ч 58м"},
  {id:"t1",mode:"train",flight:"Сапсан 756А",from:"Москва Ленинградский",to:"Санкт-Петербург Московский",date:"2026-08-01",time:"06:50",duration:"3ч 59м"},
  {id:"t2",mode:"train",flight:"Сапсан 781А",from:"Санкт-Петербург Московский",to:"Москва Ленинградский",date:"2026-08-03",time:"19:10",duration:"4ч 8м"},
  {id:"it1",mode:"train",flight:"IT",from:"Milan Central",to:"Bergamo",date:"2026-09-19",time:"10:05",duration:"50м"},
  {id:"it2",mode:"train",flight:"IT",from:"Bergamo",to:"Milan Lambrate",date:"2026-09-19",time:"18:02",duration:"37м"},
  {id:"it3",mode:"train",flight:"IT",from:"Milan Central",to:"Venice Santa Lucia",date:"2026-09-20",time:"09:35",duration:"2ч 28м"},
  {id:"it4",mode:"train",flight:"IT",from:"Venice Santa Lucia",to:"Florence S.M.N",date:"2026-09-22",time:"13:05",duration:"2ч 15м"},
  {id:"it5",mode:"train",flight:"IT",from:"Florence S.M.N",to:"Rome Termini",date:"2026-09-24",time:"10:28",duration:"1ч 42м"},
  {id:"it6",mode:"train",flight:"IT",from:"Rome Termini",to:"Naples Central",date:"2026-09-26",time:"11:25",duration:"1ч 18м"},
  {id:"car1",mode:"car",flight:"Авто",from:"Дубай",to:"Абу-Даби",date:"2025-10-03"},
  {id:"car2",mode:"car",flight:"Авто",from:"Абу-Даби",to:"Дубай",date:"2025-10-03"},
  {id:"p10",mode:"plane",flight:"U6 798",from:"Дубай (DWC)",to:"Москва (DME)",fromCode:"DWC",toCode:"DME",date:"2025-10-10",duration:"5ч 13м"},
  {id:"p11",mode:"plane",flight:"U6 797",from:"Москва (DME)",to:"Дубай (DWC)",fromCode:"DME",toCode:"DWC",date:"2025-10-01",duration:"5ч 19м"},
  {id:"p12",mode:"plane",flight:"HU 7985",from:"Пекин (PEK)",to:"Москва (SVO)",fromCode:"PEK",toCode:"SVO",date:"2025-07-14",duration:"9ч 14м"},
  {id:"p13",mode:"plane",flight:"HU 7612",from:"Шанхай (SHA)",to:"Пекин (PEK)",fromCode:"SHA",toCode:"PEK",date:"2025-07-13",duration:"2ч 24м"},
  {id:"p14",mode:"plane",flight:"HU 7605",from:"Пекин (PEK)",to:"Шанхай (SHA)",fromCode:"PEK",toCode:"SHA",date:"2025-07-06",duration:"2ч 22м"},
  {id:"p15",mode:"plane",flight:"HU 7986",from:"Москва (SVO)",to:"Пекин (PEK)",fromCode:"SVO",toCode:"PEK",date:"2025-06-30",duration:"7ч 45м"},
  {id:"p16",mode:"plane",flight:"N4 60",from:"Казань (KZN)",to:"Москва (SVO)",fromCode:"KZN",toCode:"SVO",date:"2024-02-23",duration:"1ч 32м"},
  {id:"t3",mode:"train",flight:"024",from:"Москва Казанский",to:"Казань",date:"2024-02-19",time:"23:12",duration:"11ч 39м"},
  {id:"t4",mode:"train",flight:"120",from:"Тула Московский",to:"Москва Восточный / Черкизово",date:"2024-06-01",time:"18:06",duration:"3ч 7м"},
  {id:"p17",mode:"plane",flight:"S7 1056",from:"Казань (KZN)",to:"Москва (DME)",fromCode:"KZN",toCode:"DME",date:"2021-01-29",duration:"2ч"},
  {id:"p18",mode:"plane",flight:"S7 1051",from:"Москва (DME)",to:"Казань (KZN)",fromCode:"DME",toCode:"KZN",date:"2021-01-27",duration:"1ч 21м"}
];


