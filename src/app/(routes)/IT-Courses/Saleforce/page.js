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

export default function Salesforce() {
  return (
    <>
      <DSHeader pageId="SalesHeader" pageType="salesheader" />
      <Why pageId="WhySales" pageType="Whysales" />
      <Counselor />
      <Modules pageId="SalesModule" />
      <TrustUs />
      <Certificate pageId="SalesforceCERT" />
      <Program />
      {/* <Projects pageId="GPTinduspro" pageType="gptinduspro" /> */}
      <Description pageId="salesforce" />
      <FAQ pageId="SalesFAQ" pageType="salesfaq" />
      <CoursesRelated pageId="Salesrelcourses" />
    </>
  );
}
