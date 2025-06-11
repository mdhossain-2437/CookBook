import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Shared/Navbar/Navbar";
import Footer from "../components/Shared/Footer/Footer";
import { ToastContainer } from "react-toastify";
import { useEffect } from "react";
import { Fade } from "react-awesome-reveal";

const MainLayout = () => {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-[72px]"> {/* Added padding-top to ensure content is below navbar */}
        <Fade duration={800} triggerOnce>
          <Outlet />
        </Fade>
      </main>
      <Footer />
      <ToastContainer position="top-right" />
    </div>
  );
};

export default MainLayout;