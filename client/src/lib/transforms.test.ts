/** Precision Console test suite: protect deterministic local transformations and their important error paths. */
import { describe, expect, it } from "vitest";
import { decodeBase64Utf8, decodeJwt, diffJson, encodeBase64Utf8, formatJson, formatJsonIssue, inferJsonSchema, jsonToCsv, jsonToTypeScript, jsonToYaml, minifyJson, parseJson, sortJsonKeys } from "./transforms";

describe("JSON parsing and formatting", () => {
  it("formats and minifies a valid nested JSON document", () => {
    const parsed = parseJson('{"name":"Ada","flags":[true,false]}');
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(formatJson(parsed.value, "2")).toContain('\n  "name": "Ada"');
    expect(minifyJson(parsed.value)).toBe('{"name":"Ada","flags":[true,false]}');
  });

  it("returns a useful diagnostic for malformed JSON", () => {
    const parsed = parseJson('{"name": }');
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.issue.message).toMatch(/Unexpected|JSON/i);
    expect(formatJsonIssue(parsed.issue)).toMatch(/Check|Line|JSON/i);
  });
});

describe("JSON conversions", () => {
  it("flattens nested JSON objects to CSV columns while preserving arrays in a cell", () => {
    const parsed = parseJson('[{"id":1,"profile":{"name":"Ada"},"roles":["admin"]}]');
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const csv = jsonToCsv(parsed.value);
    expect(csv).toContain("id,profile.name,roles");
    expect(csv).toContain('1,Ada,"[""admin""]"');
  });

  it("produces readable YAML and safely quotes ambiguous strings", () => {
    const parsed = parseJson('{"service":"devtools","enabled":true,"release":"2026-08-15"}');
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(jsonToYaml(parsed.value)).toBe('service: devtools\nenabled: true\nrelease: "2026-08-15"');
  });
});

describe("JSON normalization and modeling", () => {
  it("sorts nested object keys without changing array order", () => {
    const parsed = parseJson('{"zebra":{"z":1,"a":2},"apple":true,"items":["z","a"]}');
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(sortJsonKeys(parsed.value)).toEqual({ apple: true, items: ["z", "a"], zebra: { a: 2, z: 1 } });
    expect(sortJsonKeys(parsed.value, { order: "descending", caseInsensitive: true })).toEqual({ zebra: { z: 1, a: 2 }, items: ["z", "a"], apple: true });
  });

  it("infers a Draft 2020-12 schema with an explicit observed-required policy", () => {
    const schema = inferJsonSchema({ id: 42, profile: { active: true }, tags: ["json", "tool"] }, { title: "Profile", requiredFields: "all" });
    expect(schema.$schema).toBe("https://json-schema.org/draft/2020-12/schema");
    expect(schema.title).toBe("Profile");
    expect(schema.required).toEqual(["id", "profile", "tags"]);
    expect(schema.properties).toMatchObject({ id: { type: "integer" }, profile: { type: "object", required: ["active"] }, tags: { type: "array", items: { type: "string" } } });
    expect(inferJsonSchema({ id: 1 }, { requiredFields: "none" }).required).toBeUndefined();
  });

  it("generates deterministic nested TypeScript declarations and quotes unsafe property names", () => {
    const output = jsonToTypeScript({ id: 1, "display name": "Ada", profile: { active: true }, tags: ["json"] }, { rootName: "User profile", declarationStyle: "interface", exportDeclarations: true });
    expect(output).toContain("export interface UserProfile {");
    expect(output).toContain('"display name": string;');
    expect(output).toContain("profile: UserProfileProfile;");
    expect(output).toContain("export interface UserProfileProfile {");
    expect(jsonToTypeScript({ "世界": "ready" }, { rootName: "Payload" })).toContain('"世界": string;');
    expect(jsonToTypeScript([], { rootName: "Results", declarationStyle: "type", exportDeclarations: false })).toBe("type Results = unknown[];");
  });
});

describe("JSON structural diff", () => {
  it("identifies additions, removals, and changed values", () => {
    const before = parseJson('{"name":"Ada","old":true,"list":[1]}');
    const after = parseJson('{"name":"Grace","new":true,"list":[1,2]}');
    expect(before.ok && after.ok).toBe(true);
    if (!before.ok || !after.ok) return;
    const changes = diffJson(before.value, after.value);
    expect(changes).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: "changed", path: "$.name" }),
      expect.objectContaining({ kind: "removed", path: "$.old" }),
      expect.objectContaining({ kind: "added", path: "$.new" }),
      expect.objectContaining({ kind: "added", path: "$.list[1]" }),
    ]));
  });
});

describe("Base64 and JWT tools", () => {
  it("round-trips UTF-8 through Base64 and URL-safe Base64", () => {
    const source = "Hello, 世界";
    expect(decodeBase64Utf8(encodeBase64Utf8(source))).toBe(source);
    expect(decodeBase64Utf8(encodeBase64Utf8(source, true))).toBe(source);
  });

  it("decodes a three-part JWT but makes no signature claim", () => {
    const token = "eyJhbGciOiJub25lIn0.eyJzdWIiOiIxIiwiZXhwIjowfQ.";
    const decoded = decodeJwt(token);
    expect(decoded.header.alg).toBe("none");
    expect(decoded.payload.sub).toBe("1");
    expect(decoded.signaturePresent).toBe(false);
    expect(decoded.timestamps).toHaveLength(1);
  });
});
