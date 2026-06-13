"use client";
import { Field, Form, Formik } from 'formik'
import Link from 'next/link'
import React, { useState } from 'react'
import * as Yup from 'yup';
import { Lock, User } from 'react-feather'
import { Card, CardBody, Col, Container, Row } from 'reactstrap'
import { toast } from 'react-toastify';
import { useRouter, useSearchParams } from 'next/navigation';
import Img from '@/components/Common/Image';
import Cookies from 'js-cookie';
import { postData } from '@/utils/apiRequests';

const LogIn = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showpassword, setShowpassword] = useState(false);

    const login = async (values, { setSubmitting }) => {
        try {
            const payload = {
                usernameOrEmail: values.usernameOrEmail,
                password: values.password,
            };
            const res = await postData('/api/auth/login', payload);

            const { user, token } = res.data || {};

            if (typeof window !== "undefined" && token && user) {
                Cookies.set("accessToken", token);
                localStorage.setItem("accessToken", token);
                localStorage.setItem("user", JSON.stringify(user));
            }

            toast.success('Login successful');
            const returnTo = searchParams.get('returnTo');
            router.push(returnTo || '/dashboard');
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            const message = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage;
            toast.error(message || 'Please check your username/email and password..!');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="authentication-box">
            <Container fluid={true} className="container-fluid">
                <Row className="log-in">
                    <Col xxl='3' xl='4' lg='5' md='6' sm='8' className="form-login">
                        <Card className="card">
                            <CardBody className="card-body">
                                <div className="title-3 text-start">
                                    <h2>Log in</h2>
                                </div>
                                <Formik
                                    initialValues={{
                                        usernameOrEmail: "",
                                        password: ""
                                    }}
                                    validationSchema={Yup.object().shape({
                                        usernameOrEmail: Yup.string().required('Enter valid Username or Email..!'),
                                        password: Yup.string().required('Password is required..!')
                                    })}
                                    onSubmit={login}>
                                    {({ errors, touched }) => (
                                        <Form>
                                            <div className="form-group">
                                                <div className="input-group">
                                                    <div className="input-group-prepend">
                                                        <User size={20} />
                                                    </div>
                                                    <Field type="text" className={`form-control ${errors.usernameOrEmail && touched.usernameOrEmail ? 'is-invalid' : ''}`} name='usernameOrEmail' placeholder="Enter username or email" />
                                                </div>
                                                {(errors.usernameOrEmail && touched.usernameOrEmail) && <div className='text-danger ms-4'>{errors.usernameOrEmail}</div>}
                                            </div>
                                            <div className="form-group">
                                                <div className="input-group">
                                                    <div className="input-group-prepend">
                                                        <Lock size={20} />
                                                    </div>
                                                    <Field type={`${showpassword ? 'text' : 'password'}`} name='password' id="pwd-input" className={`form-control ${(errors.password && touched.password) ? 'is-invalid' : ''}`} placeholder="Password" />
                                                    <div className="input-group-apend">
                                                        <i id="pwd-icon" className={`far fa-eye${!showpassword ? '-slash' : ''}`} onClick={() => { setShowpassword(!showpassword) }} />
                                                    </div>
                                                </div>
                                                {(errors.password && touched.password) && <div className='text-danger ms-4'>{errors.password}</div>}
                                                <div className="important-note">
                                                    Mật khẩu phải có ít nhất 8 ký tự, bao gồm cả chữ và số
                                                </div>
                                            </div>
                                            <div className="d-flex">
                                                <label className="d-block mb-0" htmlFor="chk-ani">
                                                    <input className="checkbox_animated" id="chk-ani" type="checkbox" /> Remember me
                                                </label>
                                                <Link href='https://sheltos-react.vercel.app/pages/other-pages/forgot-password' className="font-rubik">Forgot password ?</Link>
                                            </div>
                                            <div>
                                                <button type="submit" className="btn btn-gradient btn-pill me-sm-3 me-2">Log in</button>
                                                <Link href="/authentication/signup" className="btn btn-dashed btn-pill">Create Account</Link>
                                            </div>
                                        </Form>
                                    )}
                                </Formik>
                                <div className="divider">
                                    <h6>or</h6>
                                </div>
                                <div>
                                    <h6>Log in with</h6>
                                    <Row className="social-connect">
                                        <Col sm='6'>
                                            <Link href="https://www.facebook.com/" className="btn btn-social btn-flat facebook p-0">
                                                <i className="fab fa-facebook-f" />
                                                <span>Facebook</span>
                                            </Link>
                                        </Col>
                                        <Col sm='6'>
                                            <Link href="https://accounts.google.com/" className="btn btn-social btn-flat google p-0">
                                                <i className="fab fa-google" />
                                                <span>Google</span>
                                            </Link>
                                        </Col>
                                    </Row>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col xxl='7' xl='7' lg='6' className="offset-xxl-1 auth-img">
                        <Img src={`/assets/images/svg/2.jpg`} alt='' className='bg-img' />
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default LogIn

LogIn.getLayout = function getLayout(LogIn) {
    return (
        <>
            {LogIn}
        </>
    )
}