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
import HRCard from "@/components/CoursesComponents/HRCard";

export default function MANAGE() {
  return (
    <>
        <DSHeader  pageId="MANHeader" pageType="manpage" />
        <Why pageId="WhyMAN" pageType="Whyman" />
        <Counselor />
        <Modules pageId="HRTrainModule" />
        <TrustUs />
        <Program />
        <Certificate pageId="HRManCERT" />
        <Description pageId="man" />
        <FAQ pageId="MANFAQ" pageType="manfaq" />
        <CoursesRelated pageId="MANrelated" />
      
    </>
  );
}
