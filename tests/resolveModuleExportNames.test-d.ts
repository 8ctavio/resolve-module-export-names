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

test("Call without reference directory", () => {
	expectTypeOf(resolveModuleExportNames('')).toEqualTypeOf(resolveModuleExportNames('', ''))

	const optionsA = { exportNames: new Set<string>(), asSet: false }
	expectTypeOf(resolveModuleExportNames('', optionsA)).toEqualTypeOf(resolveModuleExportNames('', '', optionsA))
	
	const optionsB = { asSet: true }
	expectTypeOf(resolveModuleExportNames('', optionsB)).toEqualTypeOf(resolveModuleExportNames('', '', optionsB))

	const optionsC = { exportNames: new Set<string>() }
	expectTypeOf(resolveModuleExportNames('', optionsC)).toEqualTypeOf(resolveModuleExportNames('', '', optionsC))
})