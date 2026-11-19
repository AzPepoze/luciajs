import { describe, expect, test } from "bun:test";
import { api } from "../../reference/api.ts";

const KINDS = new Set(["function", "type", "markup", "style", "value"]);
const GROUPS = new Set(["basics", "reactivity", "flow", "components", "styling", "motion"]);

describe("reference api table", () => {
  test("ids are unique url-safe anchors", () => {
    const ids = api.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z-]+$/);
  });

  test("every entry has a valid kind and group and text", () => {
    for (const entry of api) {
      expect(KINDS.has(entry.kind), entry.id).toBe(true);
      expect(GROUPS.has(entry.group), entry.id).toBe(true);
      expect(entry.name.length, entry.id).toBeGreaterThan(0);
      expect(entry.signature.length, entry.id).toBeGreaterThan(0);
      expect(entry.summary.length, entry.id).toBeGreaterThan(0);
      expect(entry.example.length, entry.id).toBeGreaterThan(0);
    }
  });

  test("every entry has 3 to 5 bullets", () => {
    for (const entry of api) {
      expect(entry.bullets.length, entry.id).toBeGreaterThanOrEqual(3);
      expect(entry.bullets.length, entry.id).toBeLessThanOrEqual(5);
    }
  });

  test("covers the public API and markup features", () => {
    const ids = api.map((entry) => entry.id);
    for (const id of [
      "store", "store-from", "store-on-update", "props", "attach",
      "store-type", "read-store-type", "component", "instance", "props-type",
      "expr", "script", "style", "style-scoped", "style-global",
      "scoped", "global", "inline-global", "setup", "component-tag",
    ]) {
      expect(ids).toContain(id);
    }
  });

  test("covers the motion API: the animate attribute, its enums and types", () => {
    const ids = api.map((entry) => entry.id);
    for (const id of [
      "animate", "transition", "ease", "active", "animate-item", "animate-type", "keyframes-type", "interpolate",
    ]) {
      expect(ids).toContain(id);
    }
  });

  test("each enum is one value entry listing its members in upper case", () => {
    for (const name of ["TRANSITION", "EASE", "ACTIVE"]) {
      const entry = api.find((item) => item.name === name);
      expect(entry?.kind, name).toBe("value");
      expect(entry?.members?.length ?? 0, name).toBeGreaterThan(0);
      for (const member of entry?.members ?? []) expect(member.name, name).toMatch(/^[A-Z]+$/);
    }
  });

  test("TRANSITION lists the eleven built-in curves", () => {
    const members = api.find((entry) => entry.name === "TRANSITION")?.members?.map((member) => member.name);
    expect(members).toEqual(["LINEAR", "QUAD", "CUBIC", "QUART", "QUINT", "SINE", "EXPO", "CIRC", "BACK", "ELASTIC", "BOUNCE"]);
  });
});

describe("reference api: flow, events and bind", () => {
  test("covers the flow tags, events and bind entries", () => {
    const ids = api.map((entry) => entry.id);
    for (const id of ["event", "bind", "bind-prop", "bind-element", "if", "elseif", "else", "each", "for", "preset"]) {
      expect(ids).toContain(id);
    }
  });

  test("the flow tags are in the flow group", () => {
    const flow = api.filter((entry) => entry.group === "flow").map((entry) => entry.id);
    expect(flow).toEqual(["if", "elseif", "else", "each", "for"]);
  });

  test("PRESET lists its members in upper case with underscores", () => {
    const members = api.find((entry) => entry.name === "PRESET")?.members?.map((member) => member.name) ?? [];
    expect(members).toContain("FADE");
    expect(members).toContain("SLIDE_UP");
    for (const name of members) expect(name).toMatch(/^[A-Z_]+$/);
  });

  test("batch and untrack are gone from the public API", () => {
    const names = api.map((entry) => entry.name);
    expect(names).not.toContain("batch()");
    expect(names).not.toContain("untrack()");
  });
});
