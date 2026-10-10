# Sample Quiz - JavaScript Fundamentals

### Q1. What is the output of `typeof null` in JavaScript?

A) "null"
B) "object"
C) "undefined"
D) "number"

**✅ Answer: B**

**Explanation:** This is a well-known quirk in JavaScript. `typeof null` returns "object" due to a legacy bug in the language implementation that has been preserved for backward compatibility.

### Q2. Which method is used to convert a JSON string to a JavaScript object?

A) JSON.stringify()
B) JSON.parse()
C) JSON.convert()
D) JSON.objectify()

**✅ Answer: B**

**Explanation:** `JSON.parse()` takes a JSON string and transforms it into a JavaScript object. `JSON.stringify()` does the opposite — it converts a JavaScript object into a JSON string.

### Q3. What does the `===` operator check in JavaScript?

A) Value equality only
B) Type equality only
C) Value and type equality
D) Reference equality

**✅ Answer: C**

**Explanation:** The strict equality operator `===` checks both value and type without performing type coercion. For example, `1 === "1"` returns false because the types differ.

### Q4. Which array method creates a new array with elements that pass a test?

A) map()
B) forEach()
C) filter()
D) reduce()

**✅ Answer: C**

**Explanation:** `filter()` creates a new array with all elements that pass the test implemented by the provided function. Unlike `map()`, which transforms elements, `filter()` selects them based on a condition.

### Q5. What is a closure in JavaScript?

A) A way to close the browser window
B) A function that has access to its outer scope's variables
C) A method to end a loop
D) A type of error handling

**✅ Answer: B**

**Explanation:** A closure is a function that retains access to variables from its enclosing (outer) scope, even after the outer function has returned. Closures are fundamental to JavaScript and are used extensively in callbacks, event handlers, and module patterns.

### Q6. What will `console.log(0.1 + 0.2 === 0.3)` output?

A) true
B) false
C) undefined
D) NaN

**✅ Answer: B**

**Explanation:** Due to floating-point precision issues in JavaScript (and most programming languages), `0.1 + 0.2` actually equals `0.30000000000000004`, not exactly `0.3`. Therefore the strict equality check returns false.

### Q7. Which keyword is used to declare a constant in JavaScript?

A) var
B) let
C) const
D) static

**✅ Answer: C**

**Explanation:** The `const` keyword declares a block-scoped variable whose value cannot be reassigned after initialization. Note that for objects and arrays, `const` prevents reassignment of the variable, but the contents can still be modified.

### Q8. What does the `Promise.all()` method do?

A) Returns the first resolved promise
B) Returns when all promises are resolved or any is rejected
C) Runs promises sequentially
D) Cancels all pending promises

**✅ Answer: B**

**Explanation:** `Promise.all()` takes an iterable of promises and returns a single promise that resolves when all input promises have resolved, or rejects as soon as any input promise rejects.

### Q9. What is event bubbling?

A) Creating new events programmatically
B) Events propagating from child to parent elements
C) Preventing default browser behavior
D) Events propagating from parent to child elements

**✅ Answer: B**

**Explanation:** Event bubbling is the process where an event triggered on a child element propagates upward through its parent elements in the DOM tree. This is the default behavior in most browsers and enables event delegation.

### Q10. Which ES6 feature allows extracting values from arrays or objects into variables?

A) Spread operator
B) Template literals
C) Destructuring
D) Arrow functions

**✅ Answer: C**

**Explanation:** Destructuring assignment allows you to unpack values from arrays or properties from objects into distinct variables using a concise syntax. For example: `const { name, age } = person;` or `const [first, second] = array;`.
