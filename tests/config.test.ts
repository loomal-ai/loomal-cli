import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

describe("resolveConfig", () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.spyOn(process, "exit").mockImplementation(() => { throw new Error("process.exit") })
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    vi.restoreAllMocks()
  })

  it("uses --api-key flag and defaults to mailgent base URL", async () => {
    const { resolveConfig } = await import("../src/config")
    const config = resolveConfig({ apiKey: "loid-test123" })
    expect(config.apiKey).toBe("loid-test123")
    expect(config.baseUrl).toBe("https://api.mailgent.dev")
  })

  it("uses MAILGENT_API_KEY env var", async () => {
    process.env.MAILGENT_API_KEY = "loid-mailgent"
    const { resolveConfig } = await import("../src/config")
    const config = resolveConfig({})
    expect(config.apiKey).toBe("loid-mailgent")
  })

  it("falls back to legacy LOOMAL_API_KEY env var", async () => {
    delete process.env.MAILGENT_API_KEY
    process.env.LOOMAL_API_KEY = "loid-fromenv"
    const { resolveConfig } = await import("../src/config")
    const config = resolveConfig({})
    expect(config.apiKey).toBe("loid-fromenv")
  })

  it("prefers MAILGENT_API_KEY over legacy LOOMAL_API_KEY", async () => {
    process.env.LOOMAL_API_KEY = "loid-legacy"
    process.env.MAILGENT_API_KEY = "loid-new"
    const { resolveConfig } = await import("../src/config")
    const config = resolveConfig({})
    expect(config.apiKey).toBe("loid-new")
  })

  it("uses custom base URL from legacy LOOMAL_API_URL env", async () => {
    process.env.LOOMAL_API_KEY = "loid-test"
    process.env.LOOMAL_API_URL = "http://localhost:3001"
    const { resolveConfig } = await import("../src/config")
    const config = resolveConfig({})
    expect(config.baseUrl).toBe("http://localhost:3001")
  })

  it("uses custom base URL from MAILGENT_API_URL env", async () => {
    process.env.MAILGENT_API_KEY = "loid-test"
    process.env.MAILGENT_API_URL = "http://localhost:4002"
    const { resolveConfig } = await import("../src/config")
    const config = resolveConfig({})
    expect(config.baseUrl).toBe("http://localhost:4002")
  })

  it("exits if no API key provided", async () => {
    delete process.env.LOOMAL_API_KEY
    delete process.env.MAILGENT_API_KEY
    const { resolveConfig } = await import("../src/config")
    expect(() => resolveConfig({})).toThrow("process.exit")
  })
})
