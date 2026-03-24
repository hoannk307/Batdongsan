
import Link from "next/link";
import React from "react";
import { Camera, Heart } from "react-feather";
import ImageSlider from "../../myproperties/ImageSlider";
import AddToCompareProducts from "./AddToCompareProducts";
import PropertyLabel from "./PropertyLabel";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const PropertyBox = ({ data }) => {
    const symbol = '$';
    const currencyValue = 1;
    const router = useRouter();

    // Defensive mapping để hỗ trợ cả dữ liệu mock cũ và dữ liệu từ backend mới
    const images = Array.isArray(data?.img) ? data.img : [];
    const labels = data?.label;
    const country = data?.country || data?.any_city || "USA";
    const title = data?.title || data?.landmark || "Property";
    const price = typeof data?.price === "number" ? data.price : 48596.0;
    const details =
        data?.details ||
        data?.description ||
        "This home provides wonderful entertaining spaces with a chef kitchen opening. Elegant retreat in a quiet Coral Gables setting..";
    const bed = data?.bed ?? data?.beds ?? 5;
    const bath = data?.bath ?? data?.baths ?? 5;
    const sqft = data?.sqft ?? data?.area ?? 5;
    const date = data?.date || data?.created_at || "";

    const NavigateFavourit = () => {
        toast.success('Add Favourites Successful..');
        router.push('/myproperties/favourites');
    };

    return (
        <>
            <div className="property-box">
                <div className="property-image">
                    <ImageSlider images={images} />
                    <div className="labels-left">
                        <PropertyLabel labels={labels} />
                    </div>
                    <div className="seen-data">
                        <Camera />
                        <span>{images.length || 5}</span>
                    </div>
                    <div className="overlay-property-box">
                        <Link
                            href="https://sheltos-react.vercel.app/pages/user-panel/compare-property"
                            className="effect-round"
                            title="Compare"
                        >
                            <AddToCompareProducts id={data?.id} />
                        </Link>
                        <div className="effect-round like" onClick={NavigateFavourit} title="wishlist">
                            <Heart />
                        </div>
                    </div>
                </div>
                <div className="property-details">
                    <span className="font-roboto">{country} </span>
                    <Link
                        href={Array.isArray(images) ? `/property/image-slider/?id=${data?.id}` : `/property/image-box/?id=${data?.id}`}
                    >
                        <h3>{title}</h3>
                    </Link>
                    <h6>
                        {symbol}
                        {(price * currencyValue).toFixed(2)}*
                    </h6>
                    <p className="font-roboto">{details} </p>
                    <ul>
                        <li>
                            <img src="/assets/images/svg/icon/double-bed.svg" className="img-fluid" alt="" />
                            Bed : {bed}
                        </li>
                        <li>
                            <img src="/assets/images/svg/icon/bathroom.svg" className="img-fluid" alt="" />
                            Baths : {bath}
                        </li>
                        <li>
                            <img src="/assets/images/svg/icon/square-ruler-tool.svg" className="img-fluid ruler-tool" alt="" />
                            Sq Ft : {sqft}
                        </li>
                    </ul>
                    <div className="property-btn d-flex">
                        <span>{date}</span>
                        <Link href="https://sheltos-react.vercel.app/property/image-box">
                            <button type="button" className="btn btn-dashed btn-pill">
                                Details
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PropertyBox;
