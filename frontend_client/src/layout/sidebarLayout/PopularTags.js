import React from "react";

const normalizeTags = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") return raw.split(/[;,]/g);
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
};

const PopularTags = ({ tags }) => {
  return (
    <div className='advance-card'>
      <h6>Popular Tags</h6>
      <div className='tags'>
        <ul>
          {(tags || []).map((tag) => {
            const href = `/news?type=${tag.type}&id=${tag.id}`;
            return (
              <li key={tag.id}>
                <a href={href}>{tag.name}</a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default PopularTags;
