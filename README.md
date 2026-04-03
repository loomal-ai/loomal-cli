# mailgent-cli

The official CLI for the [Mailgent API](https://mailgent.dev) — identity infrastructure for AI agents.

## Install

```bash
npm install -g mailgent-cli
```

Requires Node.js 18 or later.

## Quick Start

```bash
# Set your API key
export MAILGENT_API_KEY=your_api_key

# Verify your identity
mailgent whoami
```

## Authentication

Pass your API key in one of two ways:

```bash
# Environment variable (recommended)
export MAILGENT_API_KEY=your_api_key

# Or per-command flag
mailgent whoami --api-key your_api_key
```

## Commands

### Identity

```bash
mailgent whoami                          # Show identity info
```

### Mail

```bash
mailgent mail send --to a@b.com --subject "Hi" --text "Hello"
mailgent mail list [--limit 20] [--labels inbox]
mailgent mail get <messageId>
mailgent mail reply <messageId> --text "Reply"
mailgent mail labels <messageId> --add important
mailgent mail delete <messageId>
```

### Threads

```bash
mailgent threads list [--limit 20]
mailgent threads get <threadId>
mailgent threads delete <threadId>
```

### Vault

```bash
mailgent vault list
mailgent vault get <name>
mailgent vault store <name> --type API_KEY --data '{"key":"sk_..."}'
mailgent vault delete <name>
mailgent vault totp <name>               # Get TOTP code
```

### Logs

```bash
mailgent logs list [--category mail] [--status error]
mailgent logs stats
```

### DID

```bash
mailgent did resolve <identityId>        # Resolve DID document
mailgent did domain                      # Resolve domain DID
```

## Global Options

| Flag | Description |
| --- | --- |
| `--api-key <key>` | API key (or set `MAILGENT_API_KEY` env var) |
| `--base-url <url>` | API base URL (or set `MAILGENT_API_URL` env var) |
| `--json` | Output as JSON |
| `--help` | Show help |
| `--version` | Show version |

## JSON Output

Most commands support the `--json` flag for machine-readable output:

```bash
mailgent whoami --json
mailgent mail list --json
mailgent vault list --json
```

## Links

- [Documentation](https://docs.mailgent.dev)
- [Website](https://mailgent.dev)
- [Node.js SDK](https://github.com/mailgent-dev/nodejs-sdk)

## License

MIT
