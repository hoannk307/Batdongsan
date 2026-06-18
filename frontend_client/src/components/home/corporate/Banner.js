/**
 * It returns a section with a container, row, and column. The column contains a div with a span, h2,
 * p, and a link
 * @returns A function that returns a component
 */
import Link from "next/link";
import React from "react";
import { Col, Container, Row } from "reactstrap";

const BannerSection = ({ banner, value }) => {
  return (

    <section className={`mt-5 banner-section  parallax-image`} style={{ backgroundImage: `url(${value?.img})` }}>
      <Container>
        <Row>
          <Col>
            <div className="banner-3">
              <span className={`label label-light label-flat`}>Quảng cáo</span>
              <h2>
                {value?.title}
              </h2>
              <p>
                {value?.summary}
              </p>
              <Link href={`/news/detail2?id=${value?.id}`} className="btn btn-solid btn-flat">
                Xem thêm
              </Link>
            </div>
          </Col>
        </Row>
      </Container>
    </section>

  );
};

export default BannerSection;
