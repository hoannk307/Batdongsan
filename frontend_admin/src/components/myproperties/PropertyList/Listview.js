import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import PropertyBox from "../../Common/Propertybox/PropertyBox";
import { getData } from "../../utils/getData";
import usePagination from "../../utils/usePagination";

const FALLBACK_API_URL = "http://localhost:3000/api";

const Listview = () => {
  const [value, setValue] = useState();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || FALLBACK_API_URL;

  useEffect(() => {
    if (!apiBaseUrl) {
      console.warn("API_URL is not defined. Cannot fetch properties.");
      return;
    }


    getData(`${apiBaseUrl}/properties`)
      .then((res) => {
        const list = res?.data?.data || [];
        setValue(list);
      })
      .catch((error) => console.error("error fetching properties", error));
  }, [apiBaseUrl]);

  const [Pagination, data] = usePagination(value && value);
  return (
    <div className='col-xl-12'>
      <Row className='property-2 column-sm property-label property-grid'>
        {data &&
          data.map((item, i) => {
            return (
              <Col xl='4' md='6 xl-6' key={i}>
                <PropertyBox data={item} />
              </Col>
            );
          })}
      </Row>
      <Pagination />
    </div>
  );
};

export default Listview;
