/**
 * It's a function that returns a div with a button that opens a modal with a video in it
 * @returns A React component that renders a modal with a video.
 */
import React, { useState } from "react";
import { Button, Modal, ModalBody } from "reactstrap";
import Img from "../../../utils/BackgroundImageRatio";

const VideoDeskBox = ({ singleData }) => {
  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!modal);
  return (
    <div className='desc-box' id='video'>
      <div className='page-section ratio_40'>
        <h4 className='content-title'>video</h4>
        <div className='play-bg-image'>
          {/* <div>
            <Img src='/assets/images/property/11.jpg' className='bg-img' />
          </div>
          <div className='icon-video'>
            <a>
              <i className='fas fa-play' onClick={() => setModal(true)}></i>
            </a>
          </div> */}
          <iframe src={singleData?.url_video} allowFullScreen></iframe>
        </div>
      </div>
      {/* <Modal className='video-modal' centered size='lg' isOpen={modal} toggle={toggle} modalTransition={{ timeout: 100 }}>
        <ModalBody className='m-0 p-0'>
          <Button onClick={toggle} type='button' className='btn-close' aria-label='Close'>
            <span aria-hidden='true'>×</span>
          </Button>
          <iframe src={singleData?.url_video} allowFullScreen></iframe>
        </ModalBody>
      </Modal> */}
    </div>
  );
};

export default VideoDeskBox;
