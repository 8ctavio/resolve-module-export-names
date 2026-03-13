import { readFileSync } from "node:fs"
import { basename, dirname, isAbsolute } from "node:path"
import { parseSync } from "oxc-parser"
import { ResolverFactory } from 'oxc-resolver'

/**
 * @import { ValueSpan } from 'oxc-parser'
 * @import { NapiResolveOptions } from 'oxc-resolver'
 * @import { ResolveModuleExportNamesOptions, ResolvedModuleExportNames } from './index.types.js'
 */

/** @type { ResolverFactory | undefined } */
let resolverTypes
/** @type { ResolverFactory | undefined } */
let resolverImport
const resolver = {
	get types() {
		if (!resolverTypes) {
			/** @type { NapiResolveOptions } */
			const options = {
				conditionNames: ["types", "import"],
				extensions: [], // enable extension enforcement
				extensionAlias: {
					".js": [".ts", ".d.ts", ".js"],
					".ts": [".ts", ".d.ts", ".js"],
					".d.ts": [".d.ts", ".ts", ".js"]
				}
			}
			resolverTypes = resolverImport
				? resolverImport.cloneWithOptions(options)
				: new ResolverFactory(options)
		}
		return resolverTypes
	},
	get values() {
		if (!resolverImport) {
			const options = {
				conditionNames: ["import"],
				extensions: [] // enable extension enforcement
			}
			resolverImport = resolverTypes
				? resolverTypes.cloneWithOptions(options)
				: new ResolverFactory(options)
		}
		return resolverImport
	}
}

/**
 * Returns the names of a module's exported values.
 * 
 * @template { ResolveModuleExportNamesOptions["includeTypes"] } [IncludeTypes = undefined]
 * @template { ResolveModuleExportNamesOptions["exportNames"] } [ExportNames = undefined]
 * @template { ResolveModuleExportNamesOptions["asSet"] } [AsSet = (
 *     ExportNames extends (Set<string> | readonly [Set<string>, Set<string>]) ? true : false
 * )]
 * @overload
 * @param { string } specifier Module specifier.
 * @param { string } directory Reference directory path from which the module `specifier` is resolved.
 * @param { ResolveModuleExportNamesOptions<IncludeTypes, ExportNames, AsSet> } [options] Options object.
 * @returns { ResolvedModuleExportNames<IncludeTypes, ExportNames, AsSet> } Export names.
 */
/**
 * Returns the names of a module's exported values.
 * 
 * @template { ResolveModuleExportNamesOptions["includeTypes"] } [IncludeTypes = undefined]
 * @template { ResolveModuleExportNamesOptions["exportNames"] } [ExportNames = undefined]
 * @template { ResolveModuleExportNamesOptions["asSet"] } [AsSet = (
 *     ExportNames extends (Set<string> | readonly [Set<string>, Set<string>]) ? true : false
 * )]
 * @overload
 * @param { string } specifier Module specifier (absolute path to module file).
 * @param { ResolveModuleExportNamesOptions<IncludeTypes, ExportNames, AsSet> } [options] Options object.
 * @returns { ResolvedModuleExportNames<IncludeTypes, ExportNames, AsSet> } Export names.
 */
/**
 * @param { string } specifier
 * @param {(
 *   | [directory: string, options?: ResolveModuleExportNamesOptions]
 *   | [options?: ResolveModuleExportNamesOptions]
 * )} args
 * @returns { string[] | Set<string> | readonly [string[], string[]] | readonly [Set<string>, Set<string>] }
 */
export function resolveModuleExportNames(specifier, ...args) {
	/** @type { ResolveModuleExportNamesOptions } */
	let options
	let modulePath = specifier
	if (typeof args[0] === 'string') {
		/** @type { string } */
		let directory
		[directory, options = {}] = args
		const resolve = resolver[options.includeTypes ? 'types' : 'values']
		const resolveResult = resolve.sync(directory, specifier)
		if (resolveResult.error) {
			throw new Error(resolveResult.error)
		}
		modulePath = /** @type {string} */(resolveResult.path)
	} else {
		if (!isAbsolute(specifier)) {
			throw new Error(String.prototype.concat.call(
				"Module specifier must be an absolute path when no reference directory is provided; ",
				`received specifier "${specifier}"`
			))
		}
		[options = {}] = args
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

	const { includeTypes: typesConfig } = options
	
	const includeAll = typesConfig === true
	const includeTypes = Boolean(typesConfig)
	const includeTypesOnly = typesConfig === 'only'
	const includeValuesOnly = !includeTypes
	const separate = typesConfig === 'separate'
	
	const setProvided = 'exportNames' in options
	
	const {
		exportNames = /** @type {Set<string> | readonly [Set<string>, Set<string>]} */
			(separate ? [new Set(), new Set()] : new Set()),
		asSet = setProvided,
	} = options

	if (setProvided && separate && !Array.isArray(exportNames)) {
		throw new TypeError(String.prototype.concat.call(
			"exportNames must be a two-Set Array when includeTypes is set to 'separate'; ",
			`received ${exportNames}`
		))
	}

	for (const staticExport of parseResult.module.staticExports) {
		for (const entry of staticExport.entries) {
			if (entry.exportName.kind === 'Name') {
				if (
					includeAll
					|| (includeTypesOnly && entry.isType)
					|| (includeValuesOnly && !entry.isType)
				) {
					/** @type {Set<string>} */
					(exportNames)
						.add(/** @type {string} */ (entry.exportName.name))
				} else if (separate) {
					/** @type {[Set<string>, Set<string>]} */
					(exportNames)
						[/** @type {0|1} */ (Number(entry.isType))]
						.add(/** @type {string} */ (entry.exportName.name))
				}
			} else if (entry.importName.kind === 'AllButDefault' && (includeTypes || !entry.isType)) {
				const reExportedModuleSpecifier = /** @type {ValueSpan} */(entry.moduleRequest).value
				resolveModuleExportNames(
					reExportedModuleSpecifier,
					dirname(modulePath),
					// @ts-expect-error
					{ includeTypes: typesConfig, exportNames }
				)
			}
		}
	}

	return asSet
		? exportNames
		: separate
			? /** @type {[string[], string[]]} */ (
				/** @type {readonly Set<string>[]} */
				(exportNames)
					.map(set => Array.from(set))
			)
			: Array.from(/** @type {Set<string>} */(exportNames))
}