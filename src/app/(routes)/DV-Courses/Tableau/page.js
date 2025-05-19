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
        <DSHeader pageId="TABLEAU" pageType="tableau" />
        <Why pageId="WhyTABLEAU" pageType="Whytableau" />
        <Counselor />
        <Modules pageId="TABLEAUModule" />
        <TrustUs />
        <Program />
        <Certificate pageId="TableauCERT" />
        <Projects pageId="TABLEAUinduspro" pageType="tableauinduspro" />
        <Description pageId="TABLEAU" />
        <FAQ pageId="TABLEAU" pageType="tableau" />
        <CoursesRelated pageId="TABLEAUrelcourses" />
      
    </>
  );
}
