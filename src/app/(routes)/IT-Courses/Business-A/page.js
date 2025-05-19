"use client";

import DSHeader from "@/components/CoursesComponents/Header";
import Why from "@/components/CoursesComponents/Why";
import Certificate from "@/components/HomePage/Certificate";
import FAQ from "@/components/CoursesComponents/FAQ";
import CoursesRelated from "@/components/CoursesComponents/RelatedCourses";
import TrustUs from "@/components/CoursesComponents/Trustus";
import Counselor from "@/components/CoursesComponents/Councelor";
import Description from "@/components/CoursesComponents/Description";
import Program from "@/components/CoursesComponents/ProgramHighlights";
import Modules from "@/components/CoursesComponents/Modules";

export default function BusinessAnalytics() {
  return (
    <>
      <DSHeader pageId="BAHeader" pageType="BApage" />
      <Why pageId="WhyBA" pageType="Whyba" />
      <Counselor />
      <Modules pageId="BusinessAnalyticsCurriculum" />
      <TrustUs />
      <Program />
      <Certificate pageId="BusinessanalyticsCERT" />
      <Description pageId="ba" />
      <FAQ pageId="BAFAQ" pageType="bafaq" />
      <CoursesRelated pageId="BArelcourses" />
    </>
  );
}
