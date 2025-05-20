// src/app/(routes)/aboutus/page.js

import { getStaticHtml } from "@/lib/staticHtml";
import AboutUsClientContent from "@/components/AboutusPage/AboutUsClientContent"; // We will create this

// Get static HTML content
const staticHtml = getStaticHtml("aboutus");

// Define metadata (moved from Client Component's <Head>)
export const metadata = {
  title: "About Connecting Dots ERP | Our Mission & Vision", // From your previous example
  description:
    "Learn about Connecting Dots ERP, our mission, vision, values, and the team dedicated to empowering students and professionals with industry-leading SAP, IT, and HR training.", // From your previous example
  alternates: {
    canonical: "/aboutus", // Adjust if your URL is different
  },
  // Add matching Open Graph / Twitter tags here if desired
};

export default async function AboutUsPage() {
  return (
    <>
      {/* Static HTML content for SEO (will be visible in page source) */}
      <div id="seo-content" dangerouslySetInnerHTML={{ __html: staticHtml }} />

      {/* Dynamic React Content (rendered on client) */}
      {/* We hide the static part via CSS/JS in the actual static file OR rely on hydration replacement */}
      <AboutUsClientContent />
    </>
  );
}
