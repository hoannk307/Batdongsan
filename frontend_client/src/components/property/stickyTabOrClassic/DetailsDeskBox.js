import React from "react";
import { Col, Row } from "reactstrap";

const DetailsDeskBox = ({ singleData }) => {
  const address = [singleData?.landmark, singleData?.any_ward, singleData?.any_city]
    .filter(Boolean)
    .join(", ");
  const mapsUrl = address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    : "https://www.google.com/maps";

  return (
    <div className='desc-box' id='details'>
      <div className='page-section'>
        <h4 className='content-title'>
          Chi tiết bất động sản
          <a href={mapsUrl} target='_blank' rel='noreferrer'>
            <i className='fa fa-map-marker-alt'></i> Xem trên bản đồ
          </a>
        </h4>
        <Row>
          <Col md='6' xl='4'>
            <ul className='property-list-details'>
              <li>
                <span>Loại BĐS :</span> {singleData?.property_type || "—"}
              </li>
              {/* <li>
                <span>Mã BĐS :</span> #{singleData?.id || "—"}
              </li> */}
              {/* <li>
                <span>Trạng thái :</span> {singleData?.property_status || "—"}
              </li> */}
              <li>
                <span>Ngày đăng :</span> {singleData?.created_at ? new Date(singleData.created_at).toLocaleDateString("vi-VN") : "—"}
              </li>
            </ul>
          </Col>
          <Col md='6' xl='4'>
            <ul className='property-list-details'>
              <li>

                <span>Tỉnh/Thành phố :</span> {singleData?.any_city || "—"}
              </li>
              <li>
                <span>Diện tích :</span>{" "}
                {singleData?.area ? `${singleData.area} m²` : "—"}
              </li>
              <li>
                <span>Phòng ngủ :</span> {singleData?.beds ?? "—"}
              </li>
            </ul>
          </Col>
          <Col md='6' xl='4'>
            <ul className='property-list-details'>
              <li>
                <span>Phường/Xã :</span> {singleData?.any_ward || "—"}
              </li>
              <li>
                <span>Phòng tắm :</span> {singleData?.baths ?? "—"}
              </li>
              <li>
                <span>Giá :</span>{" "}
                {singleData?.price_string}
              </li>
            </ul>
          </Col>
        </Row>

        {/* Mô tả */}
        {/* {singleData?.description && (
          <>
            <h4 className='content-title mt-4'>Mô tả</h4>
            <p style={{ lineHeight: "1.8", color: "#555" }}>{singleData.description}</p>
          </>
        )} */}
      </div>
    </div>
  );
};

export default DetailsDeskBox;
