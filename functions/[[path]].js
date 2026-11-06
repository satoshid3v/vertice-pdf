export async function onRequest(context) {
  const url = new URL(context.request.url);

  // Intercept requests for .wasm and serve the pre-compressed .wasm.gz with Content-Encoding: gzip
  if (url.pathname.endsWith('.wasm')) {
    const gzUrl = new URL(url.pathname + '.gz', url.origin);
    const response = await context.env.ASSETS.fetch(gzUrl);
    if (response.ok) {
      return new Response(response.body, {
        status: 200,
        headers: {
          'Content-Type': 'application/wasm',
          'Content-Encoding': 'gzip',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=31536000, immutable'
        }
      });
    }
  }

  return context.env.ASSETS.fetch(context.request);
}
