/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import Category from "@/layout/sidebarLayout/Category";
import PopularTags from "@/layout/sidebarLayout/PopularTags";
import RecentlyAdded from "@/layout/sidebarLayout/RecentlyAdded";
import SearchBar from "@/layout/sidebarLayout/SearchBar";
import Sidebar from "@/layout/sidebarLayout/Sidebar";
import BlogTitle from "./BlogTitle";
import CommentSection from "./CommentSection";
import DetailsProperty from "./DetailsProperty";
import { getData } from "@/utils/getData";
import { useSearchParams } from "next/navigation";

const BodyContent = (props) => {
  const [value, setValue] = useState(props?.initialNews ?? null);
  const searchParams = useSearchParams();
  const id = props?.id || searchParams?.get?.("id");

  useEffect(() => {
    //console.log("----------------sdfasf", props.children);
    if (!id) return;
    // If server already provided the post (for SEO), skip client re-fetch.
    if (props?.initialNews) return;

    // Use the existing endpoint `/api/news` and pass `id` via query string.
    getData(`/api/news?id=${encodeURIComponent(id)}`)
      .then((res) => setValue(res.data))
      .catch((error) => console.error("Error fetching news data:", error));
  }, [id, props?.initialNews]);

  return (
    <section className="ratio_40">
      <Container>
        <Row>
          <Col xl={props.side ? "9" : "12"} lg={props.side ? "8" : ""} className=" order-lg-1">
            <div className="blog-single-detail theme-card">
              {props.children}
              <BlogTitle news={value} />

              <DetailsProperty news={value} />
            </div>
          </Col>
          {props.side && (
            <Sidebar side={props.side}>
              <SearchBar />
              <Category />
              <PopularTags tags={value?.tags} />
            </Sidebar>
          )}
        </Row>
      </Container>
    </section>
  );
};

export default BodyContent;
