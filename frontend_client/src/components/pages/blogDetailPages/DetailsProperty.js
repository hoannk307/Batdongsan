import React from "react";
import { Row } from "reactstrap";
import root from "react-shadow";

const DetailsProperty = ({ news }) => {
  const rawText = (news?.content || news?.detail || news?.summary || "").trim();

  return (
    <div className='details-property'>
      <Row>
        <root.div className="news-content">
          <style>{`
            :host {
              display: block;
              word-break: break-word;
              overflow-wrap: break-word;
              overflow-x: auto;
            }
            img,
            video,
            iframe {
              max-width: 100%;
              height: auto;
            }
            figure,
            table {
              max-width: 100%;
            }
          `}</style>
          <div dangerouslySetInnerHTML={{ __html: rawText }} />
        </root.div>
      </Row>
    </div>
  );
};

export default DetailsProperty;
