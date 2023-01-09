import { exposeBidirectional } from 'threads-esm';
import { ExampleParent, ExampleWorker } from './common-type.mjs';

const parent = await exposeBidirectional<ExampleWorker, ExampleParent>({
  // A function that returns a promise of a number
  add: (a: number, b: number): Promise<number> => Promise.resolve(a + b),

  // A function that returns a number
  subtract: (a: number, b: number): number => a - b,

  // A property that is a string
  foo: 'bar'
});

console.log('WORKER - getSomeNumbers'.padEnd(24), await parent.getSomeNumbers());

export {};
