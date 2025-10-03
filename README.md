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
```

### Definition

```ts
function resolveModuleExportNames(
	specifier: string,
	directory: string,
	options?: ResolveModuleExportNamesOptions
): string[] | Set<string>
function resolveModuleExportNames(
	specifier: string,
	options?: ResolveModuleExportNamesOptions
): string[] | Set<string>

type ResolveModuleExportNamesOptions = {
	asSet?: boolean;
	exportNames?: Set<string>;
}
```

#### Parameters

- `specifier`: Module specifier.
- `directory`: Reference directory path from which the module `specifier` is resolved.
- `options.asSet`: If set to `true` a `Set` is returned; an `Array` is returned otherwise. Defaults to `false` if `exportNames` is not provided, and to `true` otherwise.
- `options.exportNames`: `Set` in which to add found export names as they are found.