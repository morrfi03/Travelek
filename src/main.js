/* Точка входа. Браузер сам грузит обычные файлы.
   Сборки Vite нет: Layero отдаёт репозиторий как статику. */
var v = "17";
function load(path){
  return import(path + "?v=" + v);
}
load("./gate.js")
  .then(function(){ return load("../geo/atlas-data.js"); })
  .then(function(){ return load("./atlas.js"); })
  .then(function(){ return load("./travelek.js"); })
  .then(function(){ return load("./accounts.js"); })
  .catch(function(err){
    console.error(err);
    var box = document.getElementById("map");
    if(box) box.insertAdjacentHTML("afterbegin", "<p style=\"position:absolute;left:16px;right:16px;top:40%;text-align:center;color:#0c1b33;background:#fff;padding:14px 16px;border-radius:14px\">Не удалось открыть дневник. Обновите страницу.</p>");
  });
