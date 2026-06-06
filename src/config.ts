export interface CliConfig {
  apiKey: string
  baseUrl: string
}

export function resolveConfig(opts: { apiKey?: string; baseUrl?: string }): CliConfig {
  // Prefer MAILGENT_* env vars; fall back to legacy LOOMAL_* for backward compatibility.
  const apiKey = opts.apiKey || process.env.MAILGENT_API_KEY || process.env.LOOMAL_API_KEY
  if (!apiKey) {
    console.error("Error: API key required. Use --api-key or set MAILGENT_API_KEY env var.")
    process.exit(1)
  }

  return {
    apiKey,
    baseUrl:
      opts.baseUrl ||
      process.env.MAILGENT_API_URL ||
      process.env.LOOMAL_API_URL ||
      "https://api.mailgent.dev",
  }
}
