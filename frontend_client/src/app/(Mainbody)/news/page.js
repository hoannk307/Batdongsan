"use client";
import React, { Fragment } from "react";
import { useSearchParams } from "next/navigation";
import BodyContent from "@/components/pages/blogPage/ListSidebar";
import Breadcrumb from "@/layout/Breadcrumb/Breadcrumb";
import FooterThree from "@/layout/footers/FooterThree";
import NavbarThree from "@/layout/headers/NavbarThree";
import NavbarFour from "@/layout/headers/NavbarFour";

const ListNew = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";
  const type = searchParams.get("type") || "";

  return (
    <Fragment>
      <NavbarFour />
      <Breadcrumb />
      <BodyContent side={"left"} tagId={id} filterType={type} />
      <FooterThree />
    </Fragment>
  );
};

export default ListNew;
