import { datedPast, isFuture } from "./when.js";

export type VisitRoute = {
  id: string;
  date?: string;
  time?: string;
  arrDate?: string;
  arrTime?: string;
  from?: string;
  to?: string;
  fromCode?: string;
  toCode?: string;
  mode?: string;
  coords?: unknown[];
  countries?: string[];
  regions?: string[];
};

export type VisitTrip = {
  id: string;
  countries?: string[];
  regions?: string[];
  routes?: string[];
};

function countryOfId(id: string): string {
  const cut = String(id || "").indexOf(":");
  return cut > 0 ? String(id).slice(0, cut) : "RU";
}

function pointSig(point: unknown): string {
  if (!point) return "";
  const row = point as { lat?: number; lng?: number; 0?: number; 1?: number };
  if (row.lat != null || row.lng != null) return String(row.lat) + "," + String(row.lng);
  return String(row[0]) + "," + String(row[1]);
}

export function routeBagKey(route: VisitRoute | null | undefined): string {
  if (!route) return "";
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

export function placesVisitKey(opt: {
  tab?: string;
  selectedTripId?: string;
  manualCountries?: string[];
  manualRegions?: string[];
  offCountries?: string[];
  offRegions?: string[];
  routes?: VisitRoute[];
  trips?: VisitTrip[];
  geo?: string;
}): string {
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
    opt.geo || ""
  ].join("|");
}

export function regionMatches(marks: Record<string, unknown> | null | undefined, entity: { name?: string; rid?: string; iso?: string; layer?: string } | null | undefined): boolean {
  if (!marks || !entity) return false;
  const name = entity.name || "";
  const rid = entity.rid || "";
  const iso = entity.iso || (entity.layer === "R" ? "RU" : entity.layer === "C" ? "CN" : "");
  if (rid && marks[rid]) return true;
  if (iso && name && marks[iso + ":" + name]) return true;
  if (!name || !marks[name] || name.indexOf(":") >= 0) return false;
  return !iso || iso === "RU";
}

export function marksForTab(opt: {
  tab: string;
  routes?: VisitRoute[];
  trips?: VisitTrip[];
  manualCountries?: string[];
  manualRegions?: string[];
  offCountries?: string[];
  offRegions?: string[];
  selectedTripId?: string;
  countryOf?: (id: string) => string;
}): { countries: string[]; regions: string[] } {
  const tab = opt.tab === "future" ? "future" : "past";
  const other = tab === "future" ? "past" : "future";
  const routes = opt.routes || [];
  const trips = opt.trips || [];
  const countryOf = opt.countryOf || countryOfId;
  const offC = opt.offCountries || [];
  const offR = opt.offRegions || [];
  const countries: string[] = [];
  const regions: string[] = [];
  const seenC: Record<string, true> = {};
  const seenR: Record<string, true> = {};
  const autoC: Record<string, true> = {};
  const autoR: Record<string, true> = {};
  const byId: Record<string, VisitRoute> = {};
  const futureRegion: Record<string, true> = {};
  const pastRegion: Record<string, true> = {};

  routes.forEach(function (route) {
    if (route && route.id) byId[route.id] = route;
  });
  function note(route: VisitRoute) {
    const bucket = isFuture(route) ? futureRegion : datedPast(route) ? pastRegion : null;
    if (!bucket) return;
    (route.regions || []).forEach(function (id) { if (id) bucket[id] = true; });
  }
  routes.forEach(note);
  trips.forEach(function (trip) {
    if (!trip || (opt.selectedTripId && trip.id !== opt.selectedTripId)) return;
    const live = (trip.routes || []).map(function (id) { return byId[id]; }).filter(Boolean) as VisitRoute[];
    const fut = live.some(isFuture);
    const past = live.some(datedPast);
    if (fut && !past) (trip.regions || []).forEach(function (id) { if (id) futureRegion[id] = true; });
    if (past && !fut) (trip.regions || []).forEach(function (id) { if (id) pastRegion[id] = true; });
  });

  function onTab(route: VisitRoute, which: string): boolean {
    if (which === "future") return isFuture(route);
    return datedPast(route);
  }
  function addC(id: string, auto: boolean) {
    if (!id || seenC[id]) return;
    if (!auto && offC.indexOf(id) >= 0 && !autoC[id]) return;
    if (auto) autoC[id] = true;
    seenC[id] = true;
    countries.push(id);
  }
  function addR(id: string, auto: boolean) {
    if (!id || seenR[id]) return;
    if (tab === "past" && futureRegion[id] && !pastRegion[id]) return;
    if (!auto && offR.indexOf(id) >= 0 && !autoR[id]) return;
    const parent = countryOf(id);
    if (!auto && parent && offC.indexOf(parent) >= 0 && !autoC[parent] && !autoR[id]) return;
    if (auto) autoR[id] = true;
    seenR[id] = true;
    regions.push(id);
    if (parent) addC(parent, auto);
  }

  routes.forEach(function (route) {
    if (!route || !onTab(route, tab)) return;
    (route.countries || []).forEach(function (id) { addC(id, true); });
    (route.regions || []).forEach(function (id) { addR(id, true); });
  });
  if (tab === "past") {
    (opt.manualCountries || []).forEach(function (id) { addC(id, false); });
    (opt.manualRegions || []).forEach(function (id) { addR(id, false); });
  }
  trips.forEach(function (trip) {
    if (!trip || (opt.selectedTripId && trip.id !== opt.selectedTripId)) return;
    const ids = trip.routes || [];
    if (!ids.length) {
      if (tab !== "past") return;
      (trip.countries || []).forEach(function (id) { addC(id, false); });
      (trip.regions || []).forEach(function (id) { addR(id, false); });
      return;
    }
    const live = ids.map(function (id) { return byId[id]; }).filter(Boolean) as VisitRoute[];
    const here = live.some(function (route) { return onTab(route, tab); });
    const there = live.some(function (route) { return onTab(route, other); });
    if (!here || there) return;
    (trip.countries || []).forEach(function (id) { addC(id, true); });
    (trip.regions || []).forEach(function (id) { addR(id, true); });
  });
  return { countries: countries, regions: regions };
}
