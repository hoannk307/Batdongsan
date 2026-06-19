import { Field, Form, Formik } from "formik";
import React from "react";
import { Button, Col, Row } from "reactstrap";
import * as Yup from "yup";
import { ReactstrapInput, ReactstrapSelect } from "../../utils/ReactStarpInputsValidation";
import DropZones from "@/components/Common/Dropzones";

const EditUserdataForm = () => {
  const getUploadParams = () => {
    return { url: "https://httpbin.org/post" };
  };
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
        firstname: Yup.string().required(),
        lastname: Yup.string().required(),
        phone: Yup.number().required(),
        email: Yup.string().required(),
        password: Yup.string().required(),
        confirmPW: Yup.string().required(),

      })}
      onSubmit={(values) => {
        alert("Your data is submitted check console");
      }}
    >
      {() => (
        <Form>
          <Row className='gx-3'>
            <Col sm='4' className='form-group'>
              <Field name='firstname' type='text' component={ReactstrapInput} className='form-control' placeholder='Enter Your Name' label='First Name' />
            </Col>
            <Col sm='4' className='form-group'>
              <Field name='lastname' type='text' component={ReactstrapInput} className='form-control' placeholder='Enter Your Surname' label='Last Name' />
            </Col>
            <Col sm='4' className='form-group'>
              <Field name='phone' component={ReactstrapInput} type='number' className='form-control' placeholder='Enter Your Mobile Number' label='Phone number' />
            </Col>
            <Col sm='4' className='form-group'>
              <Field name='email' type='email' component={ReactstrapInput} className='form-control' placeholder='Enter Your Email' label='Email Address' />
            </Col>
            <Col sm='6' className='form-group'>
              <Field name='password' type='text' component={ReactstrapInput} className='form-control' placeholder='Enter Your Password' label='Password' />
            </Col>
            <Col sm='6' className='form-group'>
              <Field name='confirmPW' type='text' component={ReactstrapInput} className='form-control' placeholder='Enter Your Password' label='Confirm Password' />
            </Col>

          </Row>
          <div className='dropzone-admin mb-0'>
            <label className='label-color form-label'>Media</label>
            <div className='dropzone form' id='multiFileUpload'>
              <div className='dz-message needsclick'>
                <DropZones />
              </div>
            </div>
            <Col sm='12' className='form-btn'>
              <Button type='submit' className='btn btn-gradient btn-pill'>
                Submit
              </Button>
              <Button className='btn btn-dashed btn-pill'>Cancel</Button>
            </Col>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default EditUserdataForm;
