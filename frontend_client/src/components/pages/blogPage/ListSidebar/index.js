"use client";
import React, { useEffect, useReducer, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import Pagination from "@/layout/Pagination";
import Category from "@/layout/sidebarLayout/Category";
import SearchBar from "@/layout/sidebarLayout/SearchBar";
import Sidebar from "@/layout/sidebarLayout/Sidebar";
import BlogWrapBoxTwo from "../../../elements/propertyBoxs/BlogWrapBoxTwo";
import { gridReducer, initialGrid } from "../../../listing/gridView/grid/gridReducer";

const BodyContent = ({ side, tagId, filterType, initialCategories = [], initialNews = [] }) => {
  const [value, setValue] = useState(initialNews);
  const [categories, setCategories] = useState(initialCategories);
  const [grid, gridDispatch] = useReducer(gridReducer, initialGrid);

  useEffect(() => {
    setValue(initialNews);
    setCategories(initialCategories);
    gridDispatch({ type: "totalPages", payload: Math.ceil(initialNews.length / 4) });
  }, [initialNews, initialCategories]);

  return (
    <section className="ratio_landscape blog-list-section">
      <Container>
        <Row>
          {side && (
            <Sidebar side={side}>
              <SearchBar />
              <Category categories={categories} />
            </Sidebar>
          )}
          <Col xl={side ? "9" : "12"} lg={side ? "8" : "12"}>
            <Row className="blog-list ">
              {value &&
                value.slice(grid.toPage * 4 - 4, grid.toPage * 4).map((data, i) => (
                  <Col md="12" key={i}>
                    <BlogWrapBoxTwo data={data} />
                  </Col>
                ))}
            </Row>
            <Pagination toPage={grid.toPage} gridDispatch={gridDispatch} totalPages={grid.totalPages} />
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default BodyContent;
