(function(){
  if(window.__TRAVELEK_PRIVATE) return;
  var USERS="travelek-users", SESSION="travelek-session";
  function users(){
    try{ var u=JSON.parse(localStorage.getItem(USERS)||"[]"); if(Array.isArray(u)) return u; }catch(e){}
    return [];
  }
  var gate=document.getElementById("file-login");
  var form=document.getElementById("file-login-form");
  if(!gate || !form) return;
  var sid=null;
  try{ sid=localStorage.getItem(SESSION); }catch(e){}
  var list=users(), i, me=null;
  for(i=0;i<list.length;i++) if(list[i].id===sid) me=list[i];
  if(!me) gate.style.display="flex";
  if(!list.length){
    var hint=form.querySelector("p");
    if(hint) hint.textContent="Аккаунтов ещё нет. Придумайте логин и пароль от 8 символов. Они сохранятся только на устройстве, не в коде.";
    form.dataset.setup="1";
  }
  form.addEventListener("submit", function(e){
    e.preventDefault();
    var err=document.getElementById("file-login-err");
    if(form.dataset.setup==="1"){
      var login=document.getElementById("file-login-name").value.trim();
      var pass=document.getElementById("file-login-pass").value;
      if(login.length<2 || pass.length<8){ if(err) err.textContent="Логин от 2 символов, пароль от 8"; return; }
      function make(){
        if(!window.__createFirst){ if(err) err.textContent="Подождите секунду и нажмите ещё раз"; return; }
        window.__createFirst(login, pass);
      }
      if(window.__TRAVELEK_STORE_READY) make();
      else setTimeout(make, 400);
      return;
    }
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
