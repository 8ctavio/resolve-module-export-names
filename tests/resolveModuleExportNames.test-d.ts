import { test, expectTypeOf } from "vitest"
import { resolveModuleExportNames } from "@8ctavio/resolve-module-export-names"

test("Return Array of export names", () => {
	expectTypeOf(resolveModuleExportNames('','')).toEqualTypeOf<string[]>()
})

test("Return Set of export names", () => {
	expectTypeOf(resolveModuleExportNames('','', { asSet: true })).toEqualTypeOf<Set<string>>()
})