import React, { useEffect, useState } from 'react'
import { useLoading } from '../context/LoadingContext';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function MySales() {
  const SERVER_URL = import.meta.env.VITE_SERVERURL;
  const authUser = JSON.parse(localStorage.getItem("authUser")) || {
    customerName: "",
    customerType: "",
    city: ""
  };
  const [city] = useState(authUser.city || "");
  const [totalAmount, setTotalAmount] = useState();
  const [totalPcs, setTotalPcs] = useState("");
  const [totalQty, setTotalQty] = useState("");
  const [totalRate, setTotalRate] = useState("");
  const [error, setError] = useState(null);
  const { showLoading, hideLoading } = useLoading();
  const [isTableView, setIsTableView] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");

  // Get data from context
  const {
    salesData,
    refreshSales,
    updateSalesData,
  } = useData();

  // Use context data or empty array as fallback
  const orders = salesData || [];

  const toggleView = () => {
    setIsTableView(!isTableView);
  };

  const handlePaymentUpdate = (saleId, status) => {
    if (status === 'partial') {
      const sale = orders.find(order => order[0] === saleId);
      setSelectedSale({
        id: saleId,
        status,
        currentReceived: sale[14] || 0,
        totalAmount: sale[12] || 0
      });
      setShowPaymentModal(true);
    } else {
      updatePaymentStatus(saleId, status);
    }
  };

  const updatePaymentStatus = async (saleId, status, amount = null) => {
    try {
      const response = await fetch(`${SERVER_URL}/api/update-payment-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          saleId,
          paymentStatus: status,
          amountReceived: amount
        }),
        credentials: 'include',
      });

      if (response.ok) {
        // Refresh the sales data from context
        await refreshSales();
        setShowPaymentModal(false);
        setPaymentAmount("");
        toast.success("Payment status updated successfully!");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Failed to update payment status");
    }
  };

  const handlePartialPayment = () => {
    if (paymentAmount && selectedSale) {
      updatePaymentStatus(selectedSale.id, 'partial', paymentAmount);
    }
  };

  // Data is now loaded from context, no need to fetch here

  useEffect(() => {
    const calculateTotals = () => {
      if (orders.length > 0) {
        const totalAmount = orders.reduce((sum, order) => sum + parseFloat(order[12] || 0), 0);
        const totalReceived = orders.reduce((sum, order) => sum + parseFloat(order[14] || 0), 0);
        const totalPending = orders.reduce((sum, order) => sum + parseFloat(order[15] || 0), 0);
        const averageRate = orders.reduce((sum, order) => sum + parseFloat(order[11] || 0), 0) / orders.length;

        setTotalAmount(parseFloat(totalAmount));
        setTotalPcs(totalReceived); // Using totalPcs state for total received
        setTotalQty(totalPending); // Using totalQty state for total pending
        setTotalRate(averageRate);
      }
    };

    calculateTotals();
  }, [orders]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 sm:pb-20">
      {/* Header Section */}
      <div className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-row justify-between items-start sm:items-center py-4 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="bg-gradient-to-r from-orange-600 to-red-600 p-2 sm:p-3 rounded-xl">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Sales History</h1>
                <p className="text-xs sm:text-sm text-gray-600 capitalize">{city} Location</p>
              </div>
            </div>

            {/* View Toggle */}
            <div className="bg-gray-100 rounded-xl p-1 flex">
              <button
                className={`relative px-2 sm:px-4 py-2 rounded-lg transition-all duration-200 ${isTableView
                    ? 'bg-white shadow-md text-orange-600'
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
                    ? 'bg-white shadow-md text-orange-600'
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
        {/* Sales Summary Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-4 sm:p-6 text-white mb-6">
            <div className="flex flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2sm:p-3 rounded-xl">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold">Sales Overview</h2>
                  <p className="text-orange-100 text-sm sm:text-base">Track your sales performance</p>
                </div>
              </div>
              <div className="bg-white/20 px-3 sm:px-4 py-2 rounded-xl">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold">{orders.length}</div>
                  <div className="text-xs text-orange-100">Total Sales</div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Amount</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-600 truncate">₹{totalAmount ? totalAmount.toFixed(2) : '0.00'}</p>
                </div>
                <div className="bg-green-100 p-2 sm:p-3 rounded-xl flex-shrink-0 ml-2">
                  <svg
                    className="w-4 h-4 sm:w-6 sm:h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 6h12M6 10h12M9 6c3 0 6 2 6 5s-3 5-6 5h-3l7 6"
                    />
                  </svg>

                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Received</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-600 truncate">₹{totalPcs ? totalPcs.toFixed(2) : '0.00'}</p>
                </div>
                <div className="bg-green-100 p-2 sm:p-3 rounded-xl flex-shrink-0 ml-2">
                  <svg className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Pending</p>
                  <p className="text-lg sm:text-2xl font-bold text-red-600 truncate">₹{totalQty ? totalQty.toFixed(2) : '0.00'}</p>
                </div>
                <div className="bg-red-100 p-2 sm:p-3 rounded-xl flex-shrink-0 ml-2">
                  <svg className="w-4 h-4 sm:w-6 sm:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Average Rate</p>
                  <p className="text-lg sm:text-2xl font-bold text-orange-600 truncate">₹{totalRate ? totalRate.toFixed(2) : '0.00'}</p>
                </div>
                <div className="bg-orange-100 p-2 sm:p-3 rounded-xl flex-shrink-0 ml-2">
                  <svg className="w-4 h-4 sm:w-6 sm:h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
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

        {/* No Sales Message */}
        {orders.length === 0 && !error && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sales found</h3>
            <p className="text-gray-500">Start making sales to see them here.</p>
          </div>
        )}

        {/* Sales Table/Cards */}
        {orders.length > 0 && (
          <>
            {isTableView ? (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1400px]">
                    <thead className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
                      <tr>
                        <th className="px-2 sm:px-3 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider">Stock ID</th>
                        <th className="px-2 sm:px-3 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider">Date</th>
                        <th className="px-2 sm:px-3 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider">Party Name</th>
                        <th className="px-2 sm:px-3 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider">Bale No</th>
                        <th className="px-2 sm:px-3 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider">Item Name</th>
                        <th className="px-2 sm:px-3 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider">Color</th>
                        <th className="px-2 sm:px-3 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider">Pcs</th>
                        <th className="px-2 sm:px-3 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider">Mtrs</th>
                        <th className="px-2 sm:px-3 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider">Rate</th>
                        <th className="px-2 sm:px-3 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider">Total Amount</th>
                        <th className="px-2 sm:px-3 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider">Payment Status</th>
                        <th className="px-2 sm:px-3 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider">Amount Received</th>
                        <th className="px-2 sm:px-3 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider">Amount Pending</th>
                        <th className="px-2 sm:px-3 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider">Last Payment</th>
                        <th className="px-2 sm:px-3 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider">
                          {city === 'Bangladesh' ? 'Actions' : 'Status'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order, index) => (
                        <tr
                          key={index}
                          className={`hover:bg-gray-50 transition-colors duration-200 ${order[13] === 'due' ? "bg-red-50 border-l-4 border-red-400" :
                              order[13] === 'partial' ? "bg-yellow-50 border-l-4 border-yellow-400" :
                                "bg-green-50 border-l-4 border-green-400"
                            }`}
                        >
                          <td className="px-2 sm:px-3 py-3 sm:py-4 whitespace-nowrap">
                            <div className="text-xs sm:text-sm font-medium text-gray-900">#{order[0]}</div>
                          </td>
                          <td className="px-2 sm:px-3 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{order[1]}</td>
                          <td className="px-2 sm:px-3 py-3 sm:py-4 whitespace-nowrap">
                            <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[100px]">{order[3]}</div>
                          </td>
                          <td className="px-2 sm:px-3 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{order[6]}</td>
                          <td className="px-2 sm:px-3 py-3 sm:py-4 whitespace-nowrap">
                            <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[80px]">{order[7]}</div>
                          </td>
                          <td className="px-2 sm:px-3 py-3 sm:py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {order[8]}
                            </span>
                          </td>
                          <td className="px-2 sm:px-3 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 text-right">{order[9]}</td>
                          <td className="px-2 sm:px-3 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 text-right">{order[10]} Mtr</td>
                          <td className="px-2 sm:px-3 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 text-right">₹{order[11]}</td>
                          <td className="px-2 sm:px-3 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-semibold text-gray-900 text-right">₹{order[12]}</td>
                          <td className="px-2 sm:px-3 py-3 sm:py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${order[13] === 'received' ? 'bg-green-100 text-green-800' :
                                order[13] === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                              }`}>
                              {order[13] || 'due'}
                            </span>
                          </td>
                          <td className="px-2 sm:px-3 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-green-600 text-right">₹{order[14] || '0.00'}</td>
                          <td className="px-2 sm:px-3 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-red-600 text-right">₹{order[15] || '0.00'}</td>
                          <td className="px-2 sm:px-3 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{order[16] || '-'}</td>
                          <td className="px-2 sm:px-3 py-3 sm:py-4 whitespace-nowrap">
                            {city === 'Bangladesh' ? (
                              (order[13] === 'due' || order[13] === 'partial') && (
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => handlePaymentUpdate(order[0], 'received')}
                                    className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                                  >
                                    Paid
                                  </button>
                                  <button
                                    onClick={() => handlePaymentUpdate(order[0], 'partial')}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                                  >
                                    Partial
                                  </button>
                                </div>
                              )
                            ) : (
                              <div className="text-xs text-gray-500">
                                {order[13] === 'received' ? '✅ Fully Paid' :
                                  order[13] === 'partial' ? '⚠️ Partial Payment' :
                                    '❌ Payment Due'}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {/* Total Row */}
                      <tr className="bg-gradient-to-r from-gray-100 to-gray-200 font-bold">
                        <td className="px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm text-gray-700" colSpan="3">
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs sm:text-sm">Total</span>
                          </div>
                        </td>
                        <td className="px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm text-gray-700"></td>
                        <td className="px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm text-gray-700"></td>
                        <td className="px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm text-gray-700"></td>
                        <td className="px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm text-gray-700 text-right font-bold">{totalPcs}</td>
                        <td className="px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm text-gray-700 text-right font-bold">{totalQty} Mtr</td>
                        <td className="px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm text-gray-700 text-right font-bold">₹{totalRate ? totalRate.toFixed(2) : '0.00'}</td>
                        <td className="px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm text-green-600 text-right font-bold">₹{totalAmount ? totalAmount.toFixed(2) : '0.00'}</td>
                        <td className="px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm text-gray-700"></td>
                        <td className="px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm text-green-600 text-right font-bold">₹{totalPcs ? totalPcs.toFixed(2) : '0.00'}</td>
                        <td className="px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm text-red-600 text-right font-bold">₹{totalQty ? totalQty.toFixed(2) : '0.00'}</td>
                        <td className="px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm text-gray-700"></td>
                        <td className="px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm text-gray-700"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {orders.map((order, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs sm:text-sm font-medium text-gray-500 truncate">Sale #{order[0]}</div>
                          <div className="text-xs text-gray-400 truncate">{order[1]}</div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <div className="text-sm sm:text-lg font-bold text-green-600">₹{order[12]}</div>
                        <div className="text-xs text-gray-500">Amount</div>
                      </div>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-medium text-gray-600">Bale No.</span>
                        <span className="text-xs sm:text-sm text-gray-900 font-semibold truncate max-w-[100px]">{order[6]}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-medium text-gray-600">Party</span>
                        <span className="text-xs sm:text-sm text-gray-900 truncate max-w-[120px]">{order[3]}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-medium text-gray-600">Contact</span>
                        <span className="text-xs sm:text-sm text-gray-900 truncate max-w-[100px]">{order[5]}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-medium text-gray-600">Item</span>
                        <span className="text-xs sm:text-sm text-gray-900 font-medium truncate max-w-[100px]">{order[7]}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-medium text-gray-600">Color</span>
                        <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {order[8]}
                        </span>
                      </div>

                      <div className="space-y-2 sm:space-y-3 pt-2 sm:pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-medium text-gray-600">Payment Status</span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${order[13] === 'received' ? 'bg-green-100 text-green-800' :
                              order[13] === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                            {order[13] || 'due'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-medium text-gray-600">Amount Received</span>
                          <span className="text-xs sm:text-sm text-green-600 font-semibold">₹{order[14] || '0.00'}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-medium text-gray-600">Amount Pending</span>
                          <span className="text-xs sm:text-sm text-red-600 font-semibold">₹{order[15] || '0.00'}</span>
                        </div>

                        {city === 'Bangladesh' ? (
                          (order[13] === 'due' || order[13] === 'partial') && (
                            <div className="flex space-x-2 pt-2">
                              <button
                                onClick={() => handlePaymentUpdate(order[0], 'received')}
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                              >
                                Mark Paid
                              </button>
                              <button
                                onClick={() => handlePaymentUpdate(order[0], 'partial')}
                                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                              >
                                Add Payment
                              </button>
                            </div>
                          )
                        ) : (
                          <div className="pt-2 text-center">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${order[13] === 'received' ? 'bg-green-100 text-green-800' :
                                order[13] === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                              }`}>
                              {order[13] === 'received' ? '✅ Fully Paid' :
                                order[13] === 'partial' ? '⚠️ Partial Payment' :
                                  '❌ Payment Due'}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Update Payment</h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {selectedSale && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-600 mb-2">Payment Summary:</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Total Amount:</span>
                        <span className="font-semibold">₹{selectedSale.totalAmount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Already Received:</span>
                        <span className="font-semibold text-green-600">₹{selectedSale.currentReceived}</span>
                      </div>
                      <div className="flex justify-between border-t pt-1">
                        <span>Remaining:</span>
                        <span className="font-semibold text-red-600">₹{(selectedSale.totalAmount - selectedSale.currentReceived).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Amount Received
                  </label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter additional amount received"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This amount will be added to the existing received amount
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePartialPayment}
                    className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium"
                  >
                    Update Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}