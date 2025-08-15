// Declaration exports
export let name1, name2, name3 = []
export var name4, name5, name6 = {}
export const name7 = (a, b, c) => {}
export const name8 = 0, name9 = 1, name10 = 2
export function name11(a, b, c){}
export function* name12(a, b, c){}
export class name13 {}
export const { name14, name15, x: name16 } = {}
export const [name17, name18] = []

// List exports
let name19 = 0, name20 = 0
export { name19, name20 }
export { name19 as name21, name20 as name22 }
export { name19 as "name23", name20 as "name24" }

// Default exports
export default void 0

// Re-exports
export * as name25 from 'pkg1'
export { name26, name27 } from '@pkgs/pkg2'
export { x as name28, y as name29 } from './pkg3.js'
export { default as name30 } from '#pkg5'