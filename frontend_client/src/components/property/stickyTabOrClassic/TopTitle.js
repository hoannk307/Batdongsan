import React, { useState } from "react";
import { Facebook, Instagram, Printer, Twitter } from "react-feather";
import { Container } from "reactstrap";
import ReviewStarr from "../../elements/ReviewStarr";
import { useSelector } from "react-redux";

const TopTitle = ({ singleData, id }) => {
  const [like, setLike] = useState(false);
  const { symbol, currencyValue } = useSelector((state) => state.currencyReducer);
  return (
    <div className="single-property-section">
      <Container>
        <div className="single-title">
          <div className="left-single">
            <div className="d-flex">
              <h2 className="mb-0">{singleData?.property_type || "Bất động sản"}</h2>
              {/* <span>
                <span className="label label-shadow ms-2">{singleData?.property_status || "For Sale"}</span>
              </span> */}
            </div>
            <p className="mt-1">
              {singleData?.address}
            </p>
            <ul>
              <li>
                <div>
                  <img src="/assets/images/svg/icon/double-bed.svg" className="img-fluid" alt="" />
                  <span>{singleData?.beds ?? 0} Phòng ngủ</span>
                </div>
              </li>
              <li>
                <div>
                  <img src="/assets/images/svg/icon/bathroom.svg" className="img-fluid" alt="" />
                  <span>{singleData?.baths ?? 0} Phòng tắm</span>
                </div>
              </li>
              <li>
                <div>
                  <img src="/assets/images/svg/icon/square-ruler-tool.svg" className="img-fluid ruler-tool" alt="" />
                  <span>{singleData?.area ?? 0} m²</span>
                </div>
              </li>
              {/* Chỉ hiển thị Bedrooms, Bathrooms, Rooms, Sqft — ẩn Garage vì không có dữ liệu */}
            </ul>
            <div className="share-buttons">
              <div className="d-inline-block">
                <a className="btn btn-gradient btn-pill">
                  <i className="fas fa-share-square"></i>
                  share
                </a>
                <div className="share-hover">
                  <ul>
                    <li>
                      <a href="https://www.facebook.com/" className="icon-facebook" target="_blank" rel="noreferrer">
                        <Facebook></Facebook>
                      </a>
                    </li>
                    <li>
                      <a href="https://twitter.com/" className="icon-twitter" target="_blank" rel="noreferrer">
                        <Twitter></Twitter>
                      </a>
                    </li>
                    <li>
                      <a href="https://www.instagram.com/" target="_blank" className="icon-instagram" rel="noreferrer">
                        <Instagram></Instagram>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <a className="btn btn-dashed btn-pill ms-md-2 ms-1 save-btn" onClick={() => setLike(!like)}>
                <i className={`${like ? "fas" : "far"} fa-heart`}></i>
                Save
              </a>
              <a className="btn btn-dashed btn-pill ms-md-2 ms-1" onClick={() => window.print()}>
                <Printer />
                Print
              </a>
            </div>
          </div>
          <div className="right-single">
            <ReviewStarr rating={4} />
            <h2 className="price">
              {singleData?.price_string}
            </h2>
            {singleData?.view_count && (
              <div className="feature-label">
                <span className="btn btn-dashed btn-pill">
                  <i className="fa fa-eye me-1"></i>
                  {singleData.view_count} Lượt xem
                </span>
                {/* {singleData?.property_status && (
                  <span className="btn btn-dashed ms-1 btn-pill">{singleData.property_status}</span>
                )} */}
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default TopTitle;
