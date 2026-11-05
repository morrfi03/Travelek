import assert from "node:assert/strict";
import test from "node:test";
import { marksForTab } from "../src/visit.js";

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
