import React, { createContext, useContext, useState } from "react";

// Create the context
const LoadingContext = createContext();

// Create a provider component
export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Functions to control the loading state
  const showLoading = () => setIsLoading(true);
  const hideLoading = () => setIsLoading(false);

  return (
    <LoadingContext.Provider value={{ isLoading, showLoading, hideLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

// Custom hook to use the loading context
export const useLoading = () => {
  return useContext(LoadingContext);
};
