import { Fragment } from "react";
import BodyContent from "@/components/pages/blogDetailPages";
import Breadcrumb from "@/layout/Breadcrumb/Breadcrumb";
import FooterThree from "@/layout/footers/FooterThree";
import NavbarThree from "@/layout/headers/NavbarThree";
import Img from "@/utils/BackgroundImageRatio";
import BlogDetailSeoJsonLd from "@/components/pages/blogDetailPages/BlogDetailSeoJsonLd";


const RightSidebar = async ({ searchParams }) => {

  return (
    <Fragment>
      <NavbarThree />
      <Breadcrumb />
      <BodyContent side={"right"} >
        <div className="blog-detail-image">
          <Img src="/assets/images/parallax/4.jpg" className="bg-img img-fluid" alt="" />
        </div>
      </BodyContent>
      <BlogDetailSeoJsonLd />
      <FooterThree />
    </Fragment>
  );
};
export default RightSidebar;
