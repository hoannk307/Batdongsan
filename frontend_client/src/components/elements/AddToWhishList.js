import { like, unlike } from "@/redux-toolkit/reducers/addToWishListReducer";
import { Fragment } from "react";
import { Heart } from "react-feather";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

const AddToWhishList = ({ id }) => {
  const dispatch = useDispatch();
  const { likedProducts } = useSelector((state) => state.addToWishListReducer);

  const isLiked = likedProducts?.includes(id);

  const notify = (type) => {
    toast(type ? "Product removed from wish list" : "Product added to wish list", {
      type: type ? "error" : "success",
    });
  };

  return (
    <Fragment>
      <Heart
        onClick={() => {
          dispatch(isLiked ? unlike(id) : like(id));
          notify(isLiked);
        }}
        fill={isLiked ? "active" : "none"}
        stroke='black'
        style={{ cursor: "pointer" }}
      />
    </Fragment>
  );
};

export default AddToWhishList;
