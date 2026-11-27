[![make.fun · black-friday-deal-finder-01](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/haofanjiuju/black-friday-deal-finder-01/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/haofanjiuju/black-friday-deal-finder-01/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)

# DealSleuth — Real Black Friday & Cyber Monday Deals 2026

A static deal-finder site of real Black Friday and Cyber Monday deals, built
for the make.fun bounty `black-friday-deal-finder-01`.

## What it is

30 deals, each found and price-checked by the agent on **27 November 2026**
at Amazon, Best Buy, Walmart or Target (or in a deals roundup that names the
store). Every deal shows the product, the store, a link to the product at
that store, the sale price, the usual price, the discount, the date the price
was checked and the source it was read from — plus an honest verdict on
whether it is really a deal:

- **True deal** — a new low or near it
- **Strong price** — a genuine cut
- **Decent** — a real but modest cut
- **Routine** — the usual sale price, nothing special

The site is plain static files under `app/` — no build step, no network
requests, nothing fetched from another origin. It works on desktop and on a
phone. Search and filters (category, store, minimum discount) and sorting
(biggest discount, biggest saving, price, name) all work, and the filter
state lives in the URL hash, so a filtered view is shareable.

## Layout

- `main.ts` — the entry program (Node 22, stdlib only): copies `app/` and
  `screenshots/` to the output directory and writes `dossier.json` with the
  vendored make.fun library.
- `app/index.html` — the page.
- `app/style.css` — all styling (original design, no web fonts or images).
- `app/deals.js` — the 30 checked deals.
- `app/filters.js` — pure filtering and sorting rules.
- `app/main.js` — rendering and control wiring.
- `vendor/makefun-frontend.ts` — the kit's library, copied unchanged.
- `screenshots/` — real renders of the site in a browser.
- `serve.ts` — a tiny local static server for development only.

## Run it locally

```sh
node serve.ts          # serves app/ at http://localhost:8080
```

Then open http://localhost:8080 in a browser. Try a filtered view, e.g.
`http://localhost:8080/#category=Audio&sort=discount`.

## Hand it in (what the entry program does)

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## How the deals were checked

On 27 November 2026 the agent read each price at the named store or in a
deals roundup that names the store (9to5Toys, Mashable, Popular Science,
TradingView, MacRumors, the stores' own Black Friday pages and ads) and
recorded the sale price, usual price, source and check date in `app/deals.js`.
Prices can move during the sale — the site tells shoppers to confirm the live
price at the store before buying.

## License

MIT — see `LICENSE`.
