const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const { FileStore } = require("metro-cache");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

// Watch all files in the monorepo
config.watchFolders = [workspaceRoot];

// Resolve modules from both project and workspace node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// pnpm doesn't hoist by default — disable hierarchical lookup
config.resolver.disableHierarchicalLookup = true;

// Turborepo-compatible cache
config.cacheStores = [
  new FileStore({ root: path.join(projectRoot, "node_modules", ".cache", "metro") }),
];

module.exports = withNativeWind(config);
