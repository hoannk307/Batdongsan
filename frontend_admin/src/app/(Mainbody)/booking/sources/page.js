"use client";

import React from "react";
import { Container, Row, Col, Card, CardBody } from "reactstrap";
import Breadcrumb from "@/components/Common/Breadcrumb";
import SourceList from "@/components/booking/SourceList";

export default function BookingSourcesPage() {
  return (
    <Container fluid>
      <Breadcrumb title="Nguồn khách hàng" parent="Booking" />
      <Row>
        <Col>
          <Card>
            <CardBody>
              <SourceList />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
