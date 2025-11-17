import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import PropertyBox from "@/components/Common/Propertybox/PropertyBox";
import { getData } from "@/components/utils/getData";

const FavouriteProperties = () => {
  const [propertyList, setPropertyList] = useState();

  useEffect(() => {
    getData(`/api/property`)
      .then((res) => {
        setPropertyList(res.data?.LatestPropertyListingInEnterprise);
      })
      .catch((error) => console.error("Error", error));
  }, []);

  return (
    <Col xl='12'>
      <Row className='property-2 column-sm property-label property-grid'>
        {propertyList &&
          propertyList.slice(0, 6).map((item, index) => {
            return (
              <Col key={index} xl='4' md='6 xl-6'>
                <PropertyBox data={item} />
              </Col>
            );
          })}
      </Row>
    </Col>
  );
};

export default FavouriteProperties;
