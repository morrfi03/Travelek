import assert from "node:assert/strict";
import test from "node:test";
import { filterRoutes, regionsOnTab, rememberDeleted, removeTrip, upsertTrip, withoutRoute } from "../src/diary.js";

const past = { id: "r1", from: "Москва", to: "Казань", date: "2001-05-01", time: "09:00", mode: "train" };
const future = { id: "r2", from: "Москва", to: "Петропавловск-Камчатский", date: "2099-08-01", time: "12:00", mode: "plane" };
const undated = { id: "r3", from: "Минск", to: "Брест", mode: "car" };

test("добавление поездки кладёт её первой и не задваивает id", function () {
  const first = upsertTrip([], {
    id: "j1", title: "Волга", countries: ["RU"], regions: ["RU:Татарстан"], routes: ["r1"]
  });
  const again = upsertTrip(first, {
    id: "j2", title: "Камчатка", countries: ["RU"], regions: ["RU:Камчатский край"], routes: ["r2"]
  });
  assert.deepEqual(again.map(function (t) { return t.id; }), ["j2", "j1"]);
  const edited = upsertTrip(again, {
    id: "j1", title: "Волга, ещё раз", countries: ["RU"], regions: ["RU:Татарстан"], routes: ["r1"]
  });
  assert.equal(edited.length, 2);
  assert.equal(edited[0].title, "Волга, ещё раз");
  assert.equal(edited[0].id, "j1");
});

test("редактирование меняет маршрут и заголовок, чужие поездки не трогает", function () {
  const trips = upsertTrip(upsertTrip([], {
    id: "j1", title: "Волга", countries: ["RU"], regions: ["RU:Татарстан"], routes: ["r1"]
  }), {
    id: "j2", title: "Камчатка", countries: ["RU"], regions: ["RU:Камчатский край"], routes: ["r2"]
  });
  const edited = upsertTrip(trips, {
    id: "j2", title: "Камчатка летом", countries: ["RU"], regions: ["RU:Камчатский край"], routes: ["r2", "r9"]
  });
  const kamchatka = edited.find(function (t) { return t.id === "j2"; });
  const volga = edited.find(function (t) { return t.id === "j1"; });
  assert.equal(kamchatka && kamchatka.title, "Камчатка летом");
  assert.deepEqual(kamchatka && kamchatka.routes, ["r2", "r9"]);
  assert.equal(volga && volga.title, "Волга");
});

test("удаление поездки и маршрута", function () {
  const trips = [{ id: "j1", title: "Волга", countries: ["RU"], regions: [], routes: ["r1"] }];
  assert.deepEqual(removeTrip(trips, "j1"), []);
  assert.equal(removeTrip(trips, "нет").length, 1);
  const extra = [past, future];
  assert.deepEqual(withoutRoute(extra, "r2").map(function (r) { return r.id; }), ["r1"]);
  assert.deepEqual(rememberDeleted(["r0"], "r2"), ["r0", "r2"]);
  assert.deepEqual(rememberDeleted(["r2"], "r2"), ["r2"]);
});

test("фильтр делит прошлые и будущие, год и тип", function () {
  const all = [future, past, undated];
  assert.deepEqual(filterRoutes(all, "future").map(function (r) { return r.id; }), ["r2"]);
  assert.deepEqual(filterRoutes(all, "past").map(function (r) { return r.id; }), ["r3", "r1"]);
  assert.deepEqual(filterRoutes(all, "past", { year: "2001" }).map(function (r) { return r.id; }), ["r1"]);
  assert.deepEqual(filterRoutes(all, "future", { mode: "train" }), []);
  assert.deepEqual(filterRoutes(all, "past", { mode: "train" }).map(function (r) { return r.id; }), ["r1"]);
});

test("регион будущей поездки не попадает в прошлые", function () {
  const all = [past, future];
  function regionsOf(route) {
    if (route.id === "r1") return ["RU:Татарстан"];
    if (route.id === "r2") return ["RU:Камчатский край"];
    return [];
  }
  assert.deepEqual(regionsOnTab(all, "past", regionsOf), ["RU:Татарстан"]);
  assert.deepEqual(regionsOnTab(all, "future", regionsOf), ["RU:Камчатский край"]);
});

test("после смены даты маршрут виден только на новой вкладке", function () {
  const moved = Object.assign({}, future, { date: "2001-08-01" });
  assert.deepEqual(filterRoutes([past, moved], "future").map(function (r) { return r.id; }), []);
  assert.deepEqual(filterRoutes([past, moved], "past").map(function (r) { return r.id; }), ["r1", "r2"]);
  assert.deepEqual(regionsOnTab([past, moved], "past", function (route) {
    return route.id === "r2" ? ["RU:Камчатский край"] : ["RU:Татарстан"];
  }), ["RU:Татарстан", "RU:Камчатский край"]);
  assert.deepEqual(regionsOnTab([past, moved], "future", function () { return ["RU:Камчатский край"]; }), []);
});

