"use client";
import React, { Fragment, useEffect, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import Breadcrumb from "@/components/Common/Breadcrumb";
import PropertyBoxFour from "@/components/Common/Propertybox/PropertyBoxOne";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "@/config/apiConfig";

const AllUsers = () => {
  const [userlist, setUserlist] = useState([]);
  const apiBaseUrl = API_BASE_URL;

  useEffect(() => {
    if (!apiBaseUrl) {
      toast.error("API_URL chưa được cấu hình.");
      return;
    }

    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${apiBaseUrl}/users`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        const rawUsers = res?.data || [];
        const mappedUsers = rawUsers.map((user) => ({
          img: user.avatar || "/assets/images/avatar/5.jpg",
          properties: "",
          label: false,
          name: user.full_name || user.username || user.email,
          mobile: user.phone || "",
          mail: user.email,
          pinCode: String(user.id),
        }));

        setUserlist(mappedUsers);
      } catch (error) {
        const messageFromApi = error?.response?.data?.message;
        const normalizedMessage = Array.isArray(messageFromApi)
          ? messageFromApi.join(", ")
          : messageFromApi;
        toast.error(normalizedMessage || "Không thể tải danh sách user.");
        console.error("Error", error);
      }
    };

    fetchUsers();
  }, [apiBaseUrl]);

  return (
    <Fragment>
      <Breadcrumb title='All Users' titleText='Welcome To Admin panel' parent='Manage users' />
      <Container fluid={true}>
        <Row className='agent-section property-section user-lists'>
          <Col lg='12'>
            <div className='property-grid-3 agent-grids ratio2_3'>
              <Row className='property-2 column-sm property-label property-grid list-view'>
                {userlist &&
                  userlist.map((item, i) => {
                    return (
                      <Col md='12' xl='6' key={i}>
                        <PropertyBoxFour data={item} label={false} />
                      </Col>
                    );
                  })}
              </Row>
            </div>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default AllUsers;
