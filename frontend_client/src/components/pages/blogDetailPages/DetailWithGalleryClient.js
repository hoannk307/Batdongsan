"use client";

import React, { Fragment } from "react";
import { Gallery, Item } from "react-photoswipe-gallery";
import Slider from "react-slick";
import NoSsr from "@/utils/NoSsr";
import Img from "@/utils/BackgroundImageRatio";
import { propertySlider } from "@/data/slickSlider";

const imgData = ["/assets/images/property/4.jpg", "/assets/images/property/16.jpg", "/assets/images/property/14.jpg"];

const DetailWithGalleryClient = () => {
  return (
    <Fragment>
      <Gallery>
        <NoSsr>
          <Slider className='property-slider' {...propertySlider}>
            {imgData.map((data, i) => (
              <Item key={i} original={data} width='1000' height='550'>
                {({ ref, open }) => (
                  <div ref={ref} onClick={open}>
                    <Img src={data} className='bg-img' alt='' />
                  </div>
                )}
              </Item>
            ))}
          </Slider>
        </NoSsr>
      </Gallery>
    </Fragment>
  );
};

export default DetailWithGalleryClient;

