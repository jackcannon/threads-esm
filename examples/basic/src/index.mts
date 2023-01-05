import { spawn } from 'threads-esm';
import { ExampleWorker } from './common-type.mjs';

const worker = await spawn<ExampleWorker>(new URL('./worker.mts', import.meta.url));

worker.exit.then((exitCode: number) => console.log('Worker has exited with code', exitCode));

// an async function that returns the result of the add function
const result1 = await worker.add(1, 2);
console.log('RESULT - add'.padEnd(18), result1);

// an async function that returns the result of the subtract function
const result2 = await worker.subtract(1, 2);
console.log('RESULT - subtract'.padEnd(18), result2);

// an async function that returns the value of foo property
const result3 = await worker.foo();
console.log('RESULT - foo'.padEnd(18), JSON.stringify(result3));

const exitCode = await worker.terminate();
console.log('Worker has been terminated with exit code', exitCode);
