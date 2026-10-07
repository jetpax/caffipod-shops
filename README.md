# caffipod-shops

The list of places to buy beans that the [CaffiPod](https://github.com/jetpax)
app offers when a bag runs low. The app downloads `BeanShops.json` from
GitHub Pages at launch and keeps the last good copy, so shops can change
without an app update:

https://jetpax.github.io/caffipod-shops/BeanShops.json

## Format

```json
{
  "version": 1,
  "regions": {
    "GB": [
      {
        "name": "Roaster name",
        "blurb": "One line under the name (optional)",
        "url": "https://shop.example/beans?ref=caffipod",
        "referral": true
      }
    ],
    "default": []
  }
}
```

- `regions` is keyed by ISO country code (`GB`, `US`, `DE`, …) from the
  phone's region; `default` is used for every other country, and when a
  country's list is empty.
- `referral: true` marks a link that earns a commission. The app then shows
  "CaffiPod may earn a commission on purchases through these links."
- A file that doesn't parse is ignored and the app keeps its previous list,
  but check the JSON before pushing (`python3 -m json.tool BeanShops.json`).

## Shop links and tap counts

Shop URLs in `BeanShops.json` are the shops' own pages, tagged with
`utm_source=caffipod` so roasters see CaffiPod traffic in their analytics.
When a shop is tapped, the app opens that URL directly and, in the
background, sends `https://caffipod-go.jetpax.workers.dev/tap/<slug>?src=card`
to the `caffipod-go` Cloudflare Worker (`go/`), which records the tap in the
D1 database `caffipod-taps` (time, shop, country, `src`; no IP address or
device ID). The user never waits for it, and a failed tap never blocks the
shop.

- Add a shop: add it to `BeanShops.json` with a short `slug` (lowercase
  letters, digits, hyphens); the slug names it in the tap log.
- See taps: `go/taps.sh` (per shop, last 30 days) or `go/taps.sh all`.
- Change the worker itself: `cd go && npx wrangler deploy`.
- `redirects.json` and the worker's `/<slug>` redirect only serve links in
  app builds from before background logging.
