import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLoading } from "../context/LoadingContext";
import { use } from "react";

export default function AddSale() {

  const authUser = JSON.parse(localStorage.getItem("authUser")) || {
    contactPersonName: "",
    contactNo: "",
    companyName: "",
    userType: ""
  };

  const [city] = useState(authUser.city || "");
  const [personName, setPersonName] = useState("");
  const [partyName, setPartyName] = useState("");
  const [items, setItems] = useState([
    { itemName: "", bellNo: "", quantity: "", rate: "", amount: "", color: "", pcs: "", stockId: "" },
  ]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [itemOptions, setItemOptions] = useState([]);
  const { showLoading, hideLoading } = useLoading();
  const [fetch,setfetch] = useState(false);



  useEffect(() => {
    async function fetchItems() {
      try {
        showLoading();
        const response = await fetch(`/api/get-stock/${city}`, {
        // const response = await fetch(`http://localhost:8000/api/get-stock/${city}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        const data = await response.json();
        setItemOptions(data.data);
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
  }, [fetch]);


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
          pcs: selectedItem[6],
          quantity: selectedItem[13],
          rate: selectedItem[8],
          amount: selectedItem[9],
          stockId: selectedItem[0]
        };
      }
    }

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
      const response = await fetch("/api/add-sales", {
      // const response = await fetch("http://localhost:8000/api/add-sales", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personName, partyName, items }),
        credentials: 'include',
      });

      if (response.ok) {
        setItems([{ itemName: "", bellNo: "", quantity: "", rate: "", amount: "", color: "", pcs: "", stockId: "" }]);
        setPersonName("")
        setPartyName("")
        setShowSuccessModal(true);
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
    setfetch(!fetch)
    hideLoading();
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4 pb-14">
      <div className="p-6 w-full max-w-6xl min-h-screen">
        <h1 className="text-4xl font-semibold md:font-bold text-center">
          Avinya Exim
        </h1>
        <h1 className="text-xl md:text-2xl font-semibold text-gray-500 mt-3 text-center md:font-bold">
          StockXo
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="md:grid-cols-2 grid gap-2 mt-10">
            <input
              type="text"
              name="personName"
              id="personName"
              value={personName}
              placeholder="Person Name"
              onChange={((e) => { setPersonName(e.target.value) })}
              className="border-gray-300 rounded-md p-2 border col-span-1 "
            />
            <input
              type="text"
              name="partyName"
              id="partyName"
              value={partyName}
              placeholder="Party Name"
              onChange={((e) => { setPartyName(e.target.value) })}
              className="border-gray-300 rounded-md p-2 border col-span-1 "
            />
          </div>


          {/* Items Section */}
          <div className="mb-6 mt-3">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Item Details</h2>
            {items.map((item, index) => (
              <div
                key={index}
                className="grid gap-4 md:grid-cols-12 bg-gray-200 p-4 rounded-md mb-6"
              >
                <input type="hidden" value={item.stockId} />
                {/* Bell No */}
                <div className="md:col-span-6 col-span-12">
                  <select
                    value={item.bellNo}
                    onChange={(e) => handleItemChange(index, "bellNo", e.target.value)}
                    className="border-gray-300 rounded-md p-2 w-full"
                  >
                    <option value="">Select Bell no. *</option>
                    {itemOptions ? itemOptions.map((option, i) => (
                      <option key={i} value={option[3]}>
                        {option[3]}
                      </option>
                    )): ""}
                  </select>
                </div>


                {/* Item Name */}
                <div className="md:col-span-3 col-span-12">
                  <input
                    type="text"
                    placeholder="Item Name *"
                    value={item.itemName}
                    onChange={(e) => handleItemChange(index, "itemName", e.target.value)}
                    className="border-gray-300 rounded-md p-2 w-full bg-gray-100"
                    required
                    disabled
                  />
                </div>

                {/* Color */}
                <div className="md:col-span-3 col-span-4">
                  <input
                    type="text"
                    value={item.color}
                    placeholder="Color"
                    onChange={(e) => handleItemChange(index, "color", e.target.value)}
                    className="border-gray-300 rounded-md p-2 w-full bg-gray-100"
                    disabled
                  >
                  </input>
                </div>

                {/* Pcs */}
                <div className="md:col-span-2 col-span-4">
                  <input
                    type="number"
                    placeholder="Pcs *"
                    value={item.pcs}
                    onChange={(e) => handleItemChange(index, "pcs", e.target.value)}
                    className="border-gray-300 rounded-md p-2 w-full"
                    required
                  />
                </div>

                {/* Quantity */}
                <div className="md:col-span-2 col-span-4">
                  <input
                    type="number"
                    placeholder="Qty *"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                    className="border-gray-300 rounded-md p-2 w-full"
                    required
                  />
                </div>

                {/* Rate */}
                <div className="md:col-span-3 col-span-4">
                  <input
                    type="number"
                    placeholder="Rate"
                    value={item.rate}
                    onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                    className="border-gray-300 rounded-md p-2 w-full"
                  />
                </div>


                {/* Amount */}
                <div className="md:col-span-3 col-span-4">
                  <input
                    type="text"
                    readOnly
                    placeholder="Amount"
                    value={item.amount}
                    className="border-gray-300 bg-gray-100 rounded-md p-2 w-full"
                  />
                </div>

                {/* Delete Button */}
                <div className="col-span-1 flex justify-center items-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="flex justify-center items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-red-500 hover:text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-1 14H6L5 7m5-3h4m-4 0a1 1 0 00-1 1v1h6V5a1 1 0 00-1-1h-4zm-2 4h8m-5 4h2m-2 4h2"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddItem}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              + Add Item
            </button>
          </div>


          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Submit Order
            </button>
          </div>
        </form>
      </div>
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Confirm Your Order</h2>
            <p className="text-gray-600">Are you sure you want to place this order?</p>
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 w-20"
              >
                Cancel
              </button>
              <button
                onClick={confirmOrder}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 w-20"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Order Successfully Placed</h2>
            <p className="text-gray-600">Your order has been placed successfully!</p>
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
