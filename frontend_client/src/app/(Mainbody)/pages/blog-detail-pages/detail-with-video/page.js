import { Fragment } from "react";
import BodyContent from "@/components/pages/blogDetailPages";
import Breadcrumb from "@/layout/Breadcrumb/Breadcrumb";
import FooterThree from "@/layout/footers/FooterThree";
import NavbarThree from "@/layout/headers/NavbarThree";
import BlogDetailSeoJsonLd from "@/components/pages/blogDetailPages/BlogDetailSeoJsonLd";
import DetailWithVideoModal from "@/components/pages/blogDetailPages/DetailWithVideoModal";



const DetailWithVideo = async ({ searchParams }) => {
  return (
    <Fragment>
      <NavbarThree />
      <Breadcrumb />
      <BodyContent >
        <DetailWithVideoModal />
      </BodyContent>
      <BlogDetailSeoJsonLd />
      <FooterThree />
    </Fragment>
  );
};

export default DetailWithVideo;
