"use client";

import DSHeader from "@/components/CoursesComponents/Header";
import Why from "@/components/CoursesComponents/Why";
import Certificate from "@/components/HomePage/Certificate";
import FAQ from "@/components/CoursesComponents/FAQ";
import CoursesRelated from "@/components/CoursesComponents/RelatedCourses";
import Description from "@/components/CoursesComponents/Description";
import Counselor from "@/components/CoursesComponents/Councelor";
import TrustUs from "@/components/CoursesComponents/Trustus";
import Program from "@/components/CoursesComponents/ProgramHighlights";

export default function IT() {
  return (
    <>
      <DSHeader pageId="ITcoursesHeader" pageType="itcoursesheader" />
      <Why pageId="WhyIT" pageType="Whyit" />
      <Counselor />
      <Certificate pageId="ITcourses-CERT" />
      <TrustUs />
      <Description pageId="itcourses-landing" />
      <Program />
      <FAQ pageId="ITcoursesFAQ" pageType="itcoursesfaq" />
      <CoursesRelated pageId="ITrelcourses" />
    </>
  );
}
