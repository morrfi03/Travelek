(function(){
  var URL="https://keepjson.fourlegs.workers.dev/bins/BkoU663gNtadZ-zfQvPYx";
  var KEY="kj_w_qgNZJtClt_6vg01Eq5c8j1wpxzMTpSzUKrazvkb12AY";
  var HUES=["#3b82f6","#34d399","#a78bfa","#f59e0b","#fb7185","#22d3ee"];
  function leaveForeign(e){
    var back=e.target&&e.target.closest?e.target.closest("#view-banner button,#back-own"):null;
    if(!back) return;
    e.preventDefault();
    e.stopPropagation();
    try{ sessionStorage.removeItem("travelek-view"); }catch(err){}
    location.replace(location.pathname+location.search);
  }
  document.addEventListener("click", leaveForeign, true);
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
    function home(){ try{ sessionStorage.removeItem("travelek-view"); }catch(e){} location.replace(location.pathname+location.search); }
    var own=document.getElementById("back-own");
    if(own){ own.hidden=false; own.onclick=home; }
    document.body.classList.add("foreign-diary");
    var banner=document.getElementById("view-banner");
    if(banner){
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
