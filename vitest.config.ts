import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		dir: 'tests',
		exclude: ['fixtures'],
		typecheck: {
			enabled: true,
			checker: 'tsc',
			tsconfig: 'tsconfig.tests.json'
		}
	}
})