export const SAMPLE_QUIZ_MD = `# JavaScript & Web Core Fundamentals

### Q1. What is the output of \`typeof null\` in JavaScript?

A) "null"
B) "object"
C) "undefined"
D) "number"

**✅ Answer: B**

**Explanation:** This is a famous legacy quirk in JavaScript. In the first implementation of JavaScript, values were represented as a type tag and a value. Objects had a type tag of 0, and \`null\` was represented as the NULL pointer (0x00 in most platforms), leading \`typeof null\` to return "object".

### Q2. Which method is used to convert a JSON string to a JavaScript object?

A) JSON.stringify()
B) JSON.parse()
C) JSON.convert()
D) JSON.objectify()

**✅ Answer: B**

**Explanation:** \`JSON.parse()\` parses a JSON-formatted string and constructs the JavaScript value or object described by the string. \`JSON.stringify()\` performs the reverse operation.

### Q3. What does the \`===\` operator check in JavaScript?

A) Value equality only
B) Type equality only
C) Value and type equality without coercion
D) Reference address only

**✅ Answer: C**

**Explanation:** The strict equality operator \`===\` tests for strict equality without performing automatic type coercion. If the operands are of different types, it immediately evaluates to false.

### Q4. Which array method returns a new array with all elements that satisfy a condition?

A) map()
B) forEach()
C) filter()
D) reduce()

**✅ Answer: C**

**Explanation:** \`Array.prototype.filter()\` creates a shallow copy of a portion of a given array, filtered down to just the elements from the given array that pass the test implemented by the provided callback function.

### Q5. What is a closure in JavaScript?

A) A mechanism to terminate asynchronous tasks
B) A function bundled together with references to its surrounding lexical environment
C) A browser lifecycle event when navigating away
D) A native method for encrypting objects

**✅ Answer: B**

**Explanation:** A closure gives a function access to its outer scope from an inner function. In JavaScript, closures are created every time a function is created, at function creation time.

### Q6. What will \`console.log(0.1 + 0.2 === 0.3)\` output?

A) true
B) false
C) undefined
D) NaN

**✅ Answer: B**

**Explanation:** In JavaScript (and all languages using IEEE 754 double precision floating point), \`0.1 + 0.2\` yields \`0.30000000000000004\`. Hence, \`0.1 + 0.2 === 0.3\` evaluates to \`false\`.

### Q7. Which keyword declares a block-scoped variable that cannot be reassigned?

A) var
B) let
C) const
D) readonly

**✅ Answer: C**

**Explanation:** The \`const\` declaration creates a block-scoped local variable whose value cannot be reassigned. However, the properties of an object or elements of an array declared with \`const\` can still be mutated.

### Q8. What does \`Promise.all()\` do when one of the promises rejects?

A) Continues waiting for the rest
B) Immediately rejects with that promise's error
C) Returns undefined for that promise
D) Retries the rejected promise automatically

**✅ Answer: B**

**Explanation:** \`Promise.all()\` rejects immediately as soon as any of the input promises rejects (fail-fast behavior), discarding results of any remaining promises.

### Q9. What is event bubbling in the DOM?

A) Dispatching synthetic events to window
B) Event propagation starting from target element up through its ancestors
C) Stopping event propagation via stopPropagation()
D) Handling events exclusively during the capture phase

**✅ Answer: B**

**Explanation:** Event bubbling is the phase in DOM event dispatch where the event triggers on the innermost target element first, and then successively bubbles up through its ancestor elements towards the document root.

### Q10. What is the key difference between \`localStorage\` and \`sessionStorage\`?

A) localStorage is encrypted by default
B) sessionStorage data persists across browser restarts
C) localStorage persists indefinitely until cleared; sessionStorage clears when the tab/session closes
D) localStorage only stores numbers and booleans

**✅ Answer: C**

**Explanation:** \`localStorage\` data has no expiration date and persists until deleted by the user or code, whereas \`sessionStorage\` data is cleared as soon as the page session ends (when the browser tab or window is closed).
`;
