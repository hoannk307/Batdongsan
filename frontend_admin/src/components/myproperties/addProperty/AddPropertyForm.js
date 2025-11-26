'use client';

import axios from "axios";
import { Field, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { Button, Col, Row } from "reactstrap";
import * as Yup from "yup";

import { toast } from "react-toastify";
import { ReactstrapInput, ReactstrapSelect } from "@/components/utils/ReactStarpInputsValidation";
import DropZones from "@/components/Common/Dropzones";
import { getData } from "@/components/utils/getData";

const DEFAULT_PROVINCE_ID = "93";
const DEFAULT_WARD_ID = "152";
const FALLBACK_API_URL = "http://localhost:3000/api";
const FALLBACK_TOKEN =
  process.env.NEXT_PUBLIC_DEV_ACCESS_TOKEN || process.env.DEV_ACCESS_TOKEN || "";

const AddPropertyForm = () => {
  const [propertyDefaults, setPropertyDefaults] = useState({
    propertyTypes: [],
    propertyStatuses: [],
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || FALLBACK_API_URL;

  useEffect(() => {
    const fetchDefaults = async () => {
      if (!apiBaseUrl) {
        console.warn("API_URL is not defined. Cannot fetch property defaults.");
        return;
      }

      try {
        const response = await getData(`${apiBaseUrl}/properties/defaults/options`);
        if (response?.data) {
          setPropertyDefaults({
            propertyTypes: response.data.propertyTypes || [],
            propertyStatuses: response.data.propertyStatuses || [],
          });
        }
      } catch (error) {
        console.error("Failed to fetch property defaults", error);
      }
    };

    fetchDefaults();
  }, [apiBaseUrl]);

  useEffect(() => {
    if (DEFAULT_PROVINCE_ID) {
      fetchWardsByProvince(DEFAULT_PROVINCE_ID);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBaseUrl]);

  useEffect(() => {
    const fetchProvinces = async () => {
      if (!apiBaseUrl) {
        console.warn("API_URL is not defined. Cannot fetch provinces.");
        return;
      }

      try {
        const response = await getData(`${apiBaseUrl}/locations/provinces`);
        if (Array.isArray(response?.data)) {
          setProvinces(
            response.data.map((province) => ({
              id: province.id,
              name: province.name,
            }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch provinces", error);
      }
    };

    fetchProvinces();
  }, [apiBaseUrl]);

  const fetchWardsByProvince = async (provinceId) => {
    if (!apiBaseUrl || !provinceId) {
      setWards([]);
      return;
    }

    try {
      setIsLoadingWards(true);
      const response = await getData(`${apiBaseUrl}/locations/wards?province_id=${provinceId}`);
      if (Array.isArray(response?.data)) {
        setWards(
          response.data.map((ward) => ({
            id: ward.id,
            name: ward.name,
          }))
        );
      } else {
        setWards([]);
      }
    } catch (error) {
      console.error("Failed to fetch wards", error);
      setWards([]);
    } finally {
      setIsLoadingWards(false);
    }
  };

  const handleProvinceChange = async (event, setFieldValue) => {
    const provinceId = event.target.value;
    setFieldValue("anyCity", provinceId);
    setFieldValue("anyWard", "");

    if (provinceId) {
      await fetchWardsByProvince(provinceId);
    } else {
      setWards([]);
    }
  };

  const fallbackPropertyTypes = ["Nhà đất", "Căn hộ chung cư"].map((label) => ({
    id: label,
    name: label,
  }));

  const fallbackPropertyStatuses = [
    { id: "FOR_RENT", name: "Cho thuê" },
    { id: "FOR_SALE", name: "Bán" },
  ];

  const propertyTypeOptions =
    propertyDefaults.propertyTypes.length > 0 ? propertyDefaults.propertyTypes : fallbackPropertyTypes;

  const propertyStatusOptions =
    propertyDefaults.propertyStatuses.length > 0 ? propertyDefaults.propertyStatuses : fallbackPropertyStatuses;

  const getUploadParams = () => {
    return { url: "https://httpbin.org/post" };
  };
  const getStoredToken = () => {
    if (typeof window === "undefined") return null;

    const directToken = localStorage.getItem("accessToken") || localStorage.getItem("token");
    if (directToken) return directToken;

    const storedUser = localStorage.getItem("user");
    if (!storedUser) return FALLBACK_TOKEN || null;

    try {
      const parsed = JSON.parse(storedUser);
      return parsed?.token || parsed?.accessToken || FALLBACK_TOKEN || null;
    } catch {
      return FALLBACK_TOKEN || null;
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    if (!apiBaseUrl) {
      toast.error("API_URL chưa được cấu hình.");
      setSubmitting(false);
      return;
    }

    const payload = { ...values };

    // mp4Link hiện chưa được backend hỗ trợ trong DTO nên không gửi lên API
    delete payload.mp4Link;

    // Chuẩn hóa dữ liệu số để backend dễ validate (ValidationPipe cũng sẽ hỗ trợ)
    const numericFields = ["beds", "baths", "area", "price"];
    numericFields.forEach((field) => {
      if (payload[field] !== undefined && payload[field] !== null && payload[field] !== "") {
        payload[field] = Number(payload[field]);
      }
    });

    try {
      //const token = getStoredToken();
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiaG9hbm5rMzA3QGdtYWlsLmNvbSIsImlhdCI6MTc2NDA4ODA1NiwiZXhwIjoxNzY0NjkyODU2fQ.3Nakxha5p0l5rEovl9o9lIeWkuYUHH7Jvvlofq7zdTU"

      // Nếu có file thì gửi dạng multipart/form-data tới API tạo property + file_attach + upload Cloudflare
      if (uploadedFiles.length > 0) {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            formData.append(key, value);
          }
        });

        uploadedFiles.forEach((file) => {
          formData.append("files", file);
        });

        await axios.post(`${apiBaseUrl}/properties/with-files`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
      } else {
        await axios.post(`${apiBaseUrl}/properties`, payload, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
      }

      toast.success("Tạo bất động sản thành công.");
      resetForm();
      setUploadedFiles([]);
    } catch (error) {
      const messageFromApi = error?.response?.data?.message;
      const normalizedMessage = Array.isArray(messageFromApi) ? messageFromApi.join(", ") : messageFromApi;
      toast.error(normalizedMessage || "Không thể tạo bất động sản. Vui lòng thử lại.");
      console.error("Failed to create property", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  return (
    <Formik
      initialValues={{
        propertyType: "", // Loại bất động sản
          propertyStatus: "", // Trạng thái bất động sản
        beds: "", // Số phòng ngủ
        baths: "", // Số phòng tắm
        area: "", // Diện tích
        price: "", // Giá
        description: "", // Mô tả bất động sản
        anyCity: DEFAULT_PROVINCE_ID, // Tỉnh thành phố
        anyWard: DEFAULT_WARD_ID,// phường xã
        landmark: "", // Địa điểm cụ thể
        mp4Link: "",
      }}
      validationSchema={Yup.object().shape({
        propertyType: Yup.string().required(),
        propertyStatus: Yup.string().required(),
        beds: Yup.string().required(),
        baths: Yup.string().required(),
        area: Yup.string().required(),
        price: Yup.number().required(),
        description: Yup.string().required(),
        anyCity: Yup.string().required(),
        anyWard: Yup.string().required(),
        landmark: Yup.string().required(),
      })}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, setFieldValue, values }) => (
        <Form>
          <Row className='gx-3'>
            <Col sm='4' className='form-group'>
              <Field
                name='propertyType'
                component={ReactstrapSelect}
                className='form-control'
                label='Loại bất động sản'
                inputprops={{
                  options: propertyTypeOptions,
                  defaultOption: "Loại bất động sản",
                }}
              />
            </Col>
            <Col sm='4' className='form-group'>
              <Field
                name='propertyStatus'
                component={ReactstrapSelect}
                className='form-control'
                label='Nhu cầu bán/cho thuê'
                inputprops={{
                  options: propertyStatusOptions,
                  defaultOption: "Nhu cầu",
                }}
              />
            </Col>
            <Col sm='4' className='form-group'>
             
            </Col>
            
            <Col sm='4' className='form-group'>
              <Field
                name='beds'
                component={ReactstrapSelect}
                className='form-control'
                label='Phòng ngủ'
                inputprops={{
                  options: ["1", "2", "3", "4", "5", "6"],
                  defaultOption: "Phòng ngủ",
                }}
              />
            </Col>
            <Col sm='4' className='form-group'>
              <Field
                name='baths'
                component={ReactstrapSelect}
                className='form-control'
                label='Phòng tắm/vệ sinh'
                inputprops={{
                  options: ["1", "2", "3", "4", "5", "6"],
                  defaultOption: "Phòng tắm/vệ sinh",
                }}
              />
            </Col>
            <Col sm='4' className='form-group'>
              
            </Col>
            <Col sm='4' className='form-group'>
              <Field name='area' type='text' className='form-control' component={ReactstrapInput} label='Diện tích' placeholder='85 Sq Ft' />
            </Col>
            <Col sm='4' className='form-group'>
              <Field name='price' type='text' className='form-control' component={ReactstrapInput} label='Giá' placeholder='$3000' />
            </Col>
            
            <Col sm='12' className='form-group'>
              <Field type='textarea' name='description' component={ReactstrapInput} className='form-control' rows={4} label='Description' />
            </Col>
            <Col sm='4' className='form-group'>
           
            </Col>
          </Row>
          <div className='form-inputs'>
            <h6>Địa chỉ</h6>
            <Row className=' gx-3'>
              <Col sm='4' className='form-group'>
              <Field
                name='anyCity'
                component={ReactstrapSelect}
                className='form-control'
                label='Tỉnh/Thành phố'
                inputprops={{
                  options: provinces.length > 0 ? provinces : [],
                  defaultOption: "Tỉnh/Thành phố",
                }}
                onChange={(event) => handleProvinceChange(event, setFieldValue)}
              />
              </Col>
              <Col sm='4' className='form-group'>
                <Field
                  name='anyWard'
                  component={ReactstrapSelect}
                  className='form-control'
                  label='Phường/Xã'
                  inputprops={{
                  options: wards.length > 0 ? wards : [],
                  defaultOption: isLoadingWards ? "Đang tải..." : "Phường/Xã",
                  }}
                disabled={isLoadingWards || !values.anyCity}
                />
              </Col>
              <Col sm='4' className='form-group'>
                <Field name='landmark' type='text' component={ReactstrapInput} className='form-control' placeholder='Địa chỉ cụ thể' label='Chi tiết' />
              </Col>
            </Row>
          </div>
          <div className='dropzone-admin form-inputs'>
            <h6>Media</h6>
              <div className='dropzone' id='multiFileUpload'>
                <div className='dz-message needsclick'>
                  <DropZones multiple files={uploadedFiles} onFilesChange={setUploadedFiles} />
                </div>
              </div>
            <Row className='gx-3'>
              <Col sm='12' className='form-group'>
                <Field name='mp4Link' component={ReactstrapInput} type='text' className='form-control' placeholder='mp4 video link' label='Video (mp4)' />
              </Col>
              
              <Col sm='12' className='form-btn'>
                <Button type='submit' className='btn btn-gradient btn-pill' disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Submit"}
                </Button>
                <Button type='button' className='btn btn-dashed btn-pill' onClick={handleCancel}>
                  Cancel
                </Button>
              </Col>
            </Row>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default AddPropertyForm;
