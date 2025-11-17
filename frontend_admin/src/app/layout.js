import { ToastContainer } from "react-toastify";
import "../../public/assets/scss/admin.scss";
import NoSsr from "@/utils/NoSsr";

export const metadata = {
  title: "Sheltos - Admin dashboard page Next 15",
  description: "Sheltos - Admin dashboard page Next 15",
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <head>
        <link href='https://fonts.googleapis.com/css?family=Montserrat:400,400i,500,500i,600,600i,700,700i,800,800i' rel='stylesheet'/>
        <link href='https://fonts.googleapis.com/css?family=Roboto:400,400i,500,500i,700,700i&display=swap' rel='stylesheet'/>
        <link href='https://fonts.googleapis.com/css?family=Rubik:400,400i,500,500i,700,700i' rel='stylesheet'/>
      </head>
      <body>
        <NoSsr>
          {children} <ToastContainer />
        </NoSsr>
      </body>
    </html>
  );
}
