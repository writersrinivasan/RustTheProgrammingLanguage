export type Challenge = {
  id: string;
  title: string;
  emoji: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  description: string;
  starter: string;
  tests: string; // body of the hidden test module
  hints: string[];
  solution: string;
};

export const SCRATCH_CODE = `// 🦀 Free-play scratchpad — write anything and hit Run (Ctrl/⌘ + Enter)
use std::collections::HashMap;

fn main() {
    let text = "the quick brown fox jumps over the lazy dog the end";
    let mut freq: HashMap<&str, usize> = HashMap::new();
    for word in text.split_whitespace() {
        *freq.entry(word).or_insert(0) += 1;
    }
    let mut pairs: Vec<_> = freq.into_iter().collect();
    pairs.sort_by(|a, b| b.1.cmp(&a.1).then(a.0.cmp(b.0)));
    for (w, c) in pairs.iter().take(3) {
        println!("{w:>6} → {c}");
    }
}
`;

export const CHALLENGES: Challenge[] = [
  {
    id: "sum-evens",
    title: "Sum of Evens",
    emoji: "➕",
    difficulty: "Easy",
    topic: "Iterators",
    description: "Return the sum of all **even** numbers in the slice. Try solving it with an iterator chain instead of a manual loop.",
    starter: `fn sum_evens(nums: &[i32]) -> i32 {
    todo!("filter the evens and sum them")
}

fn main() {
    println!("{}", sum_evens(&[1, 2, 3, 4, 5, 6]));
}
`,
    tests: `
    #[test] fn sums_mixed_numbers() { assert_eq!(sum_evens(&[1, 2, 3, 4, 5, 6]), 12); }
    #[test] fn empty_slice_is_zero() { assert_eq!(sum_evens(&[]), 0); }
    #[test] fn handles_negatives() { assert_eq!(sum_evens(&[-4, -3, 2]), -2); }
    #[test] fn all_odd_is_zero() { assert_eq!(sum_evens(&[1, 3, 5]), 0); }`,
    hints: ["`nums.iter()` yields `&i32`.", "Use `.filter(|n| *n % 2 == 0)` then `.sum()`."],
    solution: `fn sum_evens(nums: &[i32]) -> i32 {
    nums.iter().filter(|n| *n % 2 == 0).sum()
}

fn main() {
    println!("{}", sum_evens(&[1, 2, 3, 4, 5, 6]));
}
`,
  },
  {
    id: "reverse-words",
    title: "Reverse the Words",
    emoji: "🔄",
    difficulty: "Easy",
    topic: "Strings",
    description: "Given a sentence, return a new `String` with the **order of words reversed**, separated by single spaces. Extra whitespace should be collapsed.",
    starter: `fn reverse_words(s: &str) -> String {
    todo!()
}

fn main() {
    println!("{}", reverse_words("hello  rusty   world"));
}
`,
    tests: `
    #[test] fn reverses_three_words() { assert_eq!(reverse_words("one two three"), "three two one"); }
    #[test] fn collapses_whitespace() { assert_eq!(reverse_words("  a   b "), "b a"); }
    #[test] fn single_word() { assert_eq!(reverse_words("ferris"), "ferris"); }
    #[test] fn empty_input() { assert_eq!(reverse_words(""), ""); }`,
    hints: ["`split_whitespace()` ignores repeated spaces.", "`.rev()` reverses an iterator; `Vec<&str>::join(\" \")` builds the string."],
    solution: `fn reverse_words(s: &str) -> String {
    s.split_whitespace().rev().collect::<Vec<_>>().join(" ")
}

fn main() {
    println!("{}", reverse_words("hello  rusty   world"));
}
`,
  },
  {
    id: "longest-lifetime",
    title: "Lifetime Doctor",
    emoji: "⏳",
    difficulty: "Easy",
    topic: "Lifetimes",
    description: "This code **does not compile**. Run it, read the error (check the 📝 Notes panel), then add the right lifetime annotations so `longest` returns the longer of two string slices (the first one on ties).",
    starter: `fn longest(a: &str, b: &str) -> &str {
    if a.len() >= b.len() { a } else { b }
}

fn main() {
    println!("{}", longest("crab", "ferris"));
}
`,
    tests: `
    #[test] fn picks_longer_second() { assert_eq!(longest("crab", "ferris"), "ferris"); }
    #[test] fn picks_longer_first() { assert_eq!(longest("rustacean", "rs"), "rustacean"); }
    #[test] fn tie_returns_first() { assert_eq!(longest("abc", "xyz"), "abc"); }`,
    hints: ["Error E0106: the compiler can't tell which input the output borrows from.", "Declare `<'a>` and use `&'a str` on both inputs and the output."],
    solution: `fn longest<'a>(a: &'a str, b: &'a str) -> &'a str {
    if a.len() >= b.len() { a } else { b }
}

fn main() {
    println!("{}", longest("crab", "ferris"));
}
`,
  },
  {
    id: "safe-divide",
    title: "Safe Division",
    emoji: "➗",
    difficulty: "Easy",
    topic: "Error Handling",
    description: "Implement `safe_div` returning `Err(\"division by zero\")` when `b == 0`, and `Err(\"overflow\")` for `i32::MIN / -1`. Otherwise `Ok(a / b)`.",
    starter: `fn safe_div(a: i32, b: i32) -> Result<i32, String> {
    todo!()
}

fn main() {
    println!("{:?}", safe_div(10, 2));
    println!("{:?}", safe_div(1, 0));
}
`,
    tests: `
    #[test] fn divides_normally() { assert_eq!(safe_div(10, 3), Ok(3)); }
    #[test] fn rejects_zero() { assert_eq!(safe_div(1, 0), Err("division by zero".to_string())); }
    #[test] fn detects_overflow() { assert_eq!(safe_div(i32::MIN, -1), Err("overflow".to_string())); }
    #[test] fn negative_numbers() { assert_eq!(safe_div(-9, 3), Ok(-3)); }`,
    hints: ["Check `b == 0` first.", "`a.checked_div(b)` returns `None` for both zero and overflow cases."],
    solution: `fn safe_div(a: i32, b: i32) -> Result<i32, String> {
    if b == 0 {
        return Err("division by zero".into());
    }
    a.checked_div(b).ok_or_else(|| "overflow".to_string())
}

fn main() {
    println!("{:?}", safe_div(10, 2));
    println!("{:?}", safe_div(1, 0));
}
`,
  },
  {
    id: "traffic-light",
    title: "Traffic Light State Machine",
    emoji: "🚦",
    difficulty: "Easy",
    topic: "Enums & match",
    description: "Implement `next()` (Red → Green → Yellow → Red) and `seconds()` (Red 30, Green 25, Yellow 5) for the `Light` enum.",
    starter: `#[derive(Debug, PartialEq, Clone, Copy)]
enum Light { Red, Yellow, Green }

impl Light {
    fn next(self) -> Light {
        todo!()
    }
    fn seconds(&self) -> u32 {
        todo!()
    }
}

fn main() {
    let mut l = Light::Red;
    for _ in 0..4 {
        println!("{:?} for {}s", l, l.seconds());
        l = l.next();
    }
}
`,
    tests: `
    #[test] fn red_goes_green() { assert_eq!(Light::Red.next(), Light::Green); }
    #[test] fn green_goes_yellow() { assert_eq!(Light::Green.next(), Light::Yellow); }
    #[test] fn yellow_goes_red() { assert_eq!(Light::Yellow.next(), Light::Red); }
    #[test] fn durations() {
        assert_eq!(Light::Red.seconds(), 30);
        assert_eq!(Light::Green.seconds(), 25);
        assert_eq!(Light::Yellow.seconds(), 5);
    }`,
    hints: ["`match self { Light::Red => Light::Green, ... }`", "`match` must cover every variant — the compiler will tell you if you miss one (E0004)."],
    solution: `#[derive(Debug, PartialEq, Clone, Copy)]
enum Light { Red, Yellow, Green }

impl Light {
    fn next(self) -> Light {
        match self {
            Light::Red => Light::Green,
            Light::Green => Light::Yellow,
            Light::Yellow => Light::Red,
        }
    }
    fn seconds(&self) -> u32 {
        match self {
            Light::Red => 30,
            Light::Green => 25,
            Light::Yellow => 5,
        }
    }
}

fn main() {
    let mut l = Light::Red;
    for _ in 0..4 {
        println!("{:?} for {}s", l, l.seconds());
        l = l.next();
    }
}
`,
  },
  {
    id: "word-freq",
    title: "Word Frequency",
    emoji: "📖",
    difficulty: "Medium",
    topic: "HashMap",
    description: "Count words case-insensitively. Strip punctuation characters `.,!?;:` from word edges. Return a `HashMap<String, usize>`.",
    starter: `use std::collections::HashMap;

fn word_freq(text: &str) -> HashMap<String, usize> {
    todo!()
}

fn main() {
    let f = word_freq("The cat. The DOG! the end?");
    println!("{:?}", f.get("the"));
}
`,
    tests: `
    #[test] fn counts_case_insensitive() { assert_eq!(word_freq("Rust rust RUST")["rust"], 3); }
    #[test] fn strips_punctuation() {
        let f = word_freq("Hello, world! Hello.");
        assert_eq!(f["hello"], 2);
        assert_eq!(f["world"], 1);
    }
    #[test] fn empty_text() { assert!(word_freq("   ").is_empty()); }
    #[test] fn no_empty_keys() { assert!(!word_freq("hi !!! there").contains_key("")); }`,
    hints: [
      "`text.split_whitespace()` then `w.trim_matches(|c| \".,!?;:\".contains(c))`.",
      "Skip empty words, lowercase with `to_lowercase()`, and use `*map.entry(w).or_insert(0) += 1`.",
    ],
    solution: `use std::collections::HashMap;

fn word_freq(text: &str) -> HashMap<String, usize> {
    let mut map = HashMap::new();
    for raw in text.split_whitespace() {
        let w = raw.trim_matches(|c| ".,!?;:".contains(c)).to_lowercase();
        if w.is_empty() { continue; }
        *map.entry(w).or_insert(0) += 1;
    }
    map
}

fn main() {
    let f = word_freq("The cat. The DOG! the end?");
    println!("{:?}", f.get("the"));
}
`,
  },
  {
    id: "generic-largest",
    title: "Generic Largest",
    emoji: "🧬",
    difficulty: "Medium",
    topic: "Generics & Traits",
    description: "Write a generic `largest` that works for any type that can be compared and copied. Return `None` for an empty slice.",
    starter: `fn largest<T>(items: &[T]) -> Option<T> {
    todo!()
}

fn main() {
    println!("{:?}", largest(&[3, 9, 2]));
    println!("{:?}", largest(&['r', 'u', 's', 't']));
}
`,
    tests: `
    #[test] fn ints() { assert_eq!(largest(&[3, 9, 2]), Some(9)); }
    #[test] fn chars() { assert_eq!(largest(&['r', 'u', 's', 't']), Some('u')); }
    #[test] fn floats() { assert_eq!(largest(&[1.5, -2.0, 0.3]), Some(1.5)); }
    #[test] fn empty() { let e: [i32; 0] = []; assert_eq!(largest(&e), None); }`,
    hints: ["You need bounds: `T: PartialOrd + Copy`.", "Start with `let mut best = *items.first()?;` then loop."],
    solution: `fn largest<T: PartialOrd + Copy>(items: &[T]) -> Option<T> {
    let mut best = *items.first()?;
    for &it in items {
        if it > best { best = it; }
    }
    Some(best)
}

fn main() {
    println!("{:?}", largest(&[3, 9, 2]));
    println!("{:?}", largest(&['r', 'u', 's', 't']));
}
`,
  },
  {
    id: "shapes-trait",
    title: "Shapes & Trait Objects",
    emoji: "🔷",
    difficulty: "Medium",
    topic: "Traits",
    description: "Implement the `Area` trait for `Circle` and `Rect`, then `total_area` over a slice of `Box<dyn Area>`.",
    starter: `trait Area {
    fn area(&self) -> f64;
}

struct Circle { r: f64 }
struct Rect { w: f64, h: f64 }

// TODO: impl Area for Circle and Rect

fn total_area(shapes: &[Box<dyn Area>]) -> f64 {
    todo!()
}

fn main() {
    let shapes: Vec<Box<dyn Area>> = vec![Box::new(Circle { r: 1.0 }), Box::new(Rect { w: 2.0, h: 3.0 })];
    println!("{:.3}", total_area(&shapes));
}
`,
    tests: `
    fn close(a: f64, b: f64) -> bool { (a - b).abs() < 1e-9 }
    #[test] fn circle_area() { assert!(close(Circle { r: 2.0 }.area(), std::f64::consts::PI * 4.0)); }
    #[test] fn rect_area() { assert!(close(Rect { w: 2.0, h: 5.0 }.area(), 10.0)); }
    #[test] fn total() {
        let s: Vec<Box<dyn Area>> = vec![Box::new(Rect { w: 1.0, h: 1.0 }), Box::new(Rect { w: 2.0, h: 2.0 })];
        assert!(close(total_area(&s), 5.0));
    }
    #[test] fn empty_total() { assert!(close(total_area(&[]), 0.0)); }`,
    hints: ["`impl Area for Circle { fn area(&self) -> f64 { std::f64::consts::PI * self.r * self.r } }`", "`shapes.iter().map(|s| s.area()).sum()`"],
    solution: `trait Area {
    fn area(&self) -> f64;
}

struct Circle { r: f64 }
struct Rect { w: f64, h: f64 }

impl Area for Circle {
    fn area(&self) -> f64 { std::f64::consts::PI * self.r * self.r }
}
impl Area for Rect {
    fn area(&self) -> f64 { self.w * self.h }
}

fn total_area(shapes: &[Box<dyn Area>]) -> f64 {
    shapes.iter().map(|s| s.area()).sum()
}

fn main() {
    let shapes: Vec<Box<dyn Area>> = vec![Box::new(Circle { r: 1.0 }), Box::new(Rect { w: 2.0, h: 3.0 })];
    println!("{:.3}", total_area(&shapes));
}
`,
  },
  {
    id: "bank-account",
    title: "Bank Account",
    emoji: "🏦",
    difficulty: "Medium",
    topic: "Structs & Result",
    description: "Implement `deposit` (rejects 0 with `BankError::ZeroAmount`) and `withdraw` (rejects overdrafts with `BankError::Insufficient { needed, available }`). Balance must never go negative.",
    starter: `#[derive(Debug, PartialEq)]
enum BankError {
    ZeroAmount,
    Insufficient { needed: u64, available: u64 },
}

struct Account { balance: u64 }

impl Account {
    fn new() -> Self { Account { balance: 0 } }

    fn deposit(&mut self, amount: u64) -> Result<u64, BankError> {
        todo!("return the new balance")
    }

    fn withdraw(&mut self, amount: u64) -> Result<u64, BankError> {
        todo!("return the new balance")
    }
}

fn main() {
    let mut acc = Account::new();
    println!("{:?}", acc.deposit(100));
    println!("{:?}", acc.withdraw(150));
}
`,
    tests: `
    #[test] fn deposit_adds() { let mut a = Account::new(); assert_eq!(a.deposit(50), Ok(50)); assert_eq!(a.deposit(25), Ok(75)); }
    #[test] fn zero_deposit_rejected() { let mut a = Account::new(); assert_eq!(a.deposit(0), Err(BankError::ZeroAmount)); }
    #[test] fn withdraw_subtracts() { let mut a = Account::new(); a.deposit(100).unwrap(); assert_eq!(a.withdraw(40), Ok(60)); }
    #[test] fn overdraft_rejected() {
        let mut a = Account::new(); a.deposit(10).unwrap();
        assert_eq!(a.withdraw(30), Err(BankError::Insufficient { needed: 30, available: 10 }));
        assert_eq!(a.balance, 10);
    }
    #[test] fn zero_withdraw_rejected() { let mut a = Account::new(); assert_eq!(a.withdraw(0), Err(BankError::ZeroAmount)); }`,
    hints: ["Validate first, then mutate — so a failed call leaves state unchanged.", "`if amount > self.balance { return Err(BankError::Insufficient { needed: amount, available: self.balance }); }`"],
    solution: `#[derive(Debug, PartialEq)]
enum BankError {
    ZeroAmount,
    Insufficient { needed: u64, available: u64 },
}

struct Account { balance: u64 }

impl Account {
    fn new() -> Self { Account { balance: 0 } }

    fn deposit(&mut self, amount: u64) -> Result<u64, BankError> {
        if amount == 0 { return Err(BankError::ZeroAmount); }
        self.balance += amount;
        Ok(self.balance)
    }

    fn withdraw(&mut self, amount: u64) -> Result<u64, BankError> {
        if amount == 0 { return Err(BankError::ZeroAmount); }
        if amount > self.balance {
            return Err(BankError::Insufficient { needed: amount, available: self.balance });
        }
        self.balance -= amount;
        Ok(self.balance)
    }
}

fn main() {
    let mut acc = Account::new();
    println!("{:?}", acc.deposit(100));
    println!("{:?}", acc.withdraw(150));
}
`,
  },
  {
    id: "config-parser",
    title: "Config Parser",
    emoji: "⚙️",
    difficulty: "Hard",
    topic: "Error Handling & Strings",
    description: "Parse `key = value` lines into a `HashMap<String, String>`. Ignore blank lines and lines starting with `#`. Trim keys/values. On a malformed line (no `=` or empty key), return `Err(format!(\"line {n}: ...\"))` where `n` is 1-based.",
    starter: `use std::collections::HashMap;

fn parse_config(input: &str) -> Result<HashMap<String, String>, String> {
    todo!()
}

fn main() {
    let cfg = "# server\\nhost = localhost\\nport= 8080\\n";
    println!("{:?}", parse_config(cfg));
}
`,
    tests: `
    #[test] fn parses_pairs() {
        let c = parse_config("a = 1\\nb=two").unwrap();
        assert_eq!(c["a"], "1"); assert_eq!(c["b"], "two");
    }
    #[test] fn skips_comments_and_blanks() {
        let c = parse_config("# hi\\n\\n  \\nx = y").unwrap();
        assert_eq!(c.len(), 1);
    }
    #[test] fn reports_line_number() {
        let e = parse_config("a=1\\nbroken line").unwrap_err();
        assert!(e.starts_with("line 2"), "got: {e}");
    }
    #[test] fn empty_key_is_error() { assert!(parse_config(" = value").is_err()); }
    #[test] fn value_may_contain_equals() { assert_eq!(parse_config("url = a=b").unwrap()["url"], "a=b"); }`,
    hints: ["`input.lines().enumerate()` gives 0-based indices — add 1.", "`line.split_once('=')` splits only at the first `=`."],
    solution: `use std::collections::HashMap;

fn parse_config(input: &str) -> Result<HashMap<String, String>, String> {
    let mut map = HashMap::new();
    for (i, line) in input.lines().enumerate() {
        let line = line.trim();
        if line.is_empty() || line.starts_with('#') { continue; }
        let Some((k, v)) = line.split_once('=') else {
            return Err(format!("line {}: expected key = value", i + 1));
        };
        let k = k.trim();
        if k.is_empty() {
            return Err(format!("line {}: empty key", i + 1));
        }
        map.insert(k.to_string(), v.trim().to_string());
    }
    Ok(map)
}

fn main() {
    let cfg = "# server\\nhost = localhost\\nport= 8080\\n";
    println!("{:?}", parse_config(cfg));
}
`,
  },
  {
    id: "parallel-sum",
    title: "Parallel Sum",
    emoji: "⚡",
    difficulty: "Hard",
    topic: "Concurrency",
    description: "Split the data into `n` chunks and sum them on separate threads, then combine. Use `std::thread::scope` (or `Arc`) — the borrow checker will keep you honest. `n` is at least 1.",
    starter: `fn parallel_sum(data: &[i64], n: usize) -> i64 {
    todo!()
}

fn main() {
    let v: Vec<i64> = (1..=1_000_000).collect();
    println!("{}", parallel_sum(&v, 4));
}
`,
    tests: `
    #[test] fn matches_serial_sum() {
        let v: Vec<i64> = (1..=10_000).collect();
        assert_eq!(parallel_sum(&v, 4), v.iter().sum::<i64>());
    }
    #[test] fn single_thread() { assert_eq!(parallel_sum(&[1, 2, 3], 1), 6); }
    #[test] fn more_threads_than_items() { assert_eq!(parallel_sum(&[5, 5], 8), 10); }
    #[test] fn empty_data() { assert_eq!(parallel_sum(&[], 3), 0); }`,
    hints: [
      "Chunk size: `let size = ((data.len() + n - 1) / n).max(1);`",
      "`std::thread::scope(|s| data.chunks(size).map(|c| s.spawn(move || c.iter().sum::<i64>())).collect::<Vec<_>>().into_iter().map(|h| h.join().unwrap()).sum())`",
    ],
    solution: `fn parallel_sum(data: &[i64], n: usize) -> i64 {
    let size = data.len().div_ceil(n).max(1);
    std::thread::scope(|s| {
        let handles: Vec<_> = data
            .chunks(size)
            .map(|chunk| s.spawn(move || chunk.iter().sum::<i64>()))
            .collect();
        handles.into_iter().map(|h| h.join().unwrap()).sum()
    })
}

fn main() {
    let v: Vec<i64> = (1..=1_000_000).collect();
    println!("{}", parallel_sum(&v, 4));
}
`,
  },
];
