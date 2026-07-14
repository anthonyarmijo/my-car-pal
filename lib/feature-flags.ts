import "server-only";

const ENABLED_VALUES = new Set(["1", "true", "yes", "on"]);

export function isDiyFeatureEnabled(): boolean {
  const configuredValue = process.env.FEATURE_DIY_ENABLED?.trim().toLowerCase();

  if (configuredValue) {
    return ENABLED_VALUES.has(configuredValue);
  }

  return process.env.NODE_ENV !== "production";
}
