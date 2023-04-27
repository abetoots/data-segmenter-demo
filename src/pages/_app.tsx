import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <ToastContainer
        autoClose={false}
        hideProgressBar={true}
        draggable={false}
        closeButton={false}
      />
      <Component {...pageProps} />
    </>
  );
};

export default api.withTRPC(MyApp);
