export async function GET() {
  const baseUrl = "https://connectingdotserp.com";

  const cities = [
    "pune",
    "mumbai",
    "delhi",
    "kolkata",
    "chennai",
    "bangalore",
    "hyderabad",
    "ahmedabad",
    "jaipur",
    "lucknow",
    "kanpur",
    "nagpur",
    "patna",
    "indore",
    "bhopal",
    "visakhapatnam",
    "vadodara",
    "ludhiana",
    "agra",
    "nashik",
    "rajkot",
    "varanasi",
    "kerala",
    "surat",
    "dehradun",
    "madurai",
    "mysore",
    "pondicherry",
    "ranchi",
    "coimbatore",
    "chandigarh",
    "bhubaneswar",
    "tirupati",
    "vizag",
    "trivandrum",
    "jalandhar",
    "mohali",
    "raipur",
    "cochin",
    "mangalore",
    "katraj",
    "pimpri-chinchwad",
    "shivaji-nagar",
    "koregaon-park",
    "viman-nagar",
    "pimple-saudagar",
    "baner",
    "hinjewadi",
    "wakad",
    "kothrud",
    "hadapsar",
    "aundh",
    "navi-mumbai",
    "thane",
    "kalyan",
    "bandra",
    "andheri",
    "powai",
    "worli",
    "chembur",
    "malad",
    "vile-parle",
    "matunga",
  ];

  const courses = [
    "sap-course-in",
    "it-course-in",
    "hr-training-course-in",
    "data-visualisation-course-in",
    "data-science-course-in",
    "data-analytics-course-in",
    "business-analytics-course-in",
    "chatgpt-course-in",
    "full-stack-developer-course-in",
    "java-course-in",
    "mern-stack-course-in",
    "python-course-in",
    "salesforce-training-in",
    "ui-ux-course-in",
    "sap-ewm-course-in",
    "sap-abap-course-in",
    "sap-ariba-course-in",
    "sap-basis-course-in",
    "sap-bwbi-course-in",
    "sap-fico-course-in",
    "sap-s4-hana-course-in",
    "sap-hr-hcm-course-in",
    "sap-mm-course-in",
    "sap-pm-course-in",
    "sap-pp-course-in",
    "sap-ps-course-in",
    "sap-qm-course-in",
    "sap-scm-course-in",
    "sap-sd-course-in",
    "sap-successfactors-course-in",
    "power-bi-course-in",
    "sql-course-in",
    "tableau-training-in",
    "digital-marketing-course-in",
    "hr-analytics-course-in",
    "hr-training-course-in",
    "core-hr-course-in",
    "hr-management-course-in",
    "hr-payroll-course-in",
    "hr-generalist-course-in",
  ];

  // Generate course and city URLs
  const courseUrls = courses.flatMap((course) =>
    cities.map(
      (city) => `
      <url>
        <loc>${baseUrl}/${course}-${city}</loc>
        <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>
    `
    )
  );

  // Static pages (Home & About Us)
  const staticUrls = [
    `
    <url>
      <loc>${baseUrl}/</loc>
      <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>1.0</priority>
    </url>
    `,
    `
    <url>
      <loc>${baseUrl}/aboutus</loc>
      <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.9</priority>
    </url>
    `,
    `
    <url>
      <loc>${baseUrl}/contactus</loc>
      <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.9</priority>
    </url>
    `,
    `
    <url>
      <loc>${baseUrl}/all-course-links</loc>
      <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
      <changefreq>daily</changefreq>
      <priority>0.9</priority>
    </url>
    `,
    `
    <url>
      <loc>${baseUrl}/sitemap</loc>
      <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
      <changefreq>daily</changefreq>
      <priority>0.9</priority>
    </url>
    `,
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${staticUrls.join("\n")}
    ${courseUrls.join("\n")}
  </urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
