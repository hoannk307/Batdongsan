import PropertyBox from "@/components/Common/Propertybox/PropertyBox";
import { getData } from "@/components/utils/getData";
import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";

const FALLBACK_API_URL = "http://localhost:3000/api";

const CondominiumList = () => {
  const [Condominiumdata, setCondominiumdata] = useState();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || FALLBACK_API_URL;

  useEffect(() => {
    if (!apiBaseUrl) {
      console.warn("API_URL is not defined. Cannot fetch properties.");
      return;
    }

    getData(`${apiBaseUrl}/properties`)
      .then((resp) => {
        const list = resp?.data?.data || [];
        setCondominiumdata(list);
      })
      .catch((error) => console.error("Error", error));
  }, [apiBaseUrl]);

  return (
    <Row className='property-2 row column-sm zoom-gallery property-label property-grid mt-0'>
      {Condominiumdata &&
        Condominiumdata.map((value, index) => {
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
  );
};

export default CondominiumList;
