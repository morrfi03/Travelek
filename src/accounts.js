(function(){
  var URL="https://keepjson.fourlegs.workers.dev/bins/BkoU663gNtadZ-zfQvPYx";
  var KEY="kj_w_qgNZJtClt_6vg01Eq5c8j1wpxzMTpSzUKrazvkb12AY";
  var HUES=["#3b82f6","#34d399","#a78bfa","#f59e0b","#fb7185","#22d3ee"];
  function say(msg){
    var el=document.getElementById("acct-err");
    if(el) el.textContent=msg||"";
  }
  function loginOf(u){
    return String((u&&(u.login||u.email))||"").toLowerCase().replace(/@travelek\.app$/,"").trim();
  }
  function sha256(text){
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(text||""))).then(function(buf){
      var a=new Uint8Array(buf), s="", i;
      for(i=0;i<a.length;i++) s+=("0"+a[i].toString(16)).slice(-2);
      return s;
    });
  }
  function load(){
    return fetch(URL+"?t="+Date.now(),{cache:"no-store"}).then(function(r){
      if(!r.ok) throw new Error("Список не загрузился");
      return r.json();
    }).then(function(data){
      if(!data||!Array.isArray(data.users)) throw new Error("Список не загрузился");
      return data;
    });
  }
  function save(data){
    return fetch(URL,{
      method:"PUT",
      headers:{"Content-Type":"application/json","Authorization":"Bearer "+KEY},
      body:JSON.stringify({users:data.users, vault:data.vault||{}, deleted:data.deleted||[]})
    }).then(function(r){
      if(!r.ok) throw new Error("Не удалось сохранить");
      try{ localStorage.setItem("travelek-users", JSON.stringify(data.users)); }catch(e){}
    });
  }
  function me(){
    var sid="";
    try{ sid=localStorage.getItem("travelek-session")||""; }catch(e){}
    var id=(window.__TRAVELEK_ME&&window.__TRAVELEK_ME.id)||sid;
    var email=window.__TRAVELEK_ME&&(window.__TRAVELEK_ME.email||window.__TRAVELEK_ME.login);
    return {id:id, login:String(email||"").toLowerCase()};
  }
  function draw(users){
    var list=document.getElementById("admin-list");
    var title=document.getElementById("accounts-title");
    if(!list) return;
    var rows=users||[];
    if(title) title.textContent="Аккаунты · "+rows.length;
    if(!rows.length){
      list.innerHTML='<p class="hint">В облаке пусто</p>';
      return;
    }
    var mine=me();
    list.innerHTML=rows.map(function(u,i){
      var login=loginOf(u);
      var own=(mine.id && u.id===mine.id) || (mine.login && login===mine.login);
      var letter=String(u.name||login||"?").charAt(0).toUpperCase();
      var role=login==="admin"?"админ":"пользователь";
      var buttons=own?"":'<button type="button" data-user="'+u.id+'">Смотреть карту</button><button type="button" data-pass="'+u.id+'" data-login="'+login+'">Пароль</button><button type="button" data-del="'+u.id+'" data-login="'+login+'">Удалить</button>';
      return '<div class="admin-row"><span class="avatar" style="background:'+HUES[i%HUES.length]+'">'+letter+'</span><div class="who"><b>'+(u.name||login)+'</b><div class="route-line">'+login+" · "+role+'</div></div>'+buttons+'</div>';
    }).join("");
  }
  function paint(){
    var list=document.getElementById("admin-list");
    if(list && !list.children.length) list.innerHTML='<p class="hint">Загрузка…</p>';
    load().then(function(data){
      draw(data.users);
      say("");
    }).catch(function(e){
      say(e&&e.message?e.message:"Список не загрузился");
    });
  }
  window.__paintAccounts=paint;
  function create(){
    var loginEl=document.getElementById("new-login");
    var p1=document.getElementById("new-pass");
    var p2=document.getElementById("new-pass2");
    var login=String(loginEl&&loginEl.value||"").trim().toLowerCase();
    var pass=String(p1&&p1.value||"");
    var pass2=String(p2&&p2.value||"");
    if(login.length<2){ say("Логин слишком короткий"); return; }
    if(pass.length<8){ say("Пароль короче 8 символов"); return; }
    if(pass!==pass2){ say("Пароли не совпадают"); return; }
    say("Сохраняем…");
    load().then(function(data){
      var self=me(), i, row=null;
      for(i=0;i<data.users.length;i++){
        if(data.users[i].id===self.id || loginOf(data.users[i])===self.login) row=data.users[i];
        if(loginOf(data.users[i])===login) throw new Error("Такой логин уже есть");
      }
      if(!row || loginOf(row)!=="admin") throw new Error("Создавать аккаунты может только admin");
      return sha256(pass).then(function(h){
        data.users.push({id:"u"+Date.now(), login:login, name:login, password:h, role:"user", mustChange:true, rev:Date.now()});
        return save(data);
      });
    }).then(function(){
      if(loginEl) loginEl.value="";
      if(p1) p1.value="";
      if(p2) p2.value="";
      say("Аккаунт создан");
      paint();
    }).catch(function(e){
      say(e&&e.message?e.message:"Не удалось создать");
    });
  }
  var btn=document.getElementById("new-user");
  if(btn) btn.onclick=function(e){ e.preventDefault(); e.stopPropagation(); create(); };
  var list=document.getElementById("admin-list");
  if(list) list.onclick=function(e){
    var passBtn=e.target.closest("[data-pass]");
    if(passBtn){
      e.preventDefault();
      var login=passBtn.getAttribute("data-login")||"пользователя";
      var p1=window.prompt("Новый пароль для "+login+". Минимум 8 символов");
      if(!p1) return;
      var p2=window.prompt("Повторите пароль");
      if(p1!==p2){ say("Пароли не совпадают"); return; }
      if(p1.length<8){ say("Пароль короче 8 символов"); return; }
      var id=passBtn.getAttribute("data-pass");
      say("Меняем пароль…");
      load().then(function(data){
        var i, row=null;
        for(i=0;i<data.users.length;i++) if(data.users[i].id===id) row=data.users[i];
        if(!row) throw new Error("Аккаунт не найден");
        return sha256(p1).then(function(h){
          row.password=h;
          row.mustChange=true;
          row.rev=Date.now();
          if(loginOf(row)==="vlad100") row.vladReset="1";
          return save(data);
        });
      }).then(function(){ say("Пароль для "+login+" изменён"); }).catch(function(err){ say(err.message||"Не удалось сменить пароль"); });
      return;
    }
    var del=e.target.closest("[data-del]");
    if(del){
      e.preventDefault();
      var who=del.getAttribute("data-login")||"аккаунт";
      if(!confirm("Удалить "+who+"?")) return;
      var id=del.getAttribute("data-del");
      say("Удаляем…");
      load().then(function(data){
        data.users=data.users.filter(function(u){ return u.id!==id; });
        data.deleted=data.deleted||[];
        if(data.deleted.indexOf(id)<0) data.deleted.push(id);
        if(data.vault) delete data.vault[id];
        return save(data);
      }).then(function(){ say("Удалено"); paint(); }).catch(function(err){ say(err.message||"Не удалось удалить"); });
      return;
    }
    var open=e.target.closest("[data-user]");
    if(open && !e.target.closest("[data-pass]") && !e.target.closest("[data-del]")){
      try{ sessionStorage.setItem("travelek-view", open.getAttribute("data-user")); }catch(err){}
      location.reload();
    }
  };
  paint();
  var view="";
  try{ view=sessionStorage.getItem("travelek-view")||""; }catch(e){}
  var sid="";
  try{ sid=localStorage.getItem("travelek-session")||""; }catch(e){}
  if(view && view!==sid){
    function home(){ try{ sessionStorage.removeItem("travelek-view"); }catch(e){} location.reload(); }
    var own=document.getElementById("back-own");
    if(own){ own.hidden=false; own.onclick=home; }
    var banner=document.getElementById("view-banner");
    if(banner && !banner.querySelector("button")){
      banner.hidden=false;
      banner.innerHTML="<span>Чужой дневник</span>";
      var back=document.createElement("button");
      back.type="button";
      back.textContent="К своей карте";
      back.onclick=home;
      banner.appendChild(back);
    }
  }
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

