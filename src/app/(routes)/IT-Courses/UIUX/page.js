"use client";

import DSHeader from "@/components/CoursesComponents/Header";
import Why from "@/components/CoursesComponents/Why";
import Modules from "@/components/CoursesComponents/Modules";
import Certificate from "@/components/HomePage/Certificate";
import FAQ from "@/components/CoursesComponents/FAQ";
import CoursesRelated from "@/components/CoursesComponents/RelatedCourses";
import TrustUs from "@/components/CoursesComponents/Trustus";
import Counselor from "@/components/CoursesComponents/Councelor";
import Description from "@/components/CoursesComponents/Description";
import Program from "@/components/CoursesComponents/ProgramHighlights";

export default function UIUX() {
  return (
    <>
      <DSHeader pageId="UIUXHeader" pageType="uiuxheader" />
      <Why pageId="WhyUIUX" pageType="Whyuiux" />
      <Counselor />
      <Modules pageId="UIUXModule" />
      <TrustUs />
      <Certificate pageId="UiuxCERT" />
      <Program />
      <Description pageId="uiux" />
      <FAQ pageId="UIUXFAQ" pageType="uiuxfaq" />
      <CoursesRelated pageId="UIUXrelcourses" />
    </>
  );
}
