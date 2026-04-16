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
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  useEffect(() => {
    if (id) {
      getData(`/api/batdongsan?id=${id}`)
        .then((res) => {
          // API trả về: { data: { img, title, price, bed, bath, ... } }
          // res.data = axios response data = { data: { ... } }
          // res.data.data = object property thực
          const propertyObj = res?.data?.data ?? res?.data ?? null;
          console.log("[SingleProperty] Loaded:", propertyObj);
          setSingleData(propertyObj);

          // Tăng lượt xem +1 (fire-and-forget, không block UI)
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL ||
            'http://localhost:3000/api';
          fetch(`${backendUrl}/properties/${id}/view`, { method: 'PATCH' })
            .catch(() => { }); // im lặng nếu backend offline
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
              <ContactInfo />
              <Exploration />
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
