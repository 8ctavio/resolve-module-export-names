import { readFileSync } from "node:fs"
import { basename, dirname } from "node:path"
import { parseSync } from "oxc-parser"
import { ResolverFactory } from 'oxc-resolver'

/**
 * @import { ValueSpan } from 'oxc-parser'
 */

/** @type { ResolverFactory } */
let resolver

/** @type { () => ResolverFactory } */
function useResolver() {
	return resolver ??= new ResolverFactory({
		conditionNames: ['import'],
		extensions: [] // enable extension enforcement
	})
}

/**
 * @template { Set<string> | undefined } [ExportNames = Set<string>]
 * @template { boolean } [AsSet = boolean]
 * @typedef { object } ResolveModuleExportNamesOptions
 * @property { ExportNames } [exportNames]
 * @property { AsSet } [asSet]
 */

/**
 * @template { Set<string> | undefined } [ExportNames = undefined]
 * @template { boolean  } [AsSet = ExportNames extends Set<string> ? true : false]
 * @overload
 * @param { string } specifier
 * @param { string } directory
 * @param { ResolveModuleExportNamesOptions<ExportNames, AsSet> } [options]
 * @returns {(
 * 		AsSet extends true ? Set<string> : string[]
 * )}
 */

/**
 * Returns the names of a module's exported values
 * 
 * @param { string } specifier - Module specifier.
 * @param { string } directory - Reference directory path from which the module `specifier` is resolved.
 * @param { object } [options]
 * @param { boolean } [options.asSet] - If set to `true` a `Set` is returned; an `Array` is returned otherwise. Defaults to `false` if `exportNames` is not provided, and to `true` otherwise.
 * @param { Set<string> } [options.exportNames] - `Set` in which to add found export names as they are found.
 * @returns { string[] | Set<string> } Export names
 */
export function resolveModuleExportNames(specifier, directory, options = {}) {
	const resolve = useResolver()
	const resolveResult = resolve.sync(directory, specifier)
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

	const {
		exportNames = new Set(),
		asSet = Boolean(options.exportNames)
	} = options

	for (const staticExport of parseResult.module.staticExports) {
		for (const entry of staticExport.entries) {
			if (entry.exportName.kind === 'Name') {
				exportNames.add(/** @type {string} */(entry.exportName.name))
			} else if (entry.importName.kind === 'AllButDefault') {
				const reExportedModuleSpecifier = /** @type {ValueSpan} */(entry.moduleRequest).value
				resolveModuleExportNames(
					reExportedModuleSpecifier,
					dirname(modulePath),
					{ exportNames }
				)
			}
		}
	}

	return asSet ? exportNames : Array.from(exportNames)
}