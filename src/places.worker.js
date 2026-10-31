/* Индекс 69 тысяч городов и аэропортов. Считается не в потоке карты. */
function norm(s){ return (s||"").toLowerCase().replace(/\s+/g," ").trim(); }
function foldQ(s){ return norm(s).replace(/ё/g,"е"); }
function worldBucket(map, key, idx){
  var b=map[key];
  if(!b) map[key]=[idx];
  else b.push(idx);
}
function indexAir(row, idx, byCode, ab){
  var rec={code:row[0], n:row[1], lat:row[2], lng:row[3]};
  byCode[rec.code]=rec;
  var keys={}, f=foldQ(rec.code), parts, i;
  if(f.length>=2) keys[f.slice(0,2)]=1;
  f=foldQ(rec.n);
  if(f.length>=2) keys[f.slice(0,2)]=1;
  parts=f.split(" ");
  if(parts[0] && parts[0].length>=2) keys[parts[0].slice(0,2)]=1;
  for(i in keys) if(i.length>=2) worldBucket(ab, i, idx);
}
function indexCity(row, idx, cb){
  var names=[row[0]], i, f, key, seen={};
  if(row[3]) names=names.concat(String(row[3]).split("|"));
  for(i=0;i<names.length;i++){
    f=foldQ(names[i]);
    if(f.length<2) continue;
    key=f.slice(0,2);
    if(seen[key]) continue;
    seen[key]=1;
    worldBucket(cb, key, idx);
  }
}
var url=new URL("../geo/places.json?v=1", self.location.href);
fetch(url).then(function(r){
  if(!r.ok) throw new Error("places");
  return r.json();
}).then(function(data){
  var air=data.a||[], cities=data.c||[];
  var byCode={}, ab={}, cb={}, i;
  for(i=0;i<air.length;i++) indexAir(air[i], i, byCode, ab);
  for(i=0;i<cities.length;i++) indexCity(cities[i], i, cb);
  self.postMessage({ok:true, air:air, cities:cities, byCode:byCode, ab:ab, cb:cb});
}).catch(function(){
  self.postMessage({ok:false});
});
