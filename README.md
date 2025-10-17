### `resolveModuleExportNames`

> Returns the names of ESM modules' exported values

### Usage

```js
import { resolveModuleExportNames } from '@8ctavio/export-module-export-names'

// Resolve export names of module with a relative path
const exportNames = resolveModuleExportNames('./path/to/module.js', import.meta.dirname)

// Resolve export names of a package
const exportNames = resolveModuleExportNames('pkg', import.meta.dirname)
const exportNames = resolveModuleExportNames('@scope/pkg', import.meta.dirname)

// Retrieve result as a Set
const exportNames = resolveModuleExportNames(path, dir, { asSet: true })

// Collect export names into external Set
const exportNames = new Set()
resolveModuleExportNames('pkg-1', import.meta.dirname, { exportNames })
resolveModuleExportNames('pkg-2', import.meta.dirname, { exportNames })

// Omit reference directory if specifier is an absolute path
const modulePath = resolvePath('./path/to/module.js', import.meta.dirname)
const exportNames = resolveModuleExportNames(modulePath, {/* ... */})

// Include type exports
const exportNames = resolveModuleExportNames('/path/to/declaration.d.ts', {
	includeTypes: true
})

// Include type exports only
const exportNames = resolveModuleExportNames('/path/to/declaration.d.ts', {
	includeTypes: 'only'
})

// Separate value and type export names
const [values, types] = resolveModuleExportNames('/path/to/declaration.d.ts', {
	includeTypes: 'separate'
})

// Collect value and type export names into external Sets
const exportNames = [new Set(), new Set()]
resolveModuleExportNames('/path/to/declaration.d.ts', {
	includeTypes: 'separate',
	exportNames
})
```

### Definition

```ts
function resolveModuleExportNames(
	specifier: string,
	directory: string,
	options?: ResolveModuleExportNamesOptions
): string[] | Set<string> | [string[], string[]] | [Set<string>, Set<string>]
function resolveModuleExportNames(
	specifier: string,
	options?: ResolveModuleExportNamesOptions
): string[] | Set<string> | [string[], string[]] | [Set<string>, Set<string>]

type ResolveModuleExportNamesOptions = {
	asSet?: boolean;
	exportNames?: Set<string>;
	includeTypes?: boolean | 'only' | 'separate'
}
```

#### Parameters

- `specifier`: Module specifier.
- `directory`: Reference directory path from which the module `specifier` is resolved.
- `options`:
	- `exportNames`: `Set` in which to add export names as they are found.
	- `asSet`: If set to `true` a `Set` is returned; an `Array` is returned otherwise. Defaults to `false` if `exportNames` is not provided, and to `true` otherwise.
	- `includeTypes`: Whether to retrieve type export names.
		- If set to `only`, only type exports are retrieved.
		- If set to `separate`, value and type export names are collected into different arrays/sets. An array that stores the value and type export name arrays/sets in that order is returned.
			
			Defaults to `false`.
		