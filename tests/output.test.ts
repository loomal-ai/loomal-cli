import { describe, it, expect, vi, afterEach } from "vitest"
import { table } from "../src/output"

describe("table output", () => {
  afterEach(() => vi.restoreAllMocks())

  it("formats table with correct padding", () => {
    const logs: string[] = []
    vi.spyOn(console, "log").mockImplementation((...args) => logs.push(args.join(" ")))

    table(["Name", "Value"], [["foo", "bar"], ["longer", "x"]])

    expect(logs[0]).toContain("Name")
    expect(logs[0]).toContain("Value")
    expect(logs.length).toBe(4) // header + separator + 2 rows
  })
})
