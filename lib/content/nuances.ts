export type Nuance = {
  id: string;
  title: string;
  category: "Ownership" | "Types" | "Strings" | "Traits" | "Runtime" | "Concurrency" | "Patterns";
  surprise: string;
  wrong?: string;
  right: string;
  why: string;
};

export const NUANCES: Nuance[] = [
  {
    id: "string-vs-str",
    title: "String vs &str",
    category: "Strings",
    surprise: "There are two main string types and they are not interchangeable.",
    wrong: `fn greet(name: String) { println!("hi {name}"); }

fn main() {
    greet("ferris"); // error[E0308]: expected String, found &str
}`,
    right: `fn greet(name: &str) { println!("hi {name}"); }

fn main() {
    let owned = String::from("corro");
    greet("ferris");   // &'static str
    greet(&owned);     // &String coerces to &str
}`,
    why: "`String` is an owned, growable, heap buffer. `&str` is a borrowed view (pointer + length) into UTF-8 bytes. Take `&str` in parameters; return `String` when you create new text.",
  },
  {
    id: "string-index",
    title: "You can't index a String by number",
    category: "Strings",
    surprise: "`s[0]` doesn't compile, because strings are UTF-8 and characters can be 1–4 bytes.",
    wrong: `fn main() {
    let s = String::from("héllo");
    let c = s[1]; // error[E0277]: the type \`str\` cannot be indexed by \`{integer}\`
}`,
    right: `fn main() {
    let s = String::from("héllo");
    let second = s.chars().nth(1);   // Some('é')
    let bytes = s.len();             // 6 bytes, not 5 chars!
    let slice = &s[0..1];            // byte range; panics if not on a char boundary
    println!("{second:?} {bytes} {slice} chars={}", s.chars().count());
}`,
    why: "Rust refuses to pretend O(1) char indexing exists. Use `.chars()`, `.char_indices()`, or `.bytes()` and be explicit about what you mean.",
  },
  {
    id: "shadow-vs-mut",
    title: "Shadowing ≠ mutation",
    category: "Types",
    surprise: "Re-declaring with `let` creates a brand-new variable — even with a different type.",
    right: `fn main() {
    let spaces = "   ";
    let spaces = spaces.len(); // new binding, now usize
    println!("{spaces}");

    let x = 1;
    {
        let x = x + 10; // shadows only inside this block
        println!("inner {x}");
    }
    println!("outer {x}"); // still 1
}`,
    why: "Shadowing is great for transformations (`let input = input.trim();`). `mut` changes the same variable in place and cannot change its type.",
  },
  {
    id: "overflow",
    title: "Integer overflow: debug panics, release wraps",
    category: "Runtime",
    surprise: "The same arithmetic behaves differently in debug and release builds.",
    wrong: `fn main() {
    let x: u8 = 255;
    let y = x + std::hint::black_box(1); // debug: panic 'attempt to add with overflow'
    println!("{y}");
}`,
    right: `fn main() {
    let x: u8 = 255;
    println!("{:?}", x.checked_add(1));   // None
    println!("{}", x.wrapping_add(1));    // 0
    println!("{}", x.saturating_add(1));  // 255
    println!("{:?}", x.overflowing_add(1)); // (0, true)
}`,
    why: "Release builds wrap (two's complement) for speed unless `overflow-checks = true`. Make intent explicit with `checked_*`, `wrapping_*`, `saturating_*`.",
  },
  {
    id: "move-in-loop",
    title: "Moving inside a loop",
    category: "Ownership",
    surprise: "A value moved in the first iteration is gone for the second.",
    wrong: `fn take(v: Vec<i32>) -> usize { v.len() }

fn main() {
    let data = vec![1, 2, 3];
    for _ in 0..2 {
        take(data); // error[E0382]: value moved here, in previous iteration of loop
    }
}`,
    right: `fn take(v: &[i32]) -> usize { v.len() }

fn main() {
    let data = vec![1, 2, 3];
    for _ in 0..2 {
        println!("{}", take(&data)); // borrow instead
    }
}`,
    why: "Borrow when you only need to read. Clone only when you really need an independent copy.",
  },
  {
    id: "for-moves",
    title: "`for x in vec` consumes the vec",
    category: "Ownership",
    surprise: "Looping over a collection by value moves it.",
    wrong: `fn main() {
    let names = vec![String::from("a"), String::from("b")];
    for n in names { println!("{n}"); }
    println!("{}", names.len()); // error[E0382]: borrow of moved value
}`,
    right: `fn main() {
    let names = vec![String::from("a"), String::from("b")];
    for n in &names { println!("{n}"); } // iterate by reference
    println!("{}", names.len());
}`,
    why: "`for x in v` calls `IntoIterator::into_iter(v)`. Use `&v` for `&T`, `&mut v` for `&mut T`.",
  },
  {
    id: "question-from",
    title: "`?` silently converts errors via From",
    category: "Traits",
    surprise: "`?` can turn a `ParseIntError` into your custom error type automatically.",
    right: `use std::num::ParseIntError;

#[derive(Debug)]
enum MyErr { Parse(ParseIntError) }

impl From<ParseIntError> for MyErr {
    fn from(e: ParseIntError) -> Self { MyErr::Parse(e) }
}

fn double(s: &str) -> Result<i32, MyErr> {
    let n: i32 = s.parse()?; // ParseIntError -> MyErr via From
    Ok(n * 2)
}

fn main() {
    println!("{:?}", double("21"));
    if let Err(MyErr::Parse(e)) = double("x") {
        println!("converted error: {e}");
    }
}`,
    why: "`expr?` desugars roughly to `match expr { Ok(v) => v, Err(e) => return Err(From::from(e)) }`.",
  },
  {
    id: "dyn-vs-impl",
    title: "`impl Trait` in return position is ONE concrete type",
    category: "Traits",
    surprise: "You can't return different types from branches with `impl Trait`.",
    wrong: `use std::fmt::Display;

fn pick(b: bool) -> impl Display {
    if b { 1 } else { "one" } // error[E0308]: if and else have incompatible types
}

fn main() { println!("{}", pick(true)); }`,
    right: `use std::fmt::Display;

fn pick(b: bool) -> Box<dyn Display> {
    if b { Box::new(1) } else { Box::new("one") }
}

fn main() { println!("{} {}", pick(true), pick(false)); }`,
    why: "`impl Trait` is an opaque *single* type chosen by the function (static dispatch). Multiple types need a trait object (`Box<dyn Trait>`) or an enum.",
  },
  {
    id: "deref-coercion",
    title: "Deref coercion does quiet magic",
    category: "Types",
    surprise: "`&String` becomes `&str`, `&Vec<T>` becomes `&[T]`, `&Box<T>` becomes `&T` automatically.",
    right: `fn total(xs: &[i32]) -> i32 { xs.iter().sum() }
fn shout(s: &str) -> String { s.to_uppercase() }

fn main() {
    let v = vec![1, 2, 3];
    let b = Box::new(String::from("boxed"));
    println!("{} {}", total(&v), shout(&b)); // &Vec->&[i32], &Box<String>->&str
}`,
    why: "When types don't match, the compiler inserts `*` derefs through `Deref` impls. That's why `&[T]` and `&str` are the idiomatic parameter types.",
  },
  {
    id: "refcell-panic",
    title: "RefCell moves borrow errors to runtime",
    category: "Runtime",
    surprise: "Code that would be a compile error becomes a panic.",
    wrong: `use std::cell::RefCell;

fn main() {
    let c = RefCell::new(vec![1]);
    let r = c.borrow();
    c.borrow_mut().push(2); // panic: already borrowed: BorrowMutError
    println!("{r:?}");
}`,
    right: `use std::cell::RefCell;

fn main() {
    let c = RefCell::new(vec![1]);
    {
        let r = c.borrow();
        println!("{r:?}");
    } // r dropped here
    c.borrow_mut().push(2);
    if let Ok(mut v) = c.try_borrow_mut() { v.push(3); }
    println!("{:?}", c.borrow());
}`,
    why: "Keep `RefCell` guards short-lived and prefer `try_borrow*` when unsure.",
  },
  {
    id: "lazy-iter",
    title: "Iterators do nothing until consumed",
    category: "Runtime",
    surprise: "`map` with side effects never runs if you never consume the iterator.",
    wrong: `fn main() {
    let v = vec![1, 2, 3];
    v.iter().map(|x| println!("{x}")); // warning: unused \`Map\` that must be used — prints nothing
}`,
    right: `fn main() {
    let v = vec![1, 2, 3];
    v.iter().for_each(|x| println!("{x}"));
    for x in &v { println!("{x}"); } // usually clearer
}`,
    why: "Iterator adapters are lazy; terminal operations (`collect`, `sum`, `for_each`, `count`, `for`) drive them.",
  },
  {
    id: "send-sync",
    title: "Rc can't cross threads",
    category: "Concurrency",
    surprise: "The compiler knows which types are thread-safe through auto traits `Send` and `Sync`.",
    wrong: `use std::rc::Rc;
use std::thread;

fn main() {
    let data = Rc::new(5);
    thread::spawn(move || println!("{data}")); // error[E0277]: Rc<i32> cannot be sent between threads safely
}`,
    right: `use std::sync::Arc;
use std::thread;

fn main() {
    let data = Arc::new(5);
    let d = Arc::clone(&data);
    thread::spawn(move || println!("{d}")).join().unwrap();
}`,
    why: "`Rc`'s non-atomic counter would race. `Arc` uses atomics, so it's `Send + Sync` (when `T` is).",
  },
  {
    id: "drop-order",
    title: "Drop order is deterministic (reverse declaration)",
    category: "Ownership",
    surprise: "Locals are dropped in reverse order of declaration; struct fields in declaration order.",
    right: `struct Noisy(&'static str);
impl Drop for Noisy {
    fn drop(&mut self) { println!("drop {}", self.0); }
}

fn main() {
    let _a = Noisy("a");
    let _b = Noisy("b");
    let _ = Noisy("c"); // \`_\` doesn't bind: dropped IMMEDIATELY
    println!("end of main");
} // prints: drop c, end of main, drop b, drop a`,
    why: "RAII makes cleanup predictable — but `let _ = guard;` drops instantly, a classic bug with mutex guards. Use `let _guard = ...`.",
  },
  {
    id: "match-ergonomics",
    title: "Match ergonomics auto-borrows",
    category: "Patterns",
    surprise: "Matching on `&Option<String>` gives you `&String` bindings without writing `ref`.",
    right: `fn main() {
    let name: Option<String> = Some("Ferris".into());
    match &name {
        Some(n) => println!("hello {n}"), // n: &String
        None => println!("anonymous"),
    }
    println!("still usable: {name:?}");
}`,
    why: "Default binding modes (RFC 2005) switch bindings to `ref` when you match through a reference, so you don't accidentally move.",
  },
  {
    id: "closure-capture",
    title: "Threads need `move` closures",
    category: "Concurrency",
    surprise: "Closures borrow by default, but a spawned thread may outlive the stack frame.",
    wrong: `use std::thread;

fn main() {
    let v = vec![1, 2, 3];
    let h = thread::spawn(|| println!("{v:?}")); // error[E0373]
    h.join().unwrap();
}`,
    right: `use std::thread;

fn main() {
    let v = vec![1, 2, 3];
    let h = thread::spawn(move || println!("{v:?}"));
    h.join().unwrap();
}`,
    why: "`move` transfers ownership into the closure. Alternatively, `thread::scope` allows borrowing.",
  },
  {
    id: "unwrap",
    title: "unwrap() is a promise, not error handling",
    category: "Patterns",
    surprise: "Every `.unwrap()` is a potential crash in production.",
    wrong: `fn main() {
    let port: u16 = "80a".parse().unwrap(); // panics
    println!("{port}");
}`,
    right: `fn main() {
    let port: u16 = "80a".parse().unwrap_or(8080);
    let host = std::env::var("HOST").unwrap_or_else(|_| "localhost".into());
    println!("{host}:{port}");
}`,
    why: "Use `?`, `unwrap_or`, `unwrap_or_else`, `ok_or`, or `expect(\"why it can't fail\")` to document invariants.",
  },
  {
    id: "two-closures-types",
    title: "Every closure has its own unique type",
    category: "Traits",
    surprise: "Two identical-looking closures are different types — you can't put them in the same Vec without boxing.",
    right: `fn main() {
    let ops: Vec<Box<dyn Fn(i32) -> i32>> = vec![
        Box::new(|x| x + 1),
        Box::new(|x| x * 10),
    ];
    for op in &ops { println!("{}", op(5)); }
}`,
    why: "Closures are anonymous structs generated by the compiler. Box them as `dyn Fn` or use function pointers `fn(i32) -> i32` for non-capturing ones.",
  },
  {
    id: "float-eq",
    title: "Floats are PartialEq but not Eq or Ord",
    category: "Types",
    surprise: "You can't `sort()` a `Vec<f64>` or use it as a HashMap key.",
    wrong: `fn main() {
    let mut v = vec![2.5, 1.0, 3.7];
    v.sort(); // error[E0277]: the trait bound \`f64: Ord\` is not satisfied
}`,
    right: `fn main() {
    let mut v = vec![2.5, 1.0, f64::NAN, 3.7];
    v.sort_by(|a, b| a.total_cmp(b));
    println!("{v:?}");
}`,
    why: "`NaN != NaN`, so floats can't provide a total order. `f64::total_cmp` defines one explicitly.",
  },
];
