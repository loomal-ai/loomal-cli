import { Command } from "commander"
import { resolveConfig } from "../config"
import { request } from "../http"
import { table, json as jsonOut, success } from "../output"

export const mailCommand = new Command("mail").description("Email operations")

mailCommand
  .command("send")
  .description("Send an email")
  .requiredOption("--to <emails...>", "Recipient email(s)")
  .requiredOption("--subject <subject>", "Email subject")
  .requiredOption("--text <text>", "Email body text")
  .option("--html <html>", "HTML body")
  .option("--cc <emails...>", "CC recipients")
  .option("--bcc <emails...>", "BCC recipients")
  .option("--json", "Output as JSON")
  .action(async (opts, cmd) => {
    const config = resolveConfig(cmd.optsWithGlobals())
    const data = await request<any>(config.baseUrl, config.apiKey, "POST", "/v0/messages/send", {
      to: opts.to, subject: opts.subject, text: opts.text,
      html: opts.html, cc: opts.cc, bcc: opts.bcc,
    })
    if (opts.json) return jsonOut(data)
    success(`Sent message ${data.messageId} to ${opts.to.join(", ")}`)
  })

mailCommand
  .command("list")
  .description("List messages")
  .option("--limit <n>", "Max messages", "20")
  .option("--labels <labels>", "Filter by labels")
  .option("--json", "Output as JSON")
  .action(async (opts, cmd) => {
    const config = resolveConfig(cmd.optsWithGlobals())
    const params = new URLSearchParams()
    if (opts.limit) params.set("limit", opts.limit)
    if (opts.labels) params.set("labels", opts.labels)
    const qs = params.toString()
    const data = await request<any>(config.baseUrl, config.apiKey, "GET", `/v0/messages${qs ? `?${qs}` : ""}`)
    if (opts.json) return jsonOut(data)
    if (!data.messages?.length) return console.log("No messages found.")
    table(
      ["ID", "From", "Subject", "Date"],
      data.messages.map((m: any) => [
        m.messageId.slice(0, 16) + "...",
        (m.from?.[0] || "—").slice(0, 30),
        (m.subject || "—").slice(0, 40),
        new Date(m.createdAt).toLocaleString(),
      ]),
    )
  })

mailCommand
  .command("get <messageId>")
  .description("Get a message")
  .option("--json", "Output as JSON")
  .action(async (messageId, opts, cmd) => {
    const config = resolveConfig(cmd.optsWithGlobals())
    const data = await request<any>(config.baseUrl, config.apiKey, "GET", `/v0/messages/${messageId}`)
    if (opts.json) return jsonOut(data)
    table(["Field", "Value"], [
      ["Message ID", data.messageId], ["Thread ID", data.threadId],
      ["From", (data.from || []).join(", ")], ["To", (data.to || []).join(", ")],
      ["Subject", data.subject || "—"], ["Labels", (data.labels || []).join(", ")],
      ["Date", data.createdAt],
    ])
    if (data.text) console.log(`\n${data.text}`)
  })

mailCommand
  .command("reply <messageId>")
  .description("Reply to a message")
  .requiredOption("--text <text>", "Reply text")
  .option("--html <html>", "HTML body")
  .option("--json", "Output as JSON")
  .action(async (messageId, opts, cmd) => {
    const config = resolveConfig(cmd.optsWithGlobals())
    const data = await request<any>(config.baseUrl, config.apiKey, "POST", `/v0/messages/${messageId}/reply`, {
      text: opts.text, html: opts.html,
    })
    if (opts.json) return jsonOut(data)
    success(`Replied with message ${data.messageId}`)
  })

mailCommand
  .command("labels <messageId>")
  .description("Update message labels")
  .option("--add <labels...>", "Labels to add")
  .option("--remove <labels...>", "Labels to remove")
  .option("--json", "Output as JSON")
  .action(async (messageId, opts, cmd) => {
    const config = resolveConfig(cmd.optsWithGlobals())
    const data = await request<any>(config.baseUrl, config.apiKey, "PATCH", `/v0/messages/${messageId}`, {
      addLabels: opts.add, removeLabels: opts.remove,
    })
    if (opts.json) return jsonOut(data)
    success(`Updated labels: ${(data.labels || []).join(", ")}`)
  })

mailCommand
  .command("delete <messageId>")
  .description("Delete a message")
  .action(async (messageId, _opts, cmd) => {
    const config = resolveConfig(cmd.optsWithGlobals())
    await request(config.baseUrl, config.apiKey, "DELETE", `/v0/messages/${messageId}`)
    success(`Deleted message ${messageId}`)
  })
