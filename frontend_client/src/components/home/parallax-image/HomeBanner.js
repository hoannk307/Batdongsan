import Link from "next/link";
import React, { Fragment, useState } from "react";
import { MapPin } from "react-feather";
import { useDispatch } from "react-redux";
import {
  Col,
  Container,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
} from "reactstrap";

const HomeBannerSection = () => {
  const [toggle, setToggle] = useState(false);
  const [dropDownInput, setDropDownInput] = useState("Apartment");
  const dispatch = useDispatch();

  return (
    <section className="parallax-home video-layout">
      <div className="parallax-right" aria-hidden="true">
        <img
          src="/assets/images/layout/nhatrang.png"
          alt=""
          className="img-fluid"
        />
      </div>
      <Container>
        <Row className="justify-content-end">
          <Col lg="7" md="9" className="ms-auto">
            <div className="parallax-content text-end">
              <div className="box text-affect" style={{ width: '600px' }}>
                <div className="title">
                  <span className="block"></span>
                  <p style={{ fontSize: '30px', fontWeight: 'bold', color: '#FFF' }}>
                    NHA TRANG
                  </p>
                </div>
                <div className="role">
                  <div className="block"></div>
                  <p className="font-roboto" style={{ fontSize: '24px', color: '#FFF' }}>Điểm đến đầu tư, nơi an cư lý tưởng</p>
                </div>
              </div>
              <form className="video-search">
                <div className="input-group">
                  <span className="input-group-text" id="basic-addon1">
                    <MapPin />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search location"
                    aria-describedby="basic-addon1"
                  />
                </div>
                <Dropdown isOpen={toggle} toggle={() => setToggle(!toggle)}>
                  <DropdownToggle className="font-roboto">
                    <Fragment>
                      {dropDownInput}
                      <i className="fas fa-angle-down"></i>
                    </Fragment>
                  </DropdownToggle>
                  <DropdownMenu className=" text-start">
                    <DropdownItem
                      onClick={() => {
                        setDropDownInput("Any property type");
                        dispatch({
                          type: "propertyType",
                          payload: "Property Type",
                        });
                      }}
                    >
                      <Fragment>Any property type</Fragment>
                    </DropdownItem>
                    <DropdownItem
                      onClick={() => {
                        setDropDownInput("Office");
                        dispatch({
                          type: "propertyType",
                          payload: "Offices",
                        });
                      }}
                    >
                      <Fragment>Office</Fragment>
                    </DropdownItem>
                    <DropdownItem
                      onClick={() => {
                        setDropDownInput("Apartment");
                        dispatch({
                          type: "propertyType",
                          payload: "Apartment",
                        });
                      }}
                    >
                      <Fragment>Apartment</Fragment>
                    </DropdownItem>
                    <DropdownItem
                      onClick={() => {
                        setDropDownInput("House");
                        dispatch({
                          type: "propertyType",
                          payload: "Town House",
                        });
                      }}
                    >
                      <Fragment>House</Fragment>
                    </DropdownItem>
                    <DropdownItem
                      onClick={() => {
                        setDropDownInput("Villa");
                        dispatch({ type: "propertyType", payload: "Villa" });
                      }}
                    >
                      <Fragment>Villa</Fragment>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>

                <div>
                  <Link
                    href="/listing/list-view/listing/left-sidebar"
                    className="btn btn-solid btn-flat"
                  >
                    Search
                  </Link>
                </div>
              </form>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default HomeBannerSection;
