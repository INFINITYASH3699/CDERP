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
      <DSHeader pageId="BwbiHeader" pageType="bwbiheader" />
      <Why  pageId="WhyBwbi" pageType="Whybwbi" />
      <SapModComponent pageId="SAPBI" />
      <Counselor />
      <TrustUs />
      <Certificate pageId="sap-bwbiCERT" />
      <Program />
      <Description pageId="sap-bwbi" />
      <FAQ pageId="BwbiFAQ" pageType="bwbifaq" />
      <CoursesRelated pageId="Bwbirelated" />
    </>
  );
}
