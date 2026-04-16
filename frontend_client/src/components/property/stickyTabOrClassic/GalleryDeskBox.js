import React from "react";
import GallerySlider from "./GallerySlider";

const GalleryDeskBox = ({ singleData }) => {
  const images = Array.isArray(singleData?.img) && singleData.img.length > 0
    ? singleData.img
    : [
      "/assets/images/property/4.jpg",
      "/assets/images/property/3.jpg",
      "/assets/images/property/14.jpg",
      "/assets/images/property/11.jpg",
      "/assets/images/property/12.jpg",
    ];

  return (
    <div className='desc-box' id='gallery'>
      <div className='page-section ratio3_2'>
        <h4 className='content-title'>Hình ảnh</h4>
        <div className='single-gallery'>
          <GallerySlider images={images} />
        </div>
      </div>
    </div>
  );
};

export default GalleryDeskBox;
