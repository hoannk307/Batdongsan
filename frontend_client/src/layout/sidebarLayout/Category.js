/**
 * It's a function that takes in an array of objects and returns a filtered array of objects based on
 * the propertyType
 * @returns A list of properties
 */
import React from "react";
import { useDispatch } from "react-redux";

const Category = ({ categories }) => {
  return (
    <div className='advance-card'>
      <h6>Danh mục</h6>
      <div className='category-property'>
        <ul>
          {(categories || []).map((cat) => (
            <li key={cat.id}>
              <a href={`/news?type=category&id=${cat.id}`}>
                <i className='fas fa-arrow-right me-2'></i>{cat.name} 
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Category;
