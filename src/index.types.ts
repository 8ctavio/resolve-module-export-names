export type ResolveModuleExportNamesOptions<
	IncludeTypes extends boolean | 'only' | 'separate' | undefined
		=  boolean | 'only' | 'separate',
	ExportNames extends Set<string> | readonly [Set<string>, Set<string>] | undefined
		= Set<string> | readonly [Set<string>, Set<string>],
	AsSet extends boolean | undefined = boolean
> = {
	/**
	 * `Set` in which to add export names as they are found.
	 */
	exportNames?: ExportNames & NoInfer<IncludeTypes extends 'separate'
		? readonly [Set<string>, Set<string>]
		: Set<string>
	>
	/**
	 * If set to `true` a `Set` is returned; an `Array` is returned otherwise.
	 * Defaults to `false` if `exportNames` is not provided, and to `true` otherwise.
	 */
	asSet?: AsSet
	/**
	 * Whether to retrieve type export names.
	 * - If set to `only`, only type exports are retrieved.
	 * - If set to `separate`, value and type export names are collected into different
	 *   arrays/sets. An array that stores the value and type export name arrays/sets
	 *   in that order is returned.
	 * @default false
	 */
	includeTypes?: IncludeTypes
}

export type ResolvedModuleExportNames<
	IncludeTypes extends ResolveModuleExportNamesOptions['includeTypes'],
	ExportNames extends ResolveModuleExportNamesOptions['exportNames'],
	AsSet extends ResolveModuleExportNamesOptions['asSet'],
> = AsSet extends true
	? IncludeTypes extends 'separate'
		? ExportNames extends readonly [Set<string>, Set<string>]
			? ExportNames
			: [Set<string>, Set<string>]
		: Set<string>
	: IncludeTypes extends 'separate'
		? [string[], string[]]
		: string[]