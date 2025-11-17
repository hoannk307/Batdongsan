import React from "react";
import { ChevronsLeft, Maximize, Search } from "react-feather";
import { Col, FormGroup, Input, Row } from "reactstrap";
import Rightbar from "./rightbar";

const Header = ({ setToggle, toggle }) => {

  const goFull = () => {
    if ((document.fullScreenElement && document.fullScreenElement !== null) ||
      (!document.mozFullScreen && !document.webkitIsFullScreen)) {
      if (document.documentElement.requestFullScreen) {
        document.documentElement.requestFullScreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullScreen) {
        document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
      }
    } else {
      if (document.cancelFullScreen) {
        document.cancelFullScreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      }
    }
  }
  return (
    <>
      <Row className={`page-main-header ${!toggle ? 'close_icon' : ''}`}>
        <Col id="sidebar-toggle" className="toggle-sidebar col-auto">
          <ChevronsLeft size={18} onClick={() => setToggle(!toggle)} />
        </Col>
        <Col className="nav-right p-0">
          <ul className="header-menu">
            <li>
              <div className="d-md-none mobile-search">
                <Search />
              </div>
              <FormGroup className="form-group search-form">
                <Input type="text" className="form-control" placeholder="Search here..." />
              </FormGroup>
            </li>
            <li>
              <Maximize onClick={goFull} />
            </li>
            <Rightbar />
          </ul>
        </Col>
      </Row>
    </>
  );
};

export default Header;
