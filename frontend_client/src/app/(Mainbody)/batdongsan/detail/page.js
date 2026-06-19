/**
 * It takes a locale and an array of namespaces, and returns an object with the translations for those
 * namespaces
 * @returns The data is being returned as an array of objects.
 */
"use client";
import BodyContent from "@/components/property/stickyTabOrClassic";
import FooterThree from "@/layout/footers/FooterThree";
import NavbarFour from "@/layout/headers/NavbarFour";
import useMobileSize from "@/utils/useMobileSize";
import { Fragment } from "react";

const Detail = () => {
  const isMobile = useMobileSize();
  return (
    <Fragment>
      <NavbarFour />
      <BodyContent side={"left"} />
      {!isMobile && <FooterThree />}
    </Fragment>
  );
};

export default Detail;
