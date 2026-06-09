/**
 * It fetches data from the API and then renders the data in the UI
 * @returns The return value of the function is the value of the last expression in the function body.
 */
import React, { useEffect, useState } from "react";
import { AppPropertyData } from "@/data/appPropertyData";
import { getData } from "@/utils/apiRequests";
import AboutSection from "../corporate/About";
import BannerSection from "../corporate/Banner";
import BlogSection from "../corporate/Blog";
import FeaturePropertySection from "../corporate/FeatureProperty";
import PricingSection from "../corporate/Pricing";
import PropertySection from "../corporate/Property";
import ServiceSection from "../corporate/Service";
import TestimonialSection from "../corporate/Testimonial";
import HomeBannerSection from "./HomeBanner";

const BodyContent = () => {
  const [value1, setValue1] = useState();
  const [value2, setValue2] = useState();
  const [featuredProperties, setFeaturedProperties] = useState();
  const [clientData, setClientData] = useState();
  const [latestBlogInCorporate, setLatestBlogInCorporate] = useState();
  const [tinTucDuAn, setTinTucDuAn] = useState();
  const [bdsQuangCao, setBdsQuangCao] = useState();


  useEffect(() => {
    getData(`/api/batdongsan?page=1&limit=14`)
      .then((res) => {
        const list = res.data.data || [];
        setValue1(list.slice(0, 6)); // shape: { data: PropertyCard[], pagination: {} }
        setValue2(list.slice(6, 14));
      })
      .catch((error) => console.error("Error", error));
    getData(`/api/client-agent`)
      .then((res) => {
        setClientData(res.data);
      })
      .catch((error) => console.error("Error", error));

    getData(`/api/news?type=category&id=1&page=1&limit=6`)
      .then((res) => {
        setLatestBlogInCorporate(res.data || res);
      })
      .catch((error) => console.error("Error fetching latest news", error));

    getData(`/api/news?type=category&id=3&page=1&limit=6`)
      .then((res) => {
        setTinTucDuAn(res.data || res);
      })
      .catch((error) => console.error("Error fetching latest news", error));

    getData(`/api/news?type=category&id=0&page=1&limit=6`)
      .then((res) => {
        setBdsQuangCao(res.data[0] || res);
      })
      .catch((error) => console.error("Error fetching latest news", error));

    // Lấy BĐS nổi bật
    getData(`/api/batdongsan/feature`)
      .then((res) => {
        setFeaturedProperties(res.data.data);
      })
      .catch((error) => console.error("Error", error));

  }, []);
  return (
    <>
      <HomeBannerSection />
      <div className="section-pb">
        <PropertySection value={value1} />
      </div>
      <FeaturePropertySection value={featuredProperties} />
      {/* <div className="service-section-pt-0">
        <ServiceSection value={AppPropertyData.ProvidedServices} />
      </div> */}
      <PropertySection value={value2} size={3} />
      {/* <PricingSection value={AppPropertyData.PricingPlan} /> */}
      <BannerSection banner={7} value={bdsQuangCao} />
      <TestimonialSection value={tinTucDuAn} />
      <BlogSection value={latestBlogInCorporate} />
    </>
  );
};

export default BodyContent;
