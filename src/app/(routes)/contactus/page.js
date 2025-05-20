// src/app/(routes)/aboutus/page.js

import { getStaticHtml } from "@/lib/staticHtml";
import ContactUsClientContent from "@/components/ContactusPage/ContactUsClientContent"; // We will create this

// Get static HTML content
const staticHtml = getStaticHtml("contactus");

// Define metadata (moved from Client Component's <Head>)
export const metadata = {
  title: "Contact Connecting Dots ERP | Locations & Support", // From your previous example
  description:
    "Get in touch with Connecting Dots ERP. Find our office locations in Pune, Mumbai, and Raipur. Call, email, or visit us for SAP, IT, and HR training inquiries and support.", // From your previous example
  alternates: {
    canonical: "/contactus", // Adjust if your URL is different
  },
  // Add matching Open Graph / Twitter tags here if desired
};

export default async function ContactPage() {
  return (
    <>
      {/* Static HTML content for SEO (will be visible in page source) */}
      <div id="seo-content" dangerouslySetInnerHTML={{ __html: staticHtml }} />

      {/* Dynamic React Content (rendered on client) */}
      {/* We hide the static part via CSS/JS in the actual static file OR rely on hydration replacement */}
      <ContactUsClientContent />
    </>
  );
}
