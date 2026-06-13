"use client";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import React, { useState } from "react";
import { Lock, Mail, Phone, User } from "react-feather";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import { toast } from 'react-toastify';
import Img from "@/components/Common/Image";
import { useRouter } from "next/navigation";
import { postData } from "@/utils/apiRequests";

const SignUp = () => {
  const [showpassword, setShowpassword] = useState(false);
  const router = useRouter();

  const signup = async (values, { setSubmitting }) => {
    try {
      const payload = {
        username: values.name,
        full_name: values.name,
        email: values.email,
        phone: values.phone ? String(values.phone) : undefined,
        password: values.password,
      };
      await postData('/api/auth/register', payload);

      toast.success('Account created successfully');
      router.push('/authentication/login');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      const message = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage;
      toast.error(message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='authentication-box'>
      <Container fluid={true}>
        <Row className='log-in'>
          <Col xxl='3' xl='4' lg='5' md='6' sm='8' className='form-login'>
            <Card className='card'>
              <CardBody className='card-body'>
                <div className='title-3 text-start'>
                  <h2>Đăng ký tài khoản</h2>
                </div>
                <Formik
                  initialValues={{
                    name: "",
                    phone: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                  }}
                  validationSchema={Yup.object().shape({
                    name: Yup.string().required("Name is Required..!"),
                    phone: Yup.string().required("Phone is Required..!"),
                    email: Yup.string().required("Enter valid Email..!"),
                    password: Yup.string().required("Password is required..!"),
                    confirmPassword: Yup.string()
                      .oneOf([Yup.ref('password'), null], 'Mật khẩu nhập lại không khớp!')
                      .required("Confirm password is required..!"),
                  })}
                  onSubmit={signup}
                >
                  {({ errors, touched }) => (
                    <Form>
                      <div className='form-group'>
                        <div className='input-group'>
                          <div className='input-group-prepend'>
                            <User size={20} />
                          </div>
                          <Field type='text' name='name' className={`form-control ${errors.name && touched.name ? "is-invalid" : ""}`} placeholder='Tên đăng nhập' />
                        </div>
                        {errors.name && touched.name && <div className='text-danger ms-4'>{errors.name}</div>}
                      </div>
                      <div className='form-group'>
                        <div className='input-group'>
                          <div className='input-group-prepend'>
                            <Phone size={20} />
                          </div>
                          <Field type='text' name='phone' className={`form-control ${errors.phone && touched.phone ? "is-invalid" : ""}`} placeholder='Nhập số điện thoại' />
                        </div>
                        {errors.phone && touched.phone && <div className='text-danger ms-4'>{errors.phone}</div>}
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
                        <div className='important-note'>Mật khẩu phải có ít nhất 8 ký tự và chứa chữ và số</div>
                      </div>
                      <div className='form-group'>
                        <div className='input-group'>
                          <div className='input-group-prepend'>
                            <Lock size={20} />
                          </div>
                          <Field type={`${showpassword ? "text" : "password"}`} name='confirmPassword' id='pwd-input2' className={`form-control ${errors.confirmPassword && touched.confirmPassword ? "is-invalid" : ""}`} placeholder='Nhập lại password' />
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
                        {errors.confirmPassword && touched.confirmPassword && <div className='text-danger ms-4'>{errors.confirmPassword}</div>}
                        <div className='important-note'>Nhập lại mật khẩu</div>
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
                      <Link href='https://accounts.google.com/' className='btn btn-social btn-flat google p-0'>
                        <i className='fab fa-google' />
                        <span>Google</span>
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
