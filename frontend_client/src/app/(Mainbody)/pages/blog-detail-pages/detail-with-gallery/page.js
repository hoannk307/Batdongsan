import { Fragment } from "react";
import BodyContent from "@/components/pages/blogDetailPages";
import Breadcrumb from "@/layout/Breadcrumb/Breadcrumb";
import FooterThree from "@/layout/footers/FooterThree";
import NavbarThree from "@/layout/headers/NavbarThree";
import BlogDetailSeoJsonLd from "@/components/pages/blogDetailPages/BlogDetailSeoJsonLd";
import DetailWithGalleryClient from "@/components/pages/blogDetailPages/DetailWithGalleryClient";


const DetailWithGallery = async ({ searchParams }) => {
  return (
    <Fragment>
      <NavbarThree />
      <Breadcrumb />
      <BodyContent side={"left"}>
        <DetailWithGalleryClient />
      </BodyContent>
      <BlogDetailSeoJsonLd />
      <FooterThree />
    </Fragment>
  );
};

export default DetailWithGallery;
