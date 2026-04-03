import { Command } from "commander"
import { resolveConfig } from "../config"
import { request } from "../http"
import { table, json as jsonOut, success } from "../output"

export const calendarCommand = new Command("calendar").description("Calendar operations")

calendarCommand
  .command("list")
  .description("List calendar events")
  .option("--limit <n>", "Max events", "50")
  .option("--from <date>", "Filter: events from (ISO date)")
  .option("--to <date>", "Filter: events until (ISO date)")
  .option("--json", "Output as JSON")
  .action(async (opts, cmd) => {
    const config = resolveConfig(cmd.optsWithGlobals())
    const params = new URLSearchParams()
    if (opts.limit) params.set("limit", opts.limit)
    if (opts.from) params.set("from", opts.from)
    if (opts.to) params.set("to", opts.to)
    const qs = params.toString()
    const data = await request<any>(config.baseUrl, config.apiKey, "GET", `/v0/calendar${qs ? `?${qs}` : ""}`)
    if (opts.json) return jsonOut(data)
    if (!data.events?.length) return console.log("No events found.")
    table(
      ["Date", "Time", "Title", "Location"],
      data.events.map((e: any) => {
        const start = new Date(e.startAt)
        return [
          start.toLocaleDateString(),
          e.isAllDay ? "All day" : start.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
          e.title,
          e.location || "—",
        ]
      }),
    )
  })

calendarCommand
  .command("get <eventId>")
  .description("Get event details")
  .option("--json", "Output as JSON")
  .action(async (eventId, opts, cmd) => {
    const config = resolveConfig(cmd.optsWithGlobals())
    const data = await request<any>(config.baseUrl, config.apiKey, "GET", `/v0/calendar/${eventId}`)
    if (opts.json) return jsonOut(data)
    table(["Field", "Value"], [
      ["Event ID", data.eventId],
      ["Title", data.title],
      ["Start", data.startAt],
      ["End", data.endAt || "—"],
      ["All Day", data.isAllDay ? "Yes" : "No"],
      ["Location", data.location || "—"],
      ["Description", data.description || "—"],
      ["Created", data.createdAt],
    ])
  })

calendarCommand
  .command("create")
  .description("Create a calendar event")
  .requiredOption("--title <title>", "Event title")
  .requiredOption("--start <datetime>", "Start date/time (ISO 8601)")
  .option("--end <datetime>", "End date/time (ISO 8601)")
  .option("--all-day", "All-day event")
  .option("--location <location>", "Event location")
  .option("--description <desc>", "Event description")
  .option("--json", "Output as JSON")
  .action(async (opts, cmd) => {
    const config = resolveConfig(cmd.optsWithGlobals())
    const body: Record<string, unknown> = {
      title: opts.title,
      startAt: new Date(opts.start).toISOString(),
    }
    if (opts.end) body.endAt = new Date(opts.end).toISOString()
    if (opts.allDay) body.isAllDay = true
    if (opts.location) body.location = opts.location
    if (opts.description) body.description = opts.description

    const data = await request<any>(config.baseUrl, config.apiKey, "POST", "/v0/calendar", body)
    if (opts.json) return jsonOut(data)
    success(`Created event "${data.title}" (${data.eventId})`)
  })

calendarCommand
  .command("update <eventId>")
  .description("Update a calendar event")
  .option("--title <title>", "New title")
  .option("--start <datetime>", "New start date/time")
  .option("--end <datetime>", "New end date/time")
  .option("--location <location>", "New location")
  .option("--description <desc>", "New description")
  .option("--json", "Output as JSON")
  .action(async (eventId, opts, cmd) => {
    const config = resolveConfig(cmd.optsWithGlobals())
    const body: Record<string, unknown> = {}
    if (opts.title) body.title = opts.title
    if (opts.start) body.startAt = new Date(opts.start).toISOString()
    if (opts.end) body.endAt = new Date(opts.end).toISOString()
    if (opts.location) body.location = opts.location
    if (opts.description) body.description = opts.description

    const data = await request<any>(config.baseUrl, config.apiKey, "PATCH", `/v0/calendar/${eventId}`, body)
    if (opts.json) return jsonOut(data)
    success(`Updated event "${data.title}"`)
  })

calendarCommand
  .command("delete <eventId>")
  .description("Delete a calendar event")
  .action(async (eventId, _opts, cmd) => {
    const config = resolveConfig(cmd.optsWithGlobals())
    await request(config.baseUrl, config.apiKey, "DELETE", `/v0/calendar/${eventId}`)
    success(`Deleted event ${eventId}`)
  })

calendarCommand
  .command("public <on|off>")
  .description("Set calendar public or private")
  .action(async (state, _opts, cmd) => {
    const config = resolveConfig(cmd.optsWithGlobals())
    const enabled = state === "on" || state === "true"
    const data = await request<any>(config.baseUrl, config.apiKey, "POST", "/v0/calendar/public", { enabled })
    success(`Calendar is now ${data.calendarPublic ? "public" : "private"}`)
  })
