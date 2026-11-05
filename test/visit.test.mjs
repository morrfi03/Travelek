import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { countriesToPaint, marksForTab, placesVisitKey, regionMatches, routeBagKey, visitClock } from "../src/visit.js";

const pastRoute = { id: "p1", date: "2001-05-01", time: "09:00", countries: ["IT"], regions: [] };
const pastRegion = { id: "p2", date: "2001-06-01", countries: ["RU"], regions: ["RU:Татарстан"] };
const futureRoute = { id: "f1", date: "2099-08-01", time: "12:00", countries: ["JP"], regions: [] };
const futureRegion = { id: "f2", date: "2099-09-01", countries: ["RU"], regions: ["RU:Камчатский край"] };

function marks(tab, routes, extra) {
  return marksForTab(Object.assign({ tab: tab, routes: routes, trips: [], manualCountries: [], manualRegions: [], offCountries: [], offRegions: [] }, extra || {}));
}

test("прошлое: страна без регионов окрашивается страной", function () {
  const got = marks("past", [pastRoute]);
  assert.deepEqual(got.countries, ["IT"]);
  assert.deepEqual(got.regions, []);
});

test("прошлое: страна остаётся, регион добавляется отдельно и без дубля", function () {
  const got = marks("past", [pastRegion, { id: "p3", date: "2001-07-01", countries: ["RU"], regions: ["RU:Татарстан"] }]);
  assert.deepEqual(got.countries, ["RU"]);
  assert.deepEqual(got.regions, ["RU:Татарстан"]);
});

test("будущее: страна без регионов не попадает в прошлое", function () {
  assert.deepEqual(marks("future", [futureRoute]).countries, ["JP"]);
  assert.deepEqual(marks("past", [futureRoute]).countries, []);
});

test("будущее: страна и регион остаются на будущем", function () {
  const fut = marks("future", [futureRegion]);
  const past = marks("past", [futureRegion]);
  assert.deepEqual(fut.countries, ["RU"]);
  assert.deepEqual(fut.regions, ["RU:Камчатский край"]);
  assert.deepEqual(past.countries, []);
  assert.deepEqual(past.regions, []);
});

test("страницы не смешивают отметки", function () {
  const routes = [pastRoute, pastRegion, futureRoute, futureRegion];
  const past = marks("past", routes, { manualCountries: ["FR"], manualRegions: ["RU:Карелия"] });
  const fut = marks("future", routes, { manualCountries: ["FR"], manualRegions: ["RU:Карелия"] });
  assert.deepEqual(past.countries, ["IT", "RU", "FR"]);
  assert.ok(past.regions.indexOf("RU:Татарстан") >= 0);
  assert.ok(past.regions.indexOf("RU:Карелия") >= 0);
  assert.equal(past.regions.indexOf("RU:Камчатский край"), -1);
  assert.equal(past.countries.indexOf("JP"), -1);
  assert.deepEqual(fut.countries, ["JP", "RU"]);
  assert.deepEqual(fut.regions, ["RU:Камчатский край"]);
});

test("после даты маршрут с регионами виден только в прошлом", function () {
  const planned = { id: "m", date: "2099-01-02", countries: ["IT"], regions: ["IT:Лацио"] };
  assert.deepEqual(marks("future", [planned]).regions, ["IT:Лацио"]);
  assert.deepEqual(marks("past", [planned]).regions, []);
  const done = { id: "m", date: "2001-01-02", countries: ["IT"], regions: ["IT:Лацио"] };
  assert.deepEqual(marks("past", [done]).regions, ["IT:Лацио"]);
  assert.deepEqual(marks("past", [done]).countries, ["IT"]);
  assert.deepEqual(marks("future", [done]).regions, []);
  assert.deepEqual(marks("future", [planned]), marks("future", [planned]));
});

test("удаление маршрута убирает только его отметки", function () {
  const routes = [pastRoute, pastRegion];
  assert.deepEqual(marks("past", routes).countries, ["IT", "RU"]);
  const left = marks("past", [pastRegion]);
  assert.deepEqual(left.countries, ["RU"]);
  assert.deepEqual(left.regions, ["RU:Татарстан"]);
  assert.deepEqual(marks("past", []).countries, []);
});

test("страна без маршрута остаётся ручной отметкой прошлого", function () {
  const got = marks("past", [], { manualCountries: ["ES"], trips: [{ id: "j", title: "Без маршрута", countries: ["PT"], regions: ["PT:Лисабон"], routes: [] }] });
  assert.deepEqual(got.countries, ["ES", "PT"]);
  assert.deepEqual(got.regions, ["PT:Лисабон"]);
  assert.deepEqual(marks("future", [], { manualCountries: ["ES"], trips: [{ id: "j", countries: ["PT"], regions: ["PT:Лисабон"], routes: [] }] }).countries, []);
});

test("Камчатка будущего не попадает в прошлое, Татарстан прошлого не попадает в будущее", function () {
  const kamchatka = { id: "f", date: "2099-08-01", time: "12:00", from: "Москва", to: "Петропавловск-Камчатский", countries: ["RU"], regions: [] };
  const tatar = { id: "p", date: "2001-05-01", time: "09:00", from: "Москва", to: "Казань", countries: ["RU"], regions: ["RU:Татарстан"] };
  const trip = { id: "j", countries: ["RU"], regions: ["RU:Камчатский край"], routes: ["f"] };
  const opt = { trips: [trip], manualRegions: ["RU:Камчатский край"] };
  const future = marks("future", [kamchatka, tatar], opt);
  const past = marks("past", [kamchatka, tatar], opt);
  assert.deepEqual(future.regions, ["RU:Камчатский край"]);
  assert.equal(future.regions.indexOf("RU:Татарстан"), -1);
  assert.ok(future.countries.indexOf("RU") >= 0);
  assert.deepEqual(past.regions, ["RU:Татарстан"]);
  assert.equal(past.regions.indexOf("RU:Камчатский край"), -1);
  assert.ok(past.countries.indexOf("RU") >= 0);
});

test("смена даты и состава маршрута меняет ключи кэша", function () {
  const before = { id: "f", date: "2099-08-01", from: "Москва", to: "Петропавловск-Камчатский", coords: [[55.7, 37.6], [53.0, 158.6]] };
  const arrived = Object.assign({}, before, { arrDate: "2099-08-02", arrTime: "18:00" });
  const moved = Object.assign({}, before, { coords: [[55.7, 37.6], [43.1, 131.9]] });
  assert.notEqual(routeBagKey(before), routeBagKey(arrived));
  assert.notEqual(routeBagKey(before), routeBagKey(moved));
  const base = { tab: "future", routes: [before], trips: [{ id: "j", regions: ["RU:Камчатский край"], routes: ["f"], countries: ["RU"] }], manualRegions: [] };
  assert.notEqual(placesVisitKey(base), placesVisitKey(Object.assign({}, base, { tab: "past" })));
  assert.notEqual(placesVisitKey(base), placesVisitKey(Object.assign({}, base, { routes: [Object.assign({}, before, { date: "2001-08-01" })] })));
  assert.notEqual(placesVisitKey(base), placesVisitKey(Object.assign({}, base, { trips: [{ id: "j", regions: ["RU:Татарстан"], routes: ["f"], countries: ["RU"] }] })));
  const done = Object.assign({}, before, { date: "2001-08-01", regions: ["RU:Камчатский край"], countries: ["RU"] });
  const trip = { id: "j", countries: ["RU"], regions: ["RU:Камчатский край"], routes: ["f"] };
  assert.deepEqual(marks("past", [done], { trips: [trip] }).regions, ["RU:Камчатский край"]);
  assert.deepEqual(marks("future", [done], { trips: [trip] }).regions, []);
  assert.deepEqual(marks("future", [before], { trips: [trip] }), marks("future", [before], { trips: [trip] }));
});

test("одноимённый регион другой страны не подсвечивается", function () {
  const marksRu = { "RU:Камчатский край": 1 };
  assert.equal(regionMatches(marksRu, { name: "Камчатский край", iso: "RU" }), true);
  assert.equal(regionMatches(marksRu, { rid: "RU:Камчатский край", iso: "RU" }), true);
  assert.equal(regionMatches(marksRu, { name: "Камчатский край", iso: "CN" }), false);
  assert.equal(regionMatches({ "Татарстан": 1 }, { name: "Татарстан", iso: "RU" }), true);
  assert.equal(regionMatches({ "Татарстан": 1 }, { name: "Татарстан", iso: "KZ" }), false);
});

test("Россия входит в набор стран для заливки на обеих страницах", function () {
  const past = marks("past", [{ id: "p", date: "2001-06-01", countries: [], regions: ["RU:Татарстан"] }]);
  const future = marks("future", [{ id: "f", date: "2099-08-01", countries: [], regions: [] }], {
    trips: [{ id: "j", countries: [], regions: ["RU:Камчатский край"], routes: ["f"] }]
  });
  const pastDraw = countriesToPaint(past.countries, past.regions);
  const futureDraw = countriesToPaint(future.countries, future.regions);
  assert.ok(past.regions.indexOf("RU:Татарстан") >= 0);
  assert.ok(future.regions.indexOf("RU:Камчатский край") >= 0);
  assert.ok(pastDraw.indexOf("RU") >= 0);
  assert.ok(futureDraw.indexOf("RU") >= 0);
  assert.equal(pastDraw.indexOf("RU:Татарстан"), -1);
  assert.deepEqual(countriesToPaint(["IT"], ["RU:Татарстан"]), ["IT", "RU"]);
  assert.deepEqual(countriesToPaint([], ["Татарстан"]), ["RU"]);
});

function pad(n) {
  return (n < 10 ? "0" : "") + n;
}
function ymd(date) {
  return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
}
const wall = new Date();
const today = ymd(wall);
const yesterday = ymd(new Date(wall.getFullYear(), wall.getMonth(), wall.getDate() - 1));
const tomorrow = ymd(new Date(wall.getFullYear(), wall.getMonth(), wall.getDate() + 1));

function once(list, id) {
  return list.filter(function (item) { return item === id; }).length;
}

test("одна будущая страна переходит в прошлое без дубля и не остаётся в будущем", function () {
  const planned = { id: "one", date: tomorrow, time: "10:00", countries: ["IT"], regions: [] };
  assert.deepEqual(marks("future", [planned]).countries, ["IT"]);
  assert.deepEqual(marks("past", [planned]).countries, []);
  const done = Object.assign({}, planned, { date: yesterday });
  assert.deepEqual(marks("past", [done]).countries, ["IT"]);
  assert.deepEqual(marks("future", [done]).countries, []);
  assert.equal(once(marks("past", [done, done]).countries, "IT"), 1);
});

test("несколько регионов переходят вместе с поездкой и не дублируются", function () {
  const regions = ["RU:Татарстан", "RU:Карелия", "RU:Камчатский край"];
  const planned = { id: "regs", date: tomorrow, countries: ["RU"], regions: regions };
  assert.deepEqual(marks("future", [planned]).regions, regions);
  assert.deepEqual(marks("past", [planned]).regions, []);
  const done = Object.assign({}, planned, { date: yesterday });
  const past = marks("past", [done]);
  assert.deepEqual(past.regions, regions);
  assert.equal(once(past.countries, "RU"), 1);
  assert.deepEqual(marks("future", [done]).regions, []);
});

test("несколько стран переходят вместе и не смешиваются со страницами", function () {
  const planned = [
    { id: "a", date: tomorrow, countries: ["IT"], regions: [] },
    { id: "b", date: tomorrow, countries: ["JP"], regions: ["JP:Канто"] },
    { id: "c", date: tomorrow, countries: ["FR"], regions: [] }
  ];
  assert.deepEqual(marks("future", planned).countries, ["IT", "JP", "FR"]);
  assert.deepEqual(marks("past", planned).countries, []);
  const done = planned.map(function (route) { return Object.assign({}, route, { date: yesterday }); });
  assert.deepEqual(marks("past", done).countries, ["IT", "JP", "FR"]);
  assert.deepEqual(marks("past", done).regions, ["JP:Канто"]);
  assert.deepEqual(marks("future", done).countries, []);
});

test("сегодняшняя поездка ещё в будущем до времени и в прошлом после него", function () {
  const later = { id: "later", date: today, time: "23:59", countries: ["ES"], regions: [] };
  const earlier = { id: "earlier", date: today, time: "00:00", countries: ["ES"], regions: ["ES:Андалусия"] };
  const nowMin = pad(wall.getHours()) + ":" + pad(wall.getMinutes());
  assert.equal(marks("future", [later]).countries.length, nowMin < "23:59" ? 1 : 0);
  assert.equal(marks("past", [later]).countries.length, nowMin < "23:59" ? 0 : 1);
  assert.deepEqual(marks("past", [earlier]).regions, ["ES:Андалусия"]);
  assert.deepEqual(marks("future", [earlier]).regions, []);
});

test("после полуночи вчерашняя поездка только в прошлом, завтрашняя только в будущем", function () {
  const night = { id: "night", date: yesterday, time: "23:59", countries: ["DE"], regions: ["DE:Бавария"] };
  const next = { id: "next", date: tomorrow, time: "00:01", countries: ["DE"], regions: ["DE:Берлин"] };
  assert.deepEqual(marks("past", [night, next]).regions, ["DE:Бавария"]);
  assert.deepEqual(marks("future", [night, next]).regions, ["DE:Берлин"]);
  assert.equal(once(marks("past", [night]).countries, "DE"), 1);
});

test("смена даты переносит отметки и не оставляет копию на другой вкладке", function () {
  const planned = { id: "edit", date: tomorrow, time: "15:00", countries: ["JP"], regions: ["JP:Канто"] };
  const moved = Object.assign({}, planned, { date: yesterday, time: "15:00" });
  assert.deepEqual(marks("future", [planned]).regions, ["JP:Канто"]);
  assert.deepEqual(marks("past", [moved]).regions, ["JP:Канто"]);
  assert.deepEqual(marks("future", [moved]).regions, []);
  assert.deepEqual(marks("past", [planned]).regions, []);
});

test("удаление будущей поездки убирает её страну и регионы", function () {
  const keep = { id: "keep", date: tomorrow, countries: ["IT"], regions: [] };
  const drop = { id: "drop", date: tomorrow, countries: ["JP"], regions: ["JP:Канто"] };
  assert.deepEqual(marks("future", [keep, drop]).regions, ["JP:Канто"]);
  const left = marks("future", [keep]);
  assert.deepEqual(left.countries, ["IT"]);
  assert.deepEqual(left.regions, []);
  assert.deepEqual(marks("future", []).countries, []);
  assert.deepEqual(marks("past", []).regions, []);
});

test("ключ кэша меняется в минуту наступления даты, данные поездки те же", function () {
  const route = { id: "f", date: "2099-08-01", time: "12:00", countries: ["JP"], regions: ["JP:Канто"] };
  const base = { tab: "future", routes: [route], trips: [], now: new Date(2099, 7, 1, 11, 0, 10) };
  const sameMinute = Object.assign({}, base, { now: new Date(2099, 7, 1, 11, 0, 50) });
  const arrived = Object.assign({}, base, { now: new Date(2099, 7, 1, 12, 0, 0) });
  const nextDay = Object.assign({}, base, { now: new Date(2099, 7, 2, 11, 0, 10) });
  assert.equal(visitClock(base.now), "2099-08-01 11:00");
  assert.equal(placesVisitKey(base), placesVisitKey(sameMinute));
  assert.notEqual(placesVisitKey(base), placesVisitKey(arrived));
  assert.notEqual(placesVisitKey(base), placesVisitKey(nextDay));
  assert.deepEqual(marks("past", [Object.assign({}, route, { date: "2099-08-01" })]).countries, []);
});

test("ручные отметки прошлого не пропадают и не дублируются, когда другая поездка переходит", function () {
  const manual = { manualCountries: ["ES"], manualRegions: ["RU:Карелия"] };
  const planned = { id: "f", date: tomorrow, countries: ["RU"], regions: ["RU:Камчатский край"] };
  const before = marks("past", [planned], manual);
  assert.deepEqual(before.countries, ["ES", "RU"]);
  assert.deepEqual(before.regions, ["RU:Карелия"]);
  assert.deepEqual(marks("future", [planned], manual).regions, ["RU:Камчатский край"]);
  const done = Object.assign({}, planned, { date: yesterday });
  const after = marks("past", [done], manual);
  assert.equal(once(after.countries, "RU"), 1);
  assert.equal(once(after.countries, "ES"), 1);
  assert.equal(once(after.regions, "RU:Карелия"), 1);
  assert.equal(once(after.regions, "RU:Камчатский край"), 1);
  assert.deepEqual(marks("future", [done], manual).regions, []);
});

test("89 регионов России переходят одним списком и дают одну заливку страны", function () {
  const russia = JSON.parse(readFileSync(new URL("../geo/russia.json", import.meta.url), "utf8"));
  assert.equal(russia.items.length, 89);
  const names = russia.items.map(function (item) { return item.id; });
  assert.equal(new Set(names).size, 89);
  const regions = names.map(function (name) { return "RU:" + name; });
  const planned = { id: "ru", date: tomorrow, countries: ["RU"], regions: regions };
  assert.equal(marks("future", [planned]).regions.length, 89);
  assert.equal(marks("past", [planned]).regions.length, 0);
  const done = Object.assign({}, planned, { date: yesterday });
  const past = marks("past", [done]);
  assert.equal(past.regions.length, 89);
  assert.equal(once(past.countries, "RU"), 1);
  assert.deepEqual(marks("future", [done]).regions, []);
  assert.equal(once(countriesToPaint(past.countries, past.regions), "RU"), 1);
  assert.equal(regionMatches({ "Адыгея": 1 }, { name: "Адыгея", iso: "RU" }), true);
  assert.equal(regionMatches({ "Адыгея": 1 }, { name: "Адыгея", iso: "KZ" }), false);
});



