import { defineCompareProducts } from "@/redux-toolkit/reducers/addToCompareReducer";
import { defineLikedProducts } from "@/redux-toolkit/reducers/addToWishListReducer";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const StoreOldData = () => {
  const dispatch = useDispatch();
  const { likedProducts } = useSelector((state) => state.addToWishListReducer);
  const { compareProducts } = useSelector((state) => state.addToCompareReducer);

  useEffect(() => {
    dispatch(defineLikedProducts(JSON.parse(localStorage.getItem("likedProducts")) || [])); 
    dispatch(defineCompareProducts(JSON.parse(localStorage.getItem("compareProducts")) || []));
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", function () {
        localStorage.setItem("likedProducts", JSON.stringify(likedProducts));
        localStorage.setItem("compareProducts", JSON.stringify(compareProducts));
      });
    }
  }, [likedProducts, compareProducts]);
};

export default StoreOldData;
