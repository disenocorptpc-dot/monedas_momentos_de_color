export async function onRequestGet() {
  return new Response(JSON.stringify({ ok: true, timestamp: Date.now(), platform: "Cloudflare Pages Native Function" }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
  });
}
