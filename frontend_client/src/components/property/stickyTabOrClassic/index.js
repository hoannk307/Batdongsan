/**
 * It returns a section with a container with a row with a sidebar and a single property section
 * @returns The return statement is used to return a value from a function.
 */
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Container, Row } from "reactstrap";
import ContactInfo from "../../../layout/sidebarLayout/ContactInfo";
import Exploration from "../../../layout/sidebarLayout/Exploration";
import Featured from "../../../layout/sidebarLayout/Featured";
import Filter from "../../../layout/sidebarLayout/Filter";
import Mortgage from "../../../layout/sidebarLayout/Mortgage";
import RecentlyAdded from "../../../layout/sidebarLayout/RecentlyAdded";
import Sidebar from "../../../layout/sidebarLayout/Sidebar";
import NoSsr from "../../../utils/NoSsr";
import { getData } from "../../../utils/getData";
import RelatedProperty from "./RelatedProperty";
import SinglePropertySection from "./SingleProperty";
import SliderBreadcrumbSection from "./SliderBreadcrumb";

const BodyContent = ({ side }) => {
  const [singleData, setSingleData] = useState(null);
  const [userData, setUserData] = useState(null);
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  useEffect(() => {
    if (id) {
      getData(`/api/batdongsan/${id}`)
        .then((res) => {
          const propertyObj = res?.data?.data ?? null;
          console.log("[SingleProperty] Loaded:", propertyObj);
          setSingleData(propertyObj);

          // Lấy thông tin chi tiết user (chủ bất động sản)
          if (propertyObj?.user_id) {
            fetch(`/api/user/${propertyObj.user_id}`)
              .then((r) => r.json())
              .then((userRes) => {
                setUserData(userRes?.data ?? null);
                console.log("[SingleProperty] User:", userRes?.data);
              })
              .catch(() => { });
          }

          // Tăng lượt xem +1 qua proxy route (fire-and-forget, không block UI)
          fetch("/api/batdongsan/view", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
          }).catch(() => { }); // im lặng nếu lỗi
        })
        .catch((error) =>
          console.error("Error fetching property data:", error)
        );
    }
  }, [id]);

  return (
    <NoSsr>
      <SliderBreadcrumbSection singleData={singleData} />
      <section className="single-property">
        <Container>
          <Row className=" ratio_65">
            <Sidebar mortgage={true} side={side} singleProperty={true}>
              <ContactInfo userData={userData} />
              <Exploration userData={userData} singleData={singleData} />
            </Sidebar>
            <SinglePropertySection singleData={singleData} />
          </Row>
        </Container>
      </section>
      <RelatedProperty />
    </NoSsr>
  );
};

export default BodyContent;
