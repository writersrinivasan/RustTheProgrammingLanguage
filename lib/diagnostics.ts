export type Diagnostic = {
  severity: "error" | "warning" | "panic" | "tip";
  code?: string;
  message: string;
  line?: number;
  col?: number;
  title: string;
  explain: string;
  fix?: string;
};

type Explainer = { title: string; explain: string; fix: string };

/** Friendly explanations for the compiler errors learners hit most. */
export const ERROR_CODES: Record<string, Explainer> = {
  E0382: {
    title: "Use after move",
    explain: "A value was moved (its ownership transferred) and then used again. Non-`Copy` types like `String` and `Vec` move on assignment, function calls and `for` loops.",
    fix: "Borrow instead (`&value`), call `.clone()` if you really need two copies, or restructure so the value is used before it moves.",
  },
  E0499: {
    title: "Two mutable borrows at once",
    explain: "Rust allows only one `&mut` reference to a value at a time, which prevents data races and iterator invalidation.",
    fix: "Shorten the first borrow's lifetime (finish using it first), split data with `split_at_mut`, or use indices.",
  },
  E0502: {
    title: "Mutable borrow while immutably borrowed",
    explain: "You have a shared reference (`&`) still in use, and you tried to mutate the same value. Readers and writers can't coexist.",
    fix: "Move the last use of the shared reference before the mutation, or copy/clone the value you need out first.",
  },
  E0505: {
    title: "Moved while borrowed",
    explain: "You moved a value while a reference to it was still alive.",
    fix: "End the borrow before moving, or clone the value.",
  },
  E0506: {
    title: "Assigned while borrowed",
    explain: "You assigned to a variable while a reference to it is still in use.",
    fix: "Finish using the reference before assigning.",
  },
  E0507: {
    title: "Cannot move out of a borrow",
    explain: "You tried to take ownership of something you only have a reference to (e.g. moving a `String` out of `&Vec<String>`).",
    fix: "Borrow it (`&v[i]`), `.clone()` it, or use `std::mem::take` / `Option::take` when you own the container mutably.",
  },
  E0308: {
    title: "Mismatched types",
    explain: "The compiler expected one type but found another. Common causes: a trailing `;` that makes a block return `()`, `String` vs `&str`, or integer type differences.",
    fix: "Read the 'expected X, found Y' note. Remove a stray semicolon, use `.to_string()` / `&s`, or convert numbers with `as` / `try_into()`.",
  },
  E0425: {
    title: "Unknown name",
    explain: "A variable or function name is not in scope — maybe a typo, or it's defined in another scope or module.",
    fix: "Check spelling, scope (variables in `{}` blocks don't escape), and add a `use` for items in other modules.",
  },
  E0433: {
    title: "Unresolved path",
    explain: "A path like `HashMap::new` couldn't be resolved, usually because of a missing `use`.",
    fix: "Add the import, e.g. `use std::collections::HashMap;`.",
  },
  E0432: {
    title: "Unresolved import",
    explain: "A `use` statement points to something that doesn't exist (or a crate that isn't available).",
    fix: "Double-check the path and crate name.",
  },
  E0599: {
    title: "No such method",
    explain: "The method doesn't exist for this type, or the trait providing it isn't in scope, or the trait bound isn't satisfied.",
    fix: "Check the type you actually have (hover it in your editor), import the trait (`use std::io::Write;`), or add a `#[derive(...)]`.",
  },
  E0277: {
    title: "Trait bound not satisfied",
    explain: "A type doesn't implement a trait that's required — e.g. printing with `{}` needs `Display`, `{:?}` needs `Debug`, sending across threads needs `Send`, `sort()` needs `Ord`.",
    fix: "Derive or implement the trait (`#[derive(Debug)]`), use a different type (`Arc` instead of `Rc`), or use another method (`sort_by`).",
  },
  E0106: {
    title: "Missing lifetime specifier",
    explain: "A returned reference (or a struct field reference) must say which input it borrows from, and the elision rules couldn't figure it out.",
    fix: "Add a lifetime parameter: `fn f<'a>(x: &'a str, y: &'a str) -> &'a str`, or return an owned value (`String`).",
  },
  E0384: {
    title: "Assigning twice to an immutable variable",
    explain: "Variables are immutable by default.",
    fix: "Declare it with `let mut`, or use shadowing (`let x = x + 1;`).",
  },
  E0596: {
    title: "Borrowing immutable as mutable",
    explain: "You need `&mut` access but the variable isn't declared mutable (or you only have `&`).",
    fix: "Declare with `let mut`, or take `&mut self` / `&mut T` in the function signature.",
  },
  E0597: {
    title: "Value does not live long enough",
    explain: "A reference outlives the value it points to — the value is dropped at the end of its scope while the reference is still used.",
    fix: "Move the value to an outer scope, or return/store an owned value instead of a reference.",
  },
  E0716: {
    title: "Temporary dropped while borrowed",
    explain: "You borrowed from a temporary value that is freed at the end of the statement.",
    fix: "Bind the temporary to a `let` variable first so it lives longer.",
  },
  E0373: {
    title: "Closure may outlive borrowed value",
    explain: "A closure (often passed to `thread::spawn`) borrows a local variable, but might run after the function returns.",
    fix: "Add `move` before the closure to transfer ownership, or use `std::thread::scope`.",
  },
  E0004: {
    title: "Non-exhaustive match",
    explain: "Your `match` doesn't handle every possible value.",
    fix: "Add the missing arms listed in the error, or a catch-all `_ => ...` arm.",
  },
  E0061: {
    title: "Wrong number of arguments",
    explain: "The function was called with a different number of arguments than it declares.",
    fix: "Match the function signature.",
  },
  E0369: {
    title: "Binary operator not supported",
    explain: "An operator like `+` or `==` isn't implemented for these types (e.g. comparing a struct without `PartialEq`).",
    fix: "Derive `PartialEq`/`PartialOrd`, implement `std::ops::Add`, or convert the operands.",
  },
  E0614: {
    title: "Cannot dereference",
    explain: "You used `*` on something that isn't a reference or smart pointer.",
    fix: "Remove the `*` — the value is already owned.",
  },
  E0616: {
    title: "Private field",
    explain: "The field isn't `pub`, so code outside its module can't access it.",
    fix: "Use a getter method or make the field `pub`.",
  },
  E0603: {
    title: "Private item",
    explain: "The function/struct/module isn't public.",
    fix: "Mark it `pub` or access it from inside the module.",
  },
  E0046: {
    title: "Missing trait items",
    explain: "An `impl Trait for Type` block doesn't implement all required methods.",
    fix: "Implement the missing methods listed in the error.",
  },
  E0053: {
    title: "Method signature mismatch",
    explain: "A trait method implementation has a different signature than the trait declares.",
    fix: "Copy the exact signature from the trait definition.",
  },
  E0560: {
    title: "Unknown struct field",
    explain: "You used a field name that the struct doesn't have.",
    fix: "Check spelling against the struct definition.",
  },
  E0063: {
    title: "Missing struct fields",
    explain: "When constructing a struct, every field must be provided.",
    fix: "Add the missing fields, or use `..Default::default()`.",
  },
  E0282: {
    title: "Type annotations needed",
    explain: "The compiler can't infer a type — common with `collect()` and `parse()`.",
    fix: "Annotate: `let v: Vec<i32> = ...collect();` or use turbofish `parse::<i32>()`.",
  },
  E0423: {
    title: "Expected value, found type",
    explain: "You used a struct/type name where a value was expected.",
    fix: "Construct it (`Point { x: 1, y: 2 }` or `Point::new()`).",
  },
  E0015: {
    title: "Non-const call in a constant",
    explain: "Constants and statics can only be initialized with const-evaluable expressions.",
    fix: "Use a `const fn`, `std::sync::LazyLock`, or initialize at runtime.",
  },
  E0133: {
    title: "Unsafe operation outside unsafe",
    explain: "Dereferencing raw pointers or calling unsafe functions requires an `unsafe` block.",
    fix: "Wrap the operation in `unsafe { ... }` and document why it's sound with a `// SAFETY:` comment.",
  },
  E0601: {
    title: "No main function",
    explain: "A binary crate needs `fn main()`.",
    fix: "Add `fn main() {}`.",
  },
};

const WARNINGS: { re: RegExp; title: string; explain: string; fix: string }[] = [
  { re: /unused variable/, title: "Unused variable", explain: "A variable is declared but never read.", fix: "Use it, remove it, or prefix with `_` to signal it's intentional." },
  { re: /variable does not need to be mutable/, title: "Needless `mut`", explain: "The variable is never mutated.", fix: "Remove `mut` — immutable-by-default makes code easier to reason about." },
  { re: /never used|never read|never constructed/, title: "Dead code", explain: "An item is defined but never used.", fix: "Remove it, use it, or add `#[allow(dead_code)]` while prototyping." },
  { re: /unused import/, title: "Unused import", explain: "A `use` statement brings in something you don't use.", fix: "Remove the import." },
  { re: /unused .* that must be used/, title: "Ignored must-use value", explain: "You discarded a value that's important to handle — like a `Result` (an ignored error) or a lazy iterator/future that will never run.", fix: "Handle the `Result` with `?`/`match`, consume the iterator, or `.await` the future." },
  { re: /unreachable/, title: "Unreachable code", explain: "This code can never execute (e.g. after `return`, `panic!` or `todo!`).", fix: "Remove it or fix the control flow." },
];

const PANICS: { re: RegExp; title: string; explain: string; fix: string }[] = [
  { re: /not yet implemented/, title: "todo!() reached", explain: "The program hit a `todo!()` placeholder.", fix: "Replace `todo!()` with your implementation." },
  { re: /index out of bounds/, title: "Index out of bounds", explain: "You indexed past the end of a slice/Vec. Rust checks bounds at runtime instead of reading random memory.", fix: "Use `.get(i)` which returns `Option`, or check `.len()` first." },
  { re: /called `Option::unwrap\(\)` on a `None` value/, title: "unwrap() on None", explain: "You assumed an `Option` had a value, but it was `None`.", fix: "Use `if let Some(x)`, `match`, `unwrap_or(default)`, or `?`." },
  { re: /called `Result::unwrap\(\)` on an `Err` value/, title: "unwrap() on Err", explain: "An operation failed and `.unwrap()` turned the error into a crash.", fix: "Handle the error with `match`, `?`, or `unwrap_or_else`." },
  { re: /attempt to (add|subtract|multiply|negate|shift) .*overflow/, title: "Integer overflow", explain: "Arithmetic exceeded the type's range. Debug builds panic; release builds wrap silently.", fix: "Use a wider type, or `checked_*`, `wrapping_*`, `saturating_*` methods." },
  { re: /attempt to divide by zero|attempt to calculate the remainder with a divisor of zero/, title: "Division by zero", explain: "Integer division by zero always panics.", fix: "Check the divisor, or use `checked_div`." },
  { re: /already (mutably )?borrowed/, title: "RefCell borrow conflict", explain: "A `RefCell` was borrowed in a conflicting way at runtime.", fix: "Drop the earlier `borrow()`/`borrow_mut()` guard first, or use `try_borrow_mut`." },
  { re: /assertion `left == right` failed|assertion failed/, title: "Assertion failed", explain: "An `assert!`/`assert_eq!` check failed — the actual value didn't match the expectation.", fix: "Compare the `left` (your result) and `right` (expected) values shown in the output." },
  { re: /byte index .* is not a char boundary/, title: "Sliced inside a UTF-8 character", explain: "String slicing uses byte offsets; you cut a multi-byte character in half.", fix: "Use `.chars()` / `.char_indices()` to find valid boundaries." },
  { re: /stack overflow/, title: "Stack overflow", explain: "Usually unbounded recursion.", fix: "Add a base case, or convert recursion to iteration." },
];

/** Parse rustc/cargo stderr + test stdout into friendly diagnostics. */
export function parseDiagnostics(stderr: string, stdout: string, lineOffset = 0): Diagnostic[] {
  const out: Diagnostic[] = [];
  const lines = stderr.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(error|warning)(?:\[(E\d{4})\])?: (.+)$/);
    if (!m) continue;
    const [, sev, code, message] = m;
    // skip cargo summary lines
    if (/^(could not compile|aborting|test failed|build failed)/.test(message) || /generated \d+ warning/.test(message)) continue;
    let line: number | undefined;
    let col: number | undefined;
    for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
      const loc = lines[j].match(/-->\s+src\/(?:main|lib)\.rs:(\d+):(\d+)/);
      if (loc) {
        line = Number(loc[1]) - lineOffset;
        col = Number(loc[2]);
        break;
      }
    }
    if (sev === "error") {
      const ex = code ? ERROR_CODES[code] : undefined;
      out.push({
        severity: "error",
        code,
        message,
        line,
        col,
        title: ex?.title ?? "Compile error",
        explain: ex?.explain ?? "Read the compiler message carefully — rustc usually points at the exact span and often suggests a fix in a `help:` line.",
        fix: ex?.fix ?? extractHelp(lines, i),
      });
    } else {
      const w = WARNINGS.find((w) => w.re.test(message));
      out.push({
        severity: "warning",
        code,
        message,
        line,
        col,
        title: w?.title ?? "Warning",
        explain: w?.explain ?? "Warnings don't stop compilation but often point to real bugs.",
        fix: w?.fix ?? extractHelp(lines, i),
      });
    }
  }

  const all = stderr + "\n" + stdout;
  const panicRe = /panicked at src\/(?:main|lib)\.rs:(\d+):(\d+):\n(.+)/g;
  let pm: RegExpExecArray | null;
  const seen = new Set<string>();
  while ((pm = panicRe.exec(all))) {
    const msg = pm[3];
    const p = PANICS.find((p) => p.re.test(msg));
    const key = `${pm[1]}:${msg}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const ln = Number(pm[1]) - lineOffset;
    out.push({
      severity: "panic",
      message: msg,
      line: ln > 0 ? ln : undefined,
      col: Number(pm[2]),
      title: p?.title ?? "Runtime panic",
      explain: p?.explain ?? "The program panicked: an unrecoverable error stopped the current thread.",
      fix: p?.fix,
    });
  }
  return out;
}

function extractHelp(lines: string[], from: number) {
  for (let j = from + 1; j < Math.min(from + 25, lines.length); j++) {
    if (/^(error|warning)/.test(lines[j])) break;
    const h = lines[j].match(/=?\s*help: (.+)$/);
    if (h) return h[1];
  }
  return undefined;
}

/** Static "coach" tips on idioms, before or after running. */
export function codeTips(code: string): Diagnostic[] {
  const tips: Diagnostic[] = [];
  const lines = code.split("\n");
  const find = (re: RegExp) => lines.findIndex((l) => re.test(l) && !l.trim().startsWith("//")) + 1 || undefined;

  const stringParam = find(/fn\s+\w+[^)]*:\s*&String\b/);
  if (stringParam)
    tips.push({ severity: "tip", line: stringParam, message: "&String parameter", title: "Prefer &str over &String", explain: "`&str` accepts string literals, `&String` and slices — strictly more flexible at zero cost.", fix: "Change the parameter type to `&str`." });

  const vecParam = find(/fn\s+\w+[^)]*:\s*&Vec</);
  if (vecParam)
    tips.push({ severity: "tip", line: vecParam, message: "&Vec<T> parameter", title: "Prefer &[T] over &Vec<T>", explain: "A slice works with Vecs, arrays and sub-slices.", fix: "Change `&Vec<T>` to `&[T]`." });

  const unwraps = (code.match(/\.unwrap\(\)/g) || []).length;
  if (unwraps >= 3)
    tips.push({ severity: "tip", message: `${unwraps} × unwrap()`, title: "Lots of unwrap()", explain: "Each `unwrap()` is a potential panic. Fine in tests and prototypes, risky in production.", fix: "Return `Result` and use `?`, or `expect(\"reason\")` to document invariants." });

  const clones = (code.match(/\.clone\(\)/g) || []).length;
  if (clones >= 4)
    tips.push({ severity: "tip", message: `${clones} × clone()`, title: "Clone-heavy code", explain: "Frequent cloning often means a borrow would work instead.", fix: "Try passing references (`&T`) and see whether the borrow checker agrees." });

  const forIdx = find(/for\s+\w+\s+in\s+0\.\.\s*\w+\.len\(\)/);
  if (forIdx)
    tips.push({ severity: "tip", line: forIdx, message: "index loop", title: "Index-based loop", explain: "`for i in 0..v.len()` adds bounds checks and is less idiomatic.", fix: "Use `for x in &v` or `for (i, x) in v.iter().enumerate()`." });

  const ret = find(/^\s*return\s+[^;]+;\s*$/);
  if (ret && /^\s*}\s*$/.test(lines[ret] ?? ""))
    tips.push({ severity: "tip", line: ret, message: "trailing return", title: "Trailing `return`", explain: "The last expression of a block is its value, so a final `return x;` is unidiomatic.", fix: "Write just `x` (without semicolon) as the last line." });

  return tips;
}

export type TestResult = { name: string; status: "ok" | "failed" | "ignored"; detail?: string };

export function parseTests(stdout: string): { results: TestResult[]; summary?: string } {
  const results: TestResult[] = [];
  const re = /^test (\S+) \.\.\. (ok|FAILED|ignored)/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(stdout))) {
    results.push({ name: m[1], status: m[2] === "ok" ? "ok" : m[2] === "FAILED" ? "failed" : "ignored" });
  }
  for (const r of results) {
    if (r.status !== "failed") continue;
    const block = stdout.split(`---- ${r.name} stdout ----`)[1];
    if (block) r.detail = block.split(/\n----|\n\nfailures:/)[0].replace(/note: run with `RUST_BACKTRACE.*\n?/, "").trim();
  }
  const summary = stdout.match(/test result: .*/)?.[0];
  return { results, summary };
}
