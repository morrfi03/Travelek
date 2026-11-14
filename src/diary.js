import { isFuture } from "./when.js?v=72";
export function upsertTrip(trips, trip) {
    return [trip].concat(trips.filter(function (item) { return item.id !== trip.id; }));
}
export function removeTrip(trips, id) {
    return trips.filter(function (item) { return item.id !== id; });
}
export function rememberDeleted(ids, id) {
    if (!id || ids.indexOf(id) >= 0)
        return ids.slice();
    return ids.concat(id);
}
export function withoutRoute(extra, id) {
    return extra.filter(function (item) { return item.id !== id; });
}
export function filterRoutes(routes, tab, opt) {
    const year = opt && opt.year && opt.year !== "all" ? opt.year : "";
    const mode = opt && opt.mode && opt.mode !== "all" ? opt.mode : "";
    const dated = tab === "future" || tab === "past";
    return routes.filter(function (route) {
        if (tab === "future" && !isFuture(route))
            return false;
        if (tab === "past" && isFuture(route))
            return false;
        if (dated && year && (route.date || "").slice(0, 4) !== year)
            return false;
        if (mode && route.mode !== mode)
            return false;
        return true;
    }).slice().sort(function (a, b) {
        return ((a.date || "") + " " + (a.time || "")).localeCompare((b.date || "") + " " + (b.time || ""));
    });
}
export function regionsOnTab(routes, tab, regionsOf) {
    const seen = {};
    const out = [];
    filterRoutes(routes, tab).forEach(function (route) {
        regionsOf(route).forEach(function (id) {
            if (!id || seen[id])
                return;
            seen[id] = true;
            out.push(id);
        });
    });
    return out;
}
