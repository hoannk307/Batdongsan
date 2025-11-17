"use client";
import React, { Fragment } from 'react';
import dynamic from 'next/dynamic';
import { Container } from 'reactstrap';
import Breadcrumb from '@/components/Common/Breadcrumb';

// Dynamically import components with SSR disabled
const Assigness = dynamic(() => import('@/components/dashboard/Assigness'), { ssr: false });
const Management = dynamic(() => import('@/components/dashboard/Management'), { ssr: false });
const ProjectTimeline = dynamic(() => import('@/components/dashboard/ProjectTimeline'), { ssr: false });
const Properies = dynamic(() => import('@/components/dashboard/Properies'), { ssr: false });
const Properylist = dynamic(() => import('@/components/dashboard/Properylist'), { ssr: false });
const SalaryChart = dynamic(() => import('@/components/dashboard/SalaryChart'), { ssr: false });
const Soldout = dynamic(() => import('@/components/dashboard/Soldout'), { ssr: false });
const Status = dynamic(() => import('@/components/dashboard/Status'), { ssr: false });

const Dashboard = () => {
    return (
        <Fragment>
            <Breadcrumb title='Dashboard' titleText='Welcome To Admin Panel' parent='Dashboard' />
            <Container fluid={true}>
                <div className="row">
                    <Properies />
                    <SalaryChart />
                    <Status />
                    <ProjectTimeline />
                    <Assigness />
                    <Properylist />
                    <Management />
                    <Soldout />
                </div>
            </Container>
        </Fragment>
    )
}

export default Dashboard;
