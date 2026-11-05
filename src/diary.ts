import { isFuture, type DatedLeg } from "./when.js";

export type TripRoute = DatedLeg & {
  id: string;
  from?: string;
  to?: string;
  mode?: string;
  fromCode?: string;
  toCode?: string;
};

export type Trip = {
  id: string;
  title: string;
  countries: string[];
  regions: string[];
  routes: string[];
};

export function upsertTrip(trips: Trip[], trip: Trip): Trip[] {
  return [trip].concat(trips.filter(function (item) { return item.id !== trip.id; }));
}

export function removeTrip(trips: Trip[], id: string): Trip[] {
  return trips.filter(function (item) { return item.id !== id; });
}

export function rememberDeleted(ids: string[], id: string): string[] {
  if (!id || ids.indexOf(id) >= 0) return ids.slice();
  return ids.concat(id);
}

export function withoutRoute<T extends { id: string }>(extra: T[], id: string): T[] {
  return extra.filter(function (item) { return item.id !== id; });
}

export function filterRoutes<T extends TripRoute>(routes: T[], tab: string, opt?: { year?: string; mode?: string }): T[] {
  const year = opt && opt.year && opt.year !== "all" ? opt.year : "";
  const mode = opt && opt.mode && opt.mode !== "all" ? opt.mode : "";
  const dated = tab === "future" || tab === "past";
  return routes.filter(function (route) {
    if (tab === "future" && !isFuture(route)) return false;
    if (tab === "past" && isFuture(route)) return false;
    if (dated && year && (route.date || "").slice(0, 4) !== year) return false;
    if (mode && route.mode !== mode) return false;
    return true;
  }).slice().sort(function (a, b) {
    return ((a.date || "") + " " + (a.time || "")).localeCompare((b.date || "") + " " + (b.time || ""));
  });
}

export function regionsOnTab(routes: TripRoute[], tab: string, regionsOf: (route: TripRoute) => string[]): string[] {
  const seen: Record<string, true> = {};
  const out: string[] = [];
  filterRoutes(routes, tab).forEach(function (route) {
    regionsOf(route).forEach(function (id) {
      if (!id || seen[id]) return;
      seen[id] = true;
      out.push(id);
    });
  });
  return out;
}
