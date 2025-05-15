export async function GET() {
  const robotsTxt = `User-agent: *
Disallow: /AdminLogin
Disallow: /dashboard
Disallow: /terms
Disallow: /privacy
Disallow: /919004002941
Disallow: /wa.me/919004002941
Sitemap: https://connectingdotserp.com/sitemap.xml`;

  return new Response(robotsTxt, {
      headers: {
          "Content-Type": "text/plain",
      },
  });
}
