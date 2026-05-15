import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import PropertyBox from "@/components/Common/Propertybox/PropertyBox";
import { getData } from "@/components/utils/getData";
import { API_BASE_URL } from "@/config/apiConfig";

const AppartmentList = () => {
  const [appartmentdata, setAppartmentdata] = useState();
  const apiBaseUrl = API_BASE_URL;

  useEffect(() => {
    if (!apiBaseUrl) {
      console.warn("API_URL is not defined. Cannot fetch properties.");
      return;
    }

    getData(`${apiBaseUrl}/properties`)
      .then((response) => {
        const list = response?.data?.data || [];
        setAppartmentdata(list);
      })
      .catch((error) => console.error("Error", error));
  }, [apiBaseUrl]);

  return (
    <Col xl='12'>
      <Row className='property-2 row column-sm zoom-gallery property-label property-grid mt-0'>
        {appartmentdata &&
          appartmentdata.map((value, index) => {
            return (
              <Col key={index} xl='4' md='6 xl-6'>
                <PropertyBox data={value} />
              </Col>
            );
          })}
        <nav className='theme-pagination'>
          <ul className='pagination d-flex justify-content-center'>
            <li className='page-item'>
              <a href='#' className='page-link' aria-label='Previous'>
                <span aria-hidden='true'>«</span>
                <span className='sr-only'>Previous</span>
              </a>
            </li>
            <li className='page-item active'>
              <a href='#' className='page-link'>
                1
              </a>
            </li>
            <li className='page-item'>
              <a href='#' className='page-link'>
                2
              </a>
            </li>
            <li className='page-item'>
              <a href='#' className='page-link'>
                3
              </a>
            </li>
            <li className='page-item'>
              <a href='#' className='page-link' aria-label='Next'>
                <span aria-hidden='true'>»</span>
                <span className='sr-only'>Next</span>
              </a>
            </li>
          </ul>
        </nav>
      </Row>
    </Col>
  );
};

export default AppartmentList;
