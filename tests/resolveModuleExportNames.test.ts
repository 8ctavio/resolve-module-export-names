import { test, expect } from "vitest"
import { resolveModuleExportNames } from '@8ctavio/resolve-module-export-names'

test('Demo test', () => {
	expect(resolveModuleExportNames('../src/index.js', import.meta.dirname)).toEqual(['resolveModuleExportNames'])
})