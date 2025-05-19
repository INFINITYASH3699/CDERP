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

export default function HRTraining() {
  return (
    <>
        <DSHeader pageId="HRTrainingHeader" pageType="hrtraining" />
        <Why pageId="WhyHRTRAIN" pageType="Whyhrtrain" />
        <Counselor />
        <Modules pageId="HRTrainModule" />
        <TrustUs />
        <HRCard />
        <Program />
        <Certificate pageId="HrtrainCERT" />
        <Description pageId="hrtrain" />
        <FAQ pageId="HRTRAINFAQ" pageType="hrtrainfaq" />
        <CoursesRelated pageId="Hrtrainrelated" />
      
    </>
  );
}
