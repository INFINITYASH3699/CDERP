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

export default function Java() {
  return (
    <>
      <DSHeader pageId="JavaHeader" pageType="javaheader" />
      <Why pageId="WhyJava" pageType="Whyjava" />
      <Counselor />
      <Modules pageId="Javamodule" />
      <TrustUs />
      <Certificate pageId="JavaCERT" />
      <Program />
      {/* <Projects pageId="GPTinduspro" pageType="gptinduspro" /> */}
      <Description pageId="java" />
      <FAQ pageId="JavaFAQ" pageType="javafaq" /> 
      <CoursesRelated pageId="Javarelcourses" />
    </>
  );
}
