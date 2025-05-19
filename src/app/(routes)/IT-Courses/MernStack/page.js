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

export default function Mern() {
  return (
    <>
      <DSHeader pageId="MernHeader" pageType="mernheader" />
      <Why pageId="WhyMern" pageType="Whymern" />
      <Counselor />
      <Modules pageId="MernModule" />
      <TrustUs />
      <Certificate pageId="mernstackCERT" />
      <Program />
      <Description pageId="mern-stack" />
      <FAQ pageId="MernFAQ" pageType="mernfaq" />  
      <CoursesRelated pageId="Mernrelcourses" />
    </>
  );
}
