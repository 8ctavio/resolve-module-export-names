export {
	_ as "pkg-1",
	_ as "pkg-2",
}

// Relative path
export * from './public.js'

// Import map
export * from '#private'

// Packages
export * from 'pkg'
export * from 'pkg/sub'
export * from '@scope/pkg'
export * from '@scope/pkg/sub'