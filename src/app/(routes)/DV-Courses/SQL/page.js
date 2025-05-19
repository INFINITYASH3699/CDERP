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


export default function SQL() {
  return (
    <>
        <DSHeader pageId="SQL" pageType="sql" />
        <Why pageId="WhySQL" pageType="Whysql" />
        <Counselor />
        <Modules pageId="SQLModule" />
        <TrustUs />
        <Program />
        <Certificate pageId="SqlCERT" />
        <Projects pageId="SQLinduspro" pageType="sqlinduspro" />
        <Description pageId="SQL" />
        <FAQ pageId="SQL" pageType="sql" />
        <CoursesRelated pageId="SQLrelcourses" />
      
    </>
  );
}
