import { datedPast, isFuture } from "./when.js";

export type VisitRoute = {
  id: string;
  date?: string;
  time?: string;
  arrDate?: string;
  arrTime?: string;
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
  const routes = opt.routes || [];
  const countryOf = opt.countryOf || countryOfId;
  const offC = opt.offCountries || [];
  const offR = opt.offRegions || [];
  const countries: string[] = [];
  const regions: string[] = [];
  const seenC: Record<string, true> = {};
  const seenR: Record<string, true> = {};
  const autoC: Record<string, true> = {};
  const autoR: Record<string, true> = {};

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
  (opt.trips || []).forEach(function (trip) {
    if (!trip) return;
    if (opt.selectedTripId && trip.id !== opt.selectedTripId) return;
    const ids = trip.routes || [];
    if (ids.length) return;
    if (tab !== "past") return;
    (trip.countries || []).forEach(function (id) { addC(id, false); });
    (trip.regions || []).forEach(function (id) { addR(id, false); });
  });
  return { countries: countries, regions: regions };
}
