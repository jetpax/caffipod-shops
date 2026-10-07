// CaffiPod shop taps.
//   /tap/<shop>  records the tap and answers 204 at once; the app sends it in
//                the background while it opens the shop itself.
//   /<shop>      records the tap and redirects to the shop (links in older
//                app builds).
// Destinations come from redirects.json in this repo (served by GitHub
// Pages), so a shop's link changes without redeploying the worker.
// Each tap stores only the time, the shop and the country: no IP address,
// no device or user identifier.

const TARGETS = "https://jetpax.github.io/caffipod-shops/redirects.json";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const shop = url.pathname.replace(/^\/+|\/+$/g, "").toLowerCase();
    if (!shop) {
      return new Response("CaffiPod shop links\n", { headers: { "content-type": "text/plain" } });
    }

    if (shop.startsWith("tap/")) {
      const name = shop.slice(4);
      if (!/^[a-z0-9-]{1,40}$/.test(name)) {
        return new Response(null, { status: 400 });
      }
      ctx.waitUntil(recordTap(env, name, request, url));
      return new Response(null, { status: 204 });
    }

    const targets = await loadTargets();
    const target = targets[shop];
    if (!target) {
      return new Response("Unknown shop\n", { status: 404, headers: { "content-type": "text/plain" } });
    }

    ctx.waitUntil(recordTap(env, shop, request, url));
    return Response.redirect(target, 302);
  },
};

function recordTap(env, shop, request, url) {
  return env.DB.prepare("INSERT INTO taps (at, shop, country, source) VALUES (?, ?, ?, ?)")
    .bind(new Date().toISOString(), shop, request.cf?.country ?? null, url.searchParams.get("src"))
    .run()
    .catch((err) => console.error("tap not recorded", err));
}

async function loadTargets() {
  try {
    const res = await fetch(TARGETS, { cf: { cacheTtl: 300, cacheEverything: true } });
    return res.ok ? await res.json() : {};
  } catch {
    return {};
  }
}
