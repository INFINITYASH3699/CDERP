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
import Projects from "@/components/CoursesComponents/Projects";
import Modules from "@/components/CoursesComponents/Modules";

export default function DataAnalytics() {
  return (
    <>
      <DSHeader pageId="MDAHeader" pageType="MDApage" />
      <Why pageId="WhyDA" pageType="Whyda" />
      <Counselor />
      <Modules pageId="dataAnalyticsCurriculum" />
      <TrustUs />
      <Certificate pageId="DataanalyticsCERT" />
      <Program />
      <Projects pageId="DAinduspro" pageType="dainduspro" />
      <Description pageId="mda" />
      <FAQ pageId="DAFAQ" pageType="dafaq" />
      <CoursesRelated pageId="DArelcourses" />
    </>
  );
}
