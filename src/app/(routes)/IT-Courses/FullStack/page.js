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



export default function FullStack() {
  return (
    <>
      <DSHeader pageId="FullStackHeader" pageType="fullstackheader" />
      <Why pageId="WhyFullStack" pageType="Whyfullstack" />
      <Counselor />
      <Modules pageId="FullStackmodule" />
      <TrustUs />
      <Certificate pageId="fullstackCERT" />
     
      <Description pageId="full-stack" />
        <FAQ pageId="FullStackFAQ" pageType="fullstackfaq" />
      <CoursesRelated pageId="FullStackrelcourses" />
    </>
  );
}
