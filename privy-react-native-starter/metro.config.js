const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");

const defaultConfig = getDefaultConfig(__dirname);

const resolveRequestWithPackageExports = (context, moduleName, platform) => {
  if (moduleName === "isows") {
    const ctx = {
      ...context,
      unstable_enablePackageExports: false,
    };
    return ctx.resolveRequest(ctx, moduleName, platform);
  }

  if (moduleName.startsWith("zustand")) {
    const ctx = {
      ...context,
      unstable_enablePackageExports: false,
    };
    return ctx.resolveRequest(ctx, moduleName, platform);
  }

  if (moduleName === "jose") {
    const ctx = {
      ...context,
      unstable_conditionNames: ["browser"],
    };
    return ctx.resolveRequest(ctx, moduleName, platform);
  }

  if (moduleName.startsWith("@privy-io/")) {
    const ctx = {
      ...context,
      unstable_enablePackageExports: true,
    };
    return ctx.resolveRequest(ctx, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

const config = {
  resolver: {
    resolveRequest: resolveRequestWithPackageExports,
  },
};

module.exports = mergeConfig(defaultConfig, config);
