# rusting-js
This is a TS library that adds some of the Rust features to TS/JS.

So far, it has:

## Enums
With the `Enum` function you can create Rust-like enums, meaning: enums that can store values, other that `number` and `string`.

```ts
import { Enum, Arm } from "rusting-js/enums";

const StrNum = Enum({
  String: Arm<string>(),
  Number: Arm<number>(),
  Error: Arm<Error>(),
});

const strNum = StrNum.String("Hello");

strNum.match({
  String(value) {
    console.log(`${value} World!`);
  }
  Number(value) {
    console.log("This will never be reached");
  }
  Error(error) {
    console.log("This also will never be reached");
  }
});
```

For more complex enums (those with template types) you can use the `EnumClass`. This class is used internally to create the enums: `Result`, `Option` and `ControlFlow`

```ts
import { EnumClass } from "rusting-js/enums";

class Option<T> extends EnumClass<{ Some: T; None: void }> {
  // This is an abstract method inside the `EnumClass`
  // it is used internally to check the posible types/arms
  // of the enum
  isValidType(type: "None" | "Some"): boolean {
    switch (type) {
      case "None":
      case "Some":
        return true;
    }

    return false;
  }

  static Some<T>(value: T): Option<T> {
    return new Option("Some", value);
  }

  static None<T>(): Option<T> {
    return new Option("None");
  }
}

Option.Some("This is a message");
Option.None();
```

## Error managing
The `catchUnwind` and `catchUnwindAsync` functions are for replacing try/catch, both receive a function as its parameter, the function may throw an exception, if it does, the error value will be wrapped in a `Err` type of the enum `Result`, if the function runs successfully, the return value will be wrappd in a `Ok` type.

```ts
import { catchUnwind } from "rusting-js";

const result1 = catchUnwind(() => "This will be returned");
console.log(result1.isOk()); // -> true
console.log(result1.unwrap()); // -> This will be returned

const result2 = catchUnwind(() => {
  throw new Error("This will be throw");
});
console.log(result2.isErr()); // -> true
console.log(result2.unwrapErr()); // -> Error("This will be throw")
```

## Others
- A `Mutex` class that lets you create locks on variables to better control order of execution.

Some others still not finished features are:
- `RString` is a class that imitates the String structure in Rust. So far, it can give you the UTF-8 bytes of a string, and you can instantiated it with an array of numbers if the array is a valid UTF-8.

- `RIterator` a class that works like a trait to allow you create Rust-like Iterators. The project currently come with the next types of iterators: Chain, Intersperse, Iter, Map, StepBy and Zip. A lot of functions in RIterator depend on different Iterators so those functions, for now, are currently not available for those reasons.

- `Vec` a work in progress class that will allow you to create slices with Rust-like ranges
```ts
const v = new Vec<number>();
v["0..3"]
```

I hope it is useful.
