import fs from "fs";
import path from "path";
import { describe, it, expect } from "vitest";
import { convertIOSXmlToAndroid } from "./xmlTransforms";

function canonicalize(xml: string) {
  // remove xml declaration
  xml = xml.replace(/<\?xml[\s\S]*?\?>\s*/, "");
  // collapse whitespace between tags
  xml = xml.replace(/>\s+</g, "><").trim();
  // normalize inner whitespace
  xml = xml.replace(/\s+/g, " ");
  return xml;
}

describe("convertIOSXmlToAndroid", () => {
  it("matches expected android mock", () => {
    const iosPath = path.resolve(
      process.cwd(),
      "client/src/mocks/ios_input_mock.xml"
    );
    const androidPath = path.resolve(
      process.cwd(),
      "client/src/mocks/android_output_mock.xml"
    );
    const ios = fs.readFileSync(iosPath, "utf-8");
    const expected = fs.readFileSync(androidPath, "utf-8");

    const actual = convertIOSXmlToAndroid(ios);
    expect(actual).not.toBeNull();

    const a = canonicalize(actual as string);
    const e = canonicalize(expected);

    expect(a).toBe(e);
  });
});
