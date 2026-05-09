/**
 * It fetches data from the API and then renders the data in the UI
 * @returns The return value of the function is the value of the last expression in the function body.
 */
import React, { useEffect, useState } from "react";
import { AppPropertyData } from "@/data/appPropertyData";
import { getData } from "@/utils/getData";
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
  const [value, setValue] = useState();
  const [clientData, setClientData] = useState();
  const [latestBlogInCorporate, setLatestBlogInCorporate] = useState();

  useEffect(() => {
    getData(`/api/batdongsan?page=1&limit=6`)
      .then((res) => {
        setValue(res.data); // shape: { data: PropertyCard[], pagination: {} }
      })
      .catch((error) => console.error("Error", error));
    getData(`/api/client-agent`)
      .then((res) => {
        setClientData(res.data);
      })
      .catch((error) => console.error("Error", error));

    getData(`/api/news?page=1&limit=6`)
      .then((res) => {
        console.log('-----------------------------------LatestNews:', res.data);
        setLatestBlogInCorporate(res.data || res);
      })
      .catch((error) => console.error("Error fetching latest news", error));
  }, []);
  return (
    <>
      <HomeBannerSection />
      <div className="section-pb">
        <PropertySection value={value?.data} />
      </div>
      <FeaturePropertySection value={value?.data} />
      {/* <div className="service-section-pt-0">
        <ServiceSection value={AppPropertyData.ProvidedServices} />
      </div> */}
      <PropertySection value={value?.data} size={3} />
      {/* <PricingSection value={AppPropertyData.PricingPlan} /> */}
      <BannerSection banner={7} />
      <TestimonialSection value={clientData?.OurClientInCorporateLayout} />
      <BlogSection value={latestBlogInCorporate} />
    </>
  );
};

export default BodyContent;
