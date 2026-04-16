import React from "react";

const DEFAULT_MAP_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.1583091352!2d-74.11976373946229!3d40.69766374859258!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew+York%2C+NY%2C+USA!5e0!3m2!1sen!2sin!4v1563449626439!5m2!1sen!2sin";

const LocationMapDeskBox = ({ singleData }) => {
  const address = [singleData?.landmark, singleData?.any_ward, singleData?.any_city]
    .filter(Boolean)
    .join(", ");

  const mapSrc = address
    ? `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`
    : DEFAULT_MAP_SRC;

  return (
    <div className='desc-box' id='location-map'>
      <div className='page-section'>
        <h4 className='content-title'>Vị trí</h4>
        {address && (
          <p className="mb-2" style={{ color: "#666" }}>
            <i className="fa fa-map-marker-alt me-1"></i> {address}
          </p>
        )}
        <iframe
          title='realestate location'
          src={mapSrc}
          allowFullScreen
          style={{ width: "100%", height: "400px", border: 0 }}
        ></iframe>
      </div>
    </div>
  );
};

export default LocationMapDeskBox;
