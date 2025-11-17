"use client";
import Breadcrumb from "@/components/Common/Breadcrumb";
import AppartmentList from "@/components/types/appartmentlist/AppartmentList";
import { Fragment } from "react";
import { Col, Container, Row } from "reactstrap";

const Appartment = () => {
  return (
    <Fragment>
      <Breadcrumb title='Appartment' titleText='Welcome To Admin Panel' parent='Types' />
      <Container fluid={true}>
        <Row>
          <Col lg='12'>
            <div className='property-admin'>
              <div className='property-section section-sm'>
                <Row className='ratio_55 property-grid-2 property-map map-with-back'>
                  <AppartmentList />
                </Row>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default Appartment;
