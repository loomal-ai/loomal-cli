import { Command } from "commander"
import { resolveConfig } from "../config"
import { request } from "../http"
import { table, json as jsonOut } from "../output"

export const logsCommand = new Command("logs").description("Activity logs")

logsCommand
  .command("list")
  .description("List activity logs")
  .option("--limit <n>", "Max logs", "50")
  .option("--category <cat>", "Filter: mail, vault, identity, auth, calendar")
  .option("--status <status>", "Filter: success, error, denied")
  .option("--severity <sev>", "Filter: INFO, WARNING, ERROR")
  .option("--action <action>", "Filter by action name")
  .option("--page-token <token>", "Pagination cursor")
  .option("--json", "Output as JSON")
  .action(async (opts, cmd) => {
    const config = resolveConfig(cmd.optsWithGlobals())
    const params = new URLSearchParams()
    if (opts.limit) params.set("limit", opts.limit)
    if (opts.category) params.set("category", opts.category)
    if (opts.status) params.set("status", opts.status)
    if (opts.severity) params.set("severity", opts.severity)
    if (opts.action) params.set("action", opts.action)
    if (opts.pageToken) params.set("pageToken", opts.pageToken)
    const qs = params.toString()
    const data = await request<any>(config.baseUrl, config.apiKey, "GET", `/v0/logs${qs ? `?${qs}` : ""}`)
    if (opts.json) return jsonOut(data)
    if (!data.logs?.length) return console.log("No logs found.")
    table(
      ["Time", "Action", "Category", "Status", "Description"],
      data.logs.map((l: any) => [
        new Date(l.createdAt).toLocaleString(), l.action, l.category,
        l.status, (l.description || "—").slice(0, 40),
      ]),
    )
  })

logsCommand
  .command("stats")
  .description("Log statistics")
  .option("--json", "Output as JSON")
  .action(async (opts, cmd) => {
    const config = resolveConfig(cmd.optsWithGlobals())
    const data = await request<any>(config.baseUrl, config.apiKey, "GET", "/v0/logs/stats")
    if (opts.json) return jsonOut(data)
    table(["Metric", "Value"], [
      ["Total Events", String(data.total)], ["Today", String(data.today)], ["Errors", String(data.errors)],
      ...Object.entries(data.byCategory || {}).map(([k, v]) => [`Category: ${k}`, String(v)]),
    ])
  })
