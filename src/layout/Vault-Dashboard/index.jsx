import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  const [isOpen, setIsOpen] = useState(false);


  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  return (
    <div className="h-full w-full bg-[#000000] min-h-screen text-white ">
      <Navbar toggleSidebar={toggleSidebar} />
      <div>
        <div className="flex lg:gap-5 w-full h-full pt-28 ">
          <div className="lg:w-full max-w-[292px]">
            <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
          </div>
          <div className="w-full lx:ml-[242px] lg:max-w-[1161px] mx-auto h-full ">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
