/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "blog-page-panel.onrender.com",
      },
      {
        protocol: "https",
        hostname: "imgur.com",
      },
    ],
    domains: [
      "i.imgur.com",
      "imgur.com",
      "blog-page-panel.onrender.com",
      "images.unsplash.com",
      "plus.unsplash.com",
      "res.cloudinary.com",
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  async headers() {
    return [
      {
        source: '/:path*.(jpg|jpeg|gif|png|svg|webp|avif|ico|css|js)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/sitemap.xml",
        destination: "/api/sitemap.xml",
      },
      {
        source: "/robots.txt",
        destination: "/api/robots.txt",
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/sap-fico-course-in-Pune",
        destination: "/sap-fico-course-in-pune",
        permanent: true,
      },
      {
        source: "/sap-abap-course-in-Mumbai",
        destination: "/sap-abap-course-in-mumbai",
        permanent: true,
      },
      {
        source: "/sap-mm-course-in-Hyderabad",
        destination: "/sap-mm-course-in-hyderabad",
        permanent: true,
      },
      {
        source: "/sap-sd-course-in-Delhi",
        destination: "/sap-sd-course-in-delhi",
        permanent: true,
      },
      {
        source: "/mern-stack-course-in-Vadodara",
        destination: "/mern-stack-course-in-vadodara",
        permanent: true,
      },
      {
        source: "/hr-analytics-course-in-Trivandrum",
        destination: "/hr-analytics-course-in-trivandrum",
        permanent: true,
      },
      {
        source: "/sap-s4-hana-course-in-Mangalore",
        destination: "/sap-s4-hana-course-in-mangalore",
        permanent: true,
      },
      {
        source: "/digital-marketing-course-in-Pune",
        destination: "/digital-marketing-course-in-pune",
        permanent: true,
      },
      {
        source: "/core-hr-course-in-Nagpur",
        destination: "/core-hr-course-in-nagpur",
        permanent: true,
      },
      {
        source: "/data-analytics-course-in-Pondicherry",
        destination: "/data-analytics-course-in-pondicherry",
        permanent: true,
      },
      {
        source: "/hr-analytics-course-in-Delhi",
        destination: "/hr-analytics-course-in-delhi",
        permanent: true,
      },
      {
        source: "/digital-marketing-course-in-Vadodara",
        destination: "/digital-marketing-course-in-vadodara",
        permanent: true,
      },
      {
        source: "/core-hr-course-in-Patna",
        destination: "/core-hr-course-in-patna",
        permanent: true,
      },
      {
        source: "/Java-course-in-Lucknow",
        destination: "/java-course-in-lucknow",
        permanent: true,
      },
      {
        source: "/digital-marketing-course-in-Kolkata",
        destination: "/digital-marketing-course-in-kolkata",
        permanent: true,
      },
      {
        source: "/sap-sd-course-in-Raipur",
        destination: "/sap-sd-course-in-raipur",
        permanent: true,
      },
      {
        source: "/sap-qm-course-in-Mumbai",
        destination: "/sap-qm-course-in-mumbai",
        permanent: true,
      },
      {
        source: "/python-course-in-Dehradun",
        destination: "/python-course-in-dehradun",
        permanent: true,
      },
      {
        source: "/sap-pm-course-in-Mumbai",
        destination: "/sap-pm-course-in-mumbai",
        permanent: true,
      },
      {
        source: "/sap-abap-course-in-Mumbai",
        destination: "/sap-abap-course-in-mumbai",
        permanent: true,
      },
      {
        source: "/data-analytics-course-in-Ranchi",
        destination: "/data-analytics-course-in-ranchi",
        permanent: true,
      },
      {
        source: "/data-science-course-in-Cochin",
        destination: "/data-science-course-in-cochin",
        permanent: true,
      },
      {
        source: "/python-course-in-Surat",
        destination: "/python-course-in-surat",
        permanent: true,
      },
      {
        source: "/hr-payroll-course-in-Mysore",
        destination: "/hr-payroll-course-in-mysore",
        permanent: true,
      },
      {
        source: "/hr-management-course-in-Mysore",
        destination: "/hr-management-course-in-mysore",
        permanent: true,
      },
      {
        source: "/mern-stack-course-in-Jalandhar",
        destination: "/mern-stack-course-in-jalandhar",
        permanent: true,
      },
      {
        source: "/data-science-course-in-Varanasi",
        destination: "/data-science-course-in-varanasi",
        permanent: true,
      },
      {
        source: "/mern-stack-course-in-Mangalore",
        destination: "/mern-stack-course-in-mangalore",
        permanent: true,
      },
      {
        source: "/data-analytics-course-in-Coimbatore",
        destination: "/data-analytics-course-in-coimbatore",
        permanent: true,
      },
      {
        source: "/python-course-in-Mangalore",
        destination: "/python-course-in-mangalore",
        permanent: true,
      },
      {
        source: "/full-stack-developer-course-in-Bhubaneswar",
        destination: "/full-stack-developer-course-in-bhubaneswar",
        permanent: true,
      },
      {
        source: "/hr-analytics-course-in-Visakhapatnam",
        destination: "/hr-analytics-course-in-visakhapatnam",
        permanent: true,
      },
      {
        source: "/python-course-in-Bhopal",
        destination: "/python-course-in-bhopal",
        permanent: true,
      },
      {
        source: "/data-science-course-in-Kolkata",
        destination: "/data-science-course-in-kolkata",
        permanent: true,
      },
      {
        source: "/data-science-course-in-Hyderabad",
        destination: "/data-science-course-in-hyderabad",
        permanent: true,
      },
      {
        source: "/data-science-course-in-Chennai",
        destination: "/data-science-course-in-chennai",
        permanent: true,
      },
      {
        source: "/data-science-course-in-Delhi",
        destination: "/data-science-course-in-delhi",
        permanent: true,
      },
      {
        source: "/data-science-course-in-Ahmedabad",
        destination: "/data-science-course-in-ahmedabad",
        permanent: true,
      },
      {
        source: "/salesforce-course-in-Pune",
        destination: "/salesforce-course-in-pune",
        permanent: true,
      },
      {
        source: "/hr-analytics-course-in-Vadodara",
        destination: "/hr-analytics-course-in-vadodara",
        permanent: true,
      },
      {
        source: "/sql-course-in-Bhubaneswar",
        destination: "/sql-course-in-bhubaneswar",
        permanent: true,
      },
      {
        source: "/hr-analytics-course-in-Pondicherry",
        destination: "/hr-analytics-course-in-pondicherry",
        permanent: true,
      },
      {
        source: "/mern-stack-course-in-Pondicherry",
        destination: "/mern-stack-course-in-pondicherry",
        permanent: true,
      },
      {
        source: "/sap-ps-course-in-Pune",
        destination: "/sap-ps-course-in-pune",
        permanent: true,
      },
      {
        source: "/sap-bwbi-course-in-Kolkata",
        destination: "/sap-bwbi-course-in-kolkata",
        permanent: true,
      },
      {
        source: "/sap-bwbi-course-in-Bhopal",
        destination: "/sap-bwbi-course-in-bhopal",
        permanent: true,
      },
      {
        source: "/sap-bwbi-course-in-Mohali",
        destination: "/sap-bwbi-course-in-mohali",
        permanent: true,
      },
      {
        source: "/sap-scm-course-in-Pune",
        destination: "/sap-hr-hcm-course-in-pune",
        permanent: true,
      },
      {
        source: "/sap-hcm-course-in-Pune",
        destination: "/sap-hr-hcm-course-in-pune",
        permanent: true,
      },
      {
        source: "/sap-pm-course-in-Pune",
        destination: "/sap-pm-course-in-pune",
        permanent: true,
      },
      {
        source: "/sap-basis-course-in-Pune",
        destination: "/sap-basis-course-in-pune",
        permanent: true,
      },
      {
        source: "/sap-bwbi-course-in-Chandigarh",
        destination: "/sap-bwbi-course-in-chandigarh",
        permanent: true,
      },
      {
        source: "/sap-successfactors-course-in-Pune",
        destination: "/sap-successfactors-course-in-pune",
        permanent: true,
      },
      {
        source: "/sap-qm-course-in-Pune",
        destination: "/sap-qm-course-in-pune",
        permanent: true,
      },
      {
        source: "/sap-bwbi-course-in-Mysore",
        destination: "/sap-bwbi-course-in-mysore",
        permanent: true,
      },
      {
        source: "/sap-s4-hana-course-in-Pune",
        destination: "/sap-s4-hana-course-in-pune",
        permanent: true,
      },
      {
        source: "/sap-netweaver-course-in-Pune",
        destination: "/sap-netweaver-course-in-pune",
        permanent: true,
      },
      {
        source: "/sap-sd-course-in-Pune",
        destination: "/sap-sd-course-in-pune",
        permanent: true,
      },
      {
        source: "/sap-pp-course-in-Pune",
        destination: "/sap-pp-course-in-pune",
        permanent: true,
      },
      {
        source: "/sap-abap-course-in-Pune",
        destination: "/sap-abap-course-in-pune",
        permanent: true,
      }
    ];
  },
};

export default nextConfig;
