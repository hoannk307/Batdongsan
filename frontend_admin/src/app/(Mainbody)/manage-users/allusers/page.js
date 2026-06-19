"use client";

import React, { Fragment } from "react";
import { Card, CardBody, CardHeader, Col, Container, Row } from "reactstrap";
import Breadcrumb from "@/components/Common/Breadcrumb";
import UsersList from "@/components/manageuser/UsersList";

const AllUsers = () => {
  return (
    <Fragment>
      <Breadcrumb title="All Users" titleText="Welcome To Admin panel" parent="Manage users" />
      <Container fluid={true}>
        <Row>
          <Col lg="12">
            <Card className="card">
              <CardHeader className="card-header pb-0">
                <h5>Danh sách User</h5>
              </CardHeader>
              <CardBody className="card-body">
                <UsersList />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default AllUsers;
