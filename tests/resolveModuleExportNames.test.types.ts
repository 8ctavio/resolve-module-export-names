import { test, expectTypeOf } from "vitest"
import { resolveModuleExportNames } from "@8ctavio/resolve-module-export-names"

test("Return Array of export names", () => {
	expectTypeOf(resolveModuleExportNames('','')).toEqualTypeOf<string[]>()
	expectTypeOf(resolveModuleExportNames('','', { exportNames: new Set<string>(), asSet: false })).toEqualTypeOf<string[]>()
})

test("Return Set of export names", () => {
	expectTypeOf(resolveModuleExportNames('','', { asSet: true })).toEqualTypeOf<Set<string>>()
	expectTypeOf(resolveModuleExportNames('','', { exportNames: new Set<string>() })).toEqualTypeOf<Set<string>>()
})

test("Return Arrays of value and type export names", () => {
	expectTypeOf(
		resolveModuleExportNames('','', { includeTypes: 'separate' })
	).toEqualTypeOf<[string[], string[]]>()
	expectTypeOf(
		resolveModuleExportNames('','', {
			includeTypes: 'separate',
			exportNames: [new Set<string>, new Set<string>] as const,
			asSet: false
		})
	).toEqualTypeOf<[string[], string[]]>()
})

test("Return Sets of value and type export names", () => {
	expectTypeOf(
		resolveModuleExportNames('','', { includeTypes: 'separate', asSet: true })
	).toEqualTypeOf<[Set<string>, Set<string>]>()
	
	expectTypeOf(
		resolveModuleExportNames('','', {
			includeTypes: 'separate',
			exportNames: [new Set<string>, new Set<string>] as const,
		})
	).toEqualTypeOf<readonly [Set<string>, Set<string>]>()
	
	expectTypeOf(
		resolveModuleExportNames('','', {
			includeTypes: 'separate',
			exportNames: [new Set<string>, new Set<string>] satisfies [any,any],
		})
	).toEqualTypeOf<[Set<string>, Set<string>]>()
})

test("Call without reference directory", () => {
	expectTypeOf(resolveModuleExportNames('')).toEqualTypeOf(resolveModuleExportNames('', ''))

	const optionsA = { exportNames: new Set<string>(), asSet: false }
	expectTypeOf(resolveModuleExportNames('', optionsA)).toEqualTypeOf(resolveModuleExportNames('', '', optionsA))
	
	const optionsB = { asSet: true }
	expectTypeOf(resolveModuleExportNames('', optionsB)).toEqualTypeOf(resolveModuleExportNames('', '', optionsB))

	const optionsC = { exportNames: new Set<string>() }
	expectTypeOf(resolveModuleExportNames('', optionsC)).toEqualTypeOf(resolveModuleExportNames('', '', optionsC))
})