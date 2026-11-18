import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { airMinutes, pickFlights, readSchedule, writeSchedule } from "../server.js";

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

test("сохранённый день читается без повторного запроса", function () {
  process.env.TRAVELEK_SCHEDULES = join(mkdtempSync(join(tmpdir(), "travelek-")), "schedules.json");
  assert.equal(readSchedule("SVO", "PEK", "2026-12-01"), null);
  writeSchedule("SVO", "PEK", "2026-12-01", [{ flight: "SU 204", time: "19:00" }]);
  const again = readSchedule("SVO", "PEK", "2026-12-01");
  assert.equal(again.length, 1);
  assert.equal(again[0].flight, "SU 204");
});
