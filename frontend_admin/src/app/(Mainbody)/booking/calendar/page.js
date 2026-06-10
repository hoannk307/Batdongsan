"use client";

import React from "react";
import { Container, Row, Col, Card, CardBody } from "reactstrap";
import Breadcrumb from "@/components/Common/Breadcrumb";
import BookingCalendar from "@/components/booking/BookingCalendar";

export default function BookingCalendarPage() {
  return (
    <Container fluid>
      <Breadcrumb title="Lịch đặt phòng" parent="Booking" />
      <Row>
        <Col>
          <Card>
            <CardBody>
              <BookingCalendar />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
