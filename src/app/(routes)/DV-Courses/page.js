"use client";

import DSHeader from "@/components/CoursesComponents/Header";
import Why from "@/components/CoursesComponents/Why";
import Certificate from "@/components/HomePage/Certificate";
import FAQ from "@/components/CoursesComponents/FAQ";
import CoursesRelated from "@/components/CoursesComponents/RelatedCourses";
import Description from "@/components/CoursesComponents/Description";
import Counselor from "@/components/CoursesComponents/Councelor";
import TrustUs from "@/components/CoursesComponents/Trustus";
import Program from "@/components/CoursesComponents/ProgramHighlights";

export default function DV() {
  return (
    <>
      <DSHeader pageId="DataVisualHeader" pageType="datavisualheader" />
      <Why pageId="WhyDataVisual" pageType="Whydatavisual" />
      <Counselor />
      <Certificate pageId="DataVisual-CERT" />
      <TrustUs />
      <Description pageId="DataVisual-landing" />
      <Program />
      <FAQ pageId="DataVisualFAQ" pageType="datavisualfaq" />
      <CoursesRelated pageId="DataVisualrelcourses" />
    </>
  );
}
