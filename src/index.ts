import { Command } from "commander"
import { whoamiCommand } from "./commands/whoami"
import { mailCommand } from "./commands/mail"
import { threadsCommand } from "./commands/threads"
import { vaultCommand } from "./commands/vault"
import { logsCommand } from "./commands/logs"
import { didCommand } from "./commands/did"
import { ApiError } from "./http"

const program = new Command()
  .name("mailgent")
  .description("CLI for the Mailgent API — identity infrastructure for AI agents")
  .version("0.1.0")
  .option("--api-key <key>", "API key (or set MAILGENT_API_KEY)")
  .option("--base-url <url>", "API base URL (or set MAILGENT_API_URL)")

program.addCommand(whoamiCommand)
program.addCommand(mailCommand)
program.addCommand(threadsCommand)
program.addCommand(vaultCommand)
program.addCommand(logsCommand)
program.addCommand(didCommand)

program.parseAsync(process.argv).catch((err) => {
  if (err instanceof ApiError) {
    console.error(`Error [${err.status}]: ${err.message}`)
  } else {
    console.error(`Error: ${err.message}`)
  }
  process.exit(1)
})
