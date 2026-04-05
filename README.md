# hivekey-cli

The official CLI for the [Hivekey API](https://hivekey.ai) — identity infrastructure for AI agents.

## Install

```bash
npm install -g hivekey-cli
```

Requires Node.js 18 or later.

## Quick Start

```bash
# Set your API key
export HIVEKEY_API_KEY=your_api_key

# Verify your identity
hivekey whoami
```

## Authentication

Pass your API key in one of two ways:

```bash
# Environment variable (recommended)
export HIVEKEY_API_KEY=your_api_key

# Or per-command flag
hivekey whoami --api-key your_api_key
```

## Commands

### Identity

```bash
hivekey whoami                          # Show identity info
```

### Mail

```bash
hivekey mail send --to a@b.com --subject "Hi" --text "Hello"
hivekey mail list [--limit 20] [--labels inbox]
hivekey mail get <messageId>
hivekey mail reply <messageId> --text "Reply"
hivekey mail labels <messageId> --add important
hivekey mail delete <messageId>
```

### Threads

```bash
hivekey threads list [--limit 20]
hivekey threads get <threadId>
hivekey threads delete <threadId>
```

### Vault

```bash
hivekey vault list
hivekey vault get <name>
hivekey vault store <name> --type API_KEY --data '{"key":"sk_..."}'
hivekey vault delete <name>
hivekey vault totp <name>               # Get TOTP code
```

### Logs

```bash
hivekey logs list [--category mail] [--status error]
hivekey logs stats
```

### DID

```bash
hivekey did resolve <identityId>        # Resolve DID document
hivekey did domain                      # Resolve domain DID
```

## Global Options

| Flag | Description |
| --- | --- |
| `--api-key <key>` | API key (or set `HIVEKEY_API_KEY` env var) |
| `--base-url <url>` | API base URL (or set `HIVEKEY_API_URL` env var) |
| `--json` | Output as JSON |
| `--help` | Show help |
| `--version` | Show version |

## JSON Output

Most commands support the `--json` flag for machine-readable output:

```bash
hivekey whoami --json
hivekey mail list --json
hivekey vault list --json
```

## Links

- [Documentation](https://docs.hivekey.ai)
- [Website](https://hivekey.ai)
- [Node.js SDK](https://github.com/hivekey-ai/nodejs-sdk)

## License

MIT
