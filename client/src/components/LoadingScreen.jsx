import React from "react";
import { useLoading } from "../context/LoadingContext";

const LoadingScreen = () => {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-white bg-opacity-75 z-50">
      <div className="flex flex-col items-center">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-20 w-20 mb-4 animate-spin"></div>
        {/* <p className="text-gray-700 text-lg font-semibold">Loading...</p> */}
      </div>
      <style>
        {`
          .loader {
            border-top-color: #3498db;
          }
        `}
      </style>
    </div>
  );
};

export default LoadingScreen;
