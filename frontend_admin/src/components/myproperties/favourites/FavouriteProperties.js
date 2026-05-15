import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import PropertyBox from "@/components/Common/Propertybox/PropertyBox";
import { getData } from "@/components/utils/getData";
import { API_BASE_URL } from "@/config/apiConfig";

const FavouriteProperties = () => {
  const [propertyList, setPropertyList] = useState();
  const apiBaseUrl = API_BASE_URL;

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
