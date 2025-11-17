import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Navbar from "../components/Nav";

const MainLayout = () => {
  return (
    <div className="flex flex-col h-screen">
      {" "}
      {/* FIXED */}
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {" "}
        {/* PREVENT EXTRA HEIGHT */}
        <Navbar />
        <div className="flex-1 p-15 overflow-y-auto">
          {" "}
          {/* FIXED: removed h-screen */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
