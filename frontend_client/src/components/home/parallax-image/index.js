"use client";
import React from "react";
import AboutSection from "../corporate/About";
import BannerSection from "../corporate/Banner";
import BlogSection from "../corporate/Blog";
import FeaturePropertySection from "../corporate/FeatureProperty";
import PricingSection from "../corporate/Pricing";
import PropertySection from "../corporate/Property";
import ServiceSection from "../corporate/Service";
import TestimonialSection from "../corporate/Testimonial";
import HomeBannerSection from "./HomeBanner";
import HomeBannerSection2 from "../corporate/HomeBanner";
import VideoSection from "../classic/Video";

const BodyContent = ({
  value1,
  value2,
  featuredProperties,
  latestBlogInCorporate,
  tinTucDuAn,
  bdsQuangCao
}) => {
  return (
    <>
      <HomeBannerSection />
      <div className="section-pb">
        <PropertySection value={value1} />
      </div>
      <FeaturePropertySection value={featuredProperties} />
      <PropertySection value={value2} size={3} />
      <BannerSection banner={7} value={bdsQuangCao} />
      <TestimonialSection value={tinTucDuAn} />
      <BlogSection value={latestBlogInCorporate} />
    </>
  );
};

export default BodyContent;
