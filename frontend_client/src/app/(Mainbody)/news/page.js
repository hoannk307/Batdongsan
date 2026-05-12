"use client";
import React, { Fragment } from "react";
import BodyContent from "@/components/pages/blogPage/ListSidebar";
import Breadcrumb from "@/layout/Breadcrumb/Breadcrumb";
import FooterThree from "@/layout/footers/FooterThree";
import NavbarThree from "@/layout/headers/NavbarThree";
import NavbarFour from "@/layout/headers/NavbarFour";

const ListLeftSidebar = () => {
  return (
    <Fragment>
      <NavbarFour />
      <Breadcrumb />
      <BodyContent side={"left"} />
      <FooterThree />
    </Fragment>
  );
};

export default ListLeftSidebar;
