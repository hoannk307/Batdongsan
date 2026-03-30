import React from "react";
import { Row } from "reactstrap";

const DetailsProperty = ({ news }) => {
  const rawText = (news?.content || news?.detail || news?.summary || "").trim();

  return (
    <div className='details-property'>
      <Row>
        <div dangerouslySetInnerHTML={{ __html: rawText }} />
      </Row>
    </div>
  );
};

export default DetailsProperty;
