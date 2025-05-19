"use client";

import DSHeader from "@/components/CoursesComponents/Header";
import Why from "@/components/CoursesComponents/Why";
import Certificate from "@/components/HomePage/Certificate";
import FAQ from "@/components/CoursesComponents/FAQ";
import CoursesRelated from "@/components/CoursesComponents/RelatedCourses";
import Description from "@/components/CoursesComponents/Description";
import HrCard from "@/components/CoursesComponents/HRCard";

export default function HR() {
  return (
    <>
      <DSHeader pageId="HRcoursesHeader" pageType="hrcoursesheader" />
      <Why pageId="WhyHR" pageType="Whyhr" />
      <HrCard />
      <Certificate pageId="HRcourses-CERT" />
      <Description pageId="hrcourses-landing" />
      <FAQ pageId="HRcoursesFAQ" pageType="hrcoursesfaq" />
      <CoursesRelated pageId="HRrelcourses" />
    </>
  );
}
