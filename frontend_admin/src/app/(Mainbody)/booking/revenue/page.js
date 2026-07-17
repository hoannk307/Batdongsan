"use client";

import React from "react";
import { Container, Row, Col, Card, CardBody } from "reactstrap";
import Breadcrumb from "@/components/Common/Breadcrumb";
import BookingRevenue from "@/components/booking/BookingRevenue";

export default function BookingRevenuePage() {
  return (
    <Container fluid>
      <Breadcrumb title="Doanh thu" parent="Booking" />
      <Row>
        <Col>
          <Card>
            <CardBody>
              <BookingRevenue />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
