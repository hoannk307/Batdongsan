/**
 * It takes a locale and an array of namespaces, and returns an object with the translations for those
 * namespaces
 * @returns The data is being returned as an array of objects.
 */
"use client";
import React, { Fragment, useEffect, useState } from "react";
import SliderSection from "@/components/property/tabPanelPages/Slider";
import { getData } from "@/utils/getData";
import NavbarFive from "@/layout/headers/NavbarFive";
import FooterThree from "@/layout/footers/FooterThree";
import BodyContent from "@/components/property/stickyTabOrClassic";
import { useSearchParams } from "next/navigation";
import NavbarFour from "@/layout/headers/NavbarFour";

const Detail = () => {
  // const searchParams = useSearchParams()
  // const id = searchParams.get('id')

  // const [value, setValue] = useState({});

  // useEffect(() => {
  //   getData(`/api/property`)
  //     .then((res) => {
  //       setValue(
  //         Object.keys(res.data)
  //           .map((key) => [res.data[key]])
  //           .flat(2)
  //           .filter((item) => item.id === id)
  //           .pop()
  //       );
  //     })
  //     .catch((error) => console.error("Error", error));
  // }, [id]);

  return (
    <Fragment>
      <NavbarFour />
      <BodyContent side={"left"} />
      <FooterThree />
    </Fragment>
  );
};

export default Detail;
