import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		dir: 'tests',
		typecheck: {
			enabled: true,
			checker: 'tsc',
			tsconfig: 'tsconfig.test.json'
		}
	}
})