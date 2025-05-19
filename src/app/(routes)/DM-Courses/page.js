"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Element, scroller } from "react-scroll";

import DSHeader from "@/components/CoursesComponents/Header";
import Why from "@/components/CoursesComponents/Why";
import Certificate from "@/components/HomePage/Certificate";
import FAQ from "@/components/CoursesComponents/FAQ";
import CoursesRelated from "@/components/CoursesComponents/RelatedCourses";
import TrustUs from "@/components/CoursesComponents/Trustus";
import Counselor from "@/components/CoursesComponents/Councelor";
import Certification from "@/components/CoursesComponents/Certification.js";
import Program from "@/components/CoursesComponents/ProgramHighlights";
import Description from "@/components/CoursesComponents/Description";
import SapModComponent from "@/components/CoursesComponents/sapmod";

// 🟢 Create a separate child component for logic
function DigitalMarketingContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleScroll = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash) {
        scroller.scrollTo(hash, {
          duration: 800,
          delay: 0,
          smooth: "easeInOutQuart",
          offset: -50,
        });
      }
    };

    handleScroll();
    window.addEventListener("hashchange", handleScroll);
    return () => {
      window.removeEventListener("hashchange", handleScroll);
    };
  }, [pathname, searchParams]);

  return (
    <>
      <DSHeader pageId="DIGIMHeader" pageType="digimheader" />
      
      {/* why dm? */}
      <Why pageId="WhyDIGIM" pageType="Whydigim" />
      
      {/* syllabus */}
      <SapModComponent pageId="DIGIM" />
      
      {/* cheers to 10 yr */}
      <Counselor />

      {/* why choose dm? */}
      <Description pageId="digimdesc" />

      <Element name="pay-per-click">
        <Description pageId="digim" sectionIndex={0} />
      </Element>

      {/* ORGANISATIONS TRUST US */}
      <TrustUs />

      <Element name="search-engine-optimization">
        <Description pageId="digim2" sectionIndex={1} />
      </Element>

      <Certificate pageId="DgimCERT" />

      {/* img animation */}
      <Certification />
      <Program />
{/* imgvidieo */}
      <Element name="social-media-marketing">
        <Description pageId="digim3" sectionIndex={0} />
      </Element>

      <Element name="advance-analytics">
        <Description pageId="digim4" sectionIndex={1} />
      </Element>

      <FAQ pageId="DGMFAQ" pageType="dgmfaq" />
      <CoursesRelated pageId="DGMrelated" />
    </>
  );
}

// 🟢 Wrap the component inside Suspense
export default function DIGITALMARKETING() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DigitalMarketingContent />
    </Suspense>
  );
}
