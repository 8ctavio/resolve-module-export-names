import { test, expect } from "vitest"
import { resolveModuleExportNames } from '@8ctavio/resolve-module-export-names'

const namedExportsPath = './fixtures/named-exports.js'

test("Return Array of export names", () => {
	const names = resolveModuleExportNames(namedExportsPath, import.meta.dirname)
	expect(Array.isArray(names)).toBe(true)
})

test("Return Set of export names", () => {
	const names = resolveModuleExportNames(namedExportsPath, import.meta.dirname, { asSet: true })
	expect(names).toBeInstanceOf(Set)
})

test("Resolve a module's named exports", () => {
	const moduleNames = Array.from({ length: 30 }, (_, i) => `name${i+1}`)

	const namesArr = resolveModuleExportNames(namedExportsPath, import.meta.dirname)
	expect(namesArr).toHaveLength(30)
	for (const name of moduleNames) {
		expect(namesArr).toContain(name)
	}

	const namesSet = resolveModuleExportNames(namedExportsPath, import.meta.dirname, { asSet: true })
	expect(namesSet).toEqual(new Set(moduleNames))
})