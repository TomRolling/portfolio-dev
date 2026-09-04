const siteUrl = "https://tomrolling.vercel.app";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
