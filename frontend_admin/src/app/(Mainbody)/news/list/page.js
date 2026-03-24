"use client";

import React, { Fragment } from "react";
import { Card, CardBody, CardHeader, Col, Container, Row } from "reactstrap";
import Breadcrumb from "@/components/Common/Breadcrumb";
import NewsList from "@/components/news/NewsList";

export default function NewsListPage() {
  return (
    <Fragment>
      <Breadcrumb title="News List" titleText="Welcome to admin panel" parent="News" />
      <Container fluid={true}>
        <Row>
          <Col lg="12">
            <Card className="card">
              <CardHeader className="card-header pb-0">
                <h5>News</h5>
              </CardHeader>
              <CardBody className="card-body">
                <NewsList />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
}

