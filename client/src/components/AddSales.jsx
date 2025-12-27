import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLoading } from "../context/LoadingContext";
import { useData } from "../context/DataContext";

export default function AddSale() {
  const SERVER_URL = import.meta.env.VITE_SERVERURL;
  const authUser = JSON.parse(localStorage.getItem("authUser")) || {
    contactPersonName: "",
    contactNo: "",
    companyName: "",
    userType: ""
  };

  const [city] = useState(authUser.city || "");
  const [personName, setPersonName] = useState("");
  const [partyName, setPartyName] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("due");
  const [amountReceived, setAmountReceived] = useState("");
  const [items, setItems] = useState([
    { itemName: "", bellNo: "", quantity: "", rate: "", amount: "", color: "", pcs: "", stockId: "", availablePcs: "", availableQty: "" },
  ]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [itemOptions, setItemOptions] = useState([]);
  const { showLoading, hideLoading } = useLoading();
  const { stocksData, refreshSales, refreshStocks, isDataLoaded } = useData();
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [filteredOptions, setFilteredOptions] = useState({});

  // Handle search input changes
  const handleSearchChange = (index, value) => {
    handleItemChange(index, "bellNo", value);
    const options = itemOptions.filter((option) =>
      option[3].toLowerCase().includes(value.toLowerCase())
    );
    setFilteredOptions((prev) => ({
      ...prev,
      [index]: options,
    }));
  };

  // Handle selecting an option
  const handleSelectOption = (index, value) => {
    console.log("hello", value)
    handleItemChange(index, "bellNo", value);
    setDropdownOpen((prev) => ({ ...prev, [index]: false }));
  };

  // Toggle dropdown visibility
  const toggleDropdownOpen = (index, isOpen) => {
    setDropdownOpen((prev) => ({ ...prev, [index]: isOpen }));
  };

  // Use stocks data from context instead of fetching
  useEffect(() => {
    if (stocksData && stocksData.length > 0) {
      setItemOptions(stocksData);
    } else if (isDataLoaded && (!stocksData || stocksData.length === 0)) {
      // If data is loaded but empty, try to refresh
      refreshStocks().then(() => {
        // After refresh, the stocksData will update and trigger this effect again
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stocksData, isDataLoaded]);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;

    if (field === "bellNo") {
      const selectedItem = itemOptions.find((option) => option[3] === value);
      if (selectedItem) {
        updatedItems[index] = {
          ...updatedItems[index],
          itemName: selectedItem[4],
          color: selectedItem[5],
          pcs: selectedItem[14],
          quantity: selectedItem[13],
          rate: selectedItem[8],
          amount: (parseInt(selectedItem[13]) * parseInt(selectedItem[8])),
          stockId: selectedItem[0],
          availablePcs: selectedItem[14],
          availableQty: selectedItem[13]
        };
      }
    }

    else if (field === "quantity" || field === "rate") {
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
    setItems([...items, { itemName: "", bellNo: "", quantity: "", rate: "", amount: "", color: "", pcs: "", stockId: "" }]);
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
      console.log(items);
      const response = await fetch(`${SERVER_URL}/api/add-sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          partyName, 
          personName, 
          contactNo, 
          items, 
          paymentStatus, 
          amountReceived: paymentStatus === 'partial' ? amountReceived : null 
        }),
        credentials: 'include',
      });

      if (response.ok) {
        setItems([{ itemName: "", bellNo: "", quantity: "", rate: "", amount: "", color: "", pcs: "", stockId: "" }]);
        setPersonName("")
        setPartyName("")
        setContactNo("")
        setPaymentStatus("due")
        setAmountReceived("")
        setShowSuccessModal(true);
        // Refresh data immediately to update context
        try {
          await Promise.all([refreshSales(), refreshStocks()]);
          toast.success("Sale added and data refreshed successfully!");
        } catch (error) {
          console.error("Error refreshing data:", error);
          toast.error("Sale added but failed to refresh data. Please refresh the page manually.");
        }
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
              <div className="bg-gradient-to-r from-orange-600 to-red-600 p-2 sm:p-3 rounded-xl">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Sales Voucher</h1>
                <p className="text-xs sm:text-sm text-gray-600">Create new sales transaction</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-3 sm:px-4 py-2 rounded-xl">
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-white">{items.length}</div>
                <div className="text-xs text-orange-100">Items</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          {/* Customer Information Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-4 sm:p-6 text-white mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 sm:p-3 rounded-xl">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold">Customer Information</h2>
                  <p className="text-purple-100 text-sm sm:text-base">Enter customer details</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Party Name</label>
                  <input
                    type="text"
                    name="partyName"
                    id="partyName"
                    value={partyName}
                    placeholder="Enter party name"
                    onChange={(e) => setPartyName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Person Name </label>
                  <input
                    type="text"
                    name="personName"
                    id="personName"
                    value={personName}
                    placeholder="Enter person name"
                    onChange={(e) => setPersonName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Contact No. </label>
                  <input
                    type="text"
                    name="ContactNo"
                    id="Contactno"
                    value={contactNo}
                    placeholder="Enter contact number"
                    onChange={(e) => setContactNo(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl p-4 sm:p-6 text-white mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 sm:p-3 rounded-xl">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold">Payment Information</h2>
                  <p className="text-green-100 text-sm sm:text-base">Select payment status</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Payment Status *</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    required
                  >
                    <option value="due">Due</option>
                    <option value="received">Received</option>
                    <option value="partial">Partial</option>
                  </select>
                </div>
                {paymentStatus === 'partial' && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Amount Received *</label>
                    <input
                      type="number"
                      value={amountReceived}
                      onChange={(e) => setAmountReceived(e.target.value)}
                      placeholder="Enter amount received"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sales Items Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-4 sm:p-6 text-white mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 sm:p-3 rounded-xl">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold">Item Details</h2>
                  <p className="text-orange-100 text-sm sm:text-base">Select items for sale</p>
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
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">
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
                    <input type="hidden" value={item.stockId} />
                    
                    {/* Bale No Search */}
                    <div className="lg:col-span-6 sm:col-span-2 col-span-1 relative">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Search Bale No. *</label>
                      <input
                        type="text"
                        placeholder="Search by bale number"
                        value={item.bellNo}
                        onChange={(e) => handleSearchChange(index, e.target.value)}
                        onFocus={() => toggleDropdownOpen(index, true)}
                        onBlur={() =>
                          setTimeout(() => toggleDropdownOpen(index, false), 150)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                      {dropdownOpen[index] && (
                        <div className="absolute top-full left-0 w-full border border-gray-300 bg-white rounded-xl max-h-48 overflow-y-auto z-10 shadow-lg">
                          {filteredOptions[index]?.length ? (
                            filteredOptions[index].map((option, i) => (
                              <div
                                key={i}
                                onClick={() => handleSelectOption(index, option[3])}
                                className="p-3 hover:bg-orange-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              >
                                <div className="font-medium text-gray-900">{option[3]}</div>
                                <div className="text-sm text-gray-500">{option[4]} - {option[5]}</div>
                              </div>
                            ))
                          ) : (
                            <div className="p-3 text-gray-500 text-center">No options found</div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Item Name */}
                    <div className="lg:col-span-3 sm:col-span-1 col-span-1">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Item Name</label>
                      <input
                        type="text"
                        placeholder="Item name"
                        value={item.itemName}
                        onChange={(e) => handleItemChange(index, "itemName", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600"
                        disabled
                      />
                    </div>

                    {/* Color */}
                    <div className="lg:col-span-3 sm:col-span-1 col-span-1">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Color</label>
                      <input
                        type="text"
                        value={item.color}
                        placeholder="Color"
                        onChange={(e) => handleItemChange(index, "color", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600"
                        disabled
                      />
                    </div>

                    {/* Pcs */}
                    <div className="lg:col-span-2 sm:col-span-1 col-span-1">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Pcs *</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={item.pcs}
                        onChange={(e) => handleItemChange(index, "pcs", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                        required
                        max={item.availablePcs}
                      />
                      <p className="text-xs text-gray-500 mt-1">Available: {item.availablePcs} pcs</p>
                    </div>

                    {/* Quantity */}
                    <div className="lg:col-span-2 sm:col-span-1 col-span-1">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                        required
                        max={item.availableQty}
                      />
                      <p className="text-xs text-gray-500 mt-1">Available: {item.availableQty} mtr</p>
                    </div>

                    {/* Rate */}
                    <div className="lg:col-span-3 sm:col-span-1 col-span-1">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Rate</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={item.rate}
                        onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
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
                className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium text-sm sm:text-base"
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
              className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 font-bold text-base sm:text-lg"
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Submit Sale</span>
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
                <h2 className="text-xl font-bold text-gray-900">Confirm Sale</h2>
              </div>
              <p className="text-gray-600 mb-6">Are you sure you want to submit this sale with {items.length} item(s)?</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmOrder}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-3 rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
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
              <h2 className="text-xl font-bold text-gray-900 mb-2">Sale Completed Successfully!</h2>
              <p className="text-gray-600 mb-6">Your sales transaction has been recorded.</p>
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