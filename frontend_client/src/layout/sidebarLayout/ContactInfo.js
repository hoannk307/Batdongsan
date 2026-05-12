/**
 * It returns a div with a class of advance-card, which contains a h6 with the text "Contact Info",
 * which contains a div with a class of category-property, which contains a div with a class of
 * agent-info, which contains a div with a class of media, which contains an img with a class of
 * img-50, which contains a div with a class of media-body ms-2, which contains a h6 with the text
 * "Jonathan Scott", which contains a p with the text "Contact@gmail.com", which contains a ul, which
 * contains two li's, which contain an i with a class of me-2, which contains the text "A-32, Albany,
 * Newyork." and "(+066) 518 - 457 - 5181"
 * @returns A div with a class of advance-card.
 */
import React from "react";
import { MapPin, PhoneCall } from "react-feather";

const ContactInfo = ({ userData }) => {
  return (
    <div className='advance-card'>
      <h6>Người đăng</h6>
      <div className='category-property'>
        <div className='agent-info'>
          <div className='media'>
            <img src='/assets/images/testimonial/3.png' className='img-50' alt='' />
            <div className='media-body ms-2'>
              <h6>{userData?.full_name || "N/A"}</h6>
              <p>{userData?.email || "N/A"}</p>
            </div>
          </div>
        </div>
        <ul>
          <li>
            <PhoneCall className='me-2' />
            {userData?.phone || "N/A"}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ContactInfo;
