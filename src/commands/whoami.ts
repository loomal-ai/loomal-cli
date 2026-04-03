import { Command } from "commander"
import { resolveConfig } from "../config"
import { request } from "../http"
import { table, json as jsonOut } from "../output"

export const whoamiCommand = new Command("whoami")
  .description("Show identity info")
  .option("--json", "Output as JSON")
  .action(async (opts, cmd) => {
    const config = resolveConfig(cmd.optsWithGlobals())
    const data = await request<any>(config.baseUrl, config.apiKey, "GET", "/v0/whoami")

    if (opts.json) return jsonOut(data)

    table(
      ["Field", "Value"],
      [
        ["Identity ID", data.identityId],
        ["Name", data.name],
        ["Email", data.email || "—"],
        ["Type", data.type],
        ["Scopes", (data.scopes || []).join(", ")],
        ["Usage", String(data.usageCount || 0)],
        ["Created", data.createdAt],
      ],
    )
  })
