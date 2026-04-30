import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // change to "smooth" if you want
    });
  }, [location]); // ✅ IMPORTANT CHANGE

  return null;
};

export default ScrollToTop;
