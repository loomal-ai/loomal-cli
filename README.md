# @loomal/cli — deprecated

> [!WARNING]
> **Loomal is now [Mailgent](https://mailgent.dev).** This package is deprecated — please migrate to **[`@mailgent-dev/cli`](https://www.npmjs.com/package/@mailgent-dev/cli)**.

`@loomal/cli` now ships as a compatibility shim: the `loomal` command still works but targets `https://api.mailgent.dev`. No new features will be added here.

## Migrate

```bash
npm uninstall -g @loomal/cli && npm install -g @mailgent-dev/cli
export MAILGENT_API_KEY=your_api_key
mailgent whoami
```

- Docs: <https://docs.mailgent.dev>
- Migration guide: <https://docs.mailgent.dev/migrate>

## License
MIT
