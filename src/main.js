/* Точка входа. Дневник — четыре отдельных файла, не один сплошной скрипт.
   Сборки Vite нет: Layero отдаёт репозиторий как статику. */
var v = "18";
function classic(path){
  return new Promise(function(resolve, reject){
    var s = document.createElement("script");
    s.src = path + "?v=" + v;
    s.async = false;
    s.onload = function(){ resolve(); };
    s.onerror = function(){ reject(new Error(path)); };
    document.head.appendChild(s);
  });
}
var files = [
  "./gate.js",
  "../geo/atlas-data.js",
  "./atlas.js",
  "./parts/01-catalog.js",
  "./parts/02-cloud.js",
  "./parts/03-roads.js",
  "./parts/04-app.js",
  "./accounts.js"
];
files.reduce(function(chain, path){
  return chain.then(function(){ return classic(path); });
}, Promise.resolve()).catch(function(err){
  console.error(err);
  var box = document.getElementById("map");
  if(box) box.insertAdjacentHTML("afterbegin", "<p style=\"position:absolute;left:16px;right:16px;top:40%;text-align:center;color:#0c1b33;background:#fff;padding:14px 16px;border-radius:14px\">Не удалось открыть дневник. Обновите страницу.</p>");
});
