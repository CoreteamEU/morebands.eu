# morebands.eu

Static More Bands landing page published through GitHub Pages from the `main` branch root.

## Hosting

- Repository: `CoreteamEU/morebands.eu`
- Custom domain: `morebands.eu`
- GitHub Pages source: `main` / `/ (root)`
- `CNAME` is committed at the repository root and must remain there.

## DNS at Zone

The apex has four `A` records:

- `185.199.108.153`
- `185.199.109.153`
- `185.199.110.153`
- `185.199.111.153`

`www` is a `CNAME` to `coreteameu.github.io.`. Do not add a wildcard DNS record.

GitHub Pages manages the HTTPS certificate. DNS changes may need up to 24 hours to propagate
globally before **Enforce HTTPS** becomes available.
