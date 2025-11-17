"use client";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import React, { useState } from "react";
import { Lock, Mail, User } from "react-feather";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Img from "@/components/Common/Image";
import { useRouter } from "next/navigation";

const SignUp = () => {
  const [showpassword, setShowpassword] = useState(false);
  const router = useRouter();
  return (
    <div className='authentication-box'>
      <Container fluid={true}>
        <Row className='log-in'>
          <Col xxl='3' xl='4' lg='5' md='6' sm='8' className='form-login'>
            <Card className='card'>
              <CardBody className='card-body'>
                <div className='title-3 text-start'>
                  <h2>Sign up</h2>
                </div>
                <Formik
                  initialValues={{
                    name: "",
                    email: "",
                    password: "",
                  }}
                  validationSchema={Yup.object().shape({
                    name: Yup.string().required("Name is Required..!"),
                    email: Yup.string().required("Enter valid Email..!"),
                    password: Yup.string().required("Password is required..!"),
                  })}
                  onSubmit={(values) => {
                    values && localStorage.setItem("user", JSON.stringify(values));
                    router.push("/authentication/login");
                  }}
                >
                  {({ errors, touched }) => (
                    <Form>
                      <div className='form-group'>
                        <div className='input-group'>
                          <div className='input-group-prepend'>
                            <User size={20} />
                          </div>
                          <Field type='text' name='name' className={`form-control ${errors.name && touched.name ? "is-invalid" : ""}`} placeholder='Enter your name' />
                        </div>
                        {errors.name && touched.name && <div className='text-danger ms-4'>{errors.name}</div>}
                      </div>
                      <div className='form-group'>
                        <div className='input-group'>
                          <div className='input-group-prepend'>
                            <Mail size={20} />
                          </div>
                          <Field type='email' className={`form-control ${errors.email && touched.email ? "is-invalid" : ""}`} name='email' placeholder='Enter email address' />
                        </div>
                        {errors.email && touched.email && <div className='text-danger ms-4'>{errors.email}</div>}
                      </div>
                      <div className='form-group'>
                        <div className='input-group'>
                          <div className='input-group-prepend'>
                            <Lock size={20} />
                          </div>
                          <Field type={`${showpassword ? "text" : "password"}`} name='password' id='pwd-input' className={`form-control ${errors.password && touched.password ? "is-invalid" : ""}`} placeholder='Password' />
                          <div className='input-group-apend'>
                            <i
                              id='pwd-icon'
                              className={`far fa-eye${!showpassword ? "-slash" : ""}`}
                              onClick={() => {
                                setShowpassword(!showpassword);
                              }}
                            />
                          </div>
                        </div>
                        {errors.password && touched.password && <div className='text-danger ms-4'>{errors.password}</div>}
                        <div className='important-note'>password should be a minimum of 8 characters and should contains letters and numbers</div>
                      </div>
                      <div>
                        <button type='submit' className='btn btn-gradient btn-pill me-sm-3 me-2'>
                          Create Account
                        </button>
                        <Link href='/authentication/login' className='btn btn-dashed btn-pill'>
                          Log in
                        </Link>
                      </div>
                    </Form>
                  )}
                </Formik>
                <div className='divider'>
                  <h6>or</h6>
                </div>
                <div>
                  <h6>Sign up with</h6>
                  <Row className='social-connect'>
                    <Col sm='6'>
                      <Link href='https://www.facebook.com/' className='btn btn-social btn-flat facebook p-0'>
                        <i className='fab fa-facebook-f' />
                        <span>Facebook</span>
                      </Link>
                    </Col>
                    <Col sm='6'>
                      <Link href='https://twitter.com/' className='btn btn-social btn-flat twitter p-0'>
                        <i className='fab fa-twitter' />
                        <span>Twitter</span>
                      </Link>
                    </Col>
                    <Col sm='6'>
                      <Link href='https://accounts.google.com/' className='btn btn-social btn-flat google p-0'>
                        <i className='fab fa-google' />
                        <span>Google</span>
                      </Link>
                    </Col>
                    <Col sm='6'>
                      <Link href='https://www.linkedin.com/' className='btn btn-social btn-flat linkedin p-0'>
                        <i className='fab fa-linkedin-in' />
                        <span>Linkedin</span>
                      </Link>
                    </Col>
                  </Row>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col xxl='7' xl='7' lg='6' className='offset-xxl-1 auth-img bg-size'>
            <Img src={`/assets/images/svg/2.jpg`} alt='' className='bg-img' />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SignUp;

SignUp.getLayout = function getLayout(SignUp) {
  return <>{SignUp}</>;
};
