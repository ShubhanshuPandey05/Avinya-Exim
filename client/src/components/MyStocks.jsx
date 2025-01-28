import React, { useEffect, useState } from "react";
import { useLoading } from "../context/LoadingContext";
import { Link } from "react-router-dom";

const YourStocks = () => {
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
        const response = await fetch(`/api/get-stock/${city}`, {
          // const response = await fetch(`http://localhost:8000/api/get-stock/${city}`, {
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
        const response = await fetch("/api/get-stockRecieved", {
          // const response = await fetch("http://localhost:8000/api/get-stockRecieved", {
          method: 'GET',
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        })
        const data = await response.json();
        // console.log(data.data);

        setRecievingStocks(data.data || [])
      } catch {
        console.log("error")
      }
    }

    if (city == 'Bangladesh') {
      gettingRecievingStock();
    }

    fetchOrders();

  }, [city]);

  const sendToTransport = async (stockId) => {
    showLoading();
    try {
      const response = await fetch("/api/stocks-dispatching", {
        // const response = await fetch("http://localhost:8000/api/stocks-dispatching", {
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

  const recieveFromTransport = async (stockId) => {
    showLoading();
    try {
      // const response = await fetch("http://localhost:8000/api/stocks-recieving", {
      const response = await fetch("/api/stocks-recieving", {
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

  return (
    <div className="container py-6 bg-gray-100 min-h-screen w-[100vw]">
      <div className="rounded-xl bottom-24 left-2 fixed z-50 bg-white">
        <div className="flex items-center relative">
          <button
            className="relative w-24 h-12 border border-gray-300 rounded-md overflow-hidden"
            onClick={toggleView}
          >
            {/* Background toggle animation */}
            <div
              className={`absolute top-0 h-full w-1/2 duration-200 bg-[#2563eb] ${isTableView ? "left-0" : "left-1/2"
                }`}
            ></div>

            {/* Table view icon */}
            <img
              src="./tableView.png"
              alt="Table View"
              className={`w-6 h-6 absolute left-3 top-1/2 transform -translate-y-1/2 z-10 ${isTableView ? 'filter invert brightness-200' : ""}`}
            />

            {/* Card view icon */}
            <img
              src="./cardView.png"
              alt="Card View"
              className={`w-6 h-6 absolute right-3 top-1/2 transform -translate-y-1/2 z-10 ${!isTableView ? 'filter invert brightness-200' : ""}`}
            />
          </button>
        </div>
      </div>


      {
        city == "Bangladesh" && recievingStocks.length > 0 ? <div>
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
            Recieving Stocks
          </h2>

          {error && <p className="text-center text-red-500">{error}</p>}

          {orders.length === 0 && !error && (
            <p className="text-center text-gray-600">No Stocks Found.</p>
          )}

          {isTableView ?
            <div className="w-[100vw] overflow-auto p-2">
              <table className="min-w-[95vw] mx-auto table-auto border-collapse border border-gray-300 shadow-md rounded-lg">
                <thead>
                  <tr className="bg-blue-700 text-white">
                    <th className="border border-gray-300 px-4 py-2">Stock ID</th>
                    <th className="border border-gray-300 px-4 py-2">Date</th>
                    <th className="border border-gray-300 px-4 py-2">Bale No.</th>
                    <th className="border border-gray-300 px-4 py-2">Item Name</th>
                    <th className="border border-gray-300 px-4 py-2">Color</th>
                    <th className="border border-gray-300 px-4 py-2">Pcs</th>
                    <th className="border border-gray-300 px-4 py-2">Quantity</th>
                    <th className="border border-gray-300 px-4 py-2">Rate</th>
                    <th className="border border-gray-300 px-4 py-2">Amount</th>
                    <th className="border border-gray-300 px-4 py-2">City</th>
                    <th className="border border-gray-300 px-4 py-2">Bal. Qty</th>
                    <th className="border border-gray-300 px-4 py-2">Dispatched</th>
                    <th className="border border-gray-300 px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recievingStocks.map((order, index) => (
                    <tr
                      key={index}
                      className={`border-t ${parseInt(order[13]) < 1 ? "bg-red-100" : "bg-white"} hover:bg-gray-100`}
                    >
                      <td className="border border-gray-300 px-4 py-2">{order[0]}</td>
                      <td className="border border-gray-300 px-4 py-2">{order[1]}</td>
                      <td className="border border-gray-300 px-4 py-2">{order[3]}</td>
                      <td className="border border-gray-300 px-4 py-2">{order[4]}</td>
                      <td className="border border-gray-300 px-4 py-2">{order[5]}</td>
                      <td className="border border-gray-300 px-4 py-2">{order[6]}</td>
                      <td className="border border-gray-300 px-4 py-2">{order[7]} Mtr</td>
                      <td className="border border-gray-300 px-4 py-2">{order[8]}</td>
                      <td className="border border-gray-300 px-4 py-2 text-blue-600 font-semibold">{order[9]}</td>
                      <td className="border border-gray-300 px-4 py-2">{order[10]}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {order[13]} Mtr, {order[14]} Pcs
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {order[15] === "yes" || order[15] === "Yes" ? (
                          <>
                            <div className="text-red-600 font-bold">Yes</div>
                            <div className="text-sm text-gray-600">Dispatched: {order[11]}</div>
                            <div className="text-sm text-gray-600">Received: {order[12]}</div>
                          </>
                        ) : (
                          "No"
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <button
                          className="bg-blue-700 text-white px-4 py-2 rounded-xl hover:bg-blue-800"
                          onClick={() => recieveFromTransport(order[0])}
                        >
                          Receive
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            :
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
                        onClick={() => recieveFromTransport(order[0])}
                      >
                        Recieve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          }
        </div> : ''
      }

      <div>
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
          My Stocks
        </h2>
        <div className="h-16 w-16 flex-col bg-green-100 shadow-lg fixed z-50 top-4 right-4 rounded-3xl flex justify-center items-center">
          <div className=" text-[0.7rem] font-extrabold">Stocks</div>
          <div className="font-bold">{orders.length}</div>
        </div>
        {error && <p className="text-center text-red-500">{error}</p>}

        {orders.length === 0 && !error && (
          <p className="text-center text-gray-600">No orders found.</p>
        )}

        {isTableView ?
          <div className="w-[100vw] overflow-auto p-2">
            <table className="min-w-[95vw] mx-auto border-collapse border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">
                    Stock ID
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">
                    Bale No.
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">
                    Item Name
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">
                    Color
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">
                    Pcs
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">
                    Quantity (Mtr)
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">
                    Rate
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">
                    Amount
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">
                    City
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">
                    Bal. Pcs
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">
                    Bal. Qty
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">
                    Shipped Date
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">
                    Recieved Date
                  </th>
                  {city === "Kolkata" && (
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <tr
                    key={index}
                    className={`${parseInt(order[13]) < 1 ? "bg-red-100" : "bg-white"}`}
                  >
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">
                      {order[0]}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">
                      {order[1]}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">
                      {order[3]}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">
                      {order[4]}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">
                      {order[5]}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-right text-gray-700">
                      {order[6]}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-right text-gray-700">
                      {order[7]}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-right text-gray-700">
                      {order[8]}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-right text-gray-700">
                      {order[9]}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">
                      {order[10]}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-right text-gray-700">
                      {order[14] + " Pcs"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-right text-gray-700">
                      {order[13] + " Mtr"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">
                      {order[11]}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">
                      {order[12]}
                    </td>
                    {city === "Kolkata" && (
                      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">
                        <button
                          className="bg-blue-700 text-white px-3 py-1 rounded-lg"
                          onClick={() => onConfirmDispatch(order[0])}
                        >
                          Dispatch
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div> :
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
                  <div className="font-bold text-lg">{order[4]}</div> {/*City*/}
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
                    <div className="text-gray-600 italic text-sm">{order[1]}</div> {/*Date*/}
                    <div className="flex justify-center items-center space-x-4">
                      <div className="font-semibold text-blue-600">{order[9]}</div> {/*Amount*/}
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
                        Dispatch
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        }

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Confirm Dispatch</h2>
              <p className="text-gray-600">Are you sure you want to dispatch this order?</p>
              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 w-20"
                >
                  Cancel
                </button>
                <button
                  onClick={() => sendToTransport(selectedStockId)}
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
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Stock Successfully Dispatched</h2>
              <p className="text-gray-600">Your stock has been dispatched successfully!</p>
              <div className="mt-4 flex justify-center">
                <button
                  onClick={onDispatchSuccess}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Close
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


//  TODO: fixing the mapping of the column