"use client";

import DSHeader from "@/components/CoursesComponents/Header";
import Why from "@/components/CoursesComponents/Why";
import Certificate from "@/components/HomePage/Certificate";
import Description from "@/components/CoursesComponents/Description";
import FAQ from "@/components/CoursesComponents/FAQ";
import CoursesRelated from "@/components/CoursesComponents/RelatedCourses";
import Counselor from "@/components/CoursesComponents/Councelor";
import TrustUs from "@/components/CoursesComponents/Trustus";
import Program from "@/components/CoursesComponents/ProgramHighlights";


export default function HomePage() {
  return (
    <>
      <DSHeader pageId="SapHeader" pageType="sapheader" />
      <Why pageId="WhySap" pageType="Whysap" />
      <Counselor />
      <Certificate pageId="sap-CERT" />
      <TrustUs />
      <Description pageId="sap-landing" />
      <Program />
      <FAQ pageId="SAPFAQ" pageType="sapfaq" />
      <CoursesRelated pageId="SAPrelcourses" />
    </>
  );
}
