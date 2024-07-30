This is a TS library that add some of the Rust features to TS/JS.

So far, it has:
- An `Enum` function that gives you the ability to create Rust-like enums.

- With the previous function, the enums `Option`, `Result`, and `ControlFlow` were created and included in this library.

- A `Mutex` class that lets you create locks on variables so that just one async function can edit its value at a time.

- Functions: `panic`, `unreachable`, `todo`, and `unimplemented`. These functions just throw errors, but using them makes your code have more context when something fails.

- The function `catch_unwind` is for replacing try/catch. It needs a function as its argument, and if the function argument throws an error, it will catch it and wrap it in a `Result` of type `Err` returning it, and if the function runs successfully, it will return the function return value wrapped in a `Result` of type `Ok`.

Some others still not finnished features are:
- `RString` is a class that imitates the String structure in Rust. So far, it can give you the UTF-8 bytes of a string, and you can instatiate it with an array of numbers if the array is a valid UTF-8.

- `RIterator` a class that works like a trait to allow you create Rust-like Iterators. The project currently come with 3 types of iterators: Iter, StepBy, and Chain. A lot of functions in RIterator depend on different Iterators so those functions, for now, are currently not available for those reasons.

I hope it is useful.