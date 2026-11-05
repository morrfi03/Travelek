import assert from "node:assert/strict";
import test from "node:test";
import { filterRoutes, rememberDeleted, removeTrip, upsertTrip, withoutRoute } from "../src/diary.js";
import { jsonList, mergeUsers, preferPack, readDiary, readStoreDocument, repairVlad } from "../src/store.js";

test("пустой список и битая дата не рисуют будущий маршрут", function () {
  assert.deepEqual(filterRoutes([], "past"), []);
  assert.deepEqual(filterRoutes([{ id: "x", date: "завтра", mode: "plane" }], "future"), []);
  assert.deepEqual(filterRoutes([{ id: "x", date: "2001-01-01", mode: "ship" }], "past", { year: "all", mode: "all" }).map(function (r) { return r.id; }), ["x"]);
  assert.deepEqual(filterRoutes([{ id: "x", from: "", to: "" }], "future"), []);
});

test("правка одной поездки не меняет другую и не портит старый список", function () {
  const volga = { id: "j1", title: "Волга", countries: ["RU"], regions: ["RU:Татарстан"], routes: ["r1"] };
  const kamchatka = { id: "j2", title: "Камчатка", countries: ["RU"], regions: ["RU:Камчатский край"], routes: ["r2"] };
  const before = [volga, kamchatka];
  const next = upsertTrip(before, { id: "j1", title: "Волга зимой", countries: ["RU"], regions: ["RU:Татарстан"], routes: ["r1"] });
  assert.equal(volga.title, "Волга");
  assert.equal(next.find(function (t) { return t.id === "j2"; }), kamchatka);
  assert.equal(before.length, 2);
  assert.deepEqual(removeTrip(next, "нет"), next);
  assert.equal(removeTrip(next, "j2").some(function (t) { return t.id === "j1"; }), true);
});

test("удалённый маршрут и пустой id не портят списки", function () {
  const extra = [{ id: "r1" }, { id: "r2" }];
  assert.deepEqual(withoutRoute(extra, "нет"), extra);
  assert.deepEqual(withoutRoute(extra, "").map(function (r) { return r.id; }), ["r1", "r2"]);
  assert.deepEqual(withoutRoute(extra, "r1").map(function (r) { return r.id; }), ["r2"]);
  assert.deepEqual(rememberDeleted([], ""), []);
  assert.deepEqual(rememberDeleted(["r1"], "r1"), ["r1"]);
});

test("дневник из пачки: битый json пустой, чужие поездки на месте", function () {
  const pack = {
    "travelek-extra": "[{\"id\":\"r1\"},",
    "travelek-trips": "[{\"id\":\"j1\",\"title\":\"Волга\"},{\"id\":\"j2\",\"title\":\"Рим\"}]",
    "travelek-del": "нет",
    "travelek-regions": "[\"RU:Татарстан\"]",
    "travelek-countries": "null"
  };
  const diary = readDiary(pack);
  assert.deepEqual(diary.routes, []);
  assert.deepEqual(diary.deleted, []);
  assert.equal(diary.trips.length, 2);
  assert.equal(diary.trips[1].title, "Рим");
  assert.deepEqual(diary.regions, ["RU:Татарстан"]);
  assert.deepEqual(diary.countries, []);
  assert.deepEqual(jsonList(undefined), []);
});

test("облако: более новая пачка побеждает, удалённый аккаунт не возвращается", function () {
  const older = { "travelek-rev": "1", "travelek-extra": "[{\"id\":\"a\"}]" };
  const newer = { "travelek-rev": "2", "travelek-extra": "[]" };
  assert.equal(preferPack(older, newer), newer);
  assert.equal(preferPack(null, older), older);
  assert.equal(preferPack(older, null), older);
  const sameRevMoreMarks = { "travelek-rev": "3", "travelek-countries": "[\"RU\",\"IT\"]", "travelek-regions": "[]", "travelek-extra": "[]" };
  const sameRevLess = { "travelek-rev": "3", "travelek-countries": "[\"RU\"]", "travelek-regions": "[]", "travelek-extra": "[]" };
  assert.equal(preferPack(sameRevLess, sameRevMoreMarks), sameRevMoreMarks);
  const merged = mergeUsers(
    [{ id: "a", login: "ann", rev: 1 }, { id: "gone", login: "old", rev: 1 }],
    ["gone"],
    [{ id: "a", login: "ann", name: "Анна", rev: 4, password: "x" }, { id: "b", login: "bob", rev: 1 }]
  );
  assert.deepEqual(merged.deleted, ["gone"]);
  assert.deepEqual(merged.users.map(function (u) { return u.id; }), ["a", "b"]);
  assert.equal(merged.users[0].name, "Анна");
  assert.equal(merged.users[0].password, "x");
  assert.equal(merged.users[1].login, "bob");
});

test("битый ответ облака не считается дневником, сброс Влада не трогает остальных", function () {
  assert.equal(readStoreDocument(null), null);
  assert.equal(readStoreDocument([]), null);
  assert.equal(readStoreDocument({ vault: {} }), null);
  const doc = readStoreDocument({ users: [{ id: "a", login: "ann" }], deleted: "нет" });
  assert.ok(doc);
  assert.equal(doc.users.length, 1);
  assert.deepEqual(doc.deleted, []);
  assert.deepEqual(doc.vault, {});
  const people = [
    { id: "v", login: "vlad100", password: "plain", vladReset: "" },
    { id: "b", login: "bob", password: "keep", rev: 2 }
  ];
  assert.equal(repairVlad(people), true);
  assert.equal(people[0].vladReset, "1");
  assert.equal(people[0].mustChange, false);
  assert.notEqual(people[0].password, "plain");
  assert.equal(people[1].password, "keep");
  assert.equal(repairVlad(people), false);
});
