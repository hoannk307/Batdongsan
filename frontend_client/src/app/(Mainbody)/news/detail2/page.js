"use client";
import BodyContent from "@/components/pages/blogDetailPages";
import Breadcrumb from "@/layout/Breadcrumb/Breadcrumb";
import FooterThree from "@/layout/footers/FooterThree";
import NavbarThree from "@/layout/headers/NavbarThree";
import Img from "@/utils/BackgroundImageRatio";
import { Fragment, useEffect, useState } from "react";
import { SITE_URL } from "@/config/env";
import { useSearchParams } from "next/navigation";
import NavbarFour from "@/layout/headers/NavbarFour";

const NoSidebar = () => {
  const searchParams = useSearchParams();
  const id = searchParams?.get("id");

  const [news, setNew] = useState(null);
  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      const res = await fetch(`${SITE_URL}/api/news/detail?id=${id}`, { cache: "no-store" });
      const detail = await res.json().catch(() => null);
      setNew(detail);
    }
    fetchData();
  }, [id]);

  return (
    <Fragment>
      <NavbarFour />
      <Breadcrumb />
      <BodyContent side={false} id={id} initialNews={news}>
        <div className="blog-detail-image">
          {news?.img && <Img src={news.img} className="bg-img img-fluid" alt="" />}
        </div>
      </BodyContent>
      <FooterThree />
    </Fragment>
  );
};
export default NoSidebar;
