import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import PropertyBox from "../../Common/Propertybox/PropertyBox";
import { getData } from "../../utils/getData";
import usePagination from "../../utils/usePagination";
import { API_BASE_URL } from "@/config/apiConfig";

const Listview = () => {
  const [value, setValue] = useState();
  const apiBaseUrl = API_BASE_URL;

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
