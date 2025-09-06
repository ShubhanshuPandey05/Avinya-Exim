import React, { useEffect, useState } from "react";
import { useLoading } from "../context/LoadingContext";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const YourStocks = () => {
  const SERVER_URL = import.meta.env.VITE_SERVERURL;
  const authUser = JSON.parse(localStorage.getItem("authUser")) || {
    customerName: "",
    customerType: "",
    city: ""
  };

  const [recievingStocks, setRecievingStocks] = useState([]);
  const [city] = useState(authUser.city || "");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedStockId, setSelectedStockId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const { showLoading, hideLoading } = useLoading();
  const [isTableView, setIsTableView] = useState(true);

  const toggleView = () => {
    setIsTableView(!isTableView);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      showLoading();
      try {
        const response = await fetch(`${SERVER_URL}/api/get-stock/${city}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          new Error(`No Orders`);
        }

        const data = await response.json();
        setOrders(data.data || []);
      } catch (err) {
        setError(err.message || "Failed to fetch Stocks.");
      } finally {
        hideLoading();
      }
    };

    const gettingRecievingStock = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/api/get-stockRecieved?city=${city}`, {
          method: 'GET',
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log("Receiving stocks response:", response);
        
        // Handle 204 No Content response
        if (response.status === 204) {
          console.log("No stocks to receive (204 No Content)");
          setRecievingStocks([]);
          return;
        }
        
        const data = await response.json();
        console.log("Receiving stocks data:", data.data);

        setRecievingStocks(data.data || [])
      } catch (error) {
        console.error("Error fetching receiving stocks:", error);
        setError(error.message || "Failed to fetch receiving stocks.");
      }
    }

    if (city == 'Bangladesh' || city == 'Kolkata') {
      gettingRecievingStock();
    }

    fetchOrders();

  }, [city]);

  const sendToTransport = async (stockId) => {
    showLoading();
    try {
      const response = await fetch(`${SERVER_URL}/api/stocks-dispatching`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stockId }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to dispatch stock.");
      }

      // Update the UI and show success modal
      setShowConfirmModal(false);
      setShowSuccessModal(true);

      // Remove the dispatched stock from the orders
      setOrders((prevOrders) => prevOrders.filter((order) => order[0] !== stockId));
    } catch (err) {
      setError(err.message || "Failed to dispatch stock.");
    }
    hideLoading();
  };

  const transferToBangladesh = async (stockId) => {
    showLoading();
    try {
      const response = await fetch(`${SERVER_URL}/api/transfer-to-bangladesh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stockId }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to transfer stock to Bangladesh.");
      }

      // Update the UI and show success modal
      setShowConfirmModal(false);
      setShowSuccessModal(true);

      // Remove the transferred stock from the orders
      setOrders((prevOrders) => prevOrders.filter((order) => order[0] !== stockId));
    } catch (err) {
      setError(err.message || "Failed to transfer stock to Bangladesh.");
    }
    hideLoading();
  };

  const recieveFromTransport = async (stockId) => {
    showLoading();
    try {
      const response = await fetch(`${SERVER_URL}/api/stocks-recieving`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stockId }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to dispatch stock.");
      }
      const newStock = await response.json()

      // Remove the dispatched stock from the orders
      setRecievingStocks((prevOrders) => prevOrders.filter((order) => order[0] !== stockId));
      setOrders((prevOrders) => [...prevOrders, newStock]);
    } catch (err) {
      setError(err.message || "Failed to dispatch stock.");
    }
    hideLoading();
  };

  const onConfirmDispatch = (stockId) => {
    setSelectedStockId(stockId);
    setShowConfirmModal(true);
  };

  const onDispatchSuccess = () => {
    setShowSuccessModal(false);
    setSelectedStockId(null);
  };

  const transferToKolkata = async (stockId) => {
    showLoading();
    try {
      const response = await fetch(`${SERVER_URL}/api/transfer-to-kolkata`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stockId }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to transfer stock to Kolkata.");
      }

      // Remove the transferred stock from the orders
      setOrders((prevOrders) => prevOrders.filter((order) => order[0] !== stockId));
      
      // Show success message
      setError(null);
      toast.success("Stock transferred to Kolkata successfully!");
    } catch (err) {
      setError(err.message || "Failed to transfer stock to Kolkata.");
    }
    hideLoading();
  };

  const receiveFromSurat = async (stockId) => {
    showLoading();
    try {
      const response = await fetch(`${SERVER_URL}/api/receive-from-surat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stockId }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to receive stock from Surat.");
      }
      const newStock = await response.json()

      // Remove the received stock from the receiving list
      setRecievingStocks((prevOrders) => prevOrders.filter((order) => order[0] !== stockId));
      // Add to main orders list
      setOrders((prevOrders) => [...prevOrders, newStock]);
      
      // Show success message
      setError(null);
      toast.success("Stock received from Surat successfully!");
    } catch (err) {
      setError(err.message || "Failed to receive stock from Surat.");
    }
    hideLoading();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header Section */}
      <div className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
                <p className="text-sm text-gray-600 capitalize">{city} Location</p>
              </div>
            </div>
            
            {/* View Toggle */}
            <div className="bg-gray-100 rounded-xl p-1">
              <button
                className={`relative px-4 py-2 rounded-lg transition-all duration-200 ${
                  isTableView 
                    ? 'bg-white shadow-md text-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={toggleView}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0V4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1z" />
                  </svg>
                  <span className="text-sm font-medium">Table</span>
                </div>
              </button>
              <button
                className={`relative px-4 py-2 rounded-lg transition-all duration-200 ${
                  !isTableView 
                    ? 'bg-white shadow-md text-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={toggleView}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span className="text-sm font-medium">Cards</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Receiving Stocks Section */}
        {(city == "Bangladesh" || city == "Kolkata") && recievingStocks.length > 0 && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-3 rounded-xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {city == "Kolkata" ? "Stocks from Surat" : "Stocks from Kolkata"}
                  </h2>
                  <p className="text-orange-100">
                    {city == "Kolkata" ? "Ready to receive from Surat" : "Ready to receive from Kolkata"}
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            {isTableView ? (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Stock ID</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Bale No.</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Item Name</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Color</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Pcs</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Quantity</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Rate</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">City</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Bal. Qty</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recievingStocks.map((order, index) => (
                        <tr
                          key={index}
                          className={`hover:bg-gray-50 transition-colors duration-200 ${
                            parseInt(order[13]) < 1 ? "bg-red-50 border-l-4 border-red-400" : ""
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">#{order[0]}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order[1]}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order[3]}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{order[4]}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {order[5]}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order[6]}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order[7]} Mtr</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order[8]}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">{order[9]}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {order[10]}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex flex-col">
                              <span className="font-medium">{order[13]} Mtr</span>
                              <span className="text-gray-500">{order[14]} Pcs</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {order[15] === "yes" || order[15] === "Yes" ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Dispatched
                              </span>
                            ) : order[15] === "in transit" ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                In Transit
                              </span>
                            ) : order[15] === "dispatched" ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                Dispatched
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                              onClick={() => city == "Kolkata" ? receiveFromSurat(order[0]) : recieveFromTransport(order[0])}
                            >
                              {city == "Kolkata" ? "Receive from Surat" : "Receive"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 mb-20 lg:grid-cols-3 gap-6 p-2">
                {recievingStocks.map((order, index) => (
                  <div
                    key={index}
                    className={`rounded-lg p-4 shadow-md duration-300 transform hover:-translate-y-2 ${parseInt(order[13]) < 1 ? "bg-red-100" : "bg-white"
                      }`}
                  >
                    <div className={`col-span-1 ${order[15] === "Yes" || order[15] === "yes" ? "text-right" : "text-left"} pr-2 font-bold`}>
                      Stock Id: <span className="font-bold">{order[0]}</span>
                    </div>

                    {order[15] === "yes" || order[15] === "Yes" ? (
                      <div
                        className={`absolute top-5 -left-2 bg-red-600 text-white text-xs font-semibold py-1 px-3 transform -translate-y-3 -translate-x-3 rotate-[-42deg] shadow-md`}
                      >
                        Dispatched
                      </div>
                    ) : ""}

                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-l font-bold text-blue-800">{order[3]}</h3>
                      <div className={`text-sm font-semibold px-3 py-1 rounded-full shadow-md bg-green-100 text-green-500`}>
                        {order[10]}
                      </div>
                    </div>

                    <div className="text-gray-700 mt-2">
                      <div className="font-bold text-lg">{order[4]}</div>
                      <div className="flex justify-between md:w-[75%]">
                        <div className="text-sm text-gray-600 font-semibold w-fit">Color: {order[5]}</div>
                        <div className="text-sm font-semibold text-gray-600 w-fit">Quantity: {order[7]} Mtr</div>
                        <div className="text-sm font-semibold text-gray-600 w-fit">Pcs: {order[6]}</div>
                      </div>
                      {order[15] === "yes" || order[15] === "Yes" ? (
                        <div className="flex space-x-8 mt-2">
                          <div className="text-gray-600 font-semibold w-1/2 text-sm">Dispatched Date: {order[11]}</div>
                          <div className="font-semibold text-gray-600 w-1/2 text-sm">Received Date: {order[12]}</div>
                        </div>
                      ) : ""}
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-gray-600 italic text-sm">{order[1]}</div>
                        <div className="flex justify-center items-center space-x-4">
                          <div className="font-semibold text-blue-600">{order[9]}</div>
                          <div
                            className={`text-base right-4 bottom-4 px-3 py-1 rounded-xl flex justify-center text-center items-center shadow-md bg-yellow-100 text-black`}
                          >
                            Bal. Qty.: <span className="font-bold"> {order[13] + "Mtr" + "," + order[14] + "Pcs"}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <button
                          className="w-32 bg-blue-700 text-white p-1 rounded-xl my-2"
                          onClick={() => city == "Kolkata" ? receiveFromSurat(order[0]) : recieveFromTransport(order[0])}
                        >
                          {city == "Kolkata" ? "Receive from Surat" : "Recieve"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Main Stocks Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-3 rounded-xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">My Stocks</h2>
                  <p className="text-green-100">Manage your inventory</p>
                </div>
              </div>
              <div className="bg-white/20 px-4 py-2 rounded-xl">
                <div className="text-center">
                  <div className="text-2xl font-bold">{orders.length}</div>
                  <div className="text-xs text-green-100">Total Stocks</div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {orders.length === 0 && !error && (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No stocks found</h3>
              <p className="text-gray-500">Get started by adding some stocks to your inventory.</p>
            </div>
          )}

          {isTableView ? (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Stock ID</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Bale No.</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Item Name</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Color</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Pcs</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Rate</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Location</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Balance</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                      {(city === "Kolkata" || city === "Surat") && (
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order, index) => (
                      <tr
                        key={index}
                        className={`hover:bg-gray-50 transition-colors duration-200 ${
                          parseInt(order[13]) < 1 ? "bg-red-50 border-l-4 border-red-400" : ""
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">#{order[0]}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order[1]}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order[3]}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{order[4]}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {order[5]}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order[6]}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order[7]} Mtr</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order[8]}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">{order[9]}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order[10] === "Surat" ? "bg-green-100 text-green-800" :
                            order[10] === "Kolkata" ? "bg-blue-100 text-blue-800" :
                            order[10] === "Bangladesh" ? "bg-purple-100 text-purple-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {order[10]}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex flex-col">
                            <span className="font-medium">{order[13]} Mtr</span>
                            <span className="text-gray-500">{order[14]} Pcs</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {order[15] === "yes" || order[15] === "Yes" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Dispatched
                            </span>
                          ) : order[15] === "in transit" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              In Transit
                            </span>
                          ) : order[15] === "dispatched" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              Dispatched
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Available
                            </span>
                          )}
                        </td>
                        {city === "Kolkata" && (
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                              onClick={() => onConfirmDispatch(order[0])}
                            >
                              Transfer to Bangladesh
                            </button>
                          </td>
                        )}
                        {city === "Surat" && order[10] === "Surat" && (
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                              onClick={() => transferToKolkata(order[0])}
                            >
                              Transfer to Kolkata
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 mb-20 lg:grid-cols-3 gap-6 p-2">
              {orders.map((order, index) => (
                <div
                  key={index}
                  className={`rounded-lg p-4 shadow-md duration-300 transform hover:-translate-y-2 ${parseInt(order[13]) < 1 ? "bg-red-100" : "bg-white"
                    }`}
                >
                  <div className={`col-span-1 ${order[15] === "Yes" || order[15] === "yes" ? "text-right" : "text-left"} pr-2 font-bold`}>
                    Id: <span className="font-bold">{order[0]}</span>
                  </div>

                  {order[15] === "yes" || order[15] === "Yes" ? (
                    <div
                      className={`absolute top-5 -left-2 bg-red-600 text-white text-xs font-semibold py-1 px-3 transform -translate-y-3 -translate-x-3 rotate-[-42deg] shadow-md`}
                    >
                      Dispatched
                    </div>
                  ) : ""}

                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-l font-bold text-blue-800">Bale no.{order[3]}</h3>
                    <div className={`text-sm font-semibold px-3 py-1 rounded-full shadow-md bg-green-100 text-green-500`}>
                      {order[10]}
                    </div>
                  </div>

                  <div className="text-gray-700 mt-2">
                    <div className="font-bold text-lg">{order[4]}</div>
                    <div className="flex justify-between md:w-[75%]">
                      <div className="text-sm text-gray-600 font-semibold w-fit">Color: {order[5]}</div>
                      <div className="text-sm font-semibold text-gray-600 w-fit">Quantity: {order[7]} Mtr</div>
                      <div className="text-sm font-semibold text-gray-600 w-fit">Pcs: {order[6]}</div>
                    </div>
                    {order[15] === "yes" || order[15] === "Yes" ? (
                      <div className="flex space-x-8 mt-2">
                        <div className="text-gray-600 font-semibold w-1/2 text-sm">Dispatched Date: {order[11]}</div>
                        <div className="font-semibold text-gray-600 w-1/2 text-sm">Received Date: {order[12]}</div>
                      </div>
                    ) : ""}
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-gray-600 italic text-sm">{order[1]}</div>
                      <div className="flex justify-center items-center space-x-4">
                        <div className="font-semibold text-blue-600">{order[9]}</div>
                        <div
                          className={`text-base right-4 bottom-4 px-3 py-1 rounded-xl flex justify-center text-center items-center shadow-md bg-yellow-100 text-black`}
                        >
                          Bal. Qty.: <span className="font-bold"> {order[13] + "Mtr" + "," + order[14] + "Pcs"}</span>
                        </div>
                      </div>
                    </div>
                    {city === "Kolkata" && (
                      <div>
                        <button
                          className="w-32 bg-blue-700 text-white p-1 rounded-xl my-2"
                          onClick={() => onConfirmDispatch(order[0])}
                        >
                          Transfer to Bangladesh
                        </button>
                      </div>
                    )}
                    {city === "Surat" && order[10] === "Surat" && (
                      <div>
                        <button
                          className="w-32 bg-green-700 text-white p-1 rounded-xl my-2"
                          onClick={() => transferToKolkata(order[0])}
                        >
                          Transfer to Kolkata
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {city === "Kolkata" ? "Transfer to Bangladesh" : "Confirm Dispatch"}
                  </h2>
                </div>
                <p className="text-gray-600 mb-6">
                  {city === "Kolkata" ? "Are you sure you want to transfer this stock to Bangladesh?" : "Are you sure you want to dispatch this order?"}
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => city === "Kolkata" ? transferToBangladesh(selectedStockId) : sendToTransport(selectedStockId)}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
              <div className="p-6 text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {city === "Kolkata" ? "Transfer Successful!" : "Dispatch Successful!"}
                </h2>
                <p className="text-gray-600 mb-6">
                  {city === "Kolkata" ? "Your stock has been transferred to Bangladesh successfully!" : "Your stock has been dispatched successfully!"}
                </p>
                <button
                  onClick={onDispatchSuccess}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YourStocks;