"use client";

import DSHeader from "@/components/CoursesComponents/Header";
import Why from "@/components/CoursesComponents/Why";
import Modules from "@/components/CoursesComponents/Modules";
import Certificate from "@/components/HomePage/Certificate";
import FAQ from "@/components/CoursesComponents/FAQ";
import CoursesRelated from "@/components/CoursesComponents/RelatedCourses";
import TrustUs from "@/components/CoursesComponents/Trustus";
import Counselor from "@/components/CoursesComponents/Councelor";
import Program from "@/components/CoursesComponents/ProgramHighlights";
import Description from "@/components/CoursesComponents/Description";


export default function CORE() {
  return (
    <>
        <DSHeader pageId="COREHeader" pageType="corepage" />
        <Why pageId="WhyCORE" pageType="Whycore" />
        <Counselor />
        <Modules pageId="HRTrainModule" />
        <TrustUs />
        <Program />
        <Certificate pageId="HRCoreCERT" />
        <Description pageId="core" />
        <FAQ pageId="COREFAQ" pageType="corefaq" />
        <CoursesRelated pageId="CORErelated" />
      
    </>
  );
}
