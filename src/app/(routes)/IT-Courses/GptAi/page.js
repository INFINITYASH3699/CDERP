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

export default function GPT() {
  return (
    <>
      <DSHeader pageId="GPTHeader" pageType="GPTpage" />
      <Why pageId="WhyGPT" pageType="Whygpt" />
      <Counselor />
      <Modules pageId="ChatGPT&Ai" />
      <TrustUs />
      <Certificate pageId="gptaiCERT" />
      <Program />
      {/* <Projects pageId="GPTinduspro" pageType="gptinduspro" /> */}
      <Description pageId="gptai" />
      <FAQ pageId="GPTFAQ" pageType="GPTfaq" />
      <CoursesRelated pageId="GPTrelcourses" />
    </>
  );
}
