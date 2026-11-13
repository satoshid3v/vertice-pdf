export async function onRequest(context) {
  const url = new URL(context.request.url);
  const isPreview = url.hostname.endsWith('.pages.dev');

  // Intercept requests for .wasm and serve the pre-compressed .wasm.gz with Content-Encoding: gzip
  if (url.pathname.endsWith('.wasm')) {
    const gzUrl = new URL(url.pathname + '.gz', url.origin);
    const response = await context.env.ASSETS.fetch(gzUrl);
    if (response.ok) {
      const headers = new Headers(response.headers);
      headers.set('Content-Type', 'application/wasm');
      headers.set('Content-Encoding', 'gzip');
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      if (isPreview) {
        headers.set('X-Robots-Tag', 'noindex, nofollow');
      }
      return new Response(response.body, {
        status: 200,
        headers
      });
    }
  }

  const response = await context.env.ASSETS.fetch(context.request);
  if (isPreview) {
    const headers = new Headers(response.headers);
    headers.set('X-Robots-Tag', 'noindex, nofollow');
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }

  return response;
}
