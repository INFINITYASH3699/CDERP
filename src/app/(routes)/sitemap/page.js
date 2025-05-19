// src/app/(routes)/sitemap/page.js

import CitySitemap from "@/components/CitySitemap/CitySitemap";
import Breadcrumb from "@/components/CitySitemap/Breadcrumb";

export const metadata = {
  title: "City Course Sitemap | Connecting Dots ERP",
  description:
    "Browse our comprehensive range of professional courses available in cities across India including Pune, Mumbai, Bangalore, Delhi, and more.",
  keywords:
    "course sitemap, city courses, SAP training, IT courses, Digital Marketing courses, Data Science courses, HR courses, courses in Pune, courses in Mumbai, training programs India",
};

export default function SitemapPage() {
  // Define breadcrumb items for this page
  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    { label: "Sitemap" }, // Current page
  ];

  return (
    <main>
      <Breadcrumb items={breadcrumbItems} />
      <CitySitemap />
    </main>
  );
}
