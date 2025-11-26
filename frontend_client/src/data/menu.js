import { Clipboard, Home, Layers, Link, MapPin, User, Zap } from "react-feather";

export const MainNavMenuItems = [
  {
    title: "BÁN NHÀ ĐẤT",
    icon: <Home />,       
    path: "/batdongsan",
    type: "link",
  },
  {
    title: "THUÊ NHÀ ĐẤT",
    icon: <Home />,       
    path: "/batdongsan",
    type: "link",
  },
  {
    title: "TIN TỨC",
    type: "link",
    path: "/news",
  },
  {
    title: "DU LỊCH",
    type: "link",
    path: "/dulich",
  },
  {
    title: "LIÊN HỆ",
    type: "link",
    path: "/contact/contact-us-1",
  },
];

export const languageDropDownData = [
  { lang: "en", language: "English" },
  { lang: "fr", language: "French" },
  { lang: "ar", language: "Arabic" },
  { lang: "es", language: "Spanish" },
];

export const RightNavMenuItem = [
  {
    title: "language"
  },
  {
    title: "cart",
  },
  {
    title: "currency",
    type: [
      {
        currency: "USD",
        name: "dollar",
        symbol: "$",
        value: 1,
      },
      {
        currency: "EUR",
        name: "euro",
        symbol: "€",
        value: 0.997,
      },
      {
        currency: "GBP",
        name: "pound",
        symbol: "£",
        value: 0.847,
      },
      {
        currency: "IND",
        name: "rupees",
        symbol: "₹",
        value: 79.9,
      },
    ],
  },
  { title: "user" },
];
