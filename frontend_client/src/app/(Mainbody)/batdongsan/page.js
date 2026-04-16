/**
 * It takes a locale as an argument and returns an object with the translations for that locale
 * @returns The return value of the function is an object with a props property.
 */
"use client";
import React, { Fragment, useEffect } from "react";
import FooterThree from "@/layout/footers/FooterThree";
import NavbarThree from "@/layout/headers/NavbarThree";
import Breadcrumb from "@/layout/Breadcrumb/Breadcrumb";
import GridView from "@/components/listing/gridView/grid/GridView";
import { getData } from "@/utils/getData";
import { useState } from "react";

const LeftSidebar = () => {
  const [value, setValue] = useState();

  useEffect(() => {
    getData(`/api/batdongsan?page=1&limit=50`)
      .then((res) => {
        setValue(res.data.data.LatestPropertyData)
      })
      .catch((error) => console.error("Error", error));
  }, []);
  return (
    <Fragment>
      <NavbarThree />
      <Breadcrumb />
      <GridView value={value} side={"left"} size={2} gridType={"list-view"} gridBar={true} />
      <FooterThree />
    </Fragment>
  );
};

export default LeftSidebar;
