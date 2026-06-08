import React from "react";
import { Row } from "reactstrap";

const DetailsProperty = ({ news }) => {
  const rawText = (news?.content || news?.detail || news?.summary || "").trim();

  return (
    <div className='details-property'>
      <style>{`
        .news-content {
          word-break: break-word;
          overflow-wrap: break-word;
          overflow-x: auto;
        }
        .news-content img,
        .news-content video,
        .news-content iframe {
          max-width: 100%;
          height: auto;
        }
        .news-content figure,
        .news-content table {
          max-width: 100%;
        }
      `}</style>
      <Row>
        <div className="news-content" dangerouslySetInnerHTML={{ __html: rawText }} />
      </Row>
    </div>
  );
};

export default DetailsProperty;
