// CaffiPod shop links: /<shop> records the tap and redirects to the shop.
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

    const targets = await loadTargets();
    const target = targets[shop];
    if (!target) {
      return new Response("Unknown shop\n", { status: 404, headers: { "content-type": "text/plain" } });
    }

    ctx.waitUntil(
      env.DB.prepare("INSERT INTO taps (at, shop, country, source) VALUES (?, ?, ?, ?)")
        .bind(new Date().toISOString(), shop, request.cf?.country ?? null, url.searchParams.get("src"))
        .run()
        .catch((err) => console.error("tap not recorded", err))
    );
    return Response.redirect(target, 302);
  },
};

async function loadTargets() {
  try {
    const res = await fetch(TARGETS, { cf: { cacheTtl: 300, cacheEverything: true } });
    return res.ok ? await res.json() : {};
  } catch {
    return {};
  }
}
