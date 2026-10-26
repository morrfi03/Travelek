(function(){
  if(window.__TRAVELEK_PRIVATE) return;
  var USERS="travelek-users", SESSION="travelek-session", REV="4";
  function users(){
    var u=null, i, admin=null, next=[], seen=false, L;
    try{ u=JSON.parse(localStorage.getItem(USERS)||""); }catch(e){ u=null; }
    if(!Array.isArray(u)) u=[];
    var rev="";
    try{ rev=localStorage.getItem("travelek-auth-rev")||""; }catch(e){}
    if(rev!==REV){
      for(i=0;i<u.length;i++){
        L=String((u[i]&&(u[i].login||u[i].email))||"").toLowerCase().replace(/@travelek\.app$/,"");
        if(u[i] && (u[i].id==="admin" || u[i].role==="admin" || L==="admin")){
          if(!seen){ next.push({id:"admin", login:"admin", name:"Администратор", password:"Travelek#Admin89", role:"admin"}); seen=true; }
        } else next.push(u[i]);
      }
      if(!seen) next.unshift({id:"admin", login:"admin", name:"Администратор", password:"Travelek#Admin89", role:"admin"});
      u=next;
      try{
        localStorage.setItem(USERS, JSON.stringify(u));
        localStorage.setItem("travelek-auth-rev", REV);
      }catch(e){}
    }
    for(i=0;i<u.length;i++) if(u[i] && (u[i].id==="admin" || String(u[i].login||"").toLowerCase()==="admin")) admin=u[i];
    if(!admin){
      u.unshift({id:"admin", login:"admin", name:"Администратор", password:"Travelek#Admin89", role:"admin"});
      try{ localStorage.setItem(USERS, JSON.stringify(u)); }catch(e){}
    }
    return u;
  }
  var gate=document.getElementById("file-login");
  var form=document.getElementById("file-login-form");
  if(!gate || !form) return;
  var sid=null;
  try{ sid=localStorage.getItem(SESSION); }catch(e){}
  var list=users(), i, me=null;
  for(i=0;i<list.length;i++) if(list[i].id===sid) me=list[i];
  if(!me) gate.style.display="flex";
  form.addEventListener("submit", function(e){
    e.preventDefault();
    var err=document.getElementById("file-login-err");
    function show(ok){ if(!ok && err) err.textContent="Неверный логин или пароль"; }
    function go(){
      if(!window.__localLogin){ show(false); return; }
      var ret=window.__localLogin(document.getElementById("file-login-name").value, document.getElementById("file-login-pass").value);
      if(ret && ret.then) ret.then(show).catch(function(){ show(false); });
      else show(!!ret);
    }
    if(err) err.textContent="Проверяем…";
    if(window.__TRAVELEK_STORE_READY) go();
    else {
      var n=0, t=setInterval(function(){
        if(window.__TRAVELEK_STORE_READY || ++n>80){ clearInterval(t); go(); }
      }, 100);
    }
  });
})();
