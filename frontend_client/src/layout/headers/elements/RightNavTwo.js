import Link from "next/link";
import React, { useRef, useState } from "react";
import { Home, User } from "react-feather";
import SearchSuggestionBox from "@/components/elements/SearchSuggestionBox";

const RightNavTwo = () => {
  const [searchDropDown, setSearchDropDown] = useState(false);
  const [searchInput, setSearchInput] = useState();
  const [inputRef, setInputFocus] = useFocus();

  return (
    <ul className="header-right">
      <li>
        <Link href="/user-profile">
          <User />
        </Link>
      </li>

      <li>
        <Link
          href="/authen/signup"
          className="btn btn-solid btn-flat text-white"
          style={{ fontSize: "16px", fontWeight: 500, padding: "4px 10px", borderRadius: "8px" }}
        >
          Đăng ký
        </Link>
      </li>
      <li>
        <Link
          href="/authen/login"
          className="btn btn-solid btn-flat text-white"
          style={{ fontSize: "16px", fontWeight: 500, padding: "4px 10px", borderRadius: "8px" }}
        >
          Đăng nhập
        </Link>
      </li>
      <li>
        <Link
          href="http://localhost:3001/myproperties/add-property"
          className="btn btn-solid btn-flat text-white"
          style={{ fontSize: "16px", fontWeight: 500, padding: "4px 10px", borderRadius: "8px" }}
        >
          Đăng bài
        </Link>
      </li>
    </ul>
  );
};

export default RightNavTwo;

const useFocus = () => {
  const htmlElRef = useRef(null);
  const setFocus = () => {
    htmlElRef.current && htmlElRef.current.focus();
  };

  return [htmlElRef, setFocus];
};
