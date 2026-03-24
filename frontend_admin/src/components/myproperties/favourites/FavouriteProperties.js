import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import PropertyBox from "@/components/Common/Propertybox/PropertyBox";
import { getData } from "@/components/utils/getData";

const FALLBACK_API_URL = "http://localhost:3000/api";

const FavouriteProperties = () => {
  const [propertyList, setPropertyList] = useState();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || FALLBACK_API_URL;

  useEffect(() => {
    if (!apiBaseUrl) {
      console.warn("API_URL is not defined. Cannot fetch properties.");
      return;
    }

    getData(`${apiBaseUrl}/properties`)
      .then((res) => {
        const list = res?.data?.data || [];
        setPropertyList(list);
      })
      .catch((error) => console.error("Error", error));
  }, [apiBaseUrl]);

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
