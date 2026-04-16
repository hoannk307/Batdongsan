import React from "react";
import { Col } from "reactstrap";
import useStickyBar from "../../../utils/useStickyBar";
import useActiveLinkInStickyBar from "../../../utils/useActiveLinkInStickyBar";
import DetailsDeskBox from "./DetailsDeskBox";
import FeatureDeskBox from "./FeatureDeskBox";
import FloorPlanDeskBox from "./FloorPlanDeskBox";
import GalleryDeskBox from "./GalleryDeskBox";
import LocationMapDeskBox from "./LocationMapDeskBox";
import SearchBarDeskBox from "./SearchBarDeskBox";
import VideoDeskBox from "./VideoDeskBox";
import ReviewsDeskBox from "./ReviewsDeskBox";

const SinglePropertySection = ({ singleData }) => {
  const fix = useStickyBar();
  useActiveLinkInStickyBar();
  return (
    <Col xl='9' lg='8'>
      <div className='description-section'>
        <div className='description-details'>
          <SearchBarDeskBox fix={fix} singleData={singleData} />
          {/* <FeatureDeskBox singleData={singleData} /> */}
          <GalleryDeskBox singleData={singleData} />
          <VideoDeskBox singleData={singleData} />
          <DetailsDeskBox singleData={singleData} />
          <FloorPlanDeskBox singleData={singleData} />
          <LocationMapDeskBox singleData={singleData} />
        </div>
      </div>
    </Col>
  );
};

export default SinglePropertySection;
