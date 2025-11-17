"use client";
import dynamic from "next/dynamic";
import React, { Fragment } from "react";
import { Container, Row } from "reactstrap";
import world from "../../../data/map/world.json";
import Breadcrumb from "@/components/Common/Breadcrumb";

// Dynamically import components with SSR disabled
const VectorMap = dynamic(() => import("@south-paw/react-vector-maps").then((mod) => mod.VectorMap), { ssr: false });
const SalaryChart = dynamic(() => import("@/components/dashboard/SalaryChart"), { ssr: false });
const Management = dynamic(() => import("@/components/dashboard/Management"), { ssr: false });
const Revenuechart = dynamic(() => import("@/components/Report/Revenuechart"), { ssr: false });
const PropertySale = dynamic(() => import("@/components/Report/PropertySale"), { ssr: false });
const RecentTransaction = dynamic(() => import("@/components/Report/RecentTransaction"), { ssr: false });
const IncomeChart = dynamic(() => import("@/components/Report/IncomeChart"), { ssr: false });

const Report = () => {
  return (
    <Fragment>
      <Breadcrumb title="Reports" titleText="Welcome to admin panel" parent="Reports" />
      <Container fluid={true}>
        <Row className="report-summary">
          <SalaryChart />
          <Management />
          <Revenuechart />
          <PropertySale />
          <div className="col-xl-6">
            <IncomeChart />
          </div>
          <div className="col-xl-6">
            <div className="card">
              <div className="card-header">
                <h5>Visitors Location</h5>
              </div>
              <div className="card-body">
                <VectorMap {...world} style={{ fill: "#F34451" }} className="simplemap" id="world-map" />
              </div>
            </div>
          </div>
          <RecentTransaction />
        </Row>
      </Container>
    </Fragment>
  );
};

export default Report;
