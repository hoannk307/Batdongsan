import { Fragment } from "react";
import BodyContent from "@/components/pages/blogDetailPages";
import Breadcrumb from "@/layout/Breadcrumb/Breadcrumb";
import FooterThree from "@/layout/footers/FooterThree";
import NavbarThree from "@/layout/headers/NavbarThree";
import Img from "@/utils/BackgroundImageRatio";
import NavbarFour from "@/layout/headers/NavbarFour";
import HomeBannerSection from "@/components/home/corporate/HomeBanner";
import { fetchWithTimeout, getBackendBaseUrl } from "@/lib/api/fetchBackend";
import { mapNewsToBlogItem } from "@/lib/api/mappers/newsMapper";

const DetailNews = async ({ searchParams }) => {
  const id = (await searchParams)?.id;
  const backendApiBaseUrl = getBackendBaseUrl();
  
  let news = null;
  if (id) {
    try {
      const resNews = await fetchWithTimeout(`${backendApiBaseUrl}/news/${encodeURIComponent(id)}`, { cache: "no-store" });
      const payloadNews = await resNews.json().catch(() => null);
      if (resNews.ok && payloadNews && payloadNews.status === "PUBLISHED") {
        news = mapNewsToBlogItem(payloadNews);
      }
    } catch (e) {
      console.error("Error fetching news detail:", e);
    }
  }

  let bdsQuangCao = [];
  try {
    const resBds = await fetchWithTimeout(`${backendApiBaseUrl}/news/category/0?page=1&limit=6&status=PUBLISHED`, { cache: "no-store" });
    const payloadBds = await resBds.json().catch(() => null);
    if (resBds.ok && Array.isArray(payloadBds?.data)) {
      bdsQuangCao = payloadBds.data.map(mapNewsToBlogItem);
    }
  } catch (e) {
    console.error("Error fetching ads:", e);
  }

  return (
    <Fragment>
      <NavbarFour />
      <HomeBannerSection value={bdsQuangCao} />
      <BodyContent side={"left"} id={id} initialNews={news}>
        <div className='blog-detail-image'>
          <Img src={news?.img} className='bg-img img-fluid' alt='' />
        </div>
      </BodyContent>
      <FooterThree />
    </Fragment>
  );
};
export default DetailNews;
