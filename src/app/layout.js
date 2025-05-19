"use client";

import { useEffect, Suspense } from "react"; // ✅ added Suspense
import "./globals.css";
import { CityProvider } from "@/context/CityContext";
import Navbar from "@/components/Common/Navbar";
import Footer from "@/components/Common/Footer";
import CallAdvisorsStrip from "@/components/Common/CallAdvisorsStrip";
import Marquee from "@/components/Common/Marquee";
import Stickyform from "@/components/Stickyform";
import WaveComponent from "@/components/Wave";
import PopupForm from "@/components/PopupForm";
import Chatbot from "@/components/Chatbot";
import Whatsapp from "@/components/Whatsapp";
import Floatingcontact from "@/components/Floatingcontact";
import BottomMenu from "@/components/BottomMenu";
import ScrollToTop from "@/components/ScrollToTop";
import CourseLoader from "@/components/CourseLoader"; // ✅ contains useSearchParams 
import Script from "next/script";
import "bootstrap/dist/css/bootstrap.min.css";

const GTM_ID = "GTM-MB68QM2V";

export default function RootLayout({ children }) {
  useEffect(() => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
    fetch(`${apiBaseUrl}/api/ping`).catch(() => {});
  }, []);

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css?family=Lato:400,700&display=swap"
          rel="stylesheet"
        />

        <meta
          name="ahrefs-site-verification"
          content="05890b7d6657f7c22a48d201ddbced6847469e2f76ac6f73f1b7d49ef0da283d"
        />
        <meta
          name="ahrefs-site-verification"
          content="02de04071d4e08f203c50f26aaee76be72f3a3af3d54f684f0932ff933cb1a3f"
        />
        <Script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="Lvg8yXKWB+tW+q2A0zb0LQ"
          async
        />

        {/* Google Tag Manager - HEAD */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_ID}');
            `,
          }}
        />

        {/* Initialize dataLayer */}
        <Script
          id="gtm-dataLayer-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];`,
          }}
        />

        {/* Meta Pixel Script */}
        <Script
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '3414178115554916');
              fbq('track', 'PageView');
            `,
          }}
        />
      </head>

      <body className="body">
        <noscript
          dangerouslySetInnerHTML={{
            __html: `
              <iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}"
              height="0" width="0" style="display:none;visibility:hidden"></iframe>
            `,
          }}
        />

        <div className="background-animation">
          <div className="starsec"></div>
          <div className="starthird"></div>
          <div className="starfourth"></div>
          <div className="starfifth"></div>
        </div>

        <CallAdvisorsStrip />
        <Marquee />
        <Navbar />
        
        {/* ✅ Wrap CourseLoader inside Suspense */}
        <Suspense fallback={null}>
          <CourseLoader />
        </Suspense>

        <CityProvider>{children}</CityProvider>
        <ScrollToTop />
        <Floatingcontact phoneNumber="+919004002958" />
        <Whatsapp phoneNumber="+919004002958" />
        <Chatbot />
        <Stickyform />
        <PopupForm />
        <WaveComponent />
        <Footer />
        <BottomMenu />
      </body>
    </html>
  );
}
