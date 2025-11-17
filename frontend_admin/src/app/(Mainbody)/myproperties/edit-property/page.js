"use client";
import Breadcrumb from '@/components/Common/Breadcrumb'
import EditPropertyForm from '@/components/myproperties/editProperty/EditPropertyForm'
import React, { Fragment } from 'react'
import { Card, CardBody, CardHeader, Col, Container, Row } from 'reactstrap'
 

const EditProperty = () => {
    return (
        <Fragment>
            <Breadcrumb title='Edit Property' titleText='Welcome to admin panel' parent='My properties' />
            <Container fluid={true}>
                <Row>
                    <Col lg='12'>
                        <Card className="card">
                            <CardHeader className="card-header pb-0">
                                <h5>Edit property details</h5>
                            </CardHeader>
                            <CardBody className="card-body admin-form">
                                <EditPropertyForm />
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>

        </Fragment>
    )
}

export default EditProperty