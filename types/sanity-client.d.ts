// Ambient module declaration for @sanity/client
// This allows sanity.types.ts to augment the module without requiring the package to be installed
declare module "@sanity/client" {
  // The actual augmentation with SanityQueries interface is in sanity.types.ts
}
