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

export default function Python() {
  return (
    <>
      <DSHeader pageId="PythonHeader" pageType="pythonheader" />
      <Why pageId="WhyPython" pageType="Whypython" />
      <Counselor />
      <Modules pageId="PythonModule" />
      <TrustUs />
      <Certificate pageId="PythonCERT" />
      <Program />
      {/* <Projects pageId="GPTinduspro" pageType="gptinduspro" /> */}
      <Description pageId="python" />
      <FAQ pageId="PythonFAQ" pageType="pythonfaq" />
      <CoursesRelated pageId="Pythonrelcourses" />
    </>
  );
}
