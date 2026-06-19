import { Field, Form, Formik } from 'formik';
import React from 'react';
import * as Yup from 'yup';
import { Button, Col, Row } from 'reactstrap';
import { ReactstrapInput, ReactstrapSelect } from '../../utils/ReactStarpInputsValidation';
import DropZones from '@/components/Common/Dropzones';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '@/config/env';

const AddUserForm = () => {
    const getUploadParams = () => {
        return { url: 'https://httpbin.org/post' }
    }
    const apiBaseUrl = API_BASE_URL;
    return (
        <Formik
            initialValues={{
                firstname: "",
                lastname: "",
                phone: "",
                email: "",
                password: "",
                confirmPW: "",

            }}
            validationSchema={Yup.object().shape({
                firstname: Yup.string().required('First name is required'),
                lastname: Yup.string().required('Last name is required'),
                phone: Yup.string().required('Phone number is required'),
                email: Yup.string().email('Enter valid Email..!').required('Email is required'),
                password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
                confirmPW: Yup.string()
                    .oneOf([Yup.ref('password'), null], 'Confirm Password does not match')
                    .required('Confirm Password is required'),

            })}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
                if (!apiBaseUrl) {
                    toast.error('API_URL chưa được cấu hình.');
                    return;
                }

                const payload = {
                    username: values.email,
                    email: values.email,
                    password: values.password,
                    full_name: `${values.firstname} ${values.lastname}`.trim(),
                    phone: values.phone ? String(values.phone) : undefined,
                };

                try {
                    const response = await axios.post(`${apiBaseUrl}/auth/register`, payload, {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });

                    if (response?.data?.user) {
                        toast.success('Tạo user thành công.');
                        resetForm();
                    } else {
                        toast.warn('Tạo user thành công nhưng không nhận được dữ liệu trả về.');
                    }
                } catch (error) {
                    const messageFromApi = error?.response?.data?.message;
                    const normalizedMessage = Array.isArray(messageFromApi)
                        ? messageFromApi.join(", ")
                        : messageFromApi;
                    toast.error(normalizedMessage || 'Không thể tạo user. Vui lòng thử lại.');
                } finally {
                    setSubmitting(false);
                }
            }}>
             {(props) => (
                <Form>
                    <Row className="gx-3">
                        <Col sm="4" className="form-group">
                            <Field name="firstname" type="text" component={ReactstrapInput} className="form-control" placeholder="Enter Your Name" label="First Name" />
                        </Col>
                        <Col sm='4' className="form-group">
                            <Field name="lastname" type="text" component={ReactstrapInput} className="form-control" placeholder="Enter Your Surname" label="Last Name" />
                        </Col>
                        <Col sm="4" className="form-group">
                            <Field name="phone" component={ReactstrapInput} type='number' className="form-control" placeholder='Enter Your Mobile Number' label="Phone number" />
                        </Col>
                        <Col sm="4" className="form-group">
                            <Field name="email" type="email" component={ReactstrapInput} className="form-control" placeholder="Enter Your Email" label="Email Address" />
                        </Col>
                        <Col sm="6" className="form-group">
                            <Field name="password" type="text" component={ReactstrapInput} className="form-control" placeholder="Enter Your Password" label="Password" />
                        </Col>
                        <Col sm="6" className="form-group">
                            <Field name="confirmPW" type="text" component={ReactstrapInput} className="form-control" placeholder="Enter Your Password" label="Confirm Password" />
                        </Col>

                    </Row>
                    <div className="dropzone-admin mb-0">
                        <h6>Media</h6>
                        <div className="dropzone form" id="multiFileUpload">
                            <div className="dz-message needsclick">
                                 <DropZones/>
                            </div>
                        </div>
                        <Col sm='12' className="form-btn">
                            <Button type="submit" className="btn btn-gradient btn-pill">Submit</Button>
                            <Button className="btn btn-dashed btn-pill">Cancel</Button>
                        </Col>
                    </div>
                </Form>
            )}
            </Formik>
    )
}

export default AddUserForm