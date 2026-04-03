import { Command } from "commander"
import { resolveConfig } from "../config"
import { request } from "../http"
import { json as jsonOut } from "../output"

export const didCommand = new Command("did").description("DID resolution")

didCommand
  .command("resolve <identityId>")
  .description("Resolve an identity's DID document")
  .action(async (identityId, _opts, cmd) => {
    const config = resolveConfig(cmd.optsWithGlobals())
    const data = await request<any>(config.baseUrl, config.apiKey, "GET", `/identities/${identityId}/did.json`)
    jsonOut(data)
  })

didCommand
  .command("domain")
  .description("Resolve domain DID document")
  .action(async (_opts, cmd) => {
    const config = resolveConfig(cmd.optsWithGlobals())
    const data = await request<any>(config.baseUrl, config.apiKey, "GET", "/.well-known/did.json")
    jsonOut(data)
  })
