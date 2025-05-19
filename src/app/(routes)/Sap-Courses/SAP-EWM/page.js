"use client";

import DSHeader from "@/components/CoursesComponents/Header";
import Why from "@/components/CoursesComponents/Why";
import SapModComponent from "@/components/CoursesComponents/sapmod";
import Counselor from "@/components/CoursesComponents/Councelor";
import TrustUs from "@/components/CoursesComponents/Trustus";
import Certificate from "@/components/HomePage/Certificate";
import Program from "@/components/CoursesComponents/ProgramHighlights";
import Description from "@/components/CoursesComponents/Description";
import FAQ from "@/components/CoursesComponents/FAQ";
import CoursesRelated from "@/components/CoursesComponents/RelatedCourses";

export default function HomePage() {
  return (
    <>
      <DSHeader pageId="EWMHeader" pageType="ewmheader" />
      <Why pageId="WhyEWM" pageType="Whyewm" />
      <SapModComponent pageId="SAPEWM" />
      <Counselor />
      <TrustUs />
      <Certificate pageId="sap-ewmCERT" />
      <Program />
      <Description pageId="sap-ewm" />
      <FAQ pageId="EWMFAQ" pageType="ewmfaq" />
      <CoursesRelated pageId="EWMrelcourses" />
    </>
  );
}
