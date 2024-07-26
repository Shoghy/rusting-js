import { test, expect } from "bun:test";
import { Enum } from "../../src/enums";
import { unreachable } from "../../src/panic";

test("Creating a `enum`", () => {
  class Option extends Enum({ Some: "unknown", None: "void" }) {
    // Add your own methods
  }

  //The next methods are all provided by the `Enum` returned class.
  const some = Option.create("Some", 1);
  expect(some.is("Some")).toBeTrue();

  some.match({
    Some: (x) => expect(x).toBe(1),
    None: () => unreachable("Hardcoded `Some`"),
  });
});