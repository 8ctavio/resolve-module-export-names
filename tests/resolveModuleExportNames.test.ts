import { test, expect } from "vitest"
import { dirname } from "node:path"
import { ResolverFactory } from "oxc-resolver"
import { resolveModuleExportNames } from "@8ctavio/resolve-module-export-names"

const resolver = new ResolverFactory({
	conditionNames: ['import'],
	extensions: [] // enable extension enforcement
})
function resolve(specifier: string, directory = import.meta.dirname) {
	const { path, error } = resolver.sync(directory, specifier)
	if (error) {
		throw new Error(error)
	} else {
		return path!
	}
}

const namedExportsPath = './fixtures/named-exports.js'
const fixturePackageDir = dirname(resolve('./fixtures/package/index.js'))

test("Return Array of export names", () => {
	const names = resolveModuleExportNames(namedExportsPath, import.meta.dirname)
	expect(Array.isArray(names)).toBe(true)
})

test("Return Set of export names", () => {
	const names = resolveModuleExportNames(namedExportsPath, import.meta.dirname, { asSet: true })
	expect(names).toBeInstanceOf(Set)
})

test("Return provided export names Set", () => {
	const exportNames = new Set<string>()
	expect(resolveModuleExportNames(namedExportsPath, import.meta.dirname, { exportNames })).toBe(exportNames)
})

test("Return Array when export names Set is provided", () => {
	const exportNames = new Set<string>()
	const names = resolveModuleExportNames(namedExportsPath, import.meta.dirname, {
		exportNames,
		asSet: false
	})

	expect(Array.isArray(names)).toBe(true)
	expect(new Set(names)).toEqual(exportNames)
})

test("Collect export names into external Set", () => {
	const exportNames = new Set<string>()
	
	const names1 = resolveModuleExportNames('pkg', fixturePackageDir, { exportNames })
	const names2 = resolveModuleExportNames('@scope/pkg', fixturePackageDir, { exportNames })
	
	expect(names1.union(names2)).toEqual(exportNames)
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
	const prefixes = ['public', 'private', 'internal', 'pkg', 'pkg/sub', '@scope/pkg', '@scope/pkg/sub']
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

test("Provide resolved module path", () => {
	const absolutePath = resolve(namedExportsPath)
	expect(resolveModuleExportNames(absolutePath)).toEqual(
		resolveModuleExportNames(namedExportsPath, import.meta.dirname)
	)
	expect(resolveModuleExportNames(absolutePath, { asSet: true })).toEqual(
		resolveModuleExportNames(namedExportsPath, import.meta.dirname, { asSet: true })
	)
})

test("Throw error if reference directory is not provided and specifier is not an absolute path", () => {
	expect(() => resolveModuleExportNames(namedExportsPath)).toThrowError()
})