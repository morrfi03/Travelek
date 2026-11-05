/* Дата поездки: будущее и уже прошедшее. Без окна браузера, чтобы это можно было проверить. */
export function isFuture(r){
  if(!r) return false;
  var end=String(r.arrDate||r.date||"").trim();
  if(!end) return false;
  var day=end.slice(0,10);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(day)){
    var parsed=new Date(end);
    return !isNaN(parsed.getTime()) && parsed.getTime()>Date.now();
  }
  var now=new Date();
  function two(n){ return (n<10?"0":"")+n; }
  var today=now.getFullYear()+"-"+two(now.getMonth()+1)+"-"+two(now.getDate());
  if(day>today) return true;
  if(day<today) return false;
  var t=String(r.arrTime||r.time||"23:59").slice(0,5);
  if(!/^\d{2}:\d{2}$/.test(t)) t="23:59";
  return t>(two(now.getHours())+":"+two(now.getMinutes()));
}
export function datedPast(r){
  return !!(r && (r.arrDate||r.date)) && !isFuture(r);
}
