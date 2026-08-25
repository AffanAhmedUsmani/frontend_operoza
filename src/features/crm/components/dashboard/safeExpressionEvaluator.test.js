import { describe, expect, it, vi } from "vitest";
import {
  evaluateSafeExpression,
  parseSafeExpression,
  validateSafeExpression,
} from "./safeExpressionEvaluator";

describe("safeExpressionEvaluator - security (Sprint 7 CRITICAL fix)", () => {
  it("never invokes the Function constructor, even indirectly", () => {
    // The whole point of this module: no code path should ever hand a
    // tenant-authored string to `new Function(...)` or `eval`. Spying on
    // the global Function constructor's call count is the most direct
    // proof available that evaluation never goes through it.
    const spy = vi.spyOn(globalThis, "Function");
    evaluateSafeExpression('sale.amount + "; alert(document.cookie); //"', { sale: { amount: 5 } });
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("a script-injection payload never executes and resolves to a safe fallback", () => {
    // Node has no `alert` global (unlike a browser), so it's stubbed
    // rather than spied-on - the point is the same either way: prove the
    // payload's side effect never fires.
    const alertSpy = vi.fn();
    vi.stubGlobal("alert", alertSpy);
    const payloads = [
      "alert(document.cookie)",
      "(function(){alert(1)})()",
      "sale.amount; alert(1)",
      "sale.amount + (alert(1), 1)",
      "`${alert(1)}`",
      "window.location='https://evil.example/steal'",
      "constructor.constructor('alert(1)')()",
      "sale.amount.constructor.constructor('return alert')()('x')",
    ];
    for (const payload of payloads) {
      const result = evaluateSafeExpression(payload, { sale: { amount: 5 } });
      // Whatever the result is, it must not be the product of executing
      // the payload as code - either it's rejected outright ("") or (for
      // a field-lookalike token) resolves to a plain, inert value.
      expect(alertSpy).not.toHaveBeenCalled();
      expect(typeof result === "string" || typeof result === "number" || result === "").toBe(true);
    }
    vi.unstubAllGlobals();
  });

  it("rejects a script payload at validation time with a clear error, not silent acceptance", () => {
    const { valid, error } = validateSafeExpression("alert(document.cookie)");
    expect(valid).toBe(false);
    expect(error).toMatch(/not allowed/i);
  });

  it("disallowed function names are rejected even when dressed up as calls", () => {
    for (const payload of ["eval(sale.amount)", "Function(sale.amount)", "setTimeout(sale.amount)"]) {
      expect(validateSafeExpression(payload).valid).toBe(false);
    }
  });

  it("rejects expressions that exceed the max length instead of hanging on pathological input", () => {
    const huge = "sale.amount + ".repeat(200) + "1";
    expect(validateSafeExpression(huge).valid).toBe(false);
  });
});

describe("safeExpressionEvaluator - correctness (matches the prior implementation's supported grammar)", () => {
  const row = {
    sale: { amount: 100, currency_code: "USD" },
    payload: { first_name: "Ada", last_name: "Lovelace", discount: 15 },
  };

  it("resolves a simple field reference", () => {
    expect(evaluateSafeExpression("sale.amount", row)).toBe(100);
  });

  it("computes arithmetic across field references", () => {
    expect(evaluateSafeExpression("sale.amount - payload.discount", row)).toBe(85);
    expect(evaluateSafeExpression("sale.amount * 1.1", row)).toBeCloseTo(110);
    expect(evaluateSafeExpression("(sale.amount + payload.discount) / 2", row)).toBe(57.5);
  });

  it("concat() joins string and field parts", () => {
    expect(evaluateSafeExpression('concat(payload.first_name, " ", payload.last_name)', row)).toBe(
      "Ada Lovelace"
    );
  });

  it("string literal + field mirrors the documented example syntax", () => {
    expect(evaluateSafeExpression('payload.first_name + " " + payload.last_name', row)).toBe(
      "Ada Lovelace"
    );
  });

  it("round() and abs() behave as expected", () => {
    expect(evaluateSafeExpression("round(3.7)", row)).toBe(4);
    expect(evaluateSafeExpression("abs(0 - 9)", row)).toBe(9);
  });

  it("num() coerces to a number", () => {
    expect(evaluateSafeExpression('num("42") + 1', row)).toBe(43);
  });

  it("missing field references resolve to a safe fallback, not a crash", () => {
    expect(evaluateSafeExpression("sale.does_not_exist", row)).toBe("");
  });

  it("division by zero resolves to 0, not Infinity/NaN", () => {
    expect(evaluateSafeExpression("sale.amount / 0", row)).toBe(0);
  });

  it("empty or blank expressions resolve to an empty string", () => {
    expect(evaluateSafeExpression("", row)).toBe("");
    expect(evaluateSafeExpression("   ", row)).toBe("");
  });

  it("parseSafeExpression exposes the AST for a valid expression without evaluating it", () => {
    const ast = parseSafeExpression("sale.amount + 1");
    expect(ast.type).toBe("binary");
    expect(ast.op).toBe("+");
  });

  it("malformed expressions are rejected by the validator with a helpful message", () => {
    expect(validateSafeExpression("sale.amount +").valid).toBe(false);
    expect(validateSafeExpression("((sale.amount)").valid).toBe(false);
    expect(validateSafeExpression("sale.amount 5").valid).toBe(false);
  });
});
