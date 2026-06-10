"use client";

import React from "react";
import { Container, Row, Col, Card, CardBody } from "reactstrap";
import Breadcrumb from "@/components/Common/Breadcrumb";
import BookingDashboard from "@/components/booking/BookingDashboard";

export default function BookingDashboardPage() {
  return (
    <Container fluid>
      <Breadcrumb title="Dashboard Booking" parent="Booking" />
      <Row>
        <Col>
          <Card>
            <CardBody>
              <BookingDashboard />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
