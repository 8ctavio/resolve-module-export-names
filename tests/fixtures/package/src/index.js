export {
	_ as "pkg-value-1",
	_ as "pkg-value-2",
}

// Relative path
export * from './public.js'

// Import map
export * from '#private'

// Packages
export * from 'pkg'
export * from 'pkg/foo'
export * from '@scope/pkg'
export * from '@scope/pkg/foo'