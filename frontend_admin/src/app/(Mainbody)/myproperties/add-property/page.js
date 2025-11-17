"use client";
import React, { Fragment } from "react";
import { Card, CardBody, CardHeader, Col, Container, Row } from "reactstrap";
import AddPropertyForm from "@/components/myproperties/addProperty/AddPropertyForm";
import Breadcrumb from "@/components/Common/Breadcrumb";

const AddProperty = () => {
  return (
    <Fragment>
      <Breadcrumb title='Add Property' titleText='Welcome to admin panel' parent='My Properties' />
      <Container fluid={true} className='container-fluid'>
        <Row>
          <Col lg='12'>
            <Card className='card'>
              <CardHeader className='card-header pb-0'>
                <h5>Add property details</h5>
              </CardHeader>
              <CardBody className='card-body admin-form'>
                <AddPropertyForm />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default AddProperty;
