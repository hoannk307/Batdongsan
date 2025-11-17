"use client";
import Breadcrumb from "@/components/Common/Breadcrumb";
import PropertyBoxFour from "@/components/Common/Propertybox/PropertyBoxOne";
import { getData } from "@/components/utils/getData";
import React, { Fragment, useEffect, useState } from "react";
import { Col, Container, Row } from "reactstrap";

const AllAgents = () => {
  const [userlist, setUserlist] = useState();
  useEffect(() => {
    getData(`/api/userdata`)
      .then((res) => {
        setUserlist(res.data);
      })
      .catch((error) => {
        console.error("Error", error);
      });
  }, []);
  return (
    <Fragment>
      <Breadcrumb title='All Agents' titleText='welcome to admin panel' parent='Agents' />
      <Container fluid={true}>
        <Row className='agent-section property-section agent-lists'>
          <Col lg='12'>
            <div className='ratio2_3'>
              <Row className='property-2 column-sm property-label property-grid'>
                {userlist &&
                  userlist.map((item, i) => {
                    return (
                      <Col xl='4' sm='6' key={i} className='wow fadeInUp'>
                        <PropertyBoxFour data={item} label={true} />
                      </Col>
                    );
                  })}
              </Row>
            </div>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default AllAgents;
