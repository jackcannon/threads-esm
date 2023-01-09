import { spawnBidirectional } from 'threads-esm';
import { ExampleParent, ExampleWorker } from './common-type.mjs';

const exposeObj: ExampleParent = {
  getSomeNumbers: async () => [2, 4, 6, 8] // who do we appreciate?
};

const worker = await spawnBidirectional<ExampleParent, ExampleWorker>(exposeObj, new URL('./worker.mts', import.meta.url));

worker.exit.then((exitCode: number) => console.log('INDEX  - Worker has exited with code', exitCode));

// an async function that returns the result of the add function
const result1 = await worker.add(1, 2);
console.log('INDEX  - add'.padEnd(24), result1);

// an async function that returns the result of the subtract function
const result2 = await worker.subtract(1, 2);
console.log('INDEX  - subtract'.padEnd(24), result2);

// an async function that returns the value of foo property
const result3 = await worker.foo();
console.log('INDEX  - foo'.padEnd(24), JSON.stringify(result3));

const exitCode = await worker.terminate();
console.log('INDEX  - Worker has been terminated with exit code', exitCode);
