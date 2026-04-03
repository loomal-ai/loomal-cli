import { Command } from "commander"
import { resolveConfig } from "../config"
import { request } from "../http"
import { table, json as jsonOut, success } from "../output"

export const vaultCommand = new Command("vault").description("Vault operations")

vaultCommand
  .command("list")
  .description("List credentials")
  .option("--json", "Output as JSON")
  .action(async (opts, cmd) => {
    const config = resolveConfig(cmd.optsWithGlobals())
    const data = await request<any>(config.baseUrl, config.apiKey, "GET", "/v0/vault")
    if (opts.json) return jsonOut(data)
    if (!data.credentials?.length) return console.log("No credentials stored.")
    table(
      ["Name", "Type", "Expires", "Last Used"],
      data.credentials.map((c: any) => [
        c.name, c.type,
        c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "—",
        c.lastUsedAt ? new Date(c.lastUsedAt).toLocaleDateString() : "—",
      ]),
    )
  })

vaultCommand
  .command("get <name>")
  .description("Get a credential")
  .option("--json", "Output as JSON")
  .action(async (name, opts, cmd) => {
    const config = resolveConfig(cmd.optsWithGlobals())
    const data = await request<any>(config.baseUrl, config.apiKey, "GET", `/v0/vault/${encodeURIComponent(name)}`)
    if (opts.json) return jsonOut(data)
    table(["Field", "Value"], [["Name", data.name], ["Type", data.type], ["Created", data.createdAt]])
    console.log("\nData:")
    console.log(JSON.stringify(data.data, null, 2))
  })

vaultCommand
  .command("store <name>")
  .description("Store a credential")
  .requiredOption("--type <type>", "Credential type (LOGIN, API_KEY, OAUTH, TOTP, etc.)")
  .requiredOption("--data <json>", "Credential data as JSON string")
  .option("--metadata <json>", "Optional metadata as JSON string")
  .option("--expires-at <date>", "Expiration date (ISO 8601)")
  .option("--json", "Output as JSON")
  .action(async (name, opts, cmd) => {
    const config = resolveConfig(cmd.optsWithGlobals())
    let data: Record<string, unknown>
    try { data = JSON.parse(opts.data) } catch {
      console.error("Error: --data must be valid JSON"); process.exit(1)
    }
    let metadata: Record<string, unknown> | undefined
    if (opts.metadata) {
      try { metadata = JSON.parse(opts.metadata) } catch {
        console.error("Error: --metadata must be valid JSON"); process.exit(1)
      }
    }
    const result = await request<any>(config.baseUrl, config.apiKey, "PUT", `/v0/vault/${encodeURIComponent(name)}`, {
      type: opts.type, data, metadata, expiresAt: opts.expiresAt,
    })
    if (opts.json) return jsonOut(result)
    success(`Stored credential "${name}" (${opts.type})`)
  })

vaultCommand
  .command("delete <name>")
  .description("Delete a credential")
  .action(async (name, _opts, cmd) => {
    const config = resolveConfig(cmd.optsWithGlobals())
    await request(config.baseUrl, config.apiKey, "DELETE", `/v0/vault/${encodeURIComponent(name)}`)
    success(`Deleted credential "${name}"`)
  })

vaultCommand
  .command("totp <name>")
  .description("Get current TOTP code")
  .option("--json", "Output as JSON")
  .action(async (name, opts, cmd) => {
    const config = resolveConfig(cmd.optsWithGlobals())
    const data = await request<any>(config.baseUrl, config.apiKey, "GET", `/v0/vault/${encodeURIComponent(name)}/totp`)
    if (opts.json) return jsonOut(data)
    console.log(`Code: ${data.code}  (expires in ${data.remaining}s)`)
  })
