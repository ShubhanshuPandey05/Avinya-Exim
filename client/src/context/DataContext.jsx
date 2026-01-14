import React, { createContext, useContext, useState, useEffect } from "react";
import { useLoading } from "./LoadingContext";

// Create the context
const DataContext = createContext();

// Create a provider component
export const DataProvider = ({ children }) => {
  const SERVER_URL = import.meta.env.VITE_SERVERURL;
  const [stocksData, setStocksData] = useState(null);
  const [receivingStocksData, setReceivingStocksData] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const { showLoading, hideLoading } = useLoading();

  const authUser = JSON.parse(localStorage.getItem("authUser")) || {
    customerName: "",
    customerType: "",
    city: ""
  };
  const city = authUser.city || "";

  // Fetch all data at once
  const fetchAllData = async () => {
    // Read city dynamically from localStorage each time
    const currentAuthUser = JSON.parse(localStorage.getItem("authUser")) || {};
    const currentCity = currentAuthUser.city || "";
    
    if (!currentCity) {
      console.log("No city found in authUser, skipping data fetch");
      return;
    }

    console.log("Fetching data for city:", currentCity);
    showLoading();
    try {
      // Fetch stocks data
      const stocksResponse = await fetch(`${SERVER_URL}/api/get-stock/${currentCity}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (stocksResponse.ok) {
        // Check if response has content before parsing
        const contentType = stocksResponse.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const text = await stocksResponse.text();
          if (text.trim()) {
            try {
              const stocksResult = JSON.parse(text);
              setStocksData(stocksResult.data || []);
            } catch (parseError) {
              console.error("Error parsing stocks JSON:", parseError);
              setStocksData([]);
            }
          } else {
            console.log("Stocks response is empty");
            setStocksData([]);
          }
        } else {
          console.log("Stocks response is not JSON");
          setStocksData([]);
        }
      } else {
        console.log("Stocks response not OK, status:", stocksResponse.status);
        setStocksData([]);
      }

      // Fetch receiving stocks data (only for Bangladesh and Kolkata)
      // Use case-insensitive comparison
      const cityLower = currentCity.toLowerCase();
      if (cityLower === 'bangladesh' || cityLower === 'kolkata') {
        console.log("Fetching receiving stocks for city:", currentCity);
        try {
          const receivingResponse = await fetch(`${SERVER_URL}/api/get-stockRecieved?city=${currentCity}`, {
            method: 'GET',
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          });

          console.log("Receiving stocks response status:", receivingResponse.status);
          if (receivingResponse.status === 204) {
            console.log("No receiving stocks found (204 status)");
            setReceivingStocksData([]);
          } else if (receivingResponse.ok) {
            // Check if response has content before parsing
            const contentType = receivingResponse.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              const text = await receivingResponse.text();
              if (text.trim()) {
                try {
                  const receivingResult = JSON.parse(text);
                  console.log("Receiving stocks data:", receivingResult.data?.length || 0, "items");
                  setReceivingStocksData(receivingResult.data || []);
                } catch (parseError) {
                  console.error("Error parsing receiving stocks JSON:", parseError);
                  setReceivingStocksData([]);
                }
              } else {
                console.log("Receiving stocks response is empty");
                setReceivingStocksData([]);
              }
            } else {
              console.log("Receiving stocks response is not JSON");
              setReceivingStocksData([]);
            }
          } else {
            console.log("Receiving stocks response not OK, status:", receivingResponse.status);
            setReceivingStocksData([]);
          }
        } catch (error) {
          console.error("Error fetching receiving stocks:", error);
          setReceivingStocksData([]);
        }
      } else {
        console.log("City is not Bangladesh or Kolkata, skipping receiving stocks fetch. City:", currentCity);
      }

      // Fetch sales data (only for Surat and Bangladesh)
      const cityLowerForSales = currentCity.toLowerCase();
      if (cityLowerForSales === 'surat' || cityLowerForSales === 'bangladesh') {
        console.log("Fetching sales data for city:", currentCity);
        try {
          const salesResponse = await fetch(`${SERVER_URL}/api/get-sales/${currentCity}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          });

          if (salesResponse.ok) {
            // Check if response has content before parsing
            const contentType = salesResponse.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              const text = await salesResponse.text();
              if (text.trim()) {
                try {
                  const salesResult = JSON.parse(text);
                  setSalesData(salesResult.data || []);
                } catch (parseError) {
                  console.error("Error parsing sales JSON:", parseError);
                  setSalesData([]);
                }
              } else {
                console.log("Sales response is empty");
                setSalesData([]);
              }
            } else {
              console.log("Sales response is not JSON");
              setSalesData([]);
            }
          } else {
            console.log("Sales response not OK, status:", salesResponse.status);
            setSalesData([]);
          }
        } catch (error) {
          console.error("Error fetching sales:", error);
          setSalesData([]);
        }
      }

      setIsDataLoaded(true);
      setLastFetchTime(new Date());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      hideLoading();
    }
  };

  // Initial data fetch
  useEffect(() => {
    // Read city dynamically from localStorage each time
    const currentAuthUser = JSON.parse(localStorage.getItem("authUser")) || {};
    const currentCity = currentAuthUser.city || "";
    
    console.log("DataContext useEffect - currentCity:", currentCity, "isDataLoaded:", isDataLoaded);
    
    if (currentCity && !isDataLoaded) {
      console.log("Calling fetchAllData for city:", currentCity);
      fetchAllData();
    } else if (!currentCity) {
      console.log("No city found in localStorage, skipping fetch");
    } else if (isDataLoaded) {
      console.log("Data already loaded, skipping fetch");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, isDataLoaded]);

  // Function to refresh specific data
  const refreshStocks = async () => {
    try {
      // Read city dynamically from localStorage each time
      const currentAuthUser = JSON.parse(localStorage.getItem("authUser")) || {};
      const currentCity = currentAuthUser.city || city;
      
      if (!currentCity) {
        console.error("City not found, cannot refresh stocks");
        return;
      }

      const response = await fetch(`${SERVER_URL}/api/get-stock/${currentCity}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const text = await response.text();
          if (text.trim()) {
            try {
              const result = JSON.parse(text);
              setStocksData(result.data || []);
              console.log("Stocks refreshed successfully, count:", result.data?.length || 0);
            } catch (parseError) {
              console.error("Error parsing stocks JSON on refresh:", parseError);
              setStocksData([]);
            }
          } else {
            console.log("Stocks refresh response is empty");
            setStocksData([]);
          }
        } else {
          console.log("Stocks refresh response is not JSON");
          setStocksData([]);
        }
      } else {
        console.error("Failed to refresh stocks, status:", response.status);
        setStocksData([]);
      }
    } catch (error) {
      console.error("Error refreshing stocks:", error);
    }
  };

  const refreshReceivingStocks = async () => {
    // Read city dynamically from localStorage each time
    const currentAuthUser = JSON.parse(localStorage.getItem("authUser")) || {};
    const currentCity = currentAuthUser.city || city;
    
    // Use case-insensitive comparison
    const cityLower = currentCity.toLowerCase();
    if (cityLower !== 'bangladesh' && cityLower !== 'kolkata') {
      console.log("City is not Bangladesh or Kolkata, skipping refresh. City:", currentCity);
      return;
    }
    
    console.log("Refreshing receiving stocks for city:", currentCity);
    try {
      const response = await fetch(`${SERVER_URL}/api/get-stockRecieved?city=${currentCity}`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      console.log("Refresh receiving stocks response status:", response.status);
      if (response.status === 204) {
        console.log("No receiving stocks found on refresh (204 status)");
        setReceivingStocksData([]);
      } else if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const text = await response.text();
          if (text.trim()) {
            try {
              const result = JSON.parse(text);
              console.log("Refreshed receiving stocks data:", result.data?.length || 0, "items");
              setReceivingStocksData(result.data || []);
            } catch (parseError) {
              console.error("Error parsing receiving stocks JSON on refresh:", parseError);
              setReceivingStocksData([]);
            }
          } else {
            console.log("Receiving stocks refresh response is empty");
            setReceivingStocksData([]);
          }
        } else {
          console.log("Receiving stocks refresh response is not JSON");
          setReceivingStocksData([]);
        }
      } else {
        console.log("Receiving stocks refresh response not OK, status:", response.status);
        setReceivingStocksData([]);
      }
    } catch (error) {
      console.error("Error refreshing receiving stocks:", error);
    }
  };

  const refreshSales = async () => {
    // Read city dynamically from localStorage each time
    const currentAuthUser = JSON.parse(localStorage.getItem("authUser")) || {};
    const currentCity = currentAuthUser.city || city;
    
    if (currentCity !== 'Surat' && currentCity !== 'Bangladesh') return;
    
    try {
      const response = await fetch(`${SERVER_URL}/api/get-sales/${currentCity}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const text = await response.text();
          if (text.trim()) {
            try {
              const result = JSON.parse(text);
              setSalesData(result.data || []);
              console.log("Sales refreshed successfully, count:", result.data?.length || 0);
            } catch (parseError) {
              console.error("Error parsing sales JSON on refresh:", parseError);
              setSalesData([]);
            }
          } else {
            console.log("Sales refresh response is empty");
            setSalesData([]);
          }
        } else {
          console.log("Sales refresh response is not JSON");
          setSalesData([]);
        }
      } else {
        console.error("Failed to refresh sales, status:", response.status);
        setSalesData([]);
      }
    } catch (error) {
      console.error("Error refreshing sales:", error);
    }
  };

  // Function to refresh all data
  const refreshAllData = async () => {
    await fetchAllData();
  };

  // Update stocks data optimistically
  const updateStocksData = (updater) => {
    setStocksData(prev => {
      if (typeof updater === 'function') {
        return updater(prev);
      }
      return updater;
    });
  };

  // Update receiving stocks data optimistically
  const updateReceivingStocksData = (updater) => {
    setReceivingStocksData(prev => {
      if (typeof updater === 'function') {
        return updater(prev || []);
      }
      return updater;
    });
  };

  // Update sales data optimistically
  const updateSalesData = (updater) => {
    setSalesData(prev => {
      if (typeof updater === 'function') {
        return updater(prev);
      }
      return updater;
    });
  };

  return (
    <DataContext.Provider
      value={{
        stocksData,
        receivingStocksData,
        salesData,
        isDataLoaded,
        lastFetchTime,
        refreshStocks,
        refreshReceivingStocks,
        refreshSales,
        refreshAllData,
        updateStocksData,
        updateReceivingStocksData,
        updateSalesData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// Custom hook to use the data context
export const useData = () => {
  return useContext(DataContext);
};

