// @ts-nocheck
// Declaration exports
export let value1, value2, value3 = []
export var value4, value5, value6 = {}
export const value7 = (a, b, c) => {}
export const value8 = 0, value9 = 1, value10 = 2
export function value11(a, b, c){}
export function* value12(a, b, c){}
export const { value13, x: value14 } = {}
export const [value15, value16] = []

export class class1 {}

export type type1 = number
export type type2 = string
export type type3 = { foo: boolean }
export interface type4 { bar: number[] }
export interface type5 extends type4 { baz: Record<string,number> }

// List exports
let value17 = 0, value18 = 0
export { value17, value18 }
export { value17 as value19, value18 as value20 }
export { value17 as "value21", value18 as "value22" }

type type6 = void
type type7 = never
export type { type6, type7 }
export type { type6 as type8, type7 as type9 }
export type { type6 as "type10", type7 as "type11" }
export { type type6 as type12, type type7 as "type13" }

// Re-exports
export * as value23 from 'pkg1'
export { value24, value25 } from '@pkgs/pkg2'
export { x as value26, y as value27 } from './pkg3.js'
export { default as value28 } from '#pkg5'

export type * as type14 from 'pkg1'
export type { type15, type16 } from '@pkgs/pkg2'
export type { x as type17, y as type18 } from './pkg3.js'

// Default exports
export default void 0