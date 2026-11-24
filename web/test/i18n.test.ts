import assert from "node:assert/strict";
import test from "node:test";
import { esCategoryLabels } from "../src/i18n/categories.ts";
import { en, es } from "../src/i18n/messages.ts";
import { localeFromPath, localizePath, stripLocale } from "../src/i18n/paths.ts";
import { categoryLabels } from "../../scripts/icon-expansion/categories.ts";

test("locale paths keep English unprefixed and prefix Spanish", () => {
  assert.equal(localizePath("/", "en"), "/");
  assert.equal(localizePath("/", "es"), "/es");
  assert.equal(localizePath("/installation", "es"), "/es/installation");
  assert.equal(localizePath("/es/create?q=lamp", "en"), "/create?q=lamp");
  assert.equal(localizePath("/es/installation/", "es"), "/es/installation");
  assert.equal(localeFromPath("/es"), "es");
  assert.equal(localeFromPath("/installation"), "en");
  assert.equal(stripLocale("/es/"), "/");
});

test("Spanish covers every interface string and category", () => {
  assert.deepEqual(Object.keys(es).sort(), Object.keys(en).sort());
  assert.deepEqual(Object.keys(esCategoryLabels).sort(), Object.keys(categoryLabels).sort());
});
