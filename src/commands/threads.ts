import { Command } from "commander"
import { resolveConfig } from "../config"
import { request } from "../http"
import { table, json as jsonOut, success } from "../output"

export const threadsCommand = new Command("threads").description("Thread operations")

threadsCommand
  .command("list")
  .description("List threads")
  .option("--limit <n>", "Max threads", "50")
  .option("--page-token <token>", "Pagination cursor")
  .option("--json", "Output as JSON")
  .action(async (opts, cmd) => {
    const config = resolveConfig(cmd.optsWithGlobals())
    const params = new URLSearchParams()
    if (opts.limit) params.set("limit", opts.limit)
    if (opts.pageToken) params.set("pageToken", opts.pageToken)
    const qs = params.toString()
    const data = await request<any>(config.baseUrl, config.apiKey, "GET", `/v0/threads${qs ? `?${qs}` : ""}`)
    if (opts.json) return jsonOut(data)
    if (!data.threads?.length) return console.log("No threads found.")
    table(
      ["ID", "Subject", "Messages", "Updated"],
      data.threads.map((t: any) => [
        t.threadId.slice(0, 16) + "...", (t.subject || "—").slice(0, 40),
        String(t.messageCount || "—"), new Date(t.updatedAt).toLocaleString(),
      ]),
    )
  })

threadsCommand
  .command("get <threadId>")
  .description("Get a thread with messages")
  .option("--json", "Output as JSON")
  .action(async (threadId, opts, cmd) => {
    const config = resolveConfig(cmd.optsWithGlobals())
    const data = await request<any>(config.baseUrl, config.apiKey, "GET", `/v0/threads/${threadId}`)
    if (opts.json) return jsonOut(data)
    console.log(`Thread: ${data.subject || "—"} (${data.messages?.length || 0} messages)\n`)
    for (const msg of data.messages || []) {
      console.log(`  [${new Date(msg.createdAt).toLocaleString()}] ${(msg.from || []).join(", ")}`)
      if (msg.subject) console.log(`  Subject: ${msg.subject}`)
      if (msg.text) console.log(`  ${msg.text.slice(0, 200)}${msg.text.length > 200 ? "..." : ""}`)
      console.log()
    }
  })

threadsCommand
  .command("delete <threadId>")
  .description("Delete a thread")
  .action(async (threadId, _opts, cmd) => {
    const config = resolveConfig(cmd.optsWithGlobals())
    await request(config.baseUrl, config.apiKey, "DELETE", `/v0/threads/${threadId}`)
    success(`Deleted thread ${threadId}`)
  })
