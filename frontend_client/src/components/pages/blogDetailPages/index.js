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
import { getData } from "@/lib/api/apiRequests";
import { useSearchParams } from "next/navigation";

const BodyContent = (props) => {
  const [value, setValue] = useState(props?.initialNews ?? null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (props?.initialNews) {
      setValue(props.initialNews);
    }
    // Fetch categories
    getData('/api/news/categories')
      .then((res) => {
        setCategories(res?.data || []);
      })
      .catch((error) => console.error("Error fetching categories:", error));

  }, [props?.initialNews]);

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
              <Category categories={categories} />
              <PopularTags tags={value?.tags} />
            </Sidebar>
          )}
        </Row>
      </Container>
    </section>
  );
};

export default BodyContent;
