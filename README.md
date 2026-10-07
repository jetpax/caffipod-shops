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

Shop URLs in `BeanShops.json` point at the `caffipod-go` Cloudflare Worker
(`go/`), e.g. `https://caffipod-go.jetpax.workers.dev/sightglass?src=card`.
The worker records the tap in the D1 database `caffipod-taps` (time, shop,
country, `src`; no IP address or device ID) and redirects to the shop's link
in `redirects.json`, which carries the UTM tags and, later, referral tags.

- Change where a shop goes: edit `redirects.json` and push (picked up within
  5 minutes, no redeploy).
- Add a shop: add it to `redirects.json`, then to `BeanShops.json` with its
  worker URL.
- See taps: `go/taps.sh` (per shop, last 30 days) or `go/taps.sh all`.
- Change the worker itself: `cd go && npx wrangler deploy`.
