export function table(headers: string[], rows: string[][]): void {
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => (r[i] || "").length))
  )

  const sep = widths.map((w) => "─".repeat(w + 2)).join("┼")
  const formatRow = (row: string[]) =>
    row.map((cell, i) => ` ${(cell || "").padEnd(widths[i])} `).join("│")

  console.log(formatRow(headers))
  console.log(sep)
  rows.forEach((row) => console.log(formatRow(row)))
}

export function json(data: unknown): void {
  console.log(JSON.stringify(data, null, 2))
}

export function success(msg: string): void {
  console.log(`✓ ${msg}`)
}

export function error(msg: string): void {
  console.error(`✗ ${msg}`)
}
