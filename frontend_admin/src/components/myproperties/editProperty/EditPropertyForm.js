'use client';

import axios from "axios";
import { Field, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { Button, Col, Row, FormGroup, Label, Input, Spinner } from "reactstrap";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { ReactstrapInput, ReactstrapSelect } from "@/components/utils/ReactStarpInputsValidation";
import { getData } from "@/utils/apiRequests";

const DEFAULT_PROVINCE_ID = "93";
const DEFAULT_WARD_ID = "152";

const EditPropertyForm = ({ propertyId }) => {
  const [propertyDefaults, setPropertyDefaults] = useState({
    propertyTypes: [],
    propertyStatuses: [],
  });
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const apiBaseUrl = "/api";

  // Fetch defaults and property data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check user role
        if (typeof window !== "undefined") {
          try {
            const userStr = localStorage.getItem("user");
            if (userStr) {
              const userObj = JSON.parse(userStr);
              if (userObj?.role === "ADMIN" || userObj?.role === "admin") {
                setIsAdmin(true);
              }
            }
          } catch (e) {
            console.error(e);
          }
        }

        // Fetch form defaults
        const defRes = await getData(`${apiBaseUrl}/properties/defaults/options`);
        if (defRes?.data) {
          setPropertyDefaults({
            propertyTypes: defRes.data.propertyTypes || [],
            propertyStatuses: defRes.data.propertyStatuses || [],
          });
        }

        // Fetch provinces
        const provRes = await getData(`${apiBaseUrl}/locations/provinces`);
        if (Array.isArray(provRes?.data)) {
          setProvinces(provRes.data.map((p) => ({ id: p.id, name: p.name })));
        }

        // Fetch existing property
        if (propertyId) {
          const propRes = await getData(`${apiBaseUrl}/properties/${propertyId}`);
          if (propRes?.data) {
            const prop = propRes.data;
            setInitialData({
              propertyType: prop.property_type || "",
              propertyStatus: prop.property_status || "",
              beds: prop.beds ? String(prop.beds) : "",
              baths: prop.baths ? String(prop.baths) : "",
              area: prop.area ? String(prop.area) : "",
              price: prop.price ? String(prop.price) : "",
              description: prop.description || "",
              anyCity: prop.any_city || DEFAULT_PROVINCE_ID,
              anyWard: prop.any_ward || DEFAULT_WARD_ID,
              landmark: prop.landmark || "",
              googleMapCoordinates: prop.google_map_coordinates || "",
              outstanding: !!prop.outstanding,
              status: prop.status || "DRAFT",
            });

            // Fetch wards for the selected province
            if (prop.any_city) {
              await fetchWardsByProvince(prop.any_city);
            } else {
              await fetchWardsByProvince(DEFAULT_PROVINCE_ID);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load initial data", error);
        toast.error("Không thể tải thông tin bất động sản.");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [propertyId]);

  const fetchWardsByProvince = async (provinceId) => {
    if (!provinceId) {
      setWards([]);
      return;
    }
    try {
      setIsLoadingWards(true);
      const response = await getData(`${apiBaseUrl}/locations/wards?province_id=${provinceId}`);
      if (Array.isArray(response?.data)) {
        setWards(response.data.map((ward) => ({ id: ward.id, name: ward.name })));
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

  const getStoredToken = () => {
    if (typeof window === "undefined") return null;
    const directToken = localStorage.getItem("accessToken") || localStorage.getItem("token");
    if (directToken) return directToken;

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        return parsed?.token || parsed?.accessToken || null;
      } catch {
        return null;
      }
    }
    return null;
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    const payload = {
      property_type: values.propertyType,
      property_status: values.propertyStatus,
      beds: values.beds !== "" ? Number(values.beds) : undefined,
      baths: values.baths !== "" ? Number(values.baths) : undefined,
      area: values.area !== "" ? Number(values.area) : undefined,
      price: values.price !== "" ? Number(values.price) : undefined,
      description: values.description,
      any_city: values.anyCity,
      any_ward: values.anyWard,
      landmark: values.landmark,
      google_map_coordinates: values.googleMapCoordinates,
      outstanding: !!values.outstanding,
      status: values.status,
    };

    // Remove undefined
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) delete payload[key];
    });

    try {
      const token = getStoredToken();
      await axios.patch(`${apiBaseUrl}/properties/${propertyId}`, payload, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      toast.success("Cập nhật bất động sản thành công.");
      // Optional: window.history.back();
    } catch (error) {
      const messageFromApi = error?.response?.data?.message;
      const normalizedMessage = Array.isArray(messageFromApi) ? messageFromApi.join(", ") : messageFromApi;
      toast.error(normalizedMessage || "Lỗi khi cập nhật bất động sản.");
      console.error("Failed to update property", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  if (isLoadingData) {
    return <div className="text-center p-5"><Spinner color="primary" /> Đang tải dữ liệu...</div>;
  }

  if (!initialData) {
    return <div className="text-center p-5 text-danger">Không tìm thấy bất động sản.</div>;
  }

  const fallbackPropertyTypes = ["Nhà đất", "Căn hộ chung cư"].map((label) => ({ id: label, name: label }));
  const fallbackPropertyStatuses = [{ id: "FOR_RENT", name: "Cho thuê" }, { id: "FOR_SALE", name: "Bán" }];

  const propertyTypeOptions = propertyDefaults.propertyTypes.length > 0 ? propertyDefaults.propertyTypes : fallbackPropertyTypes;
  const propertyStatusOptions = propertyDefaults.propertyStatuses.length > 0 ? propertyDefaults.propertyStatuses : fallbackPropertyStatuses;

  return (
    <Formik
      initialValues={initialData}
      enableReinitialize={true}
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
        status: Yup.string().required(),
      })}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, setFieldValue, values }) => (
        <Form>
          <Row className='gx-3'>
            <Col sm='4' className='form-group'>
              <Field name='propertyType' component={ReactstrapSelect} className='form-control' label='Loại bất động sản' inputprops={{ options: propertyTypeOptions, defaultOption: "Loại bất động sản" }} />
            </Col>
            <Col sm='4' className='form-group'>
              <Field name='propertyStatus' component={ReactstrapSelect} className='form-control' label='Nhu cầu bán/cho thuê' inputprops={{ options: propertyStatusOptions, defaultOption: "Nhu cầu" }} />
            </Col>
            {isAdmin ? (
              <Col sm='4' className='form-group'>
                <Field name='status' component={ReactstrapSelect} className='form-control' label='Trạng thái duyệt' inputprops={{ options: [{ id: "DRAFT", name: "Chờ duyệt (Draft)" }, { id: "PUBLISHED", name: "Đã duyệt (Published)" }], defaultOption: "Trạng thái duyệt" }} />
              </Col>
            ) : (
              <Col sm='4' className='form-group'></Col>
            )}
            <Col sm='4' className='form-group'>
              <Field name='beds' component={ReactstrapSelect} className='form-control' label='Phòng ngủ' inputprops={{ options: ["1", "2", "3", "4", "5", "6"], defaultOption: "Phòng ngủ" }} />
            </Col>
            <Col sm='4' className='form-group'>
              <Field name='baths' component={ReactstrapSelect} className='form-control' label='Phòng tắm/vệ sinh' inputprops={{ options: ["1", "2", "3", "4", "5", "6"], defaultOption: "Phòng tắm/vệ sinh" }} />
            </Col>
            <Col sm='4' className='form-group'></Col>
            <Col sm='4' className='form-group'>
              <Field name='area' type='text' className='form-control' component={ReactstrapInput} label='Diện tích' placeholder='85' />
            </Col>
            <Col sm='4' className='form-group'>
              <Field name='price' type='text' className='form-control' component={ReactstrapInput} label='Giá' placeholder='3000000000' />
            </Col>
            <Col sm='12' className='form-group'>
              <Field type='textarea' name='description' component={ReactstrapInput} className='form-control' rows={4} label='Description' />
            </Col>
            {isAdmin && (
              <Col sm='4' className='form-group'>
                <FormGroup switch>
                  <Input type='switch' id='outstanding' name='outstanding' checked={values.outstanding} onChange={() => setFieldValue('outstanding', !values.outstanding)} />
                  <Label check htmlFor='outstanding' style={{ cursor: 'pointer' }}>BĐS Nổi bật</Label>
                </FormGroup>
              </Col>
            )}
          </Row>

          <div className='form-inputs'>
            <h6>Địa chỉ</h6>
            <Row className=' gx-3'>
              <Col sm='4' className='form-group'>
                <Field name='anyCity' component={ReactstrapSelect} className='form-control' label='Tỉnh/Thành phố' inputprops={{ options: provinces, defaultOption: "Tỉnh/Thành phố" }} onChange={(event) => handleProvinceChange(event, setFieldValue)} />
              </Col>
              <Col sm='4' className='form-group'>
                <Field name='anyWard' component={ReactstrapSelect} className='form-control' label='Phường/Xã' inputprops={{ options: wards, defaultOption: isLoadingWards ? "Đang tải..." : "Phường/Xã" }} disabled={isLoadingWards || !values.anyCity} />
              </Col>
              <Col sm='4' className='form-group'>
                <Field name='landmark' type='text' component={ReactstrapInput} className='form-control' placeholder='Địa chỉ cụ thể' label='Chi tiết' />
              </Col>
              <Col sm='12' className='form-group'>
                <Field name='googleMapCoordinates' type='text' component={ReactstrapInput} className='form-control' placeholder='Ví dụ: 12.273028, 109.201023' label='Tọa độ Google Map' />
              </Col>
            </Row>
          </div>

          <div className='form-inputs mb-4'>
             <p className="text-muted small"><em>* Tính năng cập nhật Hình ảnh/Video đang được xây dựng trong tương lai. Hiện tại chỉ hỗ trợ sửa thông tin văn bản.</em></p>
          </div>

          <Row className='gx-3'>
            <Col sm='12' className='form-btn'>
              <Button type='submit' className='btn btn-gradient btn-pill' disabled={isSubmitting}>
                {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
              <Button type='button' className='btn btn-dashed btn-pill' onClick={handleCancel}>
                Hủy bỏ
              </Button>
            </Col>
          </Row>
        </Form>
      )}
    </Formik>
  );
};

export default EditPropertyForm;
