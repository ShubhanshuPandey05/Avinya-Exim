import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLoading } from "../context/LoadingContext";
import { useData } from "../context/DataContext";

export default function AddStocks() {
  const SERVER_URL = import.meta.env.VITE_SERVERURL;

  const authUser = JSON.parse(localStorage.getItem("authUser")) || {
    contactPersonName: "",
    contactNo: "",
    companyName: "",
    userType: ""
  };
  const [items, setItems] = useState([
    { itemName: "", bellNo: "", quantity: "", rate: "", amount: "", color: "", pcs: "", weight: "" },
  ]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [itemOptions, setItemOptions] = useState([]);
  const [units, setUnits] = useState([]);
  const { showLoading, hideLoading } = useLoading();
  const { refreshStocks } = useData();

  useEffect(() => {
    async function fetchItems() {
      try {
        showLoading();
        const response = await fetch(`${SERVER_URL}/api/get-stockItems`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const data = await response.json();
        setItemOptions(data.data.map((item) => item["Item Names"]));
        const response2 = await fetch(`${SERVER_URL}/api/get-stockColor`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const data2 = await response2.json();
        setUnits(data2.data.map((item) => item["Color"]));
        hideLoading();

      } catch (error) {
        console.error("Error fetching item names:", error);
        toast.error('No items fetched try again later')
        let token = getCookie("jwt")
        if (!token) {
          localStorage.removeItem("authUser");
          window.location.reload();
        }
        hideLoading();
      }
    }
    fetchItems();
  }, []);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;

    if (field === "quantity" || field === "rate") {
      const quantity = updatedItems[index].quantity;
      const rate = updatedItems[index].rate;
      updatedItems[index].amount = quantity && rate ? (quantity * rate).toFixed(2) : "";
    }

    setItems(updatedItems);
  };

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  const handleAddItem = () => {
    setItems([...items, { itemName: "", bellNo: "", quantity: "", rate: "", amount: "", color: "", pcs: "", weight: "" }]);
  };

  const handleRemoveItem = (index) => {
    if (index != 0) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const confirmOrder = async () => {
    showLoading();
    try {
      const response = await fetch(`${SERVER_URL}/api/add-stocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
        credentials: 'include',
      });

      if (response.ok) {
        setItems([{ itemName: "", bellNo: "", quantity: "", rate: "", amount: "", color: "", pcs: "", weight: "" }]);
        setShowSuccessModal(true);
        toast.success("Stocks added successfully!");
        
        // Add a small delay to ensure server has processed the request, then refresh
        setTimeout(async () => {
          try {
            await refreshStocks();
            console.log("Stocks data refreshed successfully");
          } catch (error) {
            console.error("Error refreshing stocks:", error);
            toast.error("Failed to refresh stock data. Please refresh the page manually.");
          }
        }, 1000); // 1 second delay to ensure server processing
      } else {
        const jwt = getCookie('jwt');
        if (!jwt) {
          localStorage.removeItem("authUser");
          window.location.reload();
          toast.error("Please login again");
        }
      }
      setShowConfirmModal(false)

    } catch (error) {
      console.error("Error updating spreadsheet:", error);
      setShowConfirmModal(false)
    }
    hideLoading();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 sm:pb-20">
      {/* Header Section */}
      <div className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-row justify-between items-start sm:items-center py-4 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-2 sm:p-3 rounded-xl">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Add New Stock</h1>
                <p className="text-xs sm:text-sm text-gray-600">Add inventory items to your stock</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-3 sm:px-4 py-2 rounded-xl">
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-white">{items.length}</div>
                <div className="text-xs text-green-100">Items</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          {/* Stock Items Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-4 sm:p-6 text-white mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 sm:p-3 rounded-xl">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold">Stock Details</h2>
                  <p className="text-blue-100 text-sm sm:text-base">Enter your inventory items</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm sm:text-lg font-semibold text-gray-800 flex items-center space-x-2">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">
                        {index + 1}
                      </div>
                      <span>Item #{index + 1}</span>
                    </h3>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="bg-red-100 hover:bg-red-200 text-red-600 p-1.5 sm:p-2 rounded-lg transition-colors duration-200"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-1 14H6L5 7m5-3h4m-4 0a1 1 0 00-1 1v1h6V5a1 1 0 00-1-1h-4zm-2 4h8m-5 4h2m-2 4h2" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-12">
                    {/* Bale No */}
                    <div className="lg:col-span-3 sm:col-span-1 col-span-1">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Bale No. *</label>
                      <input
                        type="text"
                        placeholder="Enter bale number"
                        value={item.bellNo}
                        onChange={(e) => handleItemChange(index, "bellNo", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                        required
                      />
                    </div>

                    {/* Item Name */}
                    <div className="lg:col-span-6 sm:col-span-2 col-span-1">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Item Name *</label>
                      <select
                        value={item.itemName}
                        onChange={(e) => handleItemChange(index, "itemName", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                      >
                        <option value="">Select Item Name *</option>
                        {itemOptions.map((option, i) => (
                          <option key={i} value={option}>
                            {option}
                          </option>
                        ))}
                        <option value="Other">Not listed here</option>
                      </select>
                    </div>

                    {/* Color */}
                    <div className="lg:col-span-3 sm:col-span-1 col-span-1">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Color</label>
                      <select
                        value={item.color}
                        onChange={(e) => handleItemChange(index, "color", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                      >
                        <option value="">Select Color</option>
                        {units.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Pcs */}
                    <div className="lg:col-span-2 sm:col-span-1 col-span-1">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Pcs *</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={item.pcs}
                        onChange={(e) => handleItemChange(index, "pcs", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                        required
                      />
                    </div>

                    {/* Quantity */}
                    <div className="lg:col-span-2 sm:col-span-1 col-span-1">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                        required
                      />
                    </div>

                    {/* Weight */}
                    <div className="lg:col-span-2 sm:col-span-1 col-span-1">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Weight *</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={item.weight}
                        onChange={(e) => handleItemChange(index, "weight", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                        required
                      />
                    </div>

                    {/* Rate */}
                    <div className="lg:col-span-3 sm:col-span-1 col-span-1">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Rate</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={item.rate}
                        onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                      />
                    </div>

                    {/* Amount */}
                    <div className="lg:col-span-3 sm:col-span-1 col-span-1">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Amount</label>
                      <input
                        type="text"
                        readOnly
                        placeholder="0.00"
                        value={item.amount}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 font-semibold"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Item Button */}
            <div className="text-center mt-6">
              <button
                type="button"
                onClick={handleAddItem}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium text-sm sm:text-base"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Another Item</span>
                </div>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 font-bold text-base sm:text-lg"
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Add Stock</span>
              </div>
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all mx-4">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Confirm Stock Addition</h2>
              </div>
              <p className="text-gray-600 mb-6">Are you sure you want to add these {items.length} stock item(s)?</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmOrder}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
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
              <h2 className="text-xl font-bold text-gray-900 mb-2">Stock Added Successfully!</h2>
              <p className="text-gray-600 mb-6">Your stock items have been added to the inventory.</p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}