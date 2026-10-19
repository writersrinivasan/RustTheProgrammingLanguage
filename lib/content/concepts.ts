import type { QuizQ } from "@/components/Quiz";

export type Concept = {
  id: string;
  title: string;
  emoji: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  gradient: string;
  summary: string;
  analogy: string;
  sections: { heading: string; body: string; code?: string }[];
  keyPoints: string[];
  quiz: QuizQ[];
};

export const CONCEPTS: Concept[] = [
  {
    id: "basics",
    title: "Variables, Types & Functions",
    emoji: "🧱",
    level: "Beginner",
    gradient: "from-sky-500 to-cyan-400",
    summary: "Rust is statically typed with powerful inference. Variables are immutable by default, and almost everything is an expression.",
    analogy: "Think of `let` as writing in pen, and `let mut` as writing in pencil — you must ask for the eraser explicitly.",
    sections: [
      {
        heading: "Immutability by default",
        body: "Bindings created with `let` cannot change. Add `mut` when you genuinely need mutation. This makes data flow explicit and lets the compiler catch accidental changes.",
        code: `fn main() {
    let x = 5;          // immutable
    let mut count = 0;  // mutable
    count += x;
    println!("count = {count}");

    // Shadowing: a *new* binding with the same name
    let x = x * 2;
    println!("x is now {x}");
}`,
      },
      {
        heading: "Scalar & compound types",
        body: "Integers (`i8`…`i128`, `u8`…`u128`, `isize`/`usize`), floats (`f32`, `f64`), `bool`, and `char` (a 4-byte Unicode scalar). Tuples and fixed-size arrays group values.",
        code: `fn main() {
    let big: u64 = 1_000_000;
    let pi = 3.14159_f64;
    let crab: char = '🦀';
    let point: (i32, i32) = (3, -7);
    let primes = [2, 3, 5, 7, 11];

    let (px, py) = point; // destructuring
    println!("{big} {pi} {crab} ({px},{py}) first prime = {}", primes[0]);
}`,
      },
      {
        heading: "Functions are expressions",
        body: "The last expression in a block (without a semicolon) is its value. Adding a `;` turns it into a statement that evaluates to `()` — a classic beginner error (E0308).",
        code: `fn square(n: i32) -> i32 {
    n * n // no semicolon: this is the return value
}

fn main() {
    let grade = if square(7) > 40 { "big" } else { "small" };
    println!("49 is {grade}");
}`,
      },
    ],
    keyPoints: [
      "`let` is immutable; opt in to `mut`.",
      "Shadowing creates a new variable and may change its type.",
      "Blocks, `if`, and `match` are expressions that produce values.",
      "A trailing `;` turns an expression into a statement returning `()`.",
    ],
    quiz: [
      {
        id: "basics-1",
        q: "What does `let x = 5; x = 6;` produce?",
        options: ["x becomes 6", "Compile error E0384", "Runtime panic", "A warning only"],
        answer: 1,
        why: "E0384: cannot assign twice to an immutable variable. Use `let mut x`.",
      },
      {
        id: "basics-2",
        q: "Size of a Rust `char`?",
        options: ["1 byte", "2 bytes", "4 bytes", "Variable"],
        answer: 2,
        why: "A `char` is a Unicode scalar value, always 4 bytes. Strings, however, are UTF-8 encoded.",
      },
    ],
  },
  {
    id: "ownership",
    title: "Ownership",
    emoji: "🔑",
    level: "Beginner",
    gradient: "from-rust-500 to-amber-400",
    summary: "Every value has exactly one owner. When the owner goes out of scope, the value is dropped. This is how Rust gets memory safety without a garbage collector.",
    analogy: "Ownership is like a house key: you can hand it to someone (move), lend it briefly (borrow), or cut a copy (clone) — but there's only ever one original holder.",
    sections: [
      {
        heading: "The three rules",
        body: "1) Each value has an owner. 2) There is only one owner at a time. 3) When the owner goes out of scope, the value is dropped (its memory freed via `Drop`).",
        code: `fn main() {
    {
        let s = String::from("hello"); // s owns heap memory
        println!("{s}");
    } // s goes out of scope -> memory freed automatically
}`,
      },
      {
        heading: "Moves",
        body: "Assigning a heap-owning value or passing it to a function *moves* ownership. The old binding becomes unusable — the compiler rejects use-after-move (E0382).",
        code: `fn consume(s: String) {
    println!("consumed {s}");
} // s dropped here

fn main() {
    let a = String::from("rust");
    let b = a;            // move: a is no longer valid
    consume(b);           // move into the function
    // println!("{a}");   // error[E0382]: borrow of moved value
}`,
      },
      {
        heading: "Copy vs Clone",
        body: "Simple stack-only types (integers, bools, chars, and tuples of them) implement `Copy`: assignment duplicates bits and the original stays valid. Heap types need an explicit `.clone()`, which makes costs visible.",
        code: `fn main() {
    let n = 10;
    let m = n;          // Copy: both usable
    println!("{n} {m}");

    let s1 = String::from("deep");
    let s2 = s1.clone(); // explicit deep copy
    println!("{s1} {s2}");
}`,
      },
    ],
    keyPoints: [
      "One owner at a time; drop happens deterministically at scope end.",
      "Moves are cheap (a pointer copy) — but invalidate the source.",
      "`Copy` types are duplicated implicitly; `Clone` is explicit.",
      "No GC, no manual free(), no double-free, no use-after-free.",
    ],
    quiz: [
      {
        id: "own-1",
        q: "After `let b = a;` where `a: String`, what happens to `a`?",
        options: ["It's copied", "It's moved and invalid", "It's borrowed", "It becomes empty string"],
        answer: 1,
        why: "`String` is not `Copy`, so ownership moves to `b`. Using `a` afterwards is E0382.",
      },
      {
        id: "own-2",
        q: "Which type is `Copy`?",
        options: ["String", "Vec<i32>", "(i32, bool)", "Box<u8>"],
        answer: 2,
        why: "Tuples of `Copy` types are `Copy`. Anything owning heap memory is not.",
      },
    ],
  },
  {
    id: "borrowing",
    title: "Borrowing & References",
    emoji: "🤝",
    level: "Beginner",
    gradient: "from-emerald-500 to-teal-400",
    summary: "References let you use a value without taking ownership. The borrow checker enforces: many readers OR one writer — never both.",
    analogy: "A library book: many people can read copies on the shelf at once, but when someone is editing the master copy, no one else may touch it.",
    sections: [
      {
        heading: "Shared references (&T)",
        body: "You may have any number of `&T` at the same time. They are read-only.",
        code: `fn len(s: &String) -> usize {
    s.len()
}

fn main() {
    let name = String::from("Ferris");
    let r1 = &name;
    let r2 = &name;
    println!("{} {} {}", r1, r2, len(&name));
    println!("still mine: {name}");
}`,
      },
      {
        heading: "Mutable references (&mut T)",
        body: "Exactly one `&mut T` may exist at a time, and no `&T` may coexist with it. This rule eliminates data races at compile time.",
        code: `fn shout(s: &mut String) {
    s.push_str("!!!");
}

fn main() {
    let mut msg = String::from("hello");
    shout(&mut msg);
    println!("{msg}");
}`,
      },
      {
        heading: "Non-Lexical Lifetimes (NLL)",
        body: "A borrow lasts until its *last use*, not until the end of the scope. This is why the code below compiles: `first` is last used before the mutation.",
        code: `fn main() {
    let mut v = vec![1, 2, 3];
    let first = &v[0];
    println!("first = {first}"); // last use of the shared borrow
    v.push(4);                    // OK thanks to NLL
    println!("{v:?}");
}`,
      },
    ],
    keyPoints: [
      "`&T`: many at once, read-only.",
      "`&mut T`: exactly one, exclusive.",
      "References must never outlive the data (no dangling pointers).",
      "Borrows end at their last use (NLL).",
    ],
    quiz: [
      {
        id: "borrow-1",
        q: "Can you hold `&v` and call `v.push(1)` while `&v` is still used later?",
        options: ["Yes", "No — E0502", "Only in release mode", "Only with unsafe"],
        answer: 1,
        why: "E0502: cannot borrow as mutable because it is also borrowed as immutable.",
      },
      {
        id: "borrow-2",
        q: "Best parameter type for a function that only reads a string?",
        options: ["String", "&String", "&str", "&mut str"],
        answer: 2,
        why: "`&str` accepts `&String` (via deref coercion), string literals and slices — the most flexible.",
      },
    ],
  },
  {
    id: "lifetimes",
    title: "Lifetimes",
    emoji: "⏳",
    level: "Intermediate",
    gradient: "from-fuchsia-500 to-pink-400",
    summary: "Lifetimes are names for regions where a reference is valid. They don't change how long data lives — they let the compiler check relationships between references.",
    analogy: "A lifetime is the expiry date printed on a borrowed ticket. The compiler checks you never use a ticket after its event ended.",
    sections: [
      {
        heading: "Why annotations are needed",
        body: "When a function returns a reference derived from multiple inputs, the compiler needs to know which input it's tied to.",
        code: `fn longest<'a>(a: &'a str, b: &'a str) -> &'a str {
    if a.len() >= b.len() { a } else { b }
}

fn main() {
    let x = String::from("crustacean");
    let result;
    {
        let y = String::from("crab");
        result = longest(&x, &y);
        println!("longest: {result}");
    }
}`,
      },
      {
        heading: "Elision rules",
        body: "Most of the time you write no lifetimes: (1) each input reference gets its own lifetime; (2) if there's exactly one input lifetime it's assigned to all outputs; (3) if there's `&self`/`&mut self`, its lifetime is assigned to outputs.",
        code: `// Elided: fn first_word(s: &str) -> &str
fn first_word<'a>(s: &'a str) -> &'a str {
    s.split_whitespace().next().unwrap_or("")
}

fn main() {
    println!("{}", first_word("hello world"));
}`,
      },
      {
        heading: "Structs holding references",
        body: "A struct that stores a reference must declare a lifetime parameter, guaranteeing the struct can't outlive what it points to.",
        code: `struct Excerpt<'a> {
    part: &'a str,
}

fn main() {
    let novel = String::from("Call me Ishmael. Some years ago...");
    let first = novel.split('.').next().unwrap();
    let e = Excerpt { part: first };
    println!("{}", e.part);
}`,
      },
    ],
    keyPoints: [
      "Lifetimes describe, they don't extend.",
      "`'static` means valid for the whole program (e.g. string literals).",
      "Elision rules remove most annotations.",
      "E0106 (missing lifetime) and E0597 (does not live long enough) are the common errors.",
    ],
    quiz: [
      {
        id: "life-1",
        q: "What is the lifetime of a string literal like \"hi\"?",
        options: ["'a", "'static", "'_", "It has none"],
        answer: 1,
        why: "String literals are baked into the binary, so they're `&'static str`.",
      },
      {
        id: "life-2",
        q: "Do lifetime annotations make values live longer?",
        options: ["Yes", "No"],
        answer: 1,
        why: "They only describe constraints for the checker; they never change runtime behaviour.",
      },
    ],
  },
  {
    id: "structs-enums",
    title: "Structs, Enums & Pattern Matching",
    emoji: "🧩",
    level: "Beginner",
    gradient: "from-violet-500 to-indigo-400",
    summary: "Structs group data; enums model *one of several* possibilities (algebraic data types). `match` forces you to handle every case.",
    analogy: "An enum is a vending machine slot that holds exactly one kind of item at a time — and `match` makes you plan for every possible item.",
    sections: [
      {
        heading: "Structs and impl blocks",
        body: "Methods live in `impl` blocks. `&self` borrows, `&mut self` mutably borrows, and `self` consumes.",
        code: `#[derive(Debug)]
struct Rect { w: u32, h: u32 }

impl Rect {
    fn new(w: u32, h: u32) -> Self { Self { w, h } }
    fn area(&self) -> u32 { self.w * self.h }
    fn scale(&mut self, k: u32) { self.w *= k; self.h *= k; }
}

fn main() {
    let mut r = Rect::new(3, 4);
    r.scale(2);
    println!("{r:?} area={}", r.area());
}`,
      },
      {
        heading: "Enums carry data",
        body: "Each variant can hold different data. `Option<T>` and `Result<T, E>` are just enums — there is no null in safe Rust.",
        code: `enum Shape {
    Circle { r: f64 },
    Square(f64),
    Point,
}

fn area(s: &Shape) -> f64 {
    match s {
        Shape::Circle { r } => std::f64::consts::PI * r * r,
        Shape::Square(side) => side * side,
        Shape::Point => 0.0,
    }
}

fn main() {
    for s in [Shape::Circle { r: 1.0 }, Shape::Square(2.0), Shape::Point] {
        println!("{:.2}", area(&s));
    }
}`,
      },
      {
        heading: "Powerful patterns",
        body: "Guards, ranges, bindings with `@`, `if let`, and `let ... else` make control flow concise and exhaustive.",
        code: `fn classify(n: i32) -> &'static str {
    match n {
        i32::MIN..=-1 => "negative",
        0 => "zero",
        x if x % 2 == 0 => "positive even",
        _ => "positive odd",
    }
}

fn parse_age(s: &str) -> u8 {
    let Ok(age) = s.parse::<u8>() else {
        return 0;
    };
    age
}

fn main() {
    println!("{} {}", classify(-5), classify(8));
    if let Some(c) = "rust".chars().next() {
        println!("starts with {c}");
    }
    println!("age = {}", parse_age("42"));
}`,
      },
    ],
    keyPoints: [
      "`match` must be exhaustive (E0004 otherwise).",
      "`Option<T>` replaces null; `Result<T, E>` replaces exceptions.",
      "`#[derive(Debug, Clone, PartialEq)]` auto-implements common traits.",
      "`if let` / `let else` for single-pattern cases.",
    ],
    quiz: [
      {
        id: "enum-1",
        q: "What happens if a `match` on an enum misses a variant?",
        options: ["Runtime panic", "Compile error E0004", "Falls through silently", "Warning"],
        answer: 1,
        why: "Exhaustiveness is checked at compile time: E0004 non-exhaustive patterns.",
      },
    ],
  },
  {
    id: "errors",
    title: "Error Handling",
    emoji: "🛟",
    level: "Beginner",
    gradient: "from-red-500 to-orange-400",
    summary: "Recoverable errors use `Result<T, E>`; unrecoverable ones `panic!`. The `?` operator propagates errors with automatic conversion via `From`.",
    analogy: "`Result` is a sealed envelope: it holds either the letter you wanted or an explanation of why it didn't arrive. You must open it before reading.",
    sections: [
      {
        heading: "Result and the ? operator",
        body: "`?` returns early on `Err`, converting the error with `From::from`. It works in functions returning `Result` or `Option`.",
        code: `use std::num::ParseIntError;

fn sum_strs(a: &str, b: &str) -> Result<i64, ParseIntError> {
    let x: i64 = a.trim().parse()?;
    let y: i64 = b.trim().parse()?;
    Ok(x + y)
}

fn main() {
    match sum_strs("40", " 2 ") {
        Ok(v) => println!("sum = {v}"),
        Err(e) => println!("error: {e}"),
    }
    println!("{:?}", sum_strs("4o", "2"));
}`,
      },
      {
        heading: "Custom error types",
        body: "Define an enum of failure modes, implement `Display` and `std::error::Error`, and `From` for ergonomic `?`. Libraries like `thiserror` (for libraries) and `anyhow` (for apps) remove the boilerplate.",
        code: `use std::fmt;

#[derive(Debug)]
enum AppError { Empty, TooLong(usize) }

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            AppError::Empty => write!(f, "input was empty"),
            AppError::TooLong(n) => write!(f, "input too long: {n} chars"),
        }
    }
}
impl std::error::Error for AppError {}

fn validate(s: &str) -> Result<&str, AppError> {
    if s.is_empty() { return Err(AppError::Empty); }
    if s.len() > 8 { return Err(AppError::TooLong(s.len())); }
    Ok(s)
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("{}", validate("ferris")?);
    if let Err(e) = validate("supercalifragilistic") { println!("{e}"); }
    Ok(())
}`,
      },
    ],
    keyPoints: [
      "Prefer `Result` + `?` over `unwrap()` in real code.",
      "`unwrap`/`expect` are fine in tests, prototypes, and proven invariants.",
      "`main` can return `Result<(), E>`.",
      "`thiserror` for libraries, `anyhow` for applications.",
    ],
    quiz: [
      {
        id: "err-1",
        q: "What does `?` do on an `Err(e)`?",
        options: ["Panics", "Returns Err(From::from(e)) early", "Ignores it", "Logs and continues"],
        answer: 1,
        why: "It early-returns the error, converting with `From` so different error types can compose.",
      },
    ],
  },
  {
    id: "traits-generics",
    title: "Traits & Generics",
    emoji: "🧬",
    level: "Intermediate",
    gradient: "from-purple-500 to-fuchsia-400",
    summary: "Traits define shared behaviour; generics write code once for many types. Monomorphization makes generic code as fast as hand-written specialized code.",
    analogy: "A trait is a job description (\"can fly\"). Generics say: \"hire anyone who matches this description\".",
    sections: [
      {
        heading: "Defining and implementing traits",
        body: "Traits can have default methods. Implement a trait for your own types (or for foreign types, if the trait is yours — the orphan rule).",
        code: `trait Speak {
    fn name(&self) -> String;
    fn greet(&self) -> String {
        format!("Hi, I'm {}!", self.name()) // default method
    }
}

struct Crab;
struct Robot { id: u32 }

impl Speak for Crab { fn name(&self) -> String { "Ferris".into() } }
impl Speak for Robot {
    fn name(&self) -> String { format!("RX-{}", self.id) }
    fn greet(&self) -> String { format!("BEEP. UNIT {} ONLINE.", self.name()) }
}

fn main() {
    println!("{}", Crab.greet());
    println!("{}", Robot { id: 7 }.greet());
}`,
      },
      {
        heading: "Static vs dynamic dispatch",
        body: "`impl Trait` / `<T: Trait>` are monomorphized (static dispatch, zero-cost). `dyn Trait` uses a vtable (dynamic dispatch) and enables heterogeneous collections.",
        code: `use std::fmt::Display;

fn show_static<T: Display>(item: T) -> String { format!("<{item}>") }

fn show_all(items: &[Box<dyn Display>]) {
    for i in items { print!("{i} "); }
    println!();
}

fn main() {
    println!("{} {}", show_static(42), show_static("hi"));
    let mixed: Vec<Box<dyn Display>> = vec![Box::new(1), Box::new("two"), Box::new(3.5)];
    show_all(&mixed);
}`,
      },
      {
        heading: "Trait bounds & where clauses",
        body: "Combine bounds with `+`; move complex bounds into a `where` clause for readability.",
        code: `use std::collections::HashMap;
use std::hash::Hash;

fn count<T>(items: &[T]) -> HashMap<T, usize>
where
    T: Hash + Eq + Clone,
{
    let mut map = HashMap::new();
    for it in items {
        *map.entry(it.clone()).or_insert(0) += 1;
    }
    map
}

fn main() {
    let c = count(&["a", "b", "a", "c", "a"]);
    println!("a appears {} times", c["a"]);
}`,
      },
    ],
    keyPoints: [
      "Generics are monomorphized: zero runtime cost, larger binaries.",
      "`dyn Trait` trades a vtable call for flexibility.",
      "Orphan rule: implement trait for type only if you own one of them.",
      "Common std traits: Debug, Clone, Copy, PartialEq, Eq, Hash, Default, From/Into, Iterator, Display.",
    ],
    quiz: [
      {
        id: "trait-1",
        q: "Which uses dynamic dispatch?",
        options: ["fn f(x: impl Display)", "fn f<T: Display>(x: T)", "fn f(x: &dyn Display)", "All of them"],
        answer: 2,
        why: "`dyn Trait` is a trait object with a vtable; the others are monomorphized.",
      },
    ],
  },
  {
    id: "collections-iterators",
    title: "Collections, Closures & Iterators",
    emoji: "🔁",
    level: "Intermediate",
    gradient: "from-cyan-500 to-blue-400",
    summary: "`Vec`, `HashMap`, `String` and friends, plus lazy, chainable iterators and closures that compile down to tight loops.",
    analogy: "An iterator chain is an assembly line: nothing moves until someone at the end (`collect`, `sum`, `for`) pulls an item through.",
    sections: [
      {
        heading: "Iterator chains are lazy",
        body: "Adapters like `map`/`filter` do nothing until a consumer (`collect`, `sum`, `count`, `for`) drives them. The optimizer usually turns chains into a single loop.",
        code: `fn main() {
    let nums = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let even_squares: Vec<i32> = nums
        .iter()
        .filter(|&&n| n % 2 == 0)
        .map(|&n| n * n)
        .collect();
    let total: i32 = even_squares.iter().sum();
    println!("{even_squares:?} sum={total}");
}`,
      },
      {
        heading: "iter vs iter_mut vs into_iter",
        body: "`iter()` yields `&T`, `iter_mut()` yields `&mut T`, `into_iter()` yields `T` (consuming the collection).",
        code: `fn main() {
    let mut scores = vec![10, 20, 30];
    for s in scores.iter_mut() { *s += 1; }
    let names = vec![String::from("a"), String::from("b")];
    let upper: Vec<String> = names.into_iter().map(|n| n.to_uppercase()).collect();
    // names is moved now
    println!("{scores:?} {upper:?}");
}`,
      },
      {
        heading: "Closures capture their environment",
        body: "Closures implement `Fn` (borrow), `FnMut` (mutably borrow) or `FnOnce` (take ownership). `move` forces captured values to be moved in — essential for threads.",
        code: `fn apply<F: Fn(i32) -> i32>(f: F, x: i32) -> i32 { f(x) }

fn main() {
    let offset = 10;
    let add = |x| x + offset;      // Fn: borrows offset
    println!("{}", apply(add, 5));

    let mut counter = 0;
    let mut inc = || counter += 1; // FnMut
    inc(); inc();
    println!("counter = {counter}");
}`,
      },
    ],
    keyPoints: [
      "Iterators are lazy and zero-cost.",
      "Choose `iter` / `iter_mut` / `into_iter` deliberately.",
      "`HashMap::entry` API avoids double lookups.",
      "Closures: Fn ⊂ FnMut ⊂ FnOnce.",
    ],
    quiz: [
      {
        id: "iter-1",
        q: "What does `v.iter().map(|x| x * 2);` (with nothing after) do?",
        options: ["Doubles each element", "Nothing — iterators are lazy", "Panics", "Returns a Vec"],
        answer: 1,
        why: "Without a consumer, the chain never runs (and the compiler warns `unused must be used`).",
      },
    ],
  },
  {
    id: "smart-pointers",
    title: "Smart Pointers & Interior Mutability",
    emoji: "📦",
    level: "Intermediate",
    gradient: "from-amber-500 to-yellow-300",
    summary: "`Box`, `Rc`, `Arc`, `RefCell`, `Cell`, `Mutex` — tools for heap allocation, shared ownership and controlled mutation.",
    analogy: "`Rc` is a shared Netflix account with a counter of members; the account closes when the last member leaves.",
    sections: [
      {
        heading: "Box<T> for heap & recursion",
        body: "Recursive types need indirection because their size must be known at compile time.",
        code: `#[derive(Debug)]
enum List { Cons(i32, Box<List>), Nil }
use List::{Cons, Nil};

fn sum(l: &List) -> i32 {
    match l { Cons(v, rest) => v + sum(rest), Nil => 0 }
}

fn main() {
    let list = Cons(1, Box::new(Cons(2, Box::new(Cons(3, Box::new(Nil))))));
    println!("{list:?} => {}", sum(&list));
}`,
      },
      {
        heading: "Rc<RefCell<T>>: shared + mutable (single thread)",
        body: "`Rc` provides shared ownership via reference counting. `RefCell` moves borrow checking to runtime — violating it panics instead of failing to compile.",
        code: `use std::cell::RefCell;
use std::rc::Rc;

fn main() {
    let shared = Rc::new(RefCell::new(vec![1, 2]));
    let a = Rc::clone(&shared);
    let b = Rc::clone(&shared);
    a.borrow_mut().push(3);
    b.borrow_mut().push(4);
    println!("{:?} (owners: {})", shared.borrow(), Rc::strong_count(&shared));
}`,
      },
    ],
    keyPoints: [
      "`Box<T>`: single owner, heap allocated.",
      "`Rc<T>` single-threaded, `Arc<T>` thread-safe (atomic) refcount.",
      "`RefCell<T>`: runtime borrow checks; `Mutex<T>`: thread-safe equivalent.",
      "Use `Weak<T>` to break reference cycles (memory leaks are *safe* but undesirable).",
    ],
    quiz: [
      {
        id: "sp-1",
        q: "Shared ownership across threads needs…",
        options: ["Rc<T>", "Arc<T>", "Box<T>", "RefCell<T>"],
        answer: 1,
        why: "`Rc` is not `Send`; `Arc` uses atomic reference counting and is thread-safe.",
      },
    ],
  },
  {
    id: "concurrency",
    title: "Fearless Concurrency",
    emoji: "⚡",
    level: "Intermediate",
    gradient: "from-yellow-400 to-lime-400",
    summary: "Ownership + the `Send`/`Sync` marker traits make data races a compile-time error. Threads, channels, mutexes and scoped threads are all in std.",
    analogy: "The compiler is a strict air-traffic controller: two planes (threads) can never be cleared to write to the same runway at the same time.",
    sections: [
      {
        heading: "Arc<Mutex<T>>",
        body: "Share state between threads by wrapping it in `Arc` (shared ownership) and `Mutex` (exclusive access). The lock guard unlocks when dropped.",
        code: `use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];
    for _ in 0..8 {
        let c = Arc::clone(&counter);
        handles.push(thread::spawn(move || {
            for _ in 0..1000 { *c.lock().unwrap() += 1; }
        }));
    }
    for h in handles { h.join().unwrap(); }
    println!("total = {}", *counter.lock().unwrap());
}`,
      },
      {
        heading: "Channels (message passing)",
        body: "\"Do not communicate by sharing memory; share memory by communicating.\" `mpsc` = multiple producer, single consumer.",
        code: `use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel();
    for id in 0..3 {
        let tx = tx.clone();
        thread::spawn(move || tx.send(format!("worker {id} done")).unwrap());
    }
    drop(tx); // close the original sender so rx ends
    for msg in rx { println!("{msg}"); }
}`,
      },
      {
        heading: "Scoped threads",
        body: "`thread::scope` lets threads borrow local data safely because they're guaranteed to finish before the scope ends.",
        code: `fn main() {
    let data = vec![1, 2, 3, 4, 5, 6];
    let (left, right) = data.split_at(3);
    let (a, b) = std::thread::scope(|s| {
        let h1 = s.spawn(|| left.iter().sum::<i32>());
        let h2 = s.spawn(|| right.iter().sum::<i32>());
        (h1.join().unwrap(), h2.join().unwrap())
    });
    println!("{a} + {b} = {}", a + b);
}`,
      },
    ],
    keyPoints: [
      "`Send`: safe to move to another thread. `Sync`: safe to share `&T` across threads.",
      "Data races are compile errors; deadlocks are still possible.",
      "Use Rayon for easy data parallelism (`par_iter`).",
    ],
    quiz: [
      {
        id: "conc-1",
        q: "Why does `thread::spawn(|| println!(\"{}\", v.len()))` fail when `v` is a local Vec?",
        options: ["Vec isn't Send", "Closure may outlive v — needs `move`", "println! isn't thread safe", "It doesn't fail"],
        answer: 1,
        why: "E0373: the closure may outlive the current function; add `move` or use `thread::scope`.",
      },
    ],
  },
  {
    id: "async",
    title: "Async / Await",
    emoji: "🌀",
    level: "Advanced",
    gradient: "from-blue-500 to-violet-500",
    summary: "Async functions return futures — state machines that make progress only when polled by a runtime (Tokio, async-std, smol, Embassy).",
    analogy: "A future is a recipe card, not a meal. Nothing gets cooked until a chef (the executor) picks it up and works on it.",
    sections: [
      {
        heading: "Futures are lazy",
        body: "Calling an `async fn` does nothing until `.await`ed or spawned. Rust ships no built-in runtime; you choose one. Tokio dominates for servers.",
        code: `// Cargo.toml: tokio = { version = "1", features = ["full"] }
// (The Playground includes tokio.)
use tokio::time::{sleep, Duration};

async fn fetch(id: u32) -> String {
    sleep(Duration::from_millis(100 * id as u64)).await;
    format!("result #{id}")
}

#[tokio::main]
async fn main() {
    let (a, b, c) = tokio::join!(fetch(3), fetch(1), fetch(2));
    println!("{a}, {b}, {c}");
}`,
      },
      {
        heading: "Mental model",
        body: "The compiler turns each `async fn` into an enum-like state machine. `.await` points are where it can yield. Blocking calls (e.g. `std::thread::sleep`) inside async code stall the whole executor thread — use `spawn_blocking`.",
      },
    ],
    keyPoints: [
      "`async fn` → returns `impl Future`.",
      "Need a runtime: `#[tokio::main]`.",
      "Don't block inside async; use async I/O or `spawn_blocking`.",
      "`async fn` in traits is stable since Rust 1.75.",
    ],
    quiz: [
      {
        id: "async-1",
        q: "What happens when you call an async fn without .await?",
        options: ["It runs in the background", "It creates a future that does nothing", "Compile error", "It blocks"],
        answer: 1,
        why: "Futures are lazy. The compiler warns `unused implementer of Future that must be used`.",
      },
    ],
  },
  {
    id: "modules-cargo",
    title: "Modules, Crates & Cargo",
    emoji: "📚",
    level: "Beginner",
    gradient: "from-lime-500 to-emerald-400",
    summary: "Cargo builds, tests, documents and publishes. Modules control visibility; crates are compilation units; crates.io is the registry.",
    analogy: "A crate is a book, modules are chapters, and `pub` decides which pages are visible to readers outside the book.",
    sections: [
      {
        heading: "Modules and visibility",
        body: "Everything is private by default. `pub` exposes items; `pub(crate)` exposes within the crate only.",
        code: `mod bank {
    pub struct Account { pub owner: String, balance: u64 }
    impl Account {
        pub fn open(owner: &str) -> Self { Self { owner: owner.into(), balance: 0 } }
        pub fn deposit(&mut self, amt: u64) { self.balance += amt; }
        pub fn balance(&self) -> u64 { self.balance }
    }
}

use bank::Account;

fn main() {
    let mut acc = Account::open("Ferris");
    acc.deposit(100);
    // acc.balance = 1_000_000; // error[E0616]: field is private
    println!("{} has {}", acc.owner, acc.balance());
}`,
      },
      {
        heading: "Everyday Cargo commands",
        body: "`cargo new app` · `cargo build --release` · `cargo run` · `cargo test` · `cargo clippy` (linter) · `cargo fmt` · `cargo doc --open` · `cargo add serde` · `cargo bench` · workspaces for multi-crate repos.",
      },
    ],
    keyPoints: [
      "Private by default; `pub`, `pub(crate)`, `pub(super)`.",
      "`Cargo.lock` pins exact versions for reproducible builds.",
      "Features (`[features]`) enable optional functionality.",
      "Clippy + rustfmt are standard in CI.",
    ],
    quiz: [
      {
        id: "cargo-1",
        q: "Which command runs Rust's official linter?",
        options: ["cargo lint", "cargo clippy", "cargo check --lint", "rustfmt"],
        answer: 1,
        why: "Clippy provides 700+ lints. `cargo check` only type-checks, `rustfmt` formats.",
      },
    ],
  },
  {
    id: "testing",
    title: "Testing & Documentation",
    emoji: "🧪",
    level: "Beginner",
    gradient: "from-teal-500 to-sky-400",
    summary: "Unit tests live beside code, integration tests in `tests/`, and examples in doc comments are compiled and run as doctests.",
    analogy: "Rust treats tests like seatbelts that come pre-installed — `cargo test` is always one command away.",
    sections: [
      {
        heading: "Unit tests",
        body: "`#[cfg(test)]` modules are compiled only for `cargo test`. Use `assert!`, `assert_eq!`, `assert_ne!`, and `#[should_panic]`.",
        code: `pub fn fizzbuzz(n: u32) -> String {
    match (n % 3, n % 5) {
        (0, 0) => "FizzBuzz".into(),
        (0, _) => "Fizz".into(),
        (_, 0) => "Buzz".into(),
        _ => n.to_string(),
    }
}

fn main() { println!("{}", fizzbuzz(15)); }

#[cfg(test)]
mod tests {
    use super::*;
    #[test] fn fizz() { assert_eq!(fizzbuzz(9), "Fizz"); }
    #[test] fn buzz() { assert_eq!(fizzbuzz(10), "Buzz"); }
    #[test] fn both() { assert_eq!(fizzbuzz(30), "FizzBuzz"); }
}`,
      },
    ],
    keyPoints: [
      "Run the Playground's “Run Tests” to execute `cargo test`.",
      "`///` doc comments generate docs; code blocks inside are doctests.",
      "Property testing: `proptest`; benchmarking: `criterion`.",
    ],
    quiz: [
      {
        id: "test-1",
        q: "Where do integration tests live?",
        options: ["src/tests.rs", "tests/ directory", "benches/", "examples/"],
        answer: 1,
        why: "Each file in `tests/` is compiled as a separate crate that uses your public API.",
      },
    ],
  },
  {
    id: "macros",
    title: "Macros",
    emoji: "🪄",
    level: "Advanced",
    gradient: "from-pink-500 to-rose-400",
    summary: "Declarative macros (`macro_rules!`) match syntax patterns; procedural macros (derive, attribute, function-like) run Rust code at compile time to generate code.",
    analogy: "A macro is a stencil for code: you describe the shape once and stamp it out wherever needed.",
    sections: [
      {
        heading: "macro_rules!",
        body: "Match token patterns with repetitions `$(...),*` and expand to code. Hygiene prevents accidental name collisions.",
        code: `macro_rules! hashmap {
    ($($k:expr => $v:expr),* $(,)?) => {{
        let mut m = std::collections::HashMap::new();
        $( m.insert($k, $v); )*
        m
    }};
}

fn main() {
    let ages = hashmap! { "ferris" => 9, "corro" => 4 };
    println!("{:?}", ages.get("ferris"));
}`,
      },
    ],
    keyPoints: [
      "Macros end with `!` when invoked (`println!`, `vec!`).",
      "Proc macros power `#[derive(Serialize)]`, `#[tokio::main]`.",
      "Prefer functions/generics first; reach for macros for syntax-level needs.",
    ],
    quiz: [
      {
        id: "macro-1",
        q: "`#[derive(Debug)]` is an example of…",
        options: ["A declarative macro", "A procedural derive macro", "A trait object", "A lint"],
        answer: 1,
        why: "Derive macros are procedural macros that generate trait implementations.",
      },
    ],
  },
  {
    id: "unsafe-ffi",
    title: "Unsafe Rust & FFI",
    emoji: "🔮",
    level: "Advanced",
    gradient: "from-slate-500 to-zinc-400",
    summary: "`unsafe` unlocks five superpowers (raw pointer deref, unsafe fn calls, mutable statics, unsafe traits, union fields). It does NOT turn off the borrow checker.",
    analogy: "`unsafe` is a signed waiver: you promise the compiler you've personally verified the invariants it can't check.",
    sections: [
      {
        heading: "The five superpowers",
        body: "Wrap small unsafe blocks in safe abstractions and document the invariants with `// SAFETY:` comments. `Vec`, `String`, and `HashMap` are built this way.",
        code: `fn split_at_mut(v: &mut [i32], mid: usize) -> (&mut [i32], &mut [i32]) {
    let len = v.len();
    let ptr = v.as_mut_ptr();
    assert!(mid <= len);
    // SAFETY: the two halves don't overlap and are within bounds.
    unsafe {
        (
            std::slice::from_raw_parts_mut(ptr, mid),
            std::slice::from_raw_parts_mut(ptr.add(mid), len - mid),
        )
    }
}

fn main() {
    let mut arr = [1, 2, 3, 4, 5];
    let (a, b) = split_at_mut(&mut arr, 2);
    a[0] = 100; b[0] = 300;
    println!("{arr:?}");
}`,
      },
      {
        heading: "Calling C (FFI)",
        body: "Declare foreign functions in an `extern \"C\"` block. In the 2024 edition such blocks must be written `unsafe extern \"C\"`. Tools: `bindgen` (C → Rust), `cbindgen` (Rust → C), `cxx` (C++), `PyO3` (Python), `napi-rs` (Node).",
        code: `unsafe extern "C" {
    fn abs(input: i32) -> i32;
}

fn main() {
    // SAFETY: libc's abs has no preconditions for these inputs.
    let v = unsafe { abs(-42) };
    println!("abs(-42) = {v}");
}`,
      },
    ],
    keyPoints: [
      "Unsafe doesn't disable borrow checking on references.",
      "Keep unsafe blocks tiny; expose safe APIs.",
      "Use Miri to detect undefined behaviour in tests.",
    ],
    quiz: [
      {
        id: "unsafe-1",
        q: "Does `unsafe` disable the borrow checker?",
        options: ["Yes", "No"],
        answer: 1,
        why: "It only enables five extra operations; all normal checks still apply to references.",
      },
    ],
  },
];
