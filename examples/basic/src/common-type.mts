export interface ExampleWorker {
  add: (a: number, b: number) => Promise<number>;
  subtract: (a: number, b: number) => number;
  foo: string;
}
