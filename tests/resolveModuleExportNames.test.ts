import { test, expect } from "vitest"
import { dirname } from "node:path"
import { ResolverFactory } from 'oxc-resolver'
import { resolveModuleExportNames } from '@8ctavio/resolve-module-export-names'

const resolve = new ResolverFactory({
	conditionNames: ['import'],
	extensions: [] // enable extension enforcement
})

const namedExportsPath = './fixtures/named-exports.js'
const fixturePackageDir = dirname(resolve.sync(import.meta.dirname, './fixtures/package/index.js').path!)

test("Return Array of export names", () => {
	const names = resolveModuleExportNames(namedExportsPath, import.meta.dirname)
	expect(Array.isArray(names)).toBe(true)
})

test("Return Set of export names", () => {
	const names = resolveModuleExportNames(namedExportsPath, import.meta.dirname, { asSet: true })
	expect(names).toBeInstanceOf(Set)
})

test("Resolve modules' named exports", () => {
	const moduleNames = Array.from({ length: 30 }, (_, i) => `name${i+1}`)

	const namesArr = resolveModuleExportNames(namedExportsPath, import.meta.dirname)
	expect(namesArr).toHaveLength(30)
	for (const name of moduleNames) {
		expect(namesArr).toContain(name)
	}

	const namesSet = resolveModuleExportNames(namedExportsPath, import.meta.dirname, { asSet: true })
	expect(namesSet).toEqual(new Set(moduleNames))
})

test("Resolve modules' aggregated export names", () => {
	const exportNames = new Set()
	const prefixes = ['public', 'private', 'pkg', 'pkg/sub', '@scope/pkg', '@scope/pkg/sub']
	for (const prefix of prefixes) {
		for (let i=1; i<=3; i++) {
			exportNames.add(`${prefix}-${i}`)
		}
	}

	expect(
		resolveModuleExportNames('./index.js', fixturePackageDir, { asSet: true })
	).toEqual(
		exportNames
	)
})

test("Resolve packages' export names", () => {
	const packages = ['pkg', 'pkg/sub', '@scope/pkg', '@scope/pkg/sub']
	for (const pkg of packages) {
		expect(
			resolveModuleExportNames(pkg, fixturePackageDir, { asSet: true })
		).toEqual(
			new Set(Array.from({ length: 3 }, (_, i) => `${pkg}-${i+1}`))
		)
	}
})