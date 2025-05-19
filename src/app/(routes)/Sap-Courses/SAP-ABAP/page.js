"use client";

import DSHeader from "@/components/CoursesComponents/Header";
import Why from "@/components/CoursesComponents/Why";
import SapModComponent from "@/components/CoursesComponents/sapmod";
import Counselor from "@/components/CoursesComponents/Councelor";
import TrustUs from "@/components/CoursesComponents/Trustus";
import Certificate from "@/components/HomePage/Certificate";
import Program from "@/components/CoursesComponents/ProgramHighlights";
import Description from "@/components/CoursesComponents/Description";
import FAQ from "@/components/CoursesComponents/FAQ";
import CoursesRelated from "@/components/CoursesComponents/RelatedCourses";

export default function HomePage() {
    return (
      <>  
        <DSHeader pageId="AbapHeader" pageType="abapheader" />
        <Why pageId="WhyAbap" pageType="Whyabap" />
        <SapModComponent pageId="SAPABAP" />
        <Counselor />
        <TrustUs />
        <Certificate pageId="sap-abapCERT" />
        <Program />
        <Description pageId="sap-abap" />
        <FAQ pageId="AbapFAQ" pageType="abapfaq" />
        <CoursesRelated pageId="Abaprelcourses" />
      </>
    );
};