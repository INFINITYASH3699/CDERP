"use client";

import DSHeader from "@/components/CoursesComponents/Header";
import Why from "@/components/CoursesComponents/Why";
import Modules from "@/components/CoursesComponents/Modules";
import Certificate from "@/components/HomePage/Certificate";
import FAQ from "@/components/CoursesComponents/FAQ";
import CoursesRelated from "@/components/CoursesComponents/RelatedCourses";
import TrustUs from "@/components/CoursesComponents/Trustus";
import Counselor from "@/components/CoursesComponents/Councelor";
import Projects from "@/components/CoursesComponents/Projects";
import Program from "@/components/CoursesComponents/ProgramHighlights";
import Description from "@/components/CoursesComponents/Description";


export default function POWERBI() {
  return (
    <>
        <DSHeader pageId="POWERBI" pageType="powerbi" />
        <Why pageId="WhyPOWERBI" pageType="Whypowerbi" />
        <Counselor />
        <Modules pageId="POWERBIModule" />
        <TrustUs />
        <Program />
        <Certificate pageId="PowerbiCERT" />
        <Projects pageId="POWERBIinduspro" pageType="powerbiinduspro" />
        <Description pageId="POWERBI" />
        <FAQ pageId="POWERBI" pageType="powerbi" />
        <CoursesRelated pageId="POWERBIrelcourses" />
      
    </>
  );
}
