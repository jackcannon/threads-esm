# threads-esm

Very simple worker thread abstraction for ts-node ESM builds.

Couldn't get ts-node ESM workers to work with [threads.js](https://threads.js.org/), and [it doesn't look like I'm alone](https://github.com/andywer/threads.js/issues/434).

I threw this together as a quick alternative for what I needed.

## Install

```bash
yarn add threads-esm
```

or

```bash
npm install threads-esm
```

## Example

This basic example can be run using the `example` script (`yarn example` or `npm run example`).

### A common interface

```ts
interface ExampleWorker {
  add: (a: number, b: number) => Promise<number>;
  subtract: (a: number, b: number) => number;
  foo: string;
}
```

### index.mts (The main process)

```ts
import { spawn } from 'threads-esm';

const worker = await spawn<ExampleWorker>(new URL('./worker.mts', import.meta.url));

// an async function that returns the result of the add function
const result1 = await worker.add(1, 2);

// an async function that returns the result of the subtract function
const result2 = await worker.subtract(1, 2);

// an async function that returns the value of foo property
const result3 = await worker.foo();
```

### worker.mts (The worker thread)

```ts
import { expose } from 'threads-esm';

expose<ExampleWorker>({
  // A function that returns a promise of a number
  add: (a: number, b: number): Promise<number> => Promise.resolve(a + b),

  // A function that returns a number
  subtract: (a: number, b: number): number => a - b,

  // A property that is a string
  foo: 'bar'
});
```
