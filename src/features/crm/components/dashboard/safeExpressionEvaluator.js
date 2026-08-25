/**
 * safeExpressionEvaluator.js
 * ---------------------------
 * Sprint 7 (docs/SPRINT_PLAN.md) - CRITICAL security fix.
 *
 * Replaces the "calculated column" feature's `new Function(...)` evaluator
 * (confirmed genuine stored-XSS: any tenant admin editing a dashboard
 * widget's config could inject JavaScript that executed in every future
 * viewer's browser). This module never constructs or executes a program
 * from a string - no `eval`, no `Function` constructor, anywhere below.
 *
 * Instead it mirrors the same shape the backend's existing safe formula
 * engine already uses (crm/formula_engine.py): tokenize the expression ->
 * parse into a whitelisted AST (only node types this module defines) ->
 * validate every node against an explicit allowlist -> walk the AST with
 * a hand-written interpreter. A malicious payload either fails to
 * tokenize/parse (rejected before it ever becomes an AST) or parses into
 * node types this interpreter doesn't know how to execute as code - there
 * is no path from the input string to arbitrary JS execution.
 *
 * Supported grammar (matching what the "calculated column" UI already
 * documents to users - see PropertiesPanel.jsx's helper text):
 *   expression := term (('+' | '-') term)*
 *   term       := factor (('*' | '/') factor)*
 *   factor     := NUMBER | STRING | FIELD_REF | CALL | '(' expression ')'
 *   CALL       := ('concat' | 'num' | 'round' | 'abs') '(' (expression (',' expression)*)? ')'
 *   FIELD_REF  := dotted identifier, e.g. sale.amount / payload.first_name
 */

export class ExpressionValidationError extends Error {}

const ALLOWED_FUNCTIONS = new Set(["concat", "num", "round", "abs"]);
const MAX_EXPRESSION_LENGTH = 500;
const MAX_AST_DEPTH = 20;

// One token pattern, matched sequentially from the current position (not
// globally) so unrecognized characters - anything outside this exact set -
// simply fail to tokenize rather than being silently skipped.
const TOKEN_PATTERN =
  /^\s*(?:(?<NUMBER>\d+(?:\.\d+)?)|(?<STRING>"[^"]*"|'[^']*')|(?<OP>\+|-|\*|\/)|(?<LPAREN>\()|(?<RPAREN>\))|(?<COMMA>,)|(?<FIELD>[A-Za-z_]\w*(?:\.[A-Za-z_]\w+)+)|(?<IDENT>[A-Za-z_]\w*))/;

function tokenize(expression) {
  if (typeof expression !== "string") {
    throw new ExpressionValidationError("Expression must be a string");
  }
  if (expression.length > MAX_EXPRESSION_LENGTH) {
    throw new ExpressionValidationError(`Expression exceeds max length ${MAX_EXPRESSION_LENGTH}`);
  }

  const tokens = [];
  let remaining = expression;
  let consumedTotal = 0;

  while (remaining.length > 0) {
    const match = TOKEN_PATTERN.exec(remaining);
    if (!match || match[0].length === 0) {
      const snippet = remaining.slice(0, 20);
      throw new ExpressionValidationError(`Invalid token near: ${snippet}`);
    }
    const groups = match.groups || {};
    const kind = Object.keys(groups).find((key) => groups[key] !== undefined);
    if (kind) {
      tokens.push({ kind, value: groups[kind] });
    }
    consumedTotal += match[0].length;
    remaining = expression.slice(consumedTotal);
  }

  return tokens;
}

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.index = 0;
  }

  peek() {
    return this.index < this.tokens.length ? this.tokens[this.index] : null;
  }

  consume(kind) {
    const token = this.peek();
    if (!token) {
      throw new ExpressionValidationError("Unexpected end of expression");
    }
    if (kind && token.kind !== kind) {
      throw new ExpressionValidationError(`Expected ${kind}, got ${token.kind}`);
    }
    this.index += 1;
    return token;
  }

  parse() {
    const node = this.parseExpression();
    if (this.peek() !== null) {
      throw new ExpressionValidationError("Unexpected trailing tokens");
    }
    return node;
  }

  parseExpression() {
    let node = this.parseTerm();
    for (;;) {
      const token = this.peek();
      if (token && token.kind === "OP" && (token.value === "+" || token.value === "-")) {
        this.consume("OP");
        node = { type: "binary", op: token.value, left: node, right: this.parseTerm() };
        continue;
      }
      return node;
    }
  }

  parseTerm() {
    let node = this.parseFactor();
    for (;;) {
      const token = this.peek();
      if (token && token.kind === "OP" && (token.value === "*" || token.value === "/")) {
        this.consume("OP");
        node = { type: "binary", op: token.value, left: node, right: this.parseFactor() };
        continue;
      }
      return node;
    }
  }

  parseFactor() {
    const token = this.peek();
    if (!token) {
      throw new ExpressionValidationError("Expression cannot end unexpectedly");
    }

    if (token.kind === "NUMBER") {
      this.consume("NUMBER");
      return { type: "number", value: Number(token.value) };
    }

    if (token.kind === "STRING") {
      this.consume("STRING");
      return { type: "string", value: token.value.slice(1, -1) };
    }

    if (token.kind === "FIELD") {
      this.consume("FIELD");
      return { type: "field", ref: token.value };
    }

    if (token.kind === "IDENT") {
      const name = token.value;
      if (!ALLOWED_FUNCTIONS.has(name)) {
        throw new ExpressionValidationError(`Function not allowed: ${name}`);
      }
      this.consume("IDENT");
      this.consume("LPAREN");
      const args = [];
      if (this.peek() && this.peek().kind !== "RPAREN") {
        args.push(this.parseExpression());
        while (this.peek() && this.peek().kind === "COMMA") {
          this.consume("COMMA");
          args.push(this.parseExpression());
        }
      }
      this.consume("RPAREN");
      return { type: "call", name, args };
    }

    if (token.kind === "LPAREN") {
      this.consume("LPAREN");
      const node = this.parseExpression();
      this.consume("RPAREN");
      return node;
    }

    throw new ExpressionValidationError(`Unsupported token: ${token.value}`);
  }
}

function walkValidate(node, depth = 0) {
  if (depth > MAX_AST_DEPTH) {
    throw new ExpressionValidationError("Expression is too deeply nested");
  }
  switch (node.type) {
    case "number":
    case "string":
    case "field":
      return;
    case "call":
      if (!ALLOWED_FUNCTIONS.has(node.name)) {
        throw new ExpressionValidationError(`Function not allowed: ${node.name}`);
      }
      node.args.forEach((arg) => walkValidate(arg, depth + 1));
      return;
    case "binary":
      walkValidate(node.left, depth + 1);
      walkValidate(node.right, depth + 1);
      return;
    default:
      throw new ExpressionValidationError(`Unsupported AST node: ${node.type}`);
  }
}

/** Parses and validates an expression, throwing ExpressionValidationError
 * on anything outside the whitelisted grammar. Never evaluates. */
export function parseSafeExpression(expression) {
  const tokens = tokenize(expression);
  const parser = new Parser(tokens);
  const ast = parser.parse();
  walkValidate(ast);
  return ast;
}

/** Returns {valid: true} or {valid: false, error} - for live feedback in
 * the editor, without needing row data to evaluate against. */
export function validateSafeExpression(expression) {
  try {
    parseSafeExpression(expression);
    return { valid: true, error: "" };
  } catch (err) {
    return { valid: false, error: err.message || "Invalid expression" };
  }
}

function getRowValue(row, ref) {
  if (!row || !ref) {
    return undefined;
  }
  return String(ref)
    .split(".")
    .reduce((value, key) => (value && typeof value === "object" ? value[key] : undefined), row);
}

function evaluateNode(node, row) {
  switch (node.type) {
    case "number":
      return node.value;
    case "string":
      return node.value;
    case "field":
      return getRowValue(row, node.ref);
    case "call": {
      const args = node.args.map((arg) => evaluateNode(arg, row));
      if (node.name === "concat") {
        return args.filter((part) => part !== null && part !== undefined).map(String).join("");
      }
      if (node.name === "num") {
        return Number(args[0] || 0);
      }
      if (node.name === "round") {
        return Math.round(args[0]);
      }
      if (node.name === "abs") {
        return Math.abs(args[0]);
      }
      // Unreachable: walkValidate already rejects any other name during
      // parseSafeExpression, before evaluation ever runs.
      throw new ExpressionValidationError(`Function not allowed: ${node.name}`);
    }
    case "binary": {
      const left = evaluateNode(node.left, row);
      const right = evaluateNode(node.right, row);
      // Plain operators applied to already-evaluated primitive values -
      // not code constructed from the tenant's string, so this is exactly
      // as safe as any other arithmetic in this codebase.
      if (node.op === "+") return left + right;
      if (node.op === "-") return Number(left || 0) - Number(right || 0);
      if (node.op === "*") return Number(left || 0) * Number(right || 0);
      if (node.op === "/") {
        const divisor = Number(right || 0);
        return divisor === 0 ? 0 : Number(left || 0) / divisor;
      }
      throw new ExpressionValidationError(`Unsupported operator: ${node.op}`);
    }
    default:
      throw new ExpressionValidationError(`Unsupported AST node: ${node.type}`);
  }
}

/** Evaluates a calculated-column expression against one row. Never
 * throws - any parse or evaluation failure (including a deliberately
 * malicious payload that doesn't fit the whitelisted grammar) resolves to
 * "", matching the prior implementation's fallback behavior exactly. */
export function evaluateSafeExpression(expression, row) {
  const trimmed = String(expression || "").trim();
  if (!trimmed) {
    return "";
  }
  try {
    const ast = parseSafeExpression(trimmed);
    const result = evaluateNode(ast, row);
    if (result === null || result === undefined || result === "") {
      return "";
    }
    return result;
  } catch (_) {
    return "";
  }
}
