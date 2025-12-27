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
    if (!city) return;

    showLoading();
    try {
      // Fetch stocks data
      const stocksResponse = await fetch(`${SERVER_URL}/api/get-stock/${city}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (stocksResponse.ok) {
        const stocksResult = await stocksResponse.json();
        setStocksData(stocksResult.data || []);
      }

      // Fetch receiving stocks data (only for Bangladesh and Kolkata)
      if (city === 'Bangladesh' || city === 'Kolkata') {
        try {
          const receivingResponse = await fetch(`${SERVER_URL}/api/get-stockRecieved?city=${city}`, {
            method: 'GET',
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          });

          if (receivingResponse.ok && receivingResponse.status !== 204) {
            const receivingResult = await receivingResponse.json();
            setReceivingStocksData(receivingResult.data || []);
          } else {
            setReceivingStocksData([]);
          }
        } catch (error) {
          console.error("Error fetching receiving stocks:", error);
          setReceivingStocksData([]);
        }
      }

      // Fetch sales data (only for Surat and Bangladesh)
      if (city === 'Surat' || city === 'Bangladesh') {
        try {
          const salesResponse = await fetch(`${SERVER_URL}/api/get-sales/${city}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          });

          if (salesResponse.ok) {
            const salesResult = await salesResponse.json();
            setSalesData(salesResult.data || []);
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
    if (city && !isDataLoaded) {
      fetchAllData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city]);

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
        const result = await response.json();
        setStocksData(result.data || []);
        console.log("Stocks refreshed successfully, count:", result.data?.length || 0);
      } else {
        console.error("Failed to refresh stocks, status:", response.status);
      }
    } catch (error) {
      console.error("Error refreshing stocks:", error);
    }
  };

  const refreshReceivingStocks = async () => {
    // Read city dynamically from localStorage each time
    const currentAuthUser = JSON.parse(localStorage.getItem("authUser")) || {};
    const currentCity = currentAuthUser.city || city;
    
    if (currentCity !== 'Bangladesh' && currentCity !== 'Kolkata') return;
    
    try {
      const response = await fetch(`${SERVER_URL}/api/get-stockRecieved?city=${currentCity}`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok && response.status !== 204) {
        const result = await response.json();
        setReceivingStocksData(result.data || []);
      } else {
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
        const result = await response.json();
        setSalesData(result.data || []);
        console.log("Sales refreshed successfully, count:", result.data?.length || 0);
      } else {
        console.error("Failed to refresh sales, status:", response.status);
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

