import React from "react";

const normalizeTags = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") return raw.split(/[;,]/g);
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
};

const PopularTags = ({ tags }) => {
  const fallbackTags = ["Villas", "Apartment", "Hotels", "Condominiums", "Duplex", "Triplex"];

  const normalized = normalizeTags(tags)
    .map((t) => {
      if (typeof t === "string") return t;
      if (typeof t === "number") return String(t);
      if (t && typeof t === "object") return t?.name || t?.label || t?.title || t?.value || "";
      return "";
    })
    .map((s) => s.trim())
    .filter(Boolean);

  const tagsToRender = normalized.length > 0 ? Array.from(new Set(normalized)) : fallbackTags;

  const tagHref = (tag) => `/news?tag=${encodeURIComponent(tag)}`;

  return (
    <div className='advance-card'>
      <h6>Popular Tags</h6>
      <div className='tags'>
        <ul>
          {tagsToRender.map((tag) => (
            <li key={tag}>
              <a href={tagHref(tag)}>{tag}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PopularTags;
