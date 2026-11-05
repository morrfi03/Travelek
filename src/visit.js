import { datedPast, isFuture } from "./when.js?v=52";
export function countriesToPaint(countries, regions) {
    const out = [];
    const seen = {};
    function add(id) {
        if (!id || seen[id])
            return;
        seen[id] = true;
        out.push(id);
    }
    (countries || []).forEach(function (id) { add(id); });
    (regions || []).forEach(function (id) {
        if (!id)
            return;
        const cut = String(id).indexOf(":");
        add(cut > 0 ? String(id).slice(0, cut) : "RU");
    });
    return out;
}
function countryOfId(id) {
    const cut = String(id || "").indexOf(":");
    return cut > 0 ? String(id).slice(0, cut) : "RU";
}
function pointSig(point) {
    if (!point)
        return "";
    const row = point;
    if (row.lat != null || row.lng != null)
        return String(row.lat) + "," + String(row.lng);
    return String(row[0]) + "," + String(row[1]);
}
export function routeBagKey(route) {
    if (!route)
        return "";
    const coords = route.coords || [];
    const ends = coords.length ? coords.length + ":" + pointSig(coords[0]) + ":" + pointSig(coords[coords.length - 1]) : "";
    return [
        route.id || "",
        route.date || "",
        route.time || "",
        route.arrDate || "",
        route.arrTime || "",
        route.from || "",
        route.to || "",
        route.fromCode || "",
        route.toCode || "",
        route.mode || "",
        ends
    ].join("|");
}
function two(n) {
    return (n < 10 ? "0" : "") + n;
}
/** Минута местного времени. Без неё кэш syncVisited не замечает, что дата поездки уже наступила. */
export function visitClock(now) {
    const clock = now || new Date();
    return clock.getFullYear() + "-" + two(clock.getMonth() + 1) + "-" + two(clock.getDate())
        + " " + two(clock.getHours()) + ":" + two(clock.getMinutes());
}
export function placesVisitKey(opt) {
    const routes = (opt.routes || []).map(routeBagKey).join(";");
    const trips = (opt.trips || []).map(function (trip) {
        return [
            trip && trip.id || "",
            (trip && trip.countries || []).join(","),
            (trip && trip.regions || []).join(","),
            (trip && trip.routes || []).join(",")
        ].join("~");
    }).join(";");
    return [
        opt.tab || "",
        opt.selectedTripId || "",
        (opt.manualCountries || []).join(","),
        (opt.offCountries || []).join(","),
        (opt.manualRegions || []).join(","),
        (opt.offRegions || []).join(","),
        routes,
        trips,
        opt.geo || "",
        visitClock(opt.now)
    ].join("|");
}
export function regionMatches(marks, entity) {
    if (!marks || !entity)
        return false;
    const name = entity.name || "";
    const rid = entity.rid || "";
    const iso = entity.iso || (entity.layer === "R" ? "RU" : entity.layer === "C" ? "CN" : "");
    if (rid && marks[rid])
        return true;
    if (iso && name && marks[iso + ":" + name])
        return true;
    if (!name || !marks[name] || name.indexOf(":") >= 0)
        return false;
    return !iso || iso === "RU";
}
export function marksForTab(opt) {
    const tab = opt.tab === "future" ? "future" : "past";
    const other = tab === "future" ? "past" : "future";
    const routes = opt.routes || [];
    const trips = opt.trips || [];
    const countryOf = opt.countryOf || countryOfId;
    const offC = opt.offCountries || [];
    const offR = opt.offRegions || [];
    const countries = [];
    const regions = [];
    const seenC = {};
    const seenR = {};
    const autoC = {};
    const autoR = {};
    const byId = {};
    const futureRegion = {};
    const pastRegion = {};
    routes.forEach(function (route) {
        if (route && route.id)
            byId[route.id] = route;
    });
    function note(route) {
        const bucket = isFuture(route) ? futureRegion : datedPast(route) ? pastRegion : null;
        if (!bucket)
            return;
        (route.regions || []).forEach(function (id) { if (id)
            bucket[id] = true; });
    }
    routes.forEach(note);
    trips.forEach(function (trip) {
        if (!trip || (opt.selectedTripId && trip.id !== opt.selectedTripId))
            return;
        const live = (trip.routes || []).map(function (id) { return byId[id]; }).filter(Boolean);
        const fut = live.some(isFuture);
        const past = live.some(datedPast);
        if (fut && !past)
            (trip.regions || []).forEach(function (id) { if (id)
                futureRegion[id] = true; });
        if (past && !fut)
            (trip.regions || []).forEach(function (id) { if (id)
                pastRegion[id] = true; });
    });
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
        if (tab === "past" && futureRegion[id] && !pastRegion[id])
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
    trips.forEach(function (trip) {
        if (!trip || (opt.selectedTripId && trip.id !== opt.selectedTripId))
            return;
        const ids = trip.routes || [];
        if (!ids.length) {
            if (tab !== "past")
                return;
            (trip.countries || []).forEach(function (id) { addC(id, false); });
            (trip.regions || []).forEach(function (id) { addR(id, false); });
            return;
        }
        const live = ids.map(function (id) { return byId[id]; }).filter(Boolean);
        const here = live.some(function (route) { return onTab(route, tab); });
        const there = live.some(function (route) { return onTab(route, other); });
        if (!here || there)
            return;
        (trip.countries || []).forEach(function (id) { addC(id, true); });
        (trip.regions || []).forEach(function (id) { addR(id, true); });
    });
    return { countries: countries, regions: regions };
}
