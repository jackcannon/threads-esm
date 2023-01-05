import { expose } from 'threads-esm';
import { ExampleWorker } from './common-type.mjs';

expose<ExampleWorker>({
  // A function that returns a promise of a number
  add: (a: number, b: number): Promise<number> => Promise.resolve(a + b),

  // A function that returns a number
  subtract: (a: number, b: number): number => a - b,

  // A property that is a string
  foo: 'bar'
});

export {};
