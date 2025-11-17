"use client";
import Breadcrumb from '@/components/Common/Breadcrumb'
import AddUserForm from '@/components/manageuser/adduser/AddUserForm'
import React, { Fragment } from 'react'
import { Card, CardBody, CardHeader, Col, Container, Row } from 'reactstrap'

const AddUser = () => {
    return (
        <Fragment>
            <Breadcrumb title='Add user' titleText='Welcome To Admin Panel' parent='Manage Users' />
            <Container fluid={true}>
                <Row>
                    <Col lg='12'>
                        <Card className="card">
                            <CardHeader className="card-header pb-0">
                                <h5>Add user details</h5>
                            </CardHeader>
                            <CardBody className="card-body admin-form">
                                <AddUserForm />
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </Fragment>
    )
}

export default AddUser