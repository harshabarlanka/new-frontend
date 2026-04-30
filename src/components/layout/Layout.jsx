import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden">
      {" "}
      {/* ← ADD w-full max-w-[100vw] */}
      <Navbar />
      <main className="flex-1 min-w-0">
        {" "}
        {/* ← ADD min-w-0 */}
        {children}
      </main>
      <Footer />
    </div>
  );
};
export default Layout;
