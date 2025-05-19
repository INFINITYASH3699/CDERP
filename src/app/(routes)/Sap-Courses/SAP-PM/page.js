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
      <DSHeader pageId="PMHeader" pageType="pmheader" />
      <Why pageId="WhyPM" pageType="Whypm" />
      <SapModComponent pageId="SAPPM" />
      <Counselor />
      <TrustUs />
      <Certificate pageId="sap-pmCERT" />
      <Program />
      <Description pageId="sap-pm" />
      <FAQ pageId="PMFAQ" pageType="pmfaq" />
      <CoursesRelated pageId="PMrelcourses" />
    </>
  );
}
