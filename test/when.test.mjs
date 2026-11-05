import assert from "node:assert/strict";
import test from "node:test";
import { datedPast, isFuture } from "../src/when.js";

test("без даты поездка не будущая и не прошлая", function(){
  assert.equal(isFuture(null), false);
  assert.equal(isFuture({}), false);
  assert.equal(datedPast({}), false);
  assert.equal(datedPast(null), false);
});

test("далёкие даты не зависят от сегодняшнего часа", function(){
  assert.equal(isFuture({ date: "2099-06-01" }), true);
  assert.equal(datedPast({ date: "2099-06-01" }), false);
  assert.equal(isFuture({ date: "2001-06-01" }), false);
  assert.equal(datedPast({ date: "2001-06-01" }), true);
});

test("прилёт позже выезда считается по arrDate", function(){
  assert.equal(isFuture({ date: "2001-01-01", arrDate: "2099-01-01" }), true);
  assert.equal(datedPast({ date: "2099-01-01", arrDate: "2001-01-01" }), true);
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

test("сегодня до времени поездка будущая, после времени и после полуночи — прошлая", function(){
  const nowMin = pad(wall.getHours()) + ":" + pad(wall.getMinutes());
  assert.equal(isFuture({ date: today, time: "23:59" }), nowMin < "23:59");
  assert.equal(datedPast({ date: today, time: "00:00" }), true);
  assert.equal(isFuture({ date: yesterday, time: "23:59" }), false);
  assert.equal(datedPast({ date: yesterday, arrDate: yesterday, arrTime: "23:59" }), true);
  assert.equal(isFuture({ date: tomorrow, time: "00:01" }), true);
  assert.equal(datedPast({ date: tomorrow }), false);
});

