/**
 * It takes an array of data and returns a row of columns with the data
 * @returns An array of objects.
 */
import React from "react";
import { Col, Row } from "reactstrap";

const AboutDeskBox = ({ singleData }) => {

  return (
    <div className='about page-section' id='about'>
      <h4>Giới thiệu</h4>
      <Row>
        <Col sm='12'>
          <p>{singleData?.description}</p>
        </Col>
      </Row>
    </div>
  );
};

export default AboutDeskBox;
