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

import Description from "@/components/CoursesComponents/Description";
import Program from "@/components/CoursesComponents/ProgramHighlights";



export default function Datascience() {
  return (
    <>
      <DSHeader pageId="MDSHeader" pageType="MDSpage" />
      <Why pageId="WhyDS" pageType="Whyds" />
      <Counselor />
      <Modules pageId="dataScienceCurriculum" />
      <TrustUs />
      <Certificate pageId="DatascienceCERT" />
      <Program />
      <Projects pageId="DSinduspro" pageType="dsinduspro" />
      <Description pageId="mds" />
      <FAQ pageId="DSFAQ" pageType="dsfaq" />
      <CoursesRelated pageId="DSrelcourses" />
    </>
  );
}
