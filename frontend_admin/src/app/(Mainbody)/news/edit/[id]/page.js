"use client";
import React, { Fragment, useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Col, Container, Row } from "reactstrap";
import Breadcrumb from "@/components/Common/Breadcrumb";
import NewsForm from "@/components/news/NewsForm";
import { fetchNewsById } from "@/components/news/newsApi";
import { toast } from "react-toastify";
import { useParams } from "next/navigation";

const tinymceApiKey = process.env.NEXT_PUBLIC_TINYMCE_API_KEY;

export default function EditNewsPage() {
  const params = useParams();
  const id = params?.id;
  const [news, setNews] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchNewsById(id)
        .then(setNews)
        .catch((error) => {
          const messageFromApi = error?.response?.data?.message;
          const errorMessage = Array.isArray(messageFromApi)
            ? messageFromApi.join(", ")
            : messageFromApi || "Không thể tải bài viết.";
          setError(errorMessage);
          toast.error(errorMessage);
        });
    }
  }, [id]);

  return (
    <Fragment>
      <Breadcrumb title="Edit News" titleText="Welcome to admin panel" parent="News" />
      <Container fluid={true}>
        <Row>
          <Col lg="12">
            <Card className="card">
              <CardHeader className="card-header pb-0">
                <h5>Edit news</h5>
              </CardHeader>
              <CardBody className="card-body admin-form">
                {error ? (
                  <div className="alert alert-warning" role="alert">
                    {error}
                  </div>
                ) : news ? (
                  <NewsForm mode="edit" newsId={news.id} initialValues={news} tinymceApiKey={tinymceApiKey} />
                ) : null}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
}

