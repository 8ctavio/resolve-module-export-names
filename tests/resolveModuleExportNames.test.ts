import { suite, test, expect } from "vitest"
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

const namedExportsPath = './fixtures/named-exports.ts'
const fixturePackageDir = dirname(resolve('./fixtures/package/index.js'))

suite("Return value", () => {
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

		expect(names).toSatisfy(Array.isArray)
		expect(new Set(names)).toEqual(exportNames)
	})

	test("Return Arrays of value and type export names", () => {
		const [values, types] = resolveModuleExportNames(namedExportsPath, import.meta.dirname, {
			includeTypes: 'separate'
		})
		expect(values).toSatisfy(Array.isArray)
		expect(types).toSatisfy(Array.isArray)
	})

	test("Return Sets of value and type export names", () => {
		const [values, types] = resolveModuleExportNames(namedExportsPath, import.meta.dirname, {
			includeTypes: 'separate',
			asSet: true
		})
		expect(values).toBeInstanceOf(Set)
		expect(types).toBeInstanceOf(Set)
	})

	test("Return provided export names Sets", () => {
		const exportNames = [new Set<string>(), new Set<string>()] as const
		const result = resolveModuleExportNames(namedExportsPath, import.meta.dirname, {
			includeTypes: 'separate',
			exportNames
		})
		expect(result).toBe(exportNames)
		expect(result[0]).toBe(exportNames[0])
		expect(result[1]).toBe(exportNames[1])
	})

	test("Return Arrays when value and type export name Sets are provided", () => {
		const exportNames = [new Set<string>(), new Set<string>()] as const
		const names = resolveModuleExportNames(namedExportsPath, import.meta.dirname, {
			includeTypes: 'separate',
			exportNames,
			asSet: false
		})

		expect(names[0]).toSatisfy(Array.isArray)
		expect(names[1]).toSatisfy(Array.isArray)
		expect(new Set(names[0])).toEqual(exportNames[0])
		expect(new Set(names[1])).toEqual(exportNames[1])
	})
})

suite("Resolve modules' named exports", () => {
	const exportedClasses = 1
	const exportedValues = 28
	const exportedTypes = 18

	test("Include exported values only", () => {
		const exportNames = Array.from({ length: exportedValues }, (_, i) => `value${i+1}`)
		exportNames.push('class1')

		const namesArr = resolveModuleExportNames(namedExportsPath, import.meta.dirname)
		expect(namesArr).toHaveLength(exportedValues + exportedClasses)
		for (const name of exportNames) {
			expect(namesArr).toContain(name)
		}

		const namesSet = resolveModuleExportNames(namedExportsPath, import.meta.dirname, { asSet: true })
		expect(namesSet).toEqual(new Set(exportNames))
	})

	test("Include values and types", () => {
		const exportNames = ['class1']
		for (let i=0; i<exportedValues; i++) {
			exportNames.push(`value${i+1}`)
		}
		for (let i=0; i<exportedTypes; i++) {
			exportNames.push(`type${i+1}`)
		}

		const namesArr = resolveModuleExportNames(namedExportsPath, import.meta.dirname, {
			includeTypes: true
		})
		expect(namesArr).toHaveLength(exportedValues + exportedTypes + exportedClasses)
		for (const name of exportNames) {
			expect(namesArr).toContain(name)
		}

		const namesSet = resolveModuleExportNames(namedExportsPath, import.meta.dirname, {
			includeTypes: true,
			asSet: true
		})
		expect(namesSet).toEqual(new Set(exportNames))
	})

	test("Include exported types only", () => {
		const exportNames = Array.from({ length: exportedTypes }, (_, i) => `type${i+1}`)

		const namesArr = resolveModuleExportNames(namedExportsPath, import.meta.dirname, {
			includeTypes: 'only'
		})
		expect(namesArr).toHaveLength(exportedTypes)
		for (const name of exportNames) {
			expect(namesArr).toContain(name)
		}

		const namesSet = resolveModuleExportNames(namedExportsPath, import.meta.dirname, {
			includeTypes: 'only',
			asSet: true
		})
		expect(namesSet).toEqual(new Set(exportNames))
	})

	test("Separate exported names and types", () => {
		const exportNames = {
			values: Array.from({ length: exportedValues }, (_, i) => `value${i+1}`),
			types: Array.from({ length: exportedTypes }, (_, i) => `type${i+1}`)
		}
		exportNames.values.push('class1')

		const [valuesArr, typesArr] = resolveModuleExportNames(namedExportsPath, import.meta.dirname, {
			includeTypes: 'separate'
		})
		expect(valuesArr).toHaveLength(exportedValues + exportedClasses)
		expect(typesArr).toHaveLength(exportedTypes)
		for (const name of exportNames.values) {
			expect(valuesArr).toContain(name)
		}
		for (const name of exportNames.types) {
			expect(typesArr).toContain(name)
		}

		const [valuesSet, typesSet] = resolveModuleExportNames(namedExportsPath, import.meta.dirname, {
			includeTypes: 'separate',
			asSet: true
		})
		expect(valuesSet).toEqual(new Set(exportNames.values))
		expect(typesSet).toEqual(new Set(exportNames.types))
	})
})

suite("Resolve modules' aggregated export names", () => {
	const exportedTypes = new Set<string>()
	const exportedValues = new Set<string>()
	for (const prefix of ['public', 'private', 'internal']) {
		for (let i=1; i<=3; i++) {
			exportedValues.add(`${prefix}-value-${i}`)
		}
	}
	for (const prefix of ['pkg', 'pkg/foo', '@scope/pkg', '@scope/pkg/foo']) {
		for (let i=1; i<=3; i++) {
			exportedTypes.add(`${prefix}-type-${i}`)
			exportedValues.add(`${prefix}-value-${i}`)
		}
	}

	test("Include exported values only", () => {
		expect(
			resolveModuleExportNames('./index.js', fixturePackageDir, { asSet: true })
		).toEqual(exportedValues)
	})
	test("Include values and types", () => {
		expect(
			resolveModuleExportNames('./index.js', fixturePackageDir, {
				includeTypes: true,
				asSet: true
			})
		).toEqual(exportedValues.union(exportedTypes))
	})
	test("Include exported types only", () => {
		expect(
			resolveModuleExportNames('./index.js', fixturePackageDir, {
				includeTypes: 'only',
				asSet: true
			})
		).toEqual(exportedTypes)
	})
	test("Separate exported names and types", () => {
		expect(
			resolveModuleExportNames('./index.js', fixturePackageDir, {
				includeTypes: 'separate',
				asSet: true
			})
		).toStrictEqual([exportedValues, exportedTypes])
	})
})

suite("Resolve packages' export names", () => {
	const packages = ['pkg', 'pkg/foo', '@scope/pkg', '@scope/pkg/foo']

	test("Include exported values only", () => {
		for (const pkg of packages) {
			expect(
				resolveModuleExportNames(pkg, fixturePackageDir, { asSet: true })
			).toEqual(
				new Set(Array.from({ length: 3 }, (_, i) => `${pkg}-value-${i+1}`))
			)
		}
	})
	test("Include values and types", () => {
		for (const pkg of packages) {
			expect(
				resolveModuleExportNames(pkg, fixturePackageDir, { includeTypes: true, asSet: true })
			).toEqual(Set.prototype.union.call(
				new Set(Array.from({ length: 3 }, (_, i) => `${pkg}-value-${i+1}`)),
				new Set(Array.from({ length: 3 }, (_, i) => `${pkg}-type-${i+1}`)),
			))
		}
	})
})

suite("Collect export names into external Sets", () => {
	test("Single export names Set", () => {
		const exportNames = new Set<string>()
		expect(exportNames).toEqual(Set.prototype.union.call(
			resolveModuleExportNames('pkg', fixturePackageDir, { exportNames }),
			resolveModuleExportNames('@scope/pkg', fixturePackageDir, { exportNames })
		))
	})

	test("Value and type export name Sets", () => {
		const exportNames = [new Set<string>(), new Set<string>()] as const

		const names1 = resolveModuleExportNames('pkg', fixturePackageDir, { includeTypes: 'separate', exportNames })
		const names2 = resolveModuleExportNames('@scope/pkg', fixturePackageDir, { includeTypes: 'separate', exportNames })
		expect(exportNames).toEqual([
			names1[0].union(names2[0]),
			names1[1].union(names2[1]),
		])
	})
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

test("Throw error if includeTypes is 'separate' and provided exportNames is not an array", () => {
	expect(() => resolveModuleExportNames(namedExportsPath, import.meta.dirname, {
		includeTypes: 'separate',
		// @ts-expect-error
		exportNames: new Set()
	})).toThrowError()
})