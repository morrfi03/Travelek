function safeSetItem(key, val){
  try{ localStorage.setItem(key, val); }catch(e){ alert("Не удалось сохранить дневник в браузере"); return false; }
  scheduleCloudSave();
  return true;
}
var cloudTimer=null;
function scheduleCloudSave(){
  if(window.__TRAVELEK_READONLY) return;
  if(typeof window.__cloudPush!=="function") return;
  clearTimeout(cloudTimer);
  cloudTimer=setTimeout(function(){
    var keys=["travelek-extra","travelek-del","travelek-app-settings","travelek-mapprefs","travelek-theme","travelek-theme-pref","travelek-countries","travelek-countries-off","travelek-regions","travelek-regions-off","travelek-trips"];
    var pack={}, i;
    for(i=0;i<keys.length;i++) pack[keys[i]]=localStorage.getItem(keys[i]);
    try{ window.__cloudPush(pack); }catch(e){}
  }, 500);
}
function saveExtra(list){ safeSetItem("travelek-extra", JSON.stringify(list||[])); }
function saveDeleted(list){ safeSetItem("travelek-del", JSON.stringify(list||[])); }
function loadAppSettings(){ try{ return JSON.parse(localStorage.getItem("travelek-app-settings")||"{}"); }catch(e){ return {}; } }
function saveAppSettings(s){ safeSetItem("travelek-app-settings", JSON.stringify(s||{})); }
function isStrictRoutes(){ return true; }
function navLimitsOn(){ return loadAppSettings().navLimits!==false; }
function navZonesOn(){ return !!loadAppSettings().navZones; }
var navZoneLayer=null;
function shipBasin(p){
  if(!p) return "";
  var id=p.portId||"";
  var lat=p.lat, lng=p.lng;
  var vb={spb_river:1,shlisselburg:1,novaya_ladoga:1,lodeynoe:1,mandrogi:1,petrozavodsk:1,onega:1,kizhi:1,vytegra:1,cherepovets:1,sheksna:1,goritsy:1,kirillov:1,valaam:1,ladoga:1,sortavala:1,priozersk:1,spb:1,spb2:1};
  if(id==="gorodec"||id==="balakhna") return "gorodets";
  if(vb[id]) return "vb";
  if(lat>64) return "north";
  if(lng>120 && lat<56) return "amur";
  if(lng>80 && lat>55) return "siberia";
  if(lng>43 && lng<52 && lat>45 && lat<61) return "volga";
  if(lat>58 && lng>29 && lng<42) return "vb";
  return "sea";
}
function shipNavWarnings(pa, pb, dateStr){
  if(!navLimitsOn()) return [];
  var d=dateStr?new Date(dateStr+"T12:00:00"):new Date();
  if(isNaN(d.getTime())) d=new Date();
  var month=d.getMonth()+1;
  var w=[];
  function msg(b){
    if(b==="vb" && (month<4 || month>11)) return "Волго-Балт: навигация примерно апрель–ноябрь";
    if(b==="gorodets" && month>=7 && month<=9) return "Волга у Городца: летом возможно маловодье и ограничение осадки";
    if(b==="volga" && (month<4 || month>11)) return "Волга: навигация обычно апрель–ноябрь";
    if(b==="north" && (month<6 || month>10)) return "Север: короткий сезон, примерно июнь–октябрь";
    if(b==="siberia" && (month<6 || month>10)) return "Сибирские реки: навигация примерно июнь–октябрь";
    if(b==="amur" && (month<5 || month>10)) return "Амур: навигация примерно май–октябрь";
    return null;
  }
  [shipBasin(pa), shipBasin(pb)].forEach(function(b){
    var m=msg(b);
    if(m && w.indexOf(m)<0) w.push(m);
  });
  return w;
}
function drawNavZones(){
  if(typeof map==="undefined" || !map || typeof L==="undefined") return;
  if(navZoneLayer){ try{ map.removeLayer(navZoneLayer); }catch(e){} navZoneLayer=null; }
  if(!navZonesOn()) return;
  navZoneLayer=L.layerGroup();
  var zones=[
    {lat:60.2,lng:32.5,r:180000,c:"#22d3ee"},
    {lat:56.65,lng:43.47,r:28000,c:"#fbbf24"},
    {lat:53.2,lng:47.8,r:320000,c:"#60a5fa"},
    {lat:56.3,lng:52.8,r:180000,c:"#34d399"},
    {lat:47.8,lng:41.2,r:160000,c:"#fb7185"},
    {lat:61.5,lng:70,r:380000,c:"#a78bfa"},
    {lat:64,lng:88,r:420000,c:"#f97316"},
    {lat:62,lng:120,r:360000,c:"#eab308"},
    {lat:50.2,lng:136.2,r:260000,c:"#2dd4bf"}
  ];
  zones.forEach(function(z){
    L.circle([z.lat,z.lng],{radius:z.r,color:z.c,weight:1,fillColor:z.c,fillOpacity:0.12,interactive:false}).addTo(navZoneLayer);
  });
  navZoneLayer.addTo(map);
  try{ navZoneLayer.bringToBack && map.getPane && null; }catch(e){}
}

function loadExtra(){ try{return JSON.parse(localStorage.getItem("travelek-extra")||"[]");}catch(e){return[];} }
function loadDeleted(){ try{return JSON.parse(localStorage.getItem("travelek-del")||"[]");}catch(e){return[];} }
function wipeRoutesOnce(){
  if(localStorage.getItem("travelek-wipe")==="2") return;
  var KEYS=["travelek-extra","travelek-del","travelek-countries","travelek-countries-off","travelek-regions","travelek-regions-off"];
  try{
    var vault=JSON.parse(localStorage.getItem("travelek-vault")||"{}");
    if(vault && typeof vault==="object"){
      Object.keys(vault).forEach(function(id){
        KEYS.forEach(function(k){ if(vault[id]) delete vault[id][k]; });
      });
      localStorage.setItem("travelek-vault", JSON.stringify(vault));
    }
  }catch(e){}
  KEYS.forEach(function(k){ localStorage.removeItem(k); });
  localStorage.setItem("travelek-wipe","2");
  if(window.__cloudPush){
    var empty={};
    KEYS.forEach(function(k){ empty[k]=null; });
    try{ window.__cloudPush(empty); }catch(e){}
  }
}
wipeRoutesOnce();
(function bootLocalAccounts(){
  if(window.__TRAVELEK_PRIVATE) return;
  window.__TRAVELEK_PRIVATE=true;
  var USERS="travelek-users", SESSION="travelek-session", VAULT="travelek-vault";
  var KEYS=["travelek-extra","travelek-del","travelek-app-settings","travelek-mapprefs","travelek-theme","travelek-theme-pref","travelek-countries","travelek-countries-off","travelek-regions","travelek-regions-off","travelek-trips"];
  var STORE_URL=window.__TRAVELEK_API||"https://keepjson.fourlegs.workers.dev/bins/BkoU663gNtadZ-zfQvPYx";
  var STORE_KEY=window.__TRAVELEK_API?"":"kj_w_qgNZJtClt_6vg01Eq5c8j1wpxzMTpSzUKrazvkb12AY";
  window.__TRAVELEK_STORE_URL=STORE_URL;
  window.__TRAVELEK_STORE_KEY=STORE_KEY;
  function storeHeaders(){
    var h={"Content-Type":"application/json"};
    if(STORE_KEY) h.Authorization="Bearer "+STORE_KEY;
    return h;
  }
  var DEL="travelek-deleted-users";
  function read(k, fb){ try{ var v=JSON.parse(localStorage.getItem(k)||""); return v==null?fb:v; }catch(e){ return fb; } }
  function users(){
    var u=read(USERS, null);
    if(!Array.isArray(u)) u=[];
    return u;
  }
  function vault(){ var v=read(VAULT, {}); return v&&typeof v==="object"&&!Array.isArray(v)?v:{}; }
  function saveVault(v){ try{ localStorage.setItem(VAULT, JSON.stringify(v)); }catch(e){} }
  function deletedIds(){ var d=read(DEL, []); return Array.isArray(d)?d:[]; }
  function rememberDeleted(ids){
    var d=deletedIds(), i;
    for(i=0;i<(ids||[]).length;i++) if(ids[i] && d.indexOf(ids[i])<0) d.push(ids[i]);
    try{ localStorage.setItem(DEL, JSON.stringify(d)); }catch(e){}
    return d;
  }
  function extraCount(pack){ try{ var a=JSON.parse((pack&&pack["travelek-extra"])||"[]"); return Array.isArray(a)?a.length:0; }catch(e){ return 0; } }
  function packRev(pack){ var n=parseInt(pack&&pack["travelek-rev"],10); return isNaN(n)?0:n; }
  function markCount(pack){
    function n(k){ try{ var a=JSON.parse((pack&&pack[k])||"[]"); return Array.isArray(a)?a.length:0; }catch(e){ return 0; } }
    return n("travelek-countries")+n("travelek-regions")+n("travelek-extra");
  }
  function preferPack(a, b){
    if(!a) return b||null;
    if(!b) return a;
    var ar=packRev(a), br=packRev(b);
    if(ar!==br) return ar>br?a:b;
    return markCount(a)>=markCount(b)?a:b;
  }
  function copyUser(user){
    var login=String(user.login||user.email||"").replace(/@travelek\.app$/,"").trim();
    return {
      id:user.id,
      login:login,
      name:user.name||login,
      password:user.password,
      role:nickIsAdmin(user)?"admin":"user",
      mustChange:!!user.mustChange,
      rev:user.rev||0,
      vladReset:user.vladReset||""
    };
  }
  var VLAD_HASH="ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f";
  function repairVlad(list){
    var changed=false, i, u;
    for(i=0;i<(list||[]).length;i++){
      u=list[i];
      if(!u || String(u.login||"").toLowerCase()!=="vlad100" || u.vladReset==="1") continue;
      u.password=VLAD_HASH;
      u.mustChange=false;
      u.role="user";
      u.rev=Date.now();
      u.vladReset="1";
      changed=true;
    }
    return changed;
  }
  function mergeUsers(remoteUsers, remoteDeleted){
    var del={}, out=[], by={}, i, u, t, local;
    (remoteDeleted||[]).forEach(function(id){ if(id) del[id]=1; });
    function addRemote(user){
      if(!user||!user.id||del[user.id]) return;
      t=copyUser(user);
      by[t.id]=t;
      out.push(t);
    }
    (remoteUsers||[]).forEach(addRemote);
    local=users();
    for(i=0;i<local.length;i++){
      u=local[i];
      if(!u||!u.id||del[u.id]) continue;
      if(!by[u.id]){
        t=copyUser(u);
        by[t.id]=t;
        out.push(t);
        continue;
      }
      if((u.rev||0)>(by[u.id].rev||0)){
        t=by[u.id];
        if(u.login) t.login=u.login;
        if(u.name) t.name=u.name;
        if(u.password) t.password=u.password;
        t.role=nickIsAdmin(u)?"admin":"user";
        t.mustChange=!!u.mustChange;
        t.rev=u.rev;
        if(u.vladReset) t.vladReset=u.vladReset;
      }
    }
    return {users:out, deleted:Object.keys(del)};
  }
  function sha256(text){
    if(!window.crypto||!crypto.subtle||!window.TextEncoder) return Promise.resolve(String(text||""));
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(text||""))).then(function(buf){
      var a=new Uint8Array(buf), s="", i;
      for(i=0;i<a.length;i++) s+=("0"+a[i].toString(16)).slice(-2);
      return s;
    });
  }
  function passMatch(stored, typed){
    stored=String(stored||"");
    typed=String(typed||"");
    if(stored===typed) return Promise.resolve(true);
    return sha256(typed).then(function(h){ return h===stored; });
  }
  function saveStoreNow(alsoDelete){
    var gen=++storeGen;
    var drop=Array.isArray(alsoDelete)?alsoDelete:[];
    return fetch(STORE_URL+"?t="+Date.now(),{cache:"no-store"}).then(function(r){
      if(!r.ok) throw new Error("load");
      return r.json();
    }).then(function(data){
      if(!data||typeof data!=="object"||!Array.isArray(data.users)) throw new Error("load");
      var deleted=Array.isArray(data.deleted)?data.deleted.slice():[];
      drop.forEach(function(id){ if(id && deleted.indexOf(id)<0) deleted.push(id); });
      var merged=mergeUsers(data.users, deleted);
      var remoteVault=data.vault&&typeof data.vault==="object"&&!Array.isArray(data.vault)?data.vault:{};
      var localVault=vault();
      var vaultOut={};
      Object.keys(remoteVault).forEach(function(id){ if(merged.deleted.indexOf(id)<0) vaultOut[id]=remoteVault[id]; });
      Object.keys(localVault).forEach(function(id){
        if(merged.deleted.indexOf(id)>=0) return;
        vaultOut[id]=preferPack(localVault[id], vaultOut[id]);
      });
      try{
        localStorage.setItem(USERS, JSON.stringify(merged.users));
        localStorage.setItem(VAULT, JSON.stringify(vaultOut));
      }catch(e){}
      return fetch(STORE_URL, {
        method:"PUT",
        headers:storeHeaders(),
        body:JSON.stringify({users:merged.users, vault:vaultOut, deleted:merged.deleted})
      }).then(function(r){ if(!r.ok) throw new Error("save"); return gen; });
    });
  }
  var saveTimer=null, storeGen=0;
  function scheduleSave(){ clearTimeout(saveTimer); saveTimer=setTimeout(function(){ saveStoreNow().catch(function(){}); }, 500); }
  function hashList(list){
    var chain=Promise.resolve();
    list.forEach(function(u, idx){
      chain=chain.then(function(){
        var p=String(u.password||"");
        if(/^[a-f0-9]{64}$/.test(p)) return;
        return sha256(p).then(function(h){ list[idx].password=h; });
      });
    });
    return chain.then(function(){ return list; });
  }
  function pullRemote(){
    if(!me || document.hidden || cloudTimer) return;
    var modal=document.getElementById("modal");
    if(modal && modal.classList.contains("on")) return;
    var gen=storeGen;
    fetch(STORE_URL+"?t="+Date.now(),{cache:"no-store"}).then(function(r){
      if(!r.ok) throw new Error("load");
      return r.json();
    }).then(function(data){
      if(gen!==storeGen) return;
      if(!data||typeof data!=="object") return;
      if(!data.vault||typeof data.vault!=="object"||Array.isArray(data.vault)) data.vault={};
      var view=sessionStorage.getItem("travelek-view");
      var owner=(view && me.role==="admin")?view:me.id;
      var remotePack=data.vault[owner]||null;
      var remoteExtra=remotePack && typeof remotePack["travelek-extra"]==="string" ? remotePack["travelek-extra"] : null;
      var localExtra=localStorage.getItem("travelek-extra");
      function nExtra(raw){ try{ var a=JSON.parse(raw||"[]"); return Array.isArray(a)?a.length:0; }catch(e){ return 0; } }
      if(Array.isArray(data.users)){
        var merged=mergeUsers(data.users, Array.isArray(data.deleted)?data.deleted:[]);
        merged.users.forEach(function(ru){ if(ru) ru.role=nickIsAdmin(ru)?"admin":"user"; });
        try{ localStorage.setItem(USERS, JSON.stringify(merged.users)); }catch(e){}
        if(merged.users.length>(data.users||[]).length) scheduleSave();
        if(window.__TRAVELEK_ME){
          var ui;
          for(ui=0;ui<merged.users.length;ui++) if(merged.users[ui] && merged.users[ui].id===window.__TRAVELEK_ME.id) window.__TRAVELEK_ME.role=merged.users[ui].role;
        }
      }
      var vv=vault();
      Object.keys(data.vault).forEach(function(id){ vv[id]=preferPack(vv[id], data.vault[id]); });
      try{ localStorage.setItem(VAULT, JSON.stringify(vv)); }catch(e){}
      var localPack={};
      for(var pi=0;pi<KEYS.length;pi++){
        var pv=localStorage.getItem(KEYS[pi]);
        if(pv!=null) localPack[KEYS[pi]]=pv;
      }
      if(vv[owner] && vv[owner]["travelek-rev"]) localPack["travelek-rev"]=vv[owner]["travelek-rev"];
      var chosen=preferPack(localPack, remotePack);
      var localCountries=localStorage.getItem("travelek-countries")||"";
      var remoteCountries=remotePack&&remotePack["travelek-countries"]||"";
      var localRegions=localStorage.getItem("travelek-regions")||"";
      var remoteRegions=remotePack&&remotePack["travelek-regions"]||"";
      if(chosen && remotePack && chosen===remotePack && (remoteExtra!==localExtra || remoteCountries!==localCountries || remoteRegions!==localRegions)){
        apply(remotePack);
        if(vv[owner]) vv[owner]=remotePack;
        try{ localStorage.setItem(VAULT, JSON.stringify(vv)); }catch(e){}
        ROUTES=assembleRoutes();
        if(window.__reloadVisited) window.__reloadVisited();
        else {
          if(typeof render==="function") render();
          if(typeof syncVisited==="function"){ syncVisited(); if(typeof drawCountries==="function") drawCountries(); }
        }
        if(typeof scheduleGlobe==="function" && globeOn) scheduleGlobe();
      }
      var panel=document.getElementById("account-panel");
      if(panel && panel.classList.contains("on") && window.__fillAccount) window.__fillAccount();
    }).catch(function(){});
  }
  var storePromise=null;
  function ensureStore(){
    if(storePromise) return storePromise;
    var before="";
    var gen=storeGen;
    try{ before=(localStorage.getItem(USERS)||"")+"|"+(localStorage.getItem(VAULT)||""); }catch(e){}
    storePromise=fetch(STORE_URL+"?t="+Date.now(), {cache:"no-store"}).then(function(r){
      if(!r.ok) throw new Error("load");
      return r.json();
    }).then(function(data){
      if(gen!==storeGen) return;
      if(!data||typeof data!=="object") data={};
      if(!Array.isArray(data.users)) data.users=[];
      var repaired=repairVlad(data.users);
      if(!data.vault||typeof data.vault!=="object"||Array.isArray(data.vault)) data.vault={};
      var merged=mergeUsers(data.users, Array.isArray(data.deleted)?data.deleted:[]);
      return hashList(merged.users).then(function(){
        if(me){
          var n;
          grantNamedAdmin(merged.users);
          for(n=0;n<merged.users.length;n++){
            if(!merged.users[n]) continue;
            if(nickIsAdmin(merged.users[n])) merged.users[n].role="admin";
            else if(merged.users[n].role==="admin") merged.users[n].role="user";
            if(merged.users[n].id===me.id) me.role=merged.users[n].role;
          }
          if(window.__TRAVELEK_ME && window.__TRAVELEK_ME.id===me.id) window.__TRAVELEK_ME.role=me.role;
        }
        var remoteBy={}, ri;
        for(ri=0;ri<data.users.length;ri++) if(data.users[ri]&&data.users[ri].id) remoteBy[data.users[ri].id]=data.users[ri];
        var needSave=false, ui;
        for(ui=0;ui<merged.users.length;ui++){
          var ru=remoteBy[merged.users[ui].id];
          if(!ru || (merged.users[ui].rev||0)>(ru.rev||0)) needSave=true;
        }
        var vaultOut={};
        Object.keys(data.vault).forEach(function(id){ if(merged.deleted.indexOf(id)<0) vaultOut[id]=data.vault[id]; });
        var localV=vault();
        Object.keys(localV).forEach(function(id){
          if(merged.deleted.indexOf(id)>=0) return;
          vaultOut[id]=preferPack(localV[id], vaultOut[id]);
        });
        try{
          localStorage.setItem(USERS, JSON.stringify(merged.users));
          localStorage.setItem(VAULT, JSON.stringify(vaultOut));
        }catch(e){}
        var after="";
        try{ after=(localStorage.getItem(USERS)||"")+"|"+(localStorage.getItem(VAULT)||""); }catch(e){}
        window.__TRAVELEK_STORE_CHANGED=after!==before;
        if(needSave || repaired) return saveStoreNow();
      });
    }).catch(function(){}).then(function(){ window.__TRAVELEK_STORE_READY=true; if(!window.__TRAVELEK_POLL) window.__TRAVELEK_POLL=setInterval(pullRemote, 8000); });
    return storePromise;
  }
  function apply(pack){
    var i,k;
    for(i=0;i<KEYS.length;i++){
      k=KEYS[i];
      if(pack && typeof pack[k]==="string") localStorage.setItem(k, pack[k]);
      else localStorage.removeItem(k);
    }
  }
  function kmOf(text){ var m=String(text||"").replace(/\s/g,"").match(/([\d.]+)км/i); return m?Number(m[1])||0:0; }
  function nickIsAdmin(u){
    if(!u) return false;
    var login=String(u.login||u.email||"").toLowerCase().replace(/@travelek\.app$/,"").trim();
    return login==="admin";
  }
  function grantNamedAdmin(list){
    var changed=false, n;
    for(n=0;n<(list||[]).length;n++){
      if(nickIsAdmin(list[n]) && list[n].role!=="admin"){ list[n].role="admin"; changed=true; }
    }
    return changed;
  }
  function idNum(id){ var n=parseInt(String(id||"").replace(/\D/g,""),10); return isNaN(n)?0:n; }
  function ensureOwner(){
    var u=users();
    if(!me || !u.length) return;
    var row=null, first=u[0], n, hasAdmin=false;
    for(n=0;n<u.length;n++){
      if(u[n].role==="admin") hasAdmin=true;
      if(u[n].id===me.id) row=u[n];
      if(idNum(u[n].id)<idNum(first.id)) first=u[n];
    }
    if(!row) return;
    var n;
    for(n=0;n<u.length;n++){
      if(!u[n]) continue;
      if(nickIsAdmin(u[n])) u[n].role="admin";
      else if(u[n].role==="admin") u[n].role="user";
    }
    if(nickIsAdmin(row)){
      row.role="admin";
      me.role="admin";
      try{ localStorage.setItem(USERS, JSON.stringify(u)); }catch(e){}
      if(window.__TRAVELEK_ME) window.__TRAVELEK_ME.role="admin";
      scheduleSave();
      return;
    }
    me.role=row.role;
    try{ localStorage.setItem(USERS, JSON.stringify(u)); }catch(e){}
    if(window.__TRAVELEK_ME) window.__TRAVELEK_ME.role=row.role;
  }
  window.__ensureOwner=ensureOwner;
  var list=users();
  var sid=localStorage.getItem(SESSION);
  var me=null, i;
  for(i=0;i<list.length;i++) if(list[i].id===sid) me=list[i];
  if(me){
    var anyAdmin=false, ai;
    for(ai=0;ai<list.length;ai++) if(list[ai] && list[ai].role==="admin") anyAdmin=true;
    if(nickIsAdmin(me)){
      me.role="admin";
      for(ai=0;ai<list.length;ai++) if(list[ai].id===me.id) list[ai].role="admin";
      try{ localStorage.setItem(USERS, JSON.stringify(list)); }catch(e){}
      scheduleSave();
    }
  }
  var viewId=sessionStorage.getItem("travelek-view");
  if(me && (!viewId || viewId===me.id)){
    var snap=vault();
    var localPack={}, ki, kv;
    for(ki=0;ki<KEYS.length;ki++){ kv=localStorage.getItem(KEYS[ki]); if(kv!=null) localPack[KEYS[ki]]=kv; }
    function countPack(pack){
      try{ var a=JSON.parse((pack&&pack["travelek-extra"])||"[]"); return Array.isArray(a)?a.length:0; }catch(e){ return 0; }
    }
    if(countPack(localPack)>countPack(snap[me.id])){ snap[me.id]=localPack; saveVault(snap); }
  }
  window.__localLogin=function(login, password){
    login=String(login||"").trim().toLowerCase().replace(/@travelek\.app$/,"");
    password=String(password||"").replace(/[\u200B-\u200D\uFEFF]/g,"").trim();
    function tryList(list){
      var jobs=[], n, L;
      for(n=0;n<(list||[]).length;n++){
        L=String(list[n].login||list[n].email||"").toLowerCase().replace(/@travelek\.app$/,"");
        if(L===login) jobs.push(list[n]);
      }
      var chain=Promise.resolve(null);
      jobs.forEach(function(candidate){
        chain=chain.then(function(found){
          if(found) return found;
          return passMatch(candidate.password, password).then(function(ok){ return ok?candidate:null; });
        });
      });
      return chain;
    }
    return fetch(STORE_URL+"?t="+Date.now(),{cache:"no-store"}).then(function(r){
      if(!r.ok) throw new Error("load");
      return r.json();
    }).then(function(data){
      var list=Array.isArray(data.users)?data.users.slice():[];
      var repaired=repairVlad(list);
      try{ localStorage.setItem(USERS, JSON.stringify(list)); }catch(e){}
      var ready=repaired?saveStoreNow():Promise.resolve();
      return ready.then(function(){ return tryList(list); });
    }).catch(function(){ return tryList(users()); }).then(function(row){
      if(!row) return false;
      localStorage.setItem(SESSION, row.id);
      sessionStorage.removeItem("travelek-view");
      location.reload();
      return true;
    });
  };
  ensureStore().then(function(){
    if(!localStorage.getItem(SESSION) || !window.__TRAVELEK_STORE_CHANGED) return;
    if(sessionStorage.getItem("travelek-store-sync")==="1"){
      sessionStorage.removeItem("travelek-store-sync");
      return;
    }
    sessionStorage.setItem("travelek-store-sync","1");
    location.reload();
  });
  if(!me){
    window.__TRAVELEK_HOLD=true;
    window.__TRAVELEK_SEED=false;
    apply(null);
    return;
  }
  var view=sessionStorage.getItem("travelek-view");
  var packOwner=me.id;
  if(view && me.role==="admin" && view!==me.id){
    packOwner=view;
    window.__TRAVELEK_READONLY=true;
    var who=null;
    for(i=0;i<list.length;i++) if(list[i].id===view) who=list[i];
    window.__TRAVELEK_VIEW_NAME=who?(who.name||who.login):"пользователь";
  }
  var all=vault();
  apply(all[packOwner]||null);
  window.__TRAVELEK_ME={id:me.id, email:me.login, name:me.name, role:me.role, mustChange:!!me.mustChange};
  window.__TRAVELEK_SEED=false;
  window.__cloudPush=function(data){
    if(window.__TRAVELEK_READONLY) return;
    var vv=vault();
    var prev=vv[me.id];
    function nOf(pack){ try{ var a=JSON.parse((pack&&pack["travelek-extra"])||"[]"); return Array.isArray(a)?a.length:0; }catch(e){ return 0; } }
    if(!window.__TRAVELEK_DIARY_READY && nOf(data)<nOf(prev)) return;
    data["travelek-rev"]=String(Date.now());
    vv[me.id]=data; saveVault(vv);
    scheduleSave();
  };
  setTimeout(function(){ window.__TRAVELEK_DIARY_READY=true; }, 2500);
  window.__cloudRename=function(name){
    return new Promise(function(resolve, reject){
      name=String(name||"").trim();
      if(!name) return reject(new Error("Введите имя"));
      var u=users(), n;
      for(n=0;n<u.length;n++) if(u[n].id===me.id) u[n].name=name;
      localStorage.setItem(USERS, JSON.stringify(u));
      me.name=name;
      if(window.__TRAVELEK_ME) window.__TRAVELEK_ME.name=name;
      scheduleSave();
      resolve({ok:true, name:name});
    });
  };
  window.__setOwnPassword=function(newPassword){
    return new Promise(function(resolve, reject){
      if(!me || (me.role!=="admin" && !me.mustChange)) return reject(new Error("bad"));
      if(String(newPassword||"").length<8) return reject(new Error("short"));
      var u=users(), row=null, n;
      for(n=0;n<u.length;n++) if(u[n].id===me.id) row=u[n];
      if(!row) return reject(new Error("bad"));
      sha256(newPassword).then(function(h){
        row.password=h;
        delete row.mustChange;
        row.rev=Date.now();
        if(String(row.login||"").toLowerCase()==="vlad100") row.vladReset="1";
        me.mustChange=false;
        if(window.__TRAVELEK_ME) window.__TRAVELEK_ME.mustChange=false;
        localStorage.setItem(USERS, JSON.stringify(u));
        return saveStoreNow();
      }).then(function(){ resolve({ok:true}); }).catch(reject);
    });
  };
  window.__changePassword=function(currentPassword, newPassword){
    return new Promise(function(resolve, reject){
      var u=users(), row=null, n;
      for(n=0;n<u.length;n++) if(u[n].id===me.id) row=u[n];
      if(!row) return reject(new Error("bad"));
      if(String(newPassword||"").length<8) return reject(new Error("short"));
      passMatch(row.password, currentPassword).then(function(ok){
        if(!ok) return reject(new Error("bad"));
        return sha256(newPassword).then(function(h){
          row.password=h;
          row.rev=Date.now();
          if(String(row.login||"").toLowerCase()==="vlad100") row.vladReset="1";
          localStorage.setItem(USERS, JSON.stringify(u));
          return saveStoreNow().then(resolve);
        });
      }).catch(reject);
    });
  };
  window.__adminDelete=function(userId){
    return new Promise(function(resolve, reject){
      if(!me || (me.role!=="admin" && !nickIsAdmin(me))) return reject(new Error("Только администратор"));
      if(userId===me.id) return reject(new Error("Свой аккаунт удалить нельзя"));
      rememberDeleted([userId]);
      var u=users().filter(function(x){ return x.id!==userId; });
      localStorage.setItem(USERS, JSON.stringify(u));
      var v=vault();
      delete v[userId];
      saveVault(v);
      saveStoreNow([userId]).then(function(){ resolve({ok:true}); }).catch(function(e){
        reject(new Error(e&&e.message?e.message:"Не удалось удалить"));
      });
    });
  };
  window.__adminSetPassword=function(userId, newPassword){
    return new Promise(function(resolve, reject){
      if(!me || (me.role!=="admin" && !nickIsAdmin(me))) return reject(new Error("Только администратор"));
      if(String(newPassword||"").length<8) return reject(new Error("Пароль короче 8 символов"));
      ensureStore().then(function(){
        var u=users(), row=null, n;
        for(n=0;n<u.length;n++) if(u[n].id===userId) row=u[n];
        if(!row) throw new Error("Аккаунт не найден");
        if(row.id===me.id) throw new Error("Свой пароль меняйте в блоке выше");
        return sha256(newPassword).then(function(h){
          row.password=h;
          row.mustChange=true;
          row.rev=Date.now();
          if(String(row.login||"").toLowerCase()==="vlad100") row.vladReset="1";
          localStorage.setItem(USERS, JSON.stringify(u));
          return saveStoreNow();
        });
      }).then(function(){ resolve({ok:true}); }).catch(function(e){
        reject(new Error(e&&e.message?e.message:"Не удалось сменить пароль"));
      });
    });
  };
  window.__createFirst=function(login, password){
    login=String(login||"").trim().toLowerCase();
    return ensureStore().then(function(){
      var u=users(), n;
      for(n=0;n<u.length;n++){
        if(String(u[n].login||"").toLowerCase()===login) return window.__localLogin(login, password);
      }
      if(u.length) return window.__localLogin(login, password);
      return sha256(password).then(function(h){
        var row={id:"u"+Date.now(), login:login, name:login, password:h, role:"admin"};
        u.push(row);
        try{ localStorage.setItem(USERS, JSON.stringify(u)); localStorage.setItem(SESSION, row.id); }catch(e){}
        return saveStoreNow().catch(function(){}).then(function(){ location.reload(); });
      });
    });
  };
  window.__cloudCreate=function(login, password, name){
    return new Promise(function(resolve, reject){
      if(!nickIsAdmin(me) && me.role!=="admin") return reject(new Error("Только администратор может создавать аккаунты"));
      login=String(login||"").trim().toLowerCase().replace(/@travelek\.app$/,"");
      name=String(name||"").trim();
      if(login.length<2) return reject(new Error("Логин слишком короткий"));
      if(String(password||"").length<8) return reject(new Error("Пароль короче 8 символов"));
      if(!name) name=login;
      ensureStore().then(function(){
        var u=users(), n;
        for(n=0;n<u.length;n++) if(String(u[n].login||"").toLowerCase()===login) throw new Error("Такой логин уже есть");
        return sha256(password).then(function(h){
          u.push({id:"u"+Date.now(), login:login, name:name, password:h, role:"user", mustChange:true, rev:Date.now()});
          localStorage.setItem(USERS, JSON.stringify(u));
          return saveStoreNow();
        });
      }).then(function(){ resolve({ok:true}); }).catch(function(e){
        reject(new Error(e&&e.message?e.message:"Не удалось сохранить аккаунт. Проверьте интернет"));
      });
    });
  };
  window.__peekUsers=function(){
    return users().map(function(u){
      return {userId:u.id, email:u.login, name:u.name||u.login, role:u.role, routes:0, countries:0, regions:0, kmPlane:0, kmTrain:0, kmCar:0};
    });
  };
  window.__cloudAdmin=function(){
    function packOf(vv, id){ return (vv && vv[id]) || {}; }
    function row(user, vv){
      var pack=packOf(vv, user.id);
      var stats=null;
      try{ if(typeof window.__packStats==="function") stats=window.__packStats(pack); }catch(e){}
      var routes=stats?stats.routesList:[];
      if(!stats){
        try{ routes=JSON.parse(pack["travelek-extra"]||"[]"); }catch(e){ routes=[]; }
        if(!Array.isArray(routes)) routes=[];
      }
      return {
        userId:user.id,
        email:user.login,
        name:user.name,
        role:user.role,
        routes:stats?stats.routes:routes.length,
        countries:stats?stats.countries:0,
        regions:stats?stats.regions:0,
        kmPlane:stats?stats.kmPlane:0,
        kmTrain:stats?stats.kmTrain:0,
        kmCar:stats?stats.kmCar:0
      };
    }
    function merged(remote, remoteVault){
      var local=users(), have={}, out=[], i;
      var vv=remoteVault || vault();
      for(i=0;i<(remote||[]).length;i++){
        if(!remote[i] || !remote[i].id) continue;
        have[remote[i].id]=1;
        out.push(remote[i]);
      }
      for(i=0;i<local.length;i++){
        if(!local[i] || have[local[i].id]) continue;
        out.push(local[i]);
      }
      return out.map(function(user){ return row(user, vv); });
    }
    var gen=storeGen;
    return fetch(STORE_URL+"?t="+Date.now(),{cache:"no-store"}).then(function(r){
      if(!r.ok) throw new Error("load");
      return r.json();
    }).then(function(data){
      if(gen!==storeGen) return merged(users(), vault());
      return merged(Array.isArray(data.users)?data.users:[], data.vault||{});
    }).catch(function(){ return merged(users(), vault()); });
  };
  window.__openDiary=function(userId){ sessionStorage.setItem("travelek-view", userId); location.reload(); };
  window.__exitView=function(){ sessionStorage.removeItem("travelek-view"); location.reload(); };
  window.__signOut=function(){ localStorage.removeItem(SESSION); sessionStorage.removeItem("travelek-view"); location.reload(); };
})();
(function bindFileLogin(){
  var gate=document.getElementById("file-login");
  if(!gate) return;
  if(window.__TRAVELEK_HOLD) gate.style.display="flex";
  var form=document.getElementById("file-login-form");
  if(!form) return;
  form.onsubmit=function(e){
    e.preventDefault();
    var err=document.getElementById("file-login-err");
    if(err) err.textContent="";
    var legal=document.getElementById("file-login-legal");
    if(legal && !legal.checked){
      if(err) err.textContent=t("Нужно принять соглашение и политику");
      return;
    }
    try{ localStorage.setItem("travelek-legal","1"); }catch(e2){}
    var ret=window.__localLogin && window.__localLogin(document.getElementById("file-login-name").value, document.getElementById("file-login-pass").value);
    if(ret && ret.then){
      if(err) err.textContent=t("Проверяем…");
      ret.then(function(ok){ if(!ok && err) err.textContent=t("Неверный логин или пароль"); }).catch(function(){ if(err) err.textContent=t("Неверный логин или пароль"); });
    } else if(!ret && err) err.textContent=t("Неверный логин или пароль");
  };
})();
function assembleRoutes(){
  var del=loadDeleted();
  var extra=loadExtra();
  return extra.filter(function(r){ return del.indexOf(r.id)<0; });
}
var deleted = loadDeleted();
var ROUTES = assembleRoutes();

/* place lookup */
function airportLabel(a){
  if(!a) return "";
  var lang=typeof currentLang==="function"?currentLang():"ru";
  var name=a.n||"";
  var ru=/[А-Яа-яЁё]/.test(name);
  var latin=(a.alias||"").split(/\s+/).filter(function(w){ return /[A-Za-z]/.test(w); }).slice(0,4).join(" ");
  if(!latin && !ru) latin=name;
  if(lang==="en" || lang==="zh") return latin || name;
  return ru ? name : (latin || name);
}
function norm(s){ return (s||"").toLowerCase().replace(/\s+/g," ").trim(); }
function nameHas(hay, needle){
  if(!needle || !hay) return false;
  if(hay===needle) return true;
  var i=0, j, before, after;
  while((j=hay.indexOf(needle, i))>=0){
    before=j===0 || /[\s\-(/]/.test(hay.charAt(j-1));
    after=j+needle.length>=hay.length || /[\s\-)/,]/.test(hay.charAt(j+needle.length));
    if(before && after) return true;
    i=j+1;
  }
  return false;
}
function place(name, code){
  var i, a, s, c, k, m;
  /* точка с карты: "Точка 55.1234, 37.5678" или "55.12, 37.56" */
  m = String(name||"").match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
  if(m){
    var la=parseFloat(m[1]), ln=parseFloat(m[2]);
    if(!isNaN(la)&&!isNaN(ln)&&la>=-85&&la<=85&&ln>=-180&&ln<=180)
      return {lat:la,lng:ln,label:"Точка "+la.toFixed(4)+", "+ln.toFixed(4),custom:1};
  }
  if(code){
    k = norm(code);
    for(i=0;i<AIRPORTS.length;i++) if(norm(AIRPORTS[i].code)===k)
      return {lat:AIRPORTS[i].lat,lng:AIRPORTS[i].lng,label:AIRPORTS[i].n+" ("+AIRPORTS[i].code+")"};
  }
  var im=String(name||"").match(/\(([A-Za-z]{3})\)\s*$/);
  if(im){
    k=norm(im[1]);
    for(i=0;i<AIRPORTS.length;i++) if(norm(AIRPORTS[i].code)===k)
      return {lat:AIRPORTS[i].lat,lng:AIRPORTS[i].lng,label:AIRPORTS[i].n+" ("+AIRPORTS[i].code+")"};
  }
  k = norm(name);
  if(!k) return null;
  /* код IATA раньше города: «MSQ». Голое «Минск» — центр города, не аэропорт. */
  for(i=0;i<AIRPORTS.length;i++){
    a = AIRPORTS[i];
    if(norm(a.code)===k) return {lat:a.lat,lng:a.lng,label:airportLabel(a)+" ("+a.code+")"};
  }
  for(i=0;i<CITIES.length;i++){
    c = CITIES[i];
    if(norm(c.n)===k) return {lat:c.lat,lng:c.lng,label:c.n};
  }
  for(i=0;i<STATIONS.length;i++){
    s = STATIONS[i];
    if(norm(s.n)===k || norm(s.id)===k) return {lat:s.lat,lng:s.lng,label:s.n};
  }
  for(i=0;i<AIRPORTS.length;i++){
    a = AIRPORTS[i];
    if(norm(a.n)===k || norm(airportLabel(a))===k || norm(airportLabel(a)+" ("+a.code+")")===k || norm(a.n+" ("+a.code+")")===k)
      return {lat:a.lat,lng:a.lng,label:airportLabel(a)+" ("+a.code+")"};
  }
  /* речные/морские порты раньше городов (Ярославль → речной) */
  if(typeof findPortByQuery==="function"){
    var fp=findPortByQuery(k);
    if(fp) return {lat:fp.lat,lng:fp.lng,label:fp.n,portId:fp.id};
  } else if(typeof PORTS!=="undefined"){
    for(i=0;i<PORTS.length;i++){
      if(/фарватер|центр/.test(PORTS[i].n)) continue;
      if(norm(PORTS[i].n)===k || portCityKey(PORTS[i].n)===k)
        return {lat:PORTS[i].lat,lng:PORTS[i].lng,label:PORTS[i].n,portId:PORTS[i].id};
    }
  }
  /* city exact */
  for(i=0;i<CITIES.length;i++){
    c = CITIES[i];
    if(norm(c.n)===k) return {lat:c.lat,lng:c.lng,label:c.n};
  }
  /* partial airport */
  for(i=0;i<AIRPORTS.length;i++){
    a = AIRPORTS[i];
    if(norm(a.code).indexOf(k)===0 || nameHas(norm(a.n), k) || (a.alias && nameHas(norm(a.alias), k)))
      return {lat:a.lat,lng:a.lng,label:a.n+" ("+a.code+")"};
  }
  for(i=0;i<STATIONS.length;i++){
    s = STATIONS[i];
    if(nameHas(norm(s.n), k)) return {lat:s.lat,lng:s.lng,label:s.n};
  }
  for(i=0;i<CITIES.length;i++){
    c = CITIES[i];
    if(nameHas(norm(c.n), k)) return {lat:c.lat,lng:c.lng,label:c.n};
  }
  var worldHit=worldPlace(name, code);
  if(worldHit) return worldHit;
  return null;
}


/* индексы для быстрого поиска (не держим весь список в DOM) */
var IDX_AIR = null, IDX_ST = null, IDX_CITY = null;
function buildIdx(){
  if(IDX_AIR) return;
  IDX_AIR = AIRPORTS.map(function(a){
    return {code:a.code, n:a.n, alias:a.alias||"", key:norm(a.code+" "+a.n+" "+(a.alias||"")), lat:a.lat, lng:a.lng};
  });
  IDX_ST = STATIONS.map(function(s){
    return {n:s.n, key:norm(s.n+" "+s.id), lat:s.lat, lng:s.lng};
  });
  IDX_CITY = CITIES.map(function(c){
    return {n:c.n, key:norm(c.n), lat:c.lat, lng:c.lng};
  });
}
function searchCatalog(mode, q, fromHint){
  buildIdx();
  q = norm(q);
  var out = [], i, it;
  if(!q || q.length < 1) return out;
  var seenVal={};
  function push(label, value, code){
    if(out.length >= 12) return;
    var k=String(value)+"|"+String(code||"");
    if(seenVal[k]) return;
    seenVal[k]=1;
    out.push({label:label, value:value, code:code});
  }
  function codeFromHint(h){
    if(!h) return null;
    var m=String(h).match(/\(([A-Z0-9]{3})\)/i);
    if(m) return m[1].toUpperCase();
    m=String(h).trim().match(/^([A-Z0-9]{3})$/i);
    if(m) return m[1].toUpperCase();
    return null;
  }
  /* ——— Самолёт: только аэропорты; «Куда» — только куда есть рейс ——— */
  if(mode==="plane"){
    var fromCode=codeFromHint(fromHint);
    for(i=0;i<IDX_AIR.length && out.length<12;i++){
      it=IDX_AIR[i];
      if(fromCode && it.code===fromCode) continue;
      if(fromCode && !flightAllowed(fromCode, it.code)) continue;
      if(norm(it.code).indexOf(q)===0) push(airportLabel(it)+" ("+it.code+")", airportLabel(it)+" ("+it.code+")", it.code);
    }
    for(i=0;i<IDX_AIR.length && out.length<12;i++){
      it=IDX_AIR[i];
      if(fromCode && it.code===fromCode) continue;
      if(fromCode && !flightAllowed(fromCode, it.code)) continue;
      if(norm(it.code).indexOf(q)===0) continue;
      if(it.key.indexOf(q)>=0) push(airportLabel(it)+" ("+it.code+")", airportLabel(it)+" ("+it.code+")", it.code);
    }
    if(out.length<12 && q.length>=2) fillWorldAir(q, fromCode, out, push);
  } else if(mode==="train"){
    /* ——— Поезд: только станции; «Куда» — есть путь по графу ЖД ——— */
    var fromRail=null;
    if(fromHint){
      var pf=place(fromHint);
      if(pf && typeof railNear==="function") fromRail=railNear(pf);
    }
    for(i=0;i<IDX_ST.length && out.length<12;i++){
      it=IDX_ST[i];
      if(it.key.indexOf(q)<0) continue;
      if(fromRail && typeof railPath==="function"){
        var pr=place(it.n);
        var toRail=pr && railNear(pr);
        if(!toRail || toRail===fromRail) continue;
        if(!railPath(fromRail, toRail)) continue;
      }
      push(it.n, it.n);
    }
  } else if(mode==="ship"){
    /* ——— Корабль: только порты; «Куда» — есть путь по воде ——— */
    var seen={}, p, fromPort=null;
    if(fromHint && typeof findPortByQuery==="function") fromPort=findPortByQuery(fromHint);
    function addPort(p){
      if(!isPassengerPort(p)||seen[p.id]||out.length>=12) return;
      if(fromPort && fromPort.id===p.id) return;
      if(fromPort && typeof portPath==="function" && !portPath(fromPort.id, p.id)) return;
      seen[p.id]=1;
      push(formatPortLabel(p), p.n, p.id);
    }
    if(PORT_ALIASES[q] && PORT_BY_ID[PORT_ALIASES[q]]) addPort(PORT_BY_ID[PORT_ALIASES[q]]);
    for(i=0;i<PORTS.length && out.length<12;i++){
      p=PORTS[i];
      if(!isPassengerPort(p)) continue;
      var nk=norm(p.n), ck=portCityKey(p.n);
      if(ck===q || nk===q || norm(formatPortLabel(p))===q) addPort(p);
    }
    for(i=0;i<PORTS.length && out.length<12;i++){
      p=PORTS[i];
      if(!isPassengerPort(p)) continue;
      nk=norm(p.n); ck=portCityKey(p.n);
      if(ck.indexOf(q)===0 || nk.indexOf(q)===0) addPort(p);
    }
    for(i=0;i<PORTS.length && out.length<12;i++){
      p=PORTS[i];
      if(!isPassengerPort(p)) continue;
      if(norm(p.n).indexOf(q)>=0 || portCityKey(p.n).indexOf(q)>=0) addPort(p);
    }
  } else {
    /* авто / пешком / вело — только города, без повторов */
    var seenCity={}, exact=[], rest=[];
    for(i=0;i<IDX_CITY.length;i++){
      it=IDX_CITY[i];
      if(seenCity[it.key]) continue;
      if(it.key===q){ seenCity[it.key]=1; exact.push(it); }
    }
    for(i=0;i<IDX_CITY.length;i++){
      it=IDX_CITY[i];
      if(seenCity[it.key]) continue;
      if(it.key.indexOf(q)>=0){ seenCity[it.key]=1; rest.push(it); }
    }
    exact.concat(rest).forEach(function(it){ push(it.n, it.n); });
    if(out.length<12 && q.length>=2) fillWorldCities(q, out, push);
  }
  return out;
}

/* Мировой справочник: грузится после карты и ищется по первым буквам, без перебора на старте. */
var WORLD={ready:false, loading:false, byCode:{}, ab:{}, cb:{}, air:null, cities:null};
function foldQ(s){ return norm(s).replace(/ё/g,"е"); }
function worldBucket(map, key, idx){
  var b=map[key];
  if(!b) map[key]=[idx];
  else b.push(idx);
}
function indexWorldAir(row, idx){
  var rec={code:row[0], n:row[1], lat:row[2], lng:row[3]};
  WORLD.byCode[rec.code]=rec;
  var keys={}, f=foldQ(rec.code), parts, i;
  if(f.length>=2) keys[f.slice(0,2)]=1;
  f=foldQ(rec.n);
  if(f.length>=2) keys[f.slice(0,2)]=1;
  parts=f.split(" ");
  if(parts[0] && parts[0].length>=2) keys[parts[0].slice(0,2)]=1;
  for(i in keys) if(i.length>=2) worldBucket(WORLD.ab, i, idx);
}
function indexWorldCity(row, idx){
  var names=[row[0]], i, f, key, seen={};
  if(row[3]) names=names.concat(String(row[3]).split("|"));
  for(i=0;i<names.length;i++){
    f=foldQ(names[i]);
    if(f.length<2) continue;
    key=f.slice(0,2);
    if(seen[key]) continue;
    seen[key]=1;
    worldBucket(WORLD.cb, key, idx);
  }
}
function worldCityLabel(row, q){
  var names=[row[0]], i, f, best=null, bestRank=1e9, rank;
  if(row[3]) names=names.concat(String(row[3]).split("|"));
  for(i=0;i<names.length;i++){
    if(!names[i]) continue;
    f=foldQ(names[i]);
    if(f!==q && f.indexOf(q)!==0) continue;
    rank=(f===q?0:100)+names[i].length+(/[ёЁ]/.test(names[i])?1:0)+i*0.001;
    if(rank<bestRank){ bestRank=rank; best=names[i]; }
  }
  return best;
}
function fillWorldAir(q, fromCode, out, push){
  if(!WORLD.ready) return;
  var fq=foldQ(q);
  if(fq.length<2) return;
  var ids=WORLD.ab[fq.slice(0,2)];
  if(!ids) return;
  var seen={}, i, row, rec, label;
  function take(codeOnly){
    for(i=0;i<ids.length;i++){
      if(out.length>=12) return;
      if(seen[ids[i]]) continue;
      row=WORLD.air[ids[i]];
      rec=WORLD.byCode[row[0]];
      if(!rec) continue;
      if(fromCode && rec.code===fromCode) continue;
      if(fromCode && !flightAllowed(fromCode, rec.code)) continue;
      var codeHit=foldQ(rec.code).indexOf(fq)===0;
      var nameHit=foldQ(rec.n).indexOf(fq)===0;
      if(codeOnly){ if(!codeHit) continue; }
      else if(codeHit || !nameHit) continue;
      seen[ids[i]]=1;
      label=airportLabel(rec)+" ("+rec.code+")";
      push(label, label, rec.code);
    }
  }
  take(true);
  take(false);
}
function fillWorldCities(q, out, push){
  if(!WORLD.ready) return;
  var fq=foldQ(q);
  if(fq.length<2) return;
  var ids=WORLD.cb[fq.slice(0,2)];
  if(!ids) return;
  var seen={}, i, row, label;
  for(i=0;i<ids.length;i++){
    if(out.length>=12) return;
    if(seen[ids[i]]) continue;
    seen[ids[i]]=1;
    row=WORLD.cities[ids[i]];
    label=worldCityLabel(row, fq);
    if(!label) continue;
    push(label, label);
  }
}
function worldPlace(name, code){
  if(!WORLD.ready) return null;
  var up=code?String(code).toUpperCase():"";
  var rec, raw, im, q, ids, i, row, label, best, cm, cc;
  if(up && WORLD.byCode[up]){
    rec=WORLD.byCode[up];
    return {lat:rec.lat,lng:rec.lng,label:rec.n+" ("+rec.code+")"};
  }
  raw=String(name||"");
  im=raw.match(/\(([A-Za-z]{3})\)/);
  if(im && WORLD.byCode[im[1].toUpperCase()]){
    rec=WORLD.byCode[im[1].toUpperCase()];
    return {lat:rec.lat,lng:rec.lng,label:rec.n+" ("+rec.code+")"};
  }
  cc=null;
  cm=raw.trim().match(/,\s*([A-Za-z]{2})$/);
  if(cm){ cc=cm[1].toUpperCase(); raw=raw.trim().slice(0, cm.index).trim(); }
  q=foldQ(raw);
  if(/^[a-z]{3}$/.test(q) && WORLD.byCode[q.toUpperCase()]){
    rec=WORLD.byCode[q.toUpperCase()];
    return {lat:rec.lat,lng:rec.lng,label:rec.n+" ("+rec.code+")"};
  }
  if(q.length<2) return null;
  ids=WORLD.cb[q.slice(0,2)];
  best=null;
  if(ids){
    for(i=0;i<ids.length;i++){
      row=WORLD.cities[ids[i]];
      if(cc && row[4]!==cc) continue;
      label=worldCityLabel(row, q);
      if(!label) continue;
      best={lat:row[1],lng:row[2],label:label};
      if(foldQ(label)===q) break;
    }
  }
  if(best && foldQ(best.label)===q) return best;
  ids=WORLD.ab[q.slice(0,2)];
  if(ids){
    for(i=0;i<ids.length;i++){
      row=WORLD.air[ids[i]];
      if(foldQ(row[1])===q || foldQ(row[0])===q) return {lat:row[2],lng:row[3],label:row[1]+" ("+row[0]+")"};
    }
  }
  return best;
}
var _wrmQ=null, _wrm=null;
function worldRegionMap(q){
  var fq=foldQ(q);
  if(_wrm && _wrmQ===fq) return _wrm;
  _wrmQ=fq;
  _wrm={};
  if(!WORLD.ready || fq.length<2) return _wrm;
  var ids=WORLD.cb[fq.slice(0,2)];
  if(!ids) return _wrm;
  var i, row, label, n=0, cid, rid, seen={};
  for(i=0;i<ids.length && n<24;i++){
    if(seen[ids[i]]) continue;
    row=WORLD.cities[ids[i]];
    label=worldCityLabel(row, fq);
    if(!label) continue;
    seen[ids[i]]=1;
    n++;
    if(typeof countryAt!=="function") continue;
    cid=countryAt(row[1], row[2]);
    rid=cid && typeof regionIn==="function"?regionIn(cid, row[1], row[2]):null;
    if(rid && !_wrm[rid]) _wrm[rid]=label;
  }
  return _wrm;
}
function loadWorldPlacesMain(){
  WORLD.loading=true;
  fetch("./geo/places.json?v=1").then(function(r){
    if(!r.ok) throw new Error("places");
    return r.json();
  }).then(function(data){
    WORLD.air=data.a||[];
    WORLD.cities=data.c||[];
    var ai=0, ci=0;
    function step(){
      var t0=Date.now();
      while(ai<WORLD.air.length && Date.now()-t0<12){ indexWorldAir(WORLD.air[ai], ai); ai++; }
      while(ai>=WORLD.air.length && ci<WORLD.cities.length && Date.now()-t0<12){ indexWorldCity(WORLD.cities[ci], ci); ci++; }
      if(ai<WORLD.air.length || ci<WORLD.cities.length) setTimeout(step, 0);
      else {
        WORLD.ready=true;
        if(typeof render==="function") render();
      }
    }
    setTimeout(step, 0);
  }).catch(function(){ WORLD.loading=false; });
}
function loadWorldPlaces(){
  if(WORLD.loading || WORLD.ready) return;
  WORLD.loading=true;
  if(!window.Worker){ WORLD.loading=false; loadWorldPlacesMain(); return; }
  var w;
  try{ w=new Worker("src/places.worker.js?v=1"); }
  catch(e){ WORLD.loading=false; loadWorldPlacesMain(); return; }
  var done=false;
  var timer=setTimeout(function(){ fail(); }, 25000);
  function fail(){
    if(done) return;
    done=true;
    clearTimeout(timer);
    try{ w.terminate(); }catch(err){}
    WORLD.loading=false;
    loadWorldPlacesMain();
  }
  w.onerror=function(){ fail(); };
  w.onmessage=function(ev){
    var data=ev.data||{};
    if(done) return;
    if(!data.ok){ fail(); return; }
    done=true;
    clearTimeout(timer);
    WORLD.air=data.air||[];
    WORLD.cities=data.cities||[];
    WORLD.byCode=data.byCode||{};
    WORLD.ab=data.ab||{};
    WORLD.cb=data.cb||{};
    WORLD.ready=true;
    try{ w.terminate(); }catch(err){}
    if(typeof render==="function") render();
  };
}

