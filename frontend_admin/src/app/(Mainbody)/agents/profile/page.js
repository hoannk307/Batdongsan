"use client";
import { Fragment } from "react";
import { Col, Container, Row } from "reactstrap";
import dynamic from "next/dynamic";
import Breadcrumb from "@/components/Common/Breadcrumb";
import ProfileDetail from "@/components/agents/profile/ProfileDetail";
import { AgentAbout } from "@/data/agents/profiledata";

// Dynamically import components with SSR disabled
const Agentchart = dynamic(() => import("@/components/agents/profile/Agentchart"), { ssr: false });
const ProjectMeeting = dynamic(() => import("@/components/agents/profile/ProjectMeeting"), { ssr: false });
const About = dynamic(() => import("@/components/manageuser/profile/About"), { ssr: false });
const Following = dynamic(() => import("@/components/manageuser/profile/Following"), { ssr: false });
const RecentChart = dynamic(() => import("@/components/manageuser/profile/RecentChart"), { ssr: false });
const RecentProperty = dynamic(() => import("@/components/manageuser/profile/RecentProperty"), { ssr: false });

const Profile = () => {
  return (
    <Fragment>
      <Breadcrumb title="Agent profile" titleText="Welcome to admin panel" parent="Agents" />
      <Container fluid={true}>
        <Row>
          <Col lg="12">
            <Row className="user-info">
              <ProfileDetail />
              <Col xl="3" lg="6" md="6" className="follow-list-item">
                <Following />
              </Col>
              <Col xl="4" lg="6" md="6">
                <About Aboutdata={AgentAbout} />
              </Col>
              <ProjectMeeting />
              <Col xl="6" lg="12" md="7">
                <RecentProperty />
                <RecentChart />
              </Col>
              <Col xl="3" lg="6" md="12">
                <Agentchart />
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default Profile;
