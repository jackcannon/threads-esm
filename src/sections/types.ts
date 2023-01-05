export interface MsgListFunctions {
  type: 'list-functions';
  functions: string[];
}

export interface MsgTrigger {
  type: 'trigger';
  id: string;
  name: string;
  args: any[];
}

export interface MsgResult {
  type: 'result';
  id: string;
  result: any;
}

// The given type, or if it's a promise, the type of the promise's value
type UnWrapPromise<T> = T extends Promise<infer U> ? U : T;

// If the given type is a function, return the return type, otherwise return the type itself
type StripFunctions<T> = T extends (...args: any[]) => infer R ? R : T;

// Replace the return type of a function with the given type
type ReplaceReturnType<T extends (...args: any) => any, Z> = (...args: Parameters<T>) => Z;

// If the given type is a function, return the function, otherwise return a function that returns the given type
type Functionalise<T> = T extends (...args: any[]) => any ? T : () => T;

// For each property of the given object, return a function that returns a promise of the property's value,
// or if the property is a function, return a function with the same arguments that returns a promise of the function's return value
export type SpawnPromiseObject<T> = { [K in keyof T]: ReplaceReturnType<Functionalise<T[K]>, Promise<UnWrapPromise<StripFunctions<T[K]>>>> };
