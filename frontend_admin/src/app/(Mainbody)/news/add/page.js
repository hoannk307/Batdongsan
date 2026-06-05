import React, { Fragment } from "react";
import { Card, CardBody, CardHeader, Col, Container, Row } from "reactstrap";
import Breadcrumb from "@/components/Common/Breadcrumb";
import NewsForm from "@/components/news/NewsForm";

const tinymceApiKey = process.env.NEXT_PUBLIC_TINYMCE_API_KEY;

export default function AddNewsPage() {
  return (
    <Fragment>
      <Breadcrumb title="Add News" titleText="Welcome to admin panel" parent="News" />
      <Container fluid={true}>
        <Row>
          <Col lg="12">
            <Card className="card">
              <CardHeader className="card-header pb-0">
                <h5>Add news</h5>
              </CardHeader>
              <CardBody className="card-body admin-form">
                <NewsForm tinymceApiKey={tinymceApiKey} />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
}

