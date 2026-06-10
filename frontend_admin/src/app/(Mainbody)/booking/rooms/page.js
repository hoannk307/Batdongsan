"use client";

import React from "react";
import { Container, Row, Col, Card, CardBody } from "reactstrap";
import Breadcrumb from "@/components/Common/Breadcrumb";
import RoomList from "@/components/booking/RoomList";

export default function BookingRoomsPage() {
  return (
    <Container fluid>
      <Breadcrumb title="Quản lý phòng" parent="Booking" />
      <Row>
        <Col>
          <Card>
            <CardBody>
              <RoomList />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
