import { Command } from "commander"
import { resolveConfig } from "../config"
import { request } from "../http"
import { table, json as jsonOut, success } from "../output"

export const platformCommand = new Command("supervisor").description("Supervisor identity management")

platformCommand
  .command("list")
  .description("List all identities")
  .option("--limit <n>", "Max identities", "50")
  .option("--json", "Output as JSON")
  .action(async (opts, cmd) => {
    const config = resolveConfig(cmd.optsWithGlobals())
    const params = new URLSearchParams()
    if (opts.limit) params.set("limit", opts.limit)
    const qs = params.toString()
    const data = await request<any>(config.baseUrl, config.apiKey, "GET", `/v0/platform/identities${qs ? `?${qs}` : ""}`)
    if (opts.json) return jsonOut(data)
    if (!data.identities?.length) return console.log("No identities found.")
    table(
      ["ID", "Name", "Email", "Scopes", "Usage", "Created"],
      data.identities.map((i: any) => [
        i.identityId, i.name, i.email || "—",
        (i.scopes || []).join(", "), String(i.usageCount),
        new Date(i.createdAt).toLocaleDateString(),
      ]),
    )
  })

platformCommand
  .command("get <identityId>")
  .description("Get identity details")
  .option("--json", "Output as JSON")
  .action(async (identityId, opts, cmd) => {
    const config = resolveConfig(cmd.optsWithGlobals())
    const data = await request<any>(config.baseUrl, config.apiKey, "GET", `/v0/platform/identities/${identityId}`)
    if (opts.json) return jsonOut(data)
    table(["Field", "Value"], [
      ["Identity ID", data.identityId], ["Name", data.name],
      ["Email", data.email || "—"], ["Type", data.type],
      ["Scopes", (data.scopes || []).join(", ")],
      ["API Key Prefix", data.apiKeyPrefix],
      ["Usage", String(data.usageCount)],
      ["Created", data.createdAt],
    ])
  })

platformCommand
  .command("create")
  .description("Create a new identity")
  .requiredOption("--name <name>", "Display name")
  .requiredOption("--email <emailName>", "Email prefix (e.g. salesagent)")
  .requiredOption("--scopes <scopes>", "Comma-separated scopes (e.g. mail:read,mail:send)")
  .option("--json", "Output as JSON")
  .action(async (opts, cmd) => {
    const config = resolveConfig(cmd.optsWithGlobals())
    const data = await request<any>(config.baseUrl, config.apiKey, "POST", "/v0/platform/identities", {
      name: opts.name, emailName: opts.email, scopes: opts.scopes.split(",").map((s: string) => s.trim()),
    })
    if (opts.json) return jsonOut(data)
    success(`Created identity "${data.name}"`)
    console.log(`  Identity ID: ${data.identityId}`)
    console.log(`  Email: ${data.emailAddress}`)
    console.log(`  API Key: ${data.rawKey}`)
    console.log(`\n  Copy this key now — you won't see it again.`)
  })

platformCommand
  .command("delete <identityId>")
  .description("Delete an identity")
  .action(async (identityId, _opts, cmd) => {
    const config = resolveConfig(cmd.optsWithGlobals())
    await request(config.baseUrl, config.apiKey, "DELETE", `/v0/platform/identities/${identityId}`)
    success(`Deleted identity ${identityId}`)
  })

platformCommand
  .command("rotate-key <identityId>")
  .description("Rotate an identity's API key")
  .option("--json", "Output as JSON")
  .action(async (identityId, opts, cmd) => {
    const config = resolveConfig(cmd.optsWithGlobals())
    const data = await request<any>(config.baseUrl, config.apiKey, "POST", `/v0/platform/identities/${identityId}/rotate-key`)
    if (opts.json) return jsonOut(data)
    success(`Rotated key for ${identityId}`)
    console.log(`  New API Key: ${data.rawKey}`)
    console.log(`\n  Copy this key now — you won't see it again.`)
  })

platformCommand
  .command("update-scopes <identityId>")
  .description("Update identity scopes")
  .option("--add <scopes>", "Comma-separated scopes to add")
  .option("--remove <scopes>", "Comma-separated scopes to remove")
  .option("--json", "Output as JSON")
  .action(async (identityId, opts, cmd) => {
    const config = resolveConfig(cmd.optsWithGlobals())
    const body: Record<string, string[]> = {}
    if (opts.add) body.addScopes = opts.add.split(",").map((s: string) => s.trim())
    if (opts.remove) body.removeScopes = opts.remove.split(",").map((s: string) => s.trim())
    const data = await request<any>(config.baseUrl, config.apiKey, "PATCH", `/v0/platform/identities/${identityId}`, body)
    if (opts.json) return jsonOut(data)
    success(`Updated scopes for ${identityId}`)
    console.log(`  Scopes: ${data.scopes.join(", ")}`)
  })
