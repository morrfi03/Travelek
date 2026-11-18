import test from "node:test";
import assert from "node:assert/strict";
import { airMinutes, pickFlights } from "../server.js";

test("рейс на нужный аэропорт, с авиакомпанией и временем", function () {
  const rows = pickFlights({
    departures: [
      {
        number: "SU 100",
        airline: { name: "Аэрофлот" },
        aircraft: { model: "Airbus A320" },
        departure: { airport: { iata: "SVO" }, scheduledTime: { local: "2026-11-18 10:00+03:00" } },
        arrival: { airport: { iata: "LED" }, scheduledTime: { local: "2026-11-18 11:35+03:00" } }
      },
      {
        number: "SU 200",
        airline: { name: "Аэрофлот" },
        departure: { airport: { iata: "SVO" }, scheduledTimeLocal: "2026-11-18 12:00" },
        arrival: { airport: { iata: "AER" }, scheduledTimeLocal: "2026-11-18 15:00" }
      }
    ]
  }, "LED");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].flight, "SU 100");
  assert.equal(rows[0].airline, "Аэрофлот");
  assert.equal(rows[0].aircraft, "Airbus A320");
  assert.equal(rows[0].time, "10:00");
  assert.equal(rows[0].airMin, 95);
});

test("без времени прилёта длительность пустая", function () {
  assert.equal(airMinutes("2026-11-18 10:00+03:00", ""), 0);
});
