"use client";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { DataTable } from "@/data/payments/tabledata";
import { Fragment } from "react";
import { Badge, Card, CardBody, CardHeader, Col, Container, Row, Table } from "reactstrap";

const Payments = () => {
  return (
    <Fragment>
      <Breadcrumb title='Payments' titleText='Welcome to admin panel' parent='Payments' />
      <Container fluid={true}>
        <Row>
          <Col lg='12'>
            <Card className='card'>
              <CardHeader className='pb-0 card-header'>
                <h5>Payment lists</h5>
              </CardHeader>
              <CardBody className='card-body payment-table'>
                <div id='batchDelete' className='transactions table-responsive'>
                  <Table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Property Name</th>
                        <th>Rates</th>
                        <th>Deposit</th>
                        <th>Type</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DataTable &&
                        DataTable.map((item, i) => {
                          return (
                            <tr key={i}>
                              <td>{item.id}</td>
                              <td>{item.Property_Name}</td>
                              <td>{item.Date}</td>
                              <td>{item.Rates}</td>
                              <td>{item.Deposit}</td>
                              <td>{item.Type}</td>
                              <td>
                                <Badge color={`${item.Status === "Pending" ? "danger" : "success"}`}>{item.Status}</Badge>
                              </td>
                              <td>{item.Amount}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </Table>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default Payments;
