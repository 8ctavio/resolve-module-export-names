import { readFileSync } from "node:fs"
import { basename, dirname } from "node:path"
import { parseSync } from "oxc-parser"
import { ResolverFactory } from 'oxc-resolver'

/**
 * @import { ValueSpan } from 'oxc-parser'
 */

/** @type { ResolverFactory } */
let resolvePath

/**
 * @template { boolean } [AsSet = boolean]
 * @typedef { object } ResolveModuleExportNamesOptions
 * @property { AsSet } asSet
 */

/**
 * @template { boolean } [AsSet = false]
 * @override
 * @param { string } specifier
 * @param { string } directory
 * @param { ResolveModuleExportNamesOptions<AsSet> } options
 * @returns {(
 * 		AsSet extends true ? string[] : Set<string> 
 * )}
 */

/**
 * Returns the names of a module's exported values
 * 
 * @param { string } specifier - Module specifier (relative path or bare name).
 * @param { string } directory - Reference directory path from which the module `specifier` is resolved.
 * @param { object } [options]
 * @param { boolean } [options.asSet] - If set to `true` a `Set` is returned; an `Array` is returned otherwise. Defaults to `false`.
 * @returns { string[] | Set<string> } Export names
 */
export function resolveModuleExportNames(specifier, directory, options = {}) {
	resolvePath ??= new ResolverFactory({
		conditionNames: ['import'],
		extensions: [] // enable extension enforcement
	})

	const {
		asSet = false
	} = options

	try {
		const resolveResult = resolvePath.sync(directory, specifier)
		if (resolveResult.error) {
			throw new Error(resolveResult.error)
		}

		const modulePath = /** @type {string} */(resolveResult.path)
		const parseResult = parseSync(
			basename(modulePath),
			readFileSync(modulePath, 'utf-8')
		)
		if (parseResult.errors.length > 0) {
			const errors = []
			for (const error of parseResult.errors) {
				if (error.severity === 'Error') {
					errors.push(error)
				} else if (error.severity === 'Warning') {
					console.warn(error.message, error)
				} else {
					console.info(error.message, error)
				}
			}
			if (errors.length > 0) {
				throw new Error('Parse errors encountered', { cause: errors })
			}
		}

		/** @type { Set<string> } */
		const exportNames = new Set()
		for (const staticExport of parseResult.module.staticExports) {
			for (const entry of staticExport.entries) {
				if (entry.exportName.kind === 'Name') {
					exportNames.add(/** @type {string} */(entry.exportName.name))
				} else if (entry.importName.kind === 'AllButDefault') {
					const reExportedModuleSpecifier = /** @type {ValueSpan} */(entry.moduleRequest).value
					resolveModuleExportNames(
						reExportedModuleSpecifier,
						dirname(modulePath), 
						{ asSet: true }
					).forEach(exportName => {
						exportNames.add(exportName)
					})
				}
			}
		}

		return asSet ? exportNames : Array.from(exportNames)
	} catch(error) {
		console.error(error)
		throw error
	}
}