import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { airMinutes, pickFlightDetail, pickFlights, readSchedule, writeSchedule } from "../server.js";

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

test("номер без букв берёт код авиакомпании, модель приходит кодом", function () {
  const rows = pickFlights({
    departures: [{
      number: "204",
      airline: { iata: "SU", name: "Aeroflot" },
      aircraft: { modelCode: "B738" },
      departure: { airport: { iata: "SVO" }, scheduledTime: { local: "2026-12-01 19:00+03:00" } },
      arrival: { airport: { iata: "PEK" }, scheduledTime: { local: "2026-12-01 23:40+03:00" } }
    }]
  }, "PEK");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].flight, "SU 204");
  assert.equal(rows[0].airline, "Aeroflot");
  assert.equal(rows[0].airlineIata, "SU");
  assert.equal(rows[0].aircraft, "B738");
});

test("карточка рейса по номеру отдаёт компанию и самолёт", function () {
  const row = pickFlightDetail([{
    number: "CA910",
    airline: { name: "Air China", iata: "CA" },
    aircraft: { model: "Airbus A330-200" },
    departure: { scheduledTime: { local: "2026-12-01 09:00+03:00" } },
    arrival: { scheduledTime: { local: "2026-12-01 16:10+08:00" } }
  }]);
  assert.equal(row.airline, "Air China");
  assert.equal(row.airlineIata, "CA");
  assert.equal(row.aircraft, "Airbus A330-200");
  assert.ok(row.airMin > 0);
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
