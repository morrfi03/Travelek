/* Экран отдаёт карту и подписи сюда. Облако и дороги его не импортируют. */
var state = {};
export function bindScreen(api) { state = api || {}; }
function read(name) {
    var g = state[name];
    return typeof g === "function" ? g() : undefined;
}
function call(name, args) {
    var f = state[name];
    if (typeof f !== "function")
        return undefined;
    return f.apply(null, args);
}
export var ui = {};
["map", "globeOn", "activeTab", "layer", "selectedTripId"].forEach(function (k) {
    Object.defineProperty(ui, k, { get: function () { return read(k); }, enumerable: true });
});
["t", "render", "countryAt", "countryLabel", "countryRecord", "ofCount", "loadTrips", "shortPlaceLabel", "currentLang", "regionIn", "syncVisited", "drawCountries"].forEach(function (k) {
    ui[k] = function () { return call(k, arguments); };
});
