import { readFileSync } from "node:fs"
import { basename, dirname, isAbsolute } from "node:path"
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
 * @property { ExportNames } [exportNames] `Set` in which to add export names as they are found.
 * @property { AsSet } [asSet] If set to `true` a `Set` is returned; an `Array` is returned otherwise. Defaults to `false` if `exportNames` is not provided, and to `true` otherwise.
 */

/**
 * Returns the names of a module's exported values
 * 
 * @template { Set<string> | undefined } [ExportNames = undefined]
 * @template { boolean  } [AsSet = ExportNames extends Set<string> ? true : false]
 * @overload
 * @param { string } specifier Module specifier.
 * @param { string } directory Reference directory path from which the module `specifier` is resolved.
 * @param { ResolveModuleExportNamesOptions<ExportNames, AsSet> } [options] Options object
 * @returns {(
 * 		AsSet extends true ? Set<string> : string[]
 * )} Export names
 */

/**
 * Returns the names of a module's exported values
 * 
 * @template { Set<string> | undefined } [ExportNames = undefined]
 * @template { boolean  } [AsSet = ExportNames extends Set<string> ? true : false]
 * @overload
 * @param { string } specifier Module specifier (absolute path to module file).
 * @param { ResolveModuleExportNamesOptions<ExportNames, AsSet> } [options] Options object
 * @returns {(
 * 		AsSet extends true ? Set<string> : string[]
 * )} Export names
 */

/**
 * @param { string } specifier
 * @param {(
 *   | [directory: string, options?: ResolveModuleExportNamesOptions]
 *   | [options?: ResolveModuleExportNamesOptions]
 * )} args
 * @returns { string[] | Set<string> }
 */
export function resolveModuleExportNames(specifier, ...args) {
	let modulePath = specifier
	/** @type { ResolveModuleExportNamesOptions } */
	let options
	if (typeof args[0] === 'string') {
		const [directory] = args
		const resolve = useResolver()
		const resolveResult = resolve.sync(directory, specifier)
		if (resolveResult.error) {
			throw new Error(resolveResult.error)
		}
		modulePath = /** @type {string} */(resolveResult.path)
		options = args[1] ?? {}
	} else {
		if (!isAbsolute(specifier)) {
			throw new Error(String.prototype.concat.call(
				"Module specifier must be an absolute path when no reference directory is provided; ",
				`received specifier "${specifier}"`
			))
		}
		options = args[0] ?? {}
	}
	
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