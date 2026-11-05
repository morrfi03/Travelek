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
