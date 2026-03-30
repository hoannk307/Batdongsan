/**
 * It returns a div with a class of blog-wrap, which contains a div with a class of blog-image, which
 * contains a div, which contains an Img component, which contains an img tag
 * @returns A div with a class of blog-wrap and wow fadeInUp.
 */
import Link from "next/link";
import React from "react";
import { MapPin } from "react-feather";
import Img from "../../../utils/BackgroundImageRatio";

const BlogWrapBoxTwo = ({ data }) => {
  const detailHref = data?.id ? `/pages/blog-detail-pages/left-sidebar?id=${encodeURIComponent(data.id)}` : "/pages/blog-detail-pages/left-sidebar";

  return (
    <div className="blog-wrap wow fadeInUp">
      <div className="blog-image">
        <div>
          <Img src={data.img} className="bg-img img-fluid" alt="" />
        </div>
      </div>
      <div className="blog-details">
        <div>
          <span>
            <MapPin /> {data.place}
          </span>
          <h3>
            <Link href={detailHref}>{data.title}</Link>
          </h3>
          <p className="font-roboto">{data.detail}</p>
          <Link href={detailHref}>read more</Link>
        </div>
      </div>
    </div>
  );
};

export default BlogWrapBoxTwo;
