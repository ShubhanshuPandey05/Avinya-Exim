import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AiOutlineForm } from "react-icons/ai";
import { CiBoxList } from "react-icons/ci";

const BottomNavBar = () => {
  const authUser = JSON.parse(localStorage.getItem("authUser")) || {
    contactPersonName: "",
    contactNo: "",
    companyName: "",
    userType: "",
    city: "", // Ensure city is initialized to avoid undefined
  };

  // Determine the second route based on city
  const [city] = useState(authUser.city || "");
  let secondRoute = null;

  if (city === "Surat") {
    secondRoute = "/add-stocks";
  } else if (city === "Bangladesh") {
    secondRoute = "/add-sales";
  }

  // Define the menu items dynamically
  const Menus = [
    { name: "My Stocks", icon: <CiBoxList size={24} />, path: "/" },
    ...(secondRoute
      ? [{ name: city === "Surat" ? "Add Stocks" : "Add Sales", icon: <AiOutlineForm size={24} />, path: secondRoute }]
      : []),
  ];


  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState(0);
  const [indicatorPosition, setIndicatorPosition] = useState({ left: 0, width: 0 });
  const navRef = useRef(null);

  useEffect(() => {
    // Calculate the position of the indicator based on screen width and tab positions
    const updateIndicatorPosition = () => {
      const navWidth = navRef.current.getBoundingClientRect().width;
      const tabWidth = navWidth / 2;
      const centerOffset = tabWidth / 2;

      // Based on the active tab, calculate its center position
      const currentTabIndex = Menus.findIndex(menu => menu.path === location.pathname);
      const newLeft = currentTabIndex === 0 ? 0 + centerOffset : tabWidth + centerOffset;

      setIndicatorPosition({
        left: newLeft,
        width: tabWidth,
      });

      if (location.pathname == "/") {
        setActive(0)
      } else {
        setActive(1)
      }
    };

    updateIndicatorPosition(); // Update on initial render

    // Optional: Add event listener to handle screen resizing
    window.addEventListener("resize", updateIndicatorPosition);
    return () => {
      window.removeEventListener("resize", updateIndicatorPosition);
    };
  }, [location.pathname]); // Recalculate position whenever the active tab changes

  const handleNavigate = (index, path) => {
    setActive(index);
    navigate(path);
  };

  return (
    <div className="bg-white h-[4.4rem] rounded-t-xl fixed bottom-0 left-0 right-0 shadow-md w-screen" ref={navRef}>
      <ul className="flex relative justify-around" >
        {/* Active Indicator */}
        <span
          className="bg-blue-600 duration-500 border-4 border-white h-16 w-16 absolute -top-5 rounded-full"
          style={{ left: `${indicatorPosition.left - 32}px` }}
        >
          <span className="w-3.5 h-3.5 bg-transparent absolute top-4 -left-[18px] rounded-tr-[11px] shadow-myShadow1"></span>
          <span className="w-3.5 h-3.5 bg-transparent absolute top-4 -right-[18px] rounded-tl-[11px] shadow-myShadow2"></span>
        </span>

        {/* Menu Items */}
        {Menus.map((menu, i) => (
          <li key={i} className="w-full flex justify-center">
            <button
              className="flex flex-col items-center text-center pt-6"
              onClick={() => handleNavigate(i, menu.path)}
            >
              <span
                className={`text-2xl cursor-pointer duration-500 ${i === active ? "-mt-6 text-white z-50" : "-mt-3"}`}
              >
                {menu.icon}
              </span>
              <span
                className={`text-sm font-medium ${active != i ? "duration-700 opacity-100 text-black" : "opacity-0 translate-y-10 text-gray-500"}`}
              >
                {menu.name}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BottomNavBar;
