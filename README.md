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

## Assets copied from the app

`img/paper.jpg`, `img/crow00.png`, `img/crow01.png`, `img/pig.png`, `img/piano-off.png`, and
`img/piano-on.png` are copies of `shared/assets/genres/ui.atlas/` in the `moooreBands` monorepo
(`startscenebg.jpg`, `crow00/crow01`, `pig`, `piano_hill_off_big`, `piano_hill_on_big`). The page
background and the ambient crow/critter animations in `morebands.js` reproduce the app's own
`PaperBackgroundView`. Re-copy them if that artwork changes.
