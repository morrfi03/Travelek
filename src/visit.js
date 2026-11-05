import { datedPast, isFuture } from "./when.js?v=47";
function countryOfId(id) {
    const cut = String(id || "").indexOf(":");
    return cut > 0 ? String(id).slice(0, cut) : "RU";
}
export function marksForTab(opt) {
    const tab = opt.tab === "future" ? "future" : "past";
    const routes = opt.routes || [];
    const countryOf = opt.countryOf || countryOfId;
    const offC = opt.offCountries || [];
    const offR = opt.offRegions || [];
    const countries = [];
    const regions = [];
    const seenC = {};
    const seenR = {};
    const autoC = {};
    const autoR = {};
    function onTab(route, which) {
        if (which === "future")
            return isFuture(route);
        return datedPast(route);
    }
    function addC(id, auto) {
        if (!id || seenC[id])
            return;
        if (!auto && offC.indexOf(id) >= 0 && !autoC[id])
            return;
        if (auto)
            autoC[id] = true;
        seenC[id] = true;
        countries.push(id);
    }
    function addR(id, auto) {
        if (!id || seenR[id])
            return;
        if (!auto && offR.indexOf(id) >= 0 && !autoR[id])
            return;
        const parent = countryOf(id);
        if (!auto && parent && offC.indexOf(parent) >= 0 && !autoC[parent] && !autoR[id])
            return;
        if (auto)
            autoR[id] = true;
        seenR[id] = true;
        regions.push(id);
        if (parent)
            addC(parent, auto);
    }
    routes.forEach(function (route) {
        if (!route || !onTab(route, tab))
            return;
        (route.countries || []).forEach(function (id) { addC(id, true); });
        (route.regions || []).forEach(function (id) { addR(id, true); });
    });
    if (tab === "past") {
        (opt.manualCountries || []).forEach(function (id) { addC(id, false); });
        (opt.manualRegions || []).forEach(function (id) { addR(id, false); });
    }
    (opt.trips || []).forEach(function (trip) {
        if (!trip)
            return;
        if (opt.selectedTripId && trip.id !== opt.selectedTripId)
            return;
        const ids = trip.routes || [];
        if (ids.length)
            return;
        if (tab !== "past")
            return;
        (trip.countries || []).forEach(function (id) { addC(id, false); });
        (trip.regions || []).forEach(function (id) { addR(id, false); });
    });
    return { countries: countries, regions: regions };
}
