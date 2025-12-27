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
  const [searchQuery, setSearchQuery] = useState("");

  // Local loading states for individual actions (button-level loading)
  const [loadingActions, setLoadingActions] = useState({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Bulk transfer states
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedStocks, setSelectedStocks] = useState([]);
  const [transferDate, setTransferDate] = useState('');
  const [receiveDate, setReceiveDate] = useState('');
  const [bulkAction, setBulkAction] = useState(''); // 'transfer-to-kolkata', 'receive-from-surat', 'transfer-to-bangladesh', 'receive-from-kolkata'

  // Helper function to set loading for a specific action
  const setActionLoading = (actionId, isLoading) => {
    setLoadingActions(prev => ({
      ...prev,
      [actionId]: isLoading
    }));
  };

  const toggleView = () => {
    setIsTableView(!isTableView);
  };

  // Search filter function
  const filterStocks = (stocks) => {
    if (!searchQuery.trim()) {
      return stocks;
    }

    const query = searchQuery.toLowerCase().trim();
    return stocks.filter((stock) => {
      // Search in StockID (order[0])
      const stockId = String(stock[0] || "").toLowerCase();
      // Search in Date (order[1])
      const date = String(stock[1] || "").toLowerCase();
      // Search in Bale No. (order[3])
      const baleNo = String(stock[3] || "").toLowerCase();
      // Search in Item Name (order[4])
      const itemName = String(stock[4] || "").toLowerCase();
      // Search in Color (order[5])
      const color = String(stock[5] || "").toLowerCase();
      // Search in Location (order[10])
      const location = String(stock[10] || "").toLowerCase();

      return (
        stockId.includes(query) ||
        date.includes(query) ||
        baleNo.includes(query) ||
        itemName.includes(query) ||
        color.includes(query) ||
        location.includes(query)
      );
    });
  };

  // Get filtered stocks
  const filteredOrders = filterStocks(orders);
  const filteredReceivingStocks = filterStocks(recievingStocks);

  useEffect(() => {
    const fetchOrders = async () => {
      // Only show full page loading on initial load
      if (isInitialLoad) {
        showLoading();
      }
      try {
        const response = await fetch(`${SERVER_URL}/api/get-stock/${city}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`No Orders`);
        }

        const data = await response.json();
        setOrders(data.data || []);
        setIsInitialLoad(false);
      } catch (err) {
        setError(err.message || "Failed to fetch Stocks.");
        setIsInitialLoad(false);
      } finally {
        if (isInitialLoad) {
          hideLoading();
        }
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

        // Handle 204 No Content response
        if (response.status === 204) {
          setRecievingStocks([]);
          return;
        }

        const data = await response.json();
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

  }, [city]); // Removed showBulkModal dependency to prevent unnecessary re-fetches

  const sendToTransport = async (stockId) => {
    setActionLoading(`dispatch-${stockId}`, true);
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

      // Optimistic update - remove from UI immediately
      setOrders((prevOrders) => prevOrders.filter((order) => order[0] !== stockId));
      
      // Update the UI and show success modal
      setShowConfirmModal(false);
      setShowSuccessModal(true);
      toast.success("Stock dispatched successfully!");
    } catch (err) {
      setError(err.message || "Failed to dispatch stock.");
      toast.error(err.message || "Failed to dispatch stock.");
      // On error, we could re-fetch to sync state, but for now just show error
    } finally {
      setActionLoading(`dispatch-${stockId}`, false);
    }
  };

  const transferToBangladesh = async (stockId) => {
    setActionLoading(`transfer-bd-${stockId}`, true);
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

      // Optimistic update
      setOrders((prevOrders) => prevOrders.filter((order) => order[0] !== stockId));
      
      // Update the UI and show success modal
      setShowConfirmModal(false);
      setShowSuccessModal(true);
      toast.success("Stock transferred to Bangladesh successfully!");
    } catch (err) {
      setError(err.message || "Failed to transfer stock to Bangladesh.");
      toast.error(err.message || "Failed to transfer stock to Bangladesh.");
    } finally {
      setActionLoading(`transfer-bd-${stockId}`, false);
    }
  };

  const recieveFromTransport = async (stockId) => {
    setActionLoading(`receive-${stockId}`, true);
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
        throw new Error("Failed to receive stock.");
      }
      const newStock = await response.json()

      // Optimistic update
      setRecievingStocks((prevOrders) => prevOrders.filter((order) => order[0] !== stockId));
      setOrders((prevOrders) => [...prevOrders, newStock]);
      toast.success("Stock received successfully!");
    } catch (err) {
      setError(err.message || "Failed to receive stock.");
      toast.error(err.message || "Failed to receive stock.");
    } finally {
      setActionLoading(`receive-${stockId}`, false);
    }
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
    setActionLoading(`transfer-kolkata-${stockId}`, true);
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

      // Optimistic update
      setOrders((prevOrders) => prevOrders.filter((order) => order[0] !== stockId));

      // Show success message
      setError(null);
      toast.success("Stock transferred to Kolkata successfully!");
    } catch (err) {
      setError(err.message || "Failed to transfer stock to Kolkata.");
      toast.error(err.message || "Failed to transfer stock to Kolkata.");
    } finally {
      setActionLoading(`transfer-kolkata-${stockId}`, false);
    }
  };

  const receiveFromSurat = async (stockId) => {
    setActionLoading(`receive-surat-${stockId}`, true);
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

      // Optimistic update
      setRecievingStocks((prevOrders) => prevOrders.filter((order) => order[0] !== stockId));
      setOrders((prevOrders) => [...prevOrders, newStock]);

      // Show success message
      setError(null);
      toast.success("Stock received from Surat successfully!");
    } catch (err) {
      setError(err.message || "Failed to receive stock from Surat.");
      toast.error(err.message || "Failed to receive stock from Surat.");
    } finally {
      setActionLoading(`receive-surat-${stockId}`, false);
    }
  };

  // Bulk transfer functions
  const handleBulkAction = (action) => {
    console.log('Opening bulk action modal for:', action);
    console.log('Available stocks for action:', action.includes('receive') ? recievingStocks : orders);
    setBulkAction(action);
    setSelectedStocks([]);
    setTransferDate('');
    setReceiveDate('');
    setShowBulkModal(true);
  };

  const handleStockSelection = (stockId) => {
    setSelectedStocks(prev =>
      prev.includes(stockId)
        ? prev.filter(id => id !== stockId)
        : [...prev, stockId]
    );
  };

  const handleSelectAll = () => {
    const currentStocks = bulkAction.includes('receive') ? filteredReceivingStocks : filteredOrders;
    const availableStocks = currentStocks
      .filter(stock => {
        if (bulkAction === 'transfer-to-kolkata') return stock[10] === 'Surat';
        if (bulkAction === 'receive-from-surat') return stock[10] === 'Transport';
        if (bulkAction === 'transfer-to-bangladesh') return stock[10] === 'Kolkata';
        if (bulkAction === 'receive-from-kolkata') return stock[10] === 'Transport';
        return false;
      })
      .map(stock => stock[0]);

    setSelectedStocks(availableStocks);
  };

  const executeBulkAction = async () => {
    if (selectedStocks.length === 0) {
      toast.error("Please select at least one stock");
      return;
    }

    setActionLoading('bulk-action', true);
    try {
      let endpoint = '';
      let requestBody = { stockIds: selectedStocks };

      switch (bulkAction) {
        case 'transfer-to-kolkata':
          endpoint = '/bulk-transfer-to-kolkata';
          requestBody.transferDate = transferDate || new Date().toLocaleDateString("en-IN");
          break;
        case 'receive-from-surat':
          endpoint = '/bulk-receive-from-surat';
          requestBody.receiveDate = receiveDate || new Date().toLocaleDateString("en-IN");
          break;
        case 'transfer-to-bangladesh':
          endpoint = '/bulk-transfer-to-bangladesh';
          requestBody.transferDate = transferDate || new Date().toLocaleDateString("en-IN");
          break;
        case 'receive-from-kolkata':
          endpoint = '/bulk-receive-from-kolkata';
          requestBody.receiveDate = receiveDate || new Date().toLocaleDateString("en-IN");
          break;
        default:
          throw new Error('Invalid bulk action');
      }

      const response = await fetch(`${SERVER_URL}/api${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      // Optimistic update
      if (bulkAction.includes('transfer')) {
        // Remove transferred stocks from current view
        setOrders(prevOrders =>
          prevOrders.filter(order => !selectedStocks.includes(order[0]))
        );
      } else if (bulkAction.includes('receive')) {
        // Remove received stocks from receiving list
        setRecievingStocks(prevStocks =>
          prevStocks.filter(stock => !selectedStocks.includes(stock[0]))
        );
      }

      setShowBulkModal(false);
      setSelectedStocks([]);
      toast.success(result.message);

    } catch (err) {
      toast.error(err.message || 'Failed to execute bulk action');
    } finally {
      setActionLoading('bulk-action', false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 sm:pb-20">
      {/* Header Section */}
      <div className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-row justify-between items-start sm:items-center py-4 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 sm:p-3 rounded-xl">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Stock Management</h1>
                <p className="text-xs sm:text-sm text-gray-600 capitalize">{city} Location</p>
              </div>
            </div>

            {/* View Toggle */}
            <div className="bg-gray-100 rounded-xl p-1 flex">
              <button
                className={`relative px-2 sm:px-4 py-2 rounded-lg transition-all duration-200 ${isTableView
                    ? 'bg-white shadow-md text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
                onClick={toggleView}
              >
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0V4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1z" />
                  </svg>
                  <span className="text-xs sm:text-sm font-medium hidden sm:inline">Table</span>
                </div>
              </button>
              <button
                className={`relative px-2 sm:px-4 py-2 rounded-lg transition-all duration-200 ${!isTableView
                    ? 'bg-white shadow-md text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
                onClick={toggleView}
              >
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span className="text-xs sm:text-sm font-medium hidden sm:inline">Cards</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Universal Search Bar */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by StockID, Date, Bale No., Item Name, Color, or Location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200"
                >
                  Clear
                </button>
              )}
            </div>
            {searchQuery && (
              <div className="mt-2 text-sm text-gray-600">
                Showing {filteredOrders.length} of {orders.length} stocks
                {filteredReceivingStocks.length > 0 && (
                  <span>, {filteredReceivingStocks.length} receiving stocks</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Receiving Stocks Section */}
        {(city == "Bangladesh" || city == "Kolkata") && recievingStocks.length > 0 && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-4 sm:p-6 text-white mb-6">
              <div className="flex flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 sm:p-3 rounded-xl">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-2xl font-bold">
                      {city == "Kolkata" ? "Stocks from Surat" : "Stocks from Kolkata"}
                    </h2>
                    <p className="text-orange-100 text-sm sm:text-base">
                      {city == "Kolkata" ? "Ready to receive from Surat" : "Ready to receive from Kolkata"}
                    </p>
                  </div>
                </div>

                {/* Bulk Receive Button */}
                <button
                  onClick={() => handleBulkAction(city === "Kolkata" ? 'receive-from-surat' : 'receive-from-kolkata')}
                  className="bg-white/20 hover:bg-white/30 px-3 sm:px-4 py-2 rounded-xl transition-all duration-200 flex items-center space-x-2"
                  title={`Bulk Receive ${city === "Kolkata" ? "from Surat" : "from Kolkata"}`}
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs sm:text-sm font-medium hidden sm:inline">Bulk Receive</span>
                </button>
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
                  <table className="w-full min-w-[1000px]">
                    <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      <tr>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider">Stock ID</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider">Date</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider">Bale No.</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider hidden sm:table-cell">Item Name</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Color</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider">Pcs</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider">Quantity</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider">Rate</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider">Amount</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">City</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider">Bal. Qty</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider hidden sm:table-cell">Status</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredReceivingStocks.map((order, index) => (
                        <tr
                          key={index}
                          className={`hover:bg-gray-50 transition-colors duration-200 ${parseInt(order[13]) < 1 ? "bg-red-50 border-l-4 border-red-400" : ""
                            }`}
                        >
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div className="text-xs sm:text-sm font-medium text-gray-900">#{order[0]}</div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{order[1]}</td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{order[3]}</td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                            <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[120px]">{order[4]}</div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden md:table-cell">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {order[5]}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{order[6]}</td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{order[7]} Mtr</td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{order[8]}</td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-semibold text-green-600">{order[9]}</td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden lg:table-cell">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {order[10]}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                            <div className="flex flex-col">
                              <span className="font-medium">{order[13]} Mtr</span>
                              <span className="text-gray-500 text-xs">{order[14]} Pcs</span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                            {order[15] === "yes" || order[15] === "Yes" ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Dispatched
                              </span>
                            ) : order[15] === "in transit" ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                In Transit
                              </span>
                            ) : order[15] === "dispatched" ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                Dispatched
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                            <button
                              disabled={loadingActions[city == "Kolkata" ? `receive-surat-${order[0]}` : `receive-${order[0]}`]}
                              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                              onClick={() => city == "Kolkata" ? receiveFromSurat(order[0]) : recieveFromTransport(order[0])}
                            >
                              {loadingActions[city == "Kolkata" ? `receive-surat-${order[0]}` : `receive-${order[0]}`] && (
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              )}
                              <span>{city == "Kolkata" ? "Receive from Surat" : "Receive"}</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-20">
                {filteredReceivingStocks.map((order, index) => (
                  <div
                    key={index}
                    className={`rounded-2xl p-4 sm:p-6 shadow-xl duration-300 transform hover:-translate-y-2 ${parseInt(order[13]) < 1 ? "bg-red-50 border border-red-200" : "bg-white border border-gray-100"
                      }`}
                  >
                    <div className={`col-span-1 ${order[15] === "Yes" || order[15] === "yes" ? "text-right" : "text-left"} pr-2 font-bold text-xs sm:text-sm`}>
                      Stock Id: <span className="font-bold">#{order[0]}</span>
                    </div>

                    {order[15] === "yes" || order[15] === "Yes" ? (
                      <div
                        className={`absolute top-3 -left-2 bg-red-600 text-white text-xs font-semibold py-1 px-2 transform -translate-y-2 -translate-x-2 rotate-[-42deg] shadow-md`}
                      >
                        Dispatched
                      </div>
                    ) : ""}

                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm sm:text-lg font-bold text-blue-800 truncate max-w-[120px]">{order[3]}</h3>
                      <div className={`text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 rounded-full shadow-md bg-green-100 text-green-500`}>
                        {order[10]}
                      </div>
                    </div>

                    <div className="text-gray-700 mt-2">
                      <div className="font-bold text-sm sm:text-lg truncate">{order[4]}</div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                        <div className="text-xs sm:text-sm text-gray-600 font-semibold">Color: {order[5]}</div>
                        <div className="text-xs sm:text-sm font-semibold text-gray-600">Qty: {order[7]} Mtr</div>
                        <div className="text-xs sm:text-sm font-semibold text-gray-600">Pcs: {order[6]}</div>
                      </div>
                      {order[15] === "yes" || order[15] === "Yes" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                          <div className="text-gray-600 font-semibold text-xs sm:text-sm">Dispatch: {order[11]}</div>
                          <div className="font-semibold text-gray-600 text-xs sm:text-sm">Received: {order[12]}</div>
                        </div>
                      ) : ""}
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-gray-600 italic text-xs sm:text-sm">{order[1]}</div>
                        <div className="flex justify-center items-center space-x-2 sm:space-x-4">
                          <div className="font-semibold text-blue-600 text-xs sm:text-sm">₹{order[9]}</div>
                          <div
                            className={`text-xs sm:text-sm right-4 bottom-4 px-2 sm:px-3 py-1 rounded-xl flex justify-center text-center items-center shadow-md bg-yellow-100 text-black`}
                          >
                            Bal: <span className="font-bold"> {order[13]}M,{order[14]}P</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <button
                          disabled={loadingActions[city == "Kolkata" ? `receive-surat-${order[0]}` : `receive-${order[0]}`]}
                          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 rounded-xl text-xs sm:text-sm font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                          onClick={() => city == "Kolkata" ? receiveFromSurat(order[0]) : recieveFromTransport(order[0])}
                        >
                          {loadingActions[city == "Kolkata" ? `receive-surat-${order[0]}` : `receive-${order[0]}`] && (
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          )}
                          <span>{city == "Kolkata" ? "Receive from Surat" : "Receive"}</span>
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
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-4 sm:p-6 text-white mb-6">
            <div className="flex flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 sm:p-3 rounded-xl">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold">My Stocks</h2>
                  <p className="text-green-100 text-sm sm:text-base">Manage your inventory</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 px-3 sm:px-4 py-2 rounded-xl">
                  <div className="text-center">
                    <div className="text-lg sm:text-2xl font-bold">{searchQuery ? filteredOrders.length : orders.length}</div>
                    <div className="text-xs text-green-100">{searchQuery ? 'Filtered' : 'Total'} Stocks</div>
                  </div>
                </div>

                {/* Bulk Action Buttons */}
                {city === "Surat" && filteredOrders.some(order => order[10] === "Surat") && (
                  <button
                    onClick={() => handleBulkAction('transfer-to-kolkata')}
                    className="bg-white/20 hover:bg-white/30 px-3 sm:px-4 py-2 rounded-xl transition-all duration-200 flex items-center space-x-2"
                    title="Bulk Transfer to Kolkata"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-xs sm:text-sm font-medium hidden sm:inline">Bulk Transfer</span>
                  </button>
                )}

                {city === "Kolkata" && filteredOrders.some(order => order[10] === "Kolkata") && (
                  <button
                    onClick={() => handleBulkAction('transfer-to-bangladesh')}
                    className="bg-white/20 hover:bg-white/30 px-3 sm:px-4 py-2 rounded-xl transition-all duration-200 flex items-center space-x-2"
                    title="Bulk Transfer to Bangladesh"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-xs sm:text-sm font-medium hidden sm:inline">Bulk Transfer</span>
                  </button>
                )}
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

          {filteredOrders.length === 0 && orders.length > 0 && searchQuery && (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No stocks found</h3>
              <p className="text-gray-500">Try adjusting your search query.</p>
            </div>
          )}

          {orders.length === 0 && !error && !searchQuery && (
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
                    {filteredOrders.map((order, index) => (
                      <tr
                        key={index}
                        className={`hover:bg-gray-50 transition-colors duration-200 ${parseInt(order[13]) < 1 ? "bg-red-50 border-l-4 border-red-400" : ""
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
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order[10] === "Surat" ? "bg-green-100 text-green-800" :
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
                              disabled={loadingActions[`transfer-kolkata-${order[0]}`]}
                              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                              onClick={() => transferToKolkata(order[0])}
                            >
                              {loadingActions[`transfer-kolkata-${order[0]}`] && (
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              )}
                              <span>Transfer to Kolkata</span>
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
              {filteredOrders.map((order, index) => (
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
                          disabled={loadingActions[`transfer-kolkata-${order[0]}`]}
                          className="w-32 bg-green-700 text-white p-1 rounded-xl my-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                          onClick={() => transferToKolkata(order[0])}
                        >
                          {loadingActions[`transfer-kolkata-${order[0]}`] && (
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          )}
                          <span>Transfer to Kolkata</span>
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

        {/* Bulk Transfer Modal */}
        {showBulkModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full transform transition-all mx-4">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {bulkAction === 'transfer-to-kolkata' && 'Bulk Transfer to Kolkata'}
                      {bulkAction === 'receive-from-surat' && 'Bulk Receive from Surat'}
                      {bulkAction === 'transfer-to-bangladesh' && 'Bulk Transfer to Bangladesh'}
                      {bulkAction === 'receive-from-kolkata' && 'Bulk Receive from Kolkata'}
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Select stocks and set the transfer/receive date
                    </p>
                  </div>
                </div>

                {/* Date Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {bulkAction.includes('transfer') ? 'Transfer Date' : 'Receive Date'}
                  </label>
                  <input
                    type="date"
                    value={bulkAction.includes('transfer') ? transferDate : receiveDate}
                    onChange={(e) => {
                      if (bulkAction.includes('transfer')) {
                        setTransferDate(e.target.value);
                      } else {
                        setReceiveDate(e.target.value);
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                </div>

                {/* Stock Selection */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Select Stocks</h3>
                    <button
                      onClick={handleSelectAll}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Select All
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-xl">
                    {(bulkAction.includes('receive') ? filteredReceivingStocks : filteredOrders)
                      .filter(stock => {
                        const isTransferToKolkata = bulkAction === 'transfer-to-kolkata' && stock[10] === 'Surat';
                        const isReceiveFromSurat = bulkAction === 'receive-from-surat' && stock[10] === 'Transport';
                        const isTransferToBangladesh = bulkAction === 'transfer-to-bangladesh' && stock[10] === 'Kolkata';
                        const isReceiveFromKolkata = bulkAction === 'receive-from-kolkata' && stock[10] === 'Transport';

                        return isTransferToKolkata || isReceiveFromSurat || isTransferToBangladesh || isReceiveFromKolkata;
                      })
                      .map((stock, index) => (
                        <div
                          key={stock[0]}
                          className="flex items-center space-x-3 p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <input
                            type="checkbox"
                            checked={selectedStocks.includes(stock[0])}
                            onChange={() => handleStockSelection(stock[0])}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">#{stock[0]}</span>
                              <span className="text-sm text-gray-500">{stock[3]}</span>
                            </div>
                            <div className="text-sm text-gray-600">{stock[4]} - {stock[5]}</div>
                            <div className="text-xs text-gray-500">
                              Qty: {stock[7]}M, Pcs: {stock[6]}, Bal: {stock[13]}M
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {selectedStocks.length > 0 && (
                    <div className="mt-3 text-sm text-gray-600">
                      {selectedStocks.length} stock(s) selected
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowBulkModal(false);
                      setSelectedStocks([]);
                      setTransferDate('');
                      setReceiveDate('');
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeBulkAction}
                    disabled={selectedStocks.length === 0 || loadingActions['bulk-action']}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loadingActions['bulk-action'] && (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    <span>{bulkAction.includes('transfer') ? 'Transfer' : 'Receive'} ({selectedStocks.length})</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YourStocks;