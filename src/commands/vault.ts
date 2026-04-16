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
  .requiredOption(
    "--type <type>",
    "Credential type: LOGIN | API_KEY | OAUTH | TOTP | SSH_KEY | DATABASE | SMTP | AWS | CERTIFICATE | CARD | SHIPPING_ADDRESS | CUSTOM",
  )
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
  .command("store-api-key <name>")
  .description("Store an API_KEY credential (single secret or client id + secret)")
  .option("--secret <value>", "API key / secret (e.g. sk_live_...)")
  .option("--client-id <value>", "OAuth-style client ID (pair with --secret)")
  .option("--expires-at <date>", "Expiration date (ISO 8601)")
  .option("--json", "Output as JSON")
  .action(async (name, opts, cmd) => {
    const config = resolveConfig(cmd.optsWithGlobals())
    if (!opts.secret) {
      console.error("Error: --secret is required"); process.exit(1)
    }
    const hasClient = Boolean(opts.clientId)
    const data = hasClient
      ? { clientId: opts.clientId, secret: opts.secret }
      : { key: opts.secret }
    const metadata: Record<string, unknown> = {
      prefix: opts.secret.slice(0, 8) + "...",
    }
    if (hasClient) metadata.clientId = opts.clientId
    const result = await request<any>(config.baseUrl, config.apiKey, "PUT", `/v0/vault/${encodeURIComponent(name)}`, {
      type: "API_KEY", data, metadata, expiresAt: opts.expiresAt,
    })
    if (opts.json) return jsonOut(result)
    success(`Stored credential "${name}" (API_KEY${hasClient ? " with client ID" : ""})`)
  })

vaultCommand
  .command("store-card <name>")
  .description("Store a CARD credential (encrypted at rest — not a payment processor)")
  .requiredOption("--cardholder <name>", "Cardholder name")
  .requiredOption("--number <number>", "Card number")
  .requiredOption("--exp-month <MM>", "Expiration month (2 digits)")
  .requiredOption("--exp-year <YYYY>", "Expiration year (4 digits)")
  .requiredOption("--cvc <cvc>", "CVC / CVV")
  .option("--zip <zip>", "Billing ZIP / postal code")
  .option("--brand <brand>", "Card brand (Visa, Mastercard, etc.)")
  .option("--expires-at <date>", "Expiration date (ISO 8601)")
  .option("--json", "Output as JSON")
  .action(async (name, opts, cmd) => {
    const config = resolveConfig(cmd.optsWithGlobals())
    const normalizedNumber = (opts.number as string).replace(/\s+/g, "")
    const data: Record<string, unknown> = {
      cardholder: opts.cardholder,
      number: opts.number,
      expMonth: opts.expMonth,
      expYear: opts.expYear,
      cvc: opts.cvc,
    }
    if (opts.zip) data.zip = opts.zip
    const metadata: Record<string, unknown> = { last4: normalizedNumber.slice(-4) }
    if (opts.brand) metadata.brand = opts.brand
    const result = await request<any>(config.baseUrl, config.apiKey, "PUT", `/v0/vault/${encodeURIComponent(name)}`, {
      type: "CARD", data, metadata, expiresAt: opts.expiresAt,
    })
    if (opts.json) return jsonOut(result)
    success(`Stored credential "${name}" (CARD •••• ${metadata.last4})`)
  })

vaultCommand
  .command("store-address <name>")
  .description("Store a SHIPPING_ADDRESS credential (encrypted at rest)")
  .requiredOption("--recipient <name>", "Recipient name")
  .requiredOption("--line1 <line1>", "Address line 1")
  .option("--line2 <line2>", "Address line 2")
  .requiredOption("--city <city>", "City")
  .requiredOption("--state <state>", "State / region")
  .requiredOption("--postcode <postcode>", "Postcode / ZIP")
  .requiredOption("--country <country>", "Country code (2 letters)")
  .option("--phone <phone>", "Phone number")
  .option("--json", "Output as JSON")
  .action(async (name, opts, cmd) => {
    const config = resolveConfig(cmd.optsWithGlobals())
    const data: Record<string, unknown> = {
      name: opts.recipient,
      line1: opts.line1,
      city: opts.city,
      state: opts.state,
      postcode: opts.postcode,
      country: opts.country.toUpperCase(),
    }
    if (opts.line2) data.line2 = opts.line2
    if (opts.phone) data.phone = opts.phone
    const result = await request<any>(config.baseUrl, config.apiKey, "PUT", `/v0/vault/${encodeURIComponent(name)}`, {
      type: "SHIPPING_ADDRESS", data,
    })
    if (opts.json) return jsonOut(result)
    success(`Stored credential "${name}" (SHIPPING_ADDRESS)`)
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
