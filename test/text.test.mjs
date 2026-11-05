import assert from "node:assert/strict";
import test from "node:test";
import { nameHas, norm } from "../src/text.js";

test("norm схлопывает пробелы и регистр", function(){
  assert.equal(norm("  Санкт  Петербург "), "санкт петербург");
  assert.equal(norm(null), "");
});

test("nameHas берёт слово целиком, не кусок", function(){
  assert.equal(nameHas("сочи адлер", "сочи"), true);
  assert.equal(nameHas("сочи", "со"), false);
  assert.equal(nameHas("сочи", ""), false);
});
