import { Fragment } from "react";
import BodyContent from "@/components/pages/blogDetailPages";
import Breadcrumb from "@/layout/Breadcrumb/Breadcrumb";
import FooterThree from "@/layout/footers/FooterThree";
import NavbarThree from "@/layout/headers/NavbarThree";
import Img from "@/utils/BackgroundImageRatio";
import { SITE_URL } from "@/config/env";


const DetailNews = async ({ searchParams }) => {
  const id = (await searchParams)?.id;
  const res = await fetch(`${SITE_URL}/api/news/detail?id=${id}`, { cache: "no-store" });
  const news = await res.json().catch(() => null);
  return (
    <Fragment>
      <NavbarThree />
      <Breadcrumb />
      <BodyContent side={"left"} id={id} initialNews={news}>
        <div className='blog-detail-image'>
          <Img src={news?.img} className='bg-img img-fluid' alt='' />
        </div>
      </BodyContent>
      <FooterThree />
    </Fragment>
  );
};
export default DetailNews;
