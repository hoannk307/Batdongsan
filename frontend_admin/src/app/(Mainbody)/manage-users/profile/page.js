"use client";
import React, { Fragment } from 'react';
import { Col, Container, Row } from 'reactstrap';
import dynamic from 'next/dynamic';
import Breadcrumb from '@/components/Common/Breadcrumb';
import { Aboutdata } from '@/data/manage-profile/profiledata';

// Dynamically import components with SSR disabled
const About = dynamic(() => import('@/components/manageuser/profile/About'), { ssr: false });
const Following = dynamic(() => import('@/components/manageuser/profile/Following'), { ssr: false });
const UserChart = dynamic(() => import('@/components/manageuser/profile/UserChart'), { ssr: false });
const Friends = dynamic(() => import('@/components/manageuser/profile/Friends'), { ssr: false });
const RecentProperty = dynamic(() => import('@/components/manageuser/profile/RecentProperty'), { ssr: false });
const RecentChart = dynamic(() => import('@/components/manageuser/profile/RecentChart'), { ssr: false });
const ProfileDetail = dynamic(() => import('@/components/manageuser/profile/ProfileDetail'), { ssr: false });

const Profile = () => {
    return (
        <Fragment>
            <Breadcrumb title="User Profile" titleText="Welcome To Admin Panel" parent="Manage Users" />
            <Container fluid={true}>
                <Row>
                    <Col lg="12">
                        <Row className="user-info">
                            <ProfileDetail />
                            <Col xl="3" lg="12" md="5">
                                <Row className="about-profile">
                                    <Col xl="12" lg="6" className="about-info">
                                        <About Aboutdata={Aboutdata} />
                                    </Col>
                                    <Col xl="12" lg="6" className="about-info">
                                        <Friends />
                                    </Col>
                                </Row>
                            </Col>
                            <Col xl="6" lg="12" md="7">
                                <RecentProperty />
                                <RecentChart />
                            </Col>
                            <Col xl="3" md="12">
                                <Row>
                                    <Col xl="12" md="6" className="buyer-chart">
                                        <UserChart />
                                    </Col>
                                    <Col xl="12" md="6" className="follow-list">
                                        <Following />
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Container>
        </Fragment>
    );
};

export default Profile;
