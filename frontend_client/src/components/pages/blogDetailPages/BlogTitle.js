import React from "react";

const BlogTitle = ({ news }) => {
  const tags = Array.isArray(news?.tags) ? news.tags : [];

  const dateText =
    news?.date && news?.month
      ? `${news.date} ${news.month}${news?.year ? ` ${news.year}` : ""}`
      : "";

  const author = news?.author || "Agent";
  const views = typeof news?.views === "number" ? news.views : news?.views ? Number(news.views) : 0;

  return (
    <div className='blog-title'>
      <ul className='post-detail'>
        <li>{dateText || "—"}</li>

        <li>Posted By : {author}</li>
        <li>
          <i className='fa fa-heart me-2'></i>
          {views} Hits
        </li>
        <li>
          <i className='fa fa-comments me-2'></i>{typeof news?.comments === "number" ? news.comments : 0} Comment
        </li>
      </ul>
      <h1>{news?.title || "Untitled"}</h1>

      {tags.length > 0 && (
        <div className='tags'>
          <ul>
            {tags.map((tag) => (
              <li key={tag}>
                <a href={`/news?tag=${encodeURIComponent(tag)}`}>{tag}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BlogTitle;
