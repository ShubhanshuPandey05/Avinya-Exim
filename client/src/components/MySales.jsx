import React, { useEffect, useState } from 'react'
import { useLoading } from '../context/LoadingContext';
import { Link } from 'react-router-dom';

export default function MySales() {
  const SERVER_URL = import.meta.env.VITE_SERVERURL;
  const authUser = JSON.parse(localStorage.getItem("authUser")) || {
    customerName: "",
    customerType: "",
    city: ""
  };
  const [city] = useState(authUser.city || "");
  const [orders, setOrders] = useState([]);
  const [totalAmount, setTotalAmount] = useState();
  const [totalPcs, setTotalPcs] = useState("");
  const [totalQty, setTotalQty] = useState("");
  const [totalRate, setTotalRate] = useState("");
  const [error, setError] = useState(null);
  const { showLoading, hideLoading } = useLoading();
  // const [isTableView, setIsTableView] = useState(true);

  // const toggleView = () => {
  //   setIsTableView(!isTableView);
  // };

  useEffect(() => {
    const fetchOrders = async () => {
      showLoading();
      try {
        const response = await fetch(`${SERVER_URL}/api/get-sales/${city}`, {
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
        setError(err.message || "Failed to fetch Sales.");
      } finally {
        hideLoading();
      }
    };
    fetchOrders();
  }, []);
  useEffect(() => {
    const calculateTotals = () => {
      if (orders.length > 0) {
        const totalPcs = orders.reduce((sum, order) => sum + parseFloat(order[9] || 0), 0);
        const totalQty = orders.reduce((sum, order) => sum + parseFloat(order[10] || 0), 0);
        const totalRate = orders.reduce((sum, order) => sum + parseFloat(order[11] || 0), 0);
        const totalAmount = orders.reduce((sum, order) => sum + parseFloat(order[12] || 0), 0);
        

        console.log(totalAmount);
        console.log(parseFloat(totalAmount));
        

        setTotalPcs(totalPcs);
        setTotalQty(totalQty);
        setTotalRate(totalRate);
        setTotalAmount(parseFloat(totalAmount));
      }
    };

    calculateTotals();
  }, [orders]);

  return (
    <div className='py-5'>
      {/* <div className="rounded-xl bottom-24 left-2 fixed z-50 bg-white">
        <div className="flex items-center relative">
          <button
            className="relative w-24 h-12 border border-gray-300 rounded-md overflow-hidden"
            onClick={toggleView}
          >
            <div
              className={`absolute top-0 h-full w-1/2 duration-200 bg-[#2563eb] ${isTableView ? "left-0" : "left-1/2"
                }`}
            ></div>
            <img
              src="./tableView.png"
              alt="Table View"
              className={`w-6 h-6 absolute left-3 top-1/2 transform -translate-y-1/2 z-10 ${isTableView ? 'filter invert brightness-200' : ""}`}
            />

            <img
              src="./cardView.png"
              alt="Card View"
              className={`w-6 h-6 absolute right-3 top-1/2 transform -translate-y-1/2 z-10 ${!isTableView ? 'filter invert brightness-200' : ""}`}
            />
          </button>
        </div>
      </div> */}
      <div>
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
          My Sales
        </h2>
        <div className="h-16 w-16 flex-col bg-green-100 shadow-lg fixed z-50 top-4 right-4 rounded-3xl flex justify-center items-center">
          <div className=" text-[0.7rem] font-extrabold">Sales</div>
          <div className="font-bold">{orders.length}</div>
        </div>
        {error && <p className="text-center text-red-500">{error}</p>}

        {orders.length === 0 && !error && (
          <p className="text-center text-gray-600">No orders found.</p>
        )}

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
                  Party Name
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Person Name
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Contact
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
                    {order[6]}
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
                  <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">
                    {order[7]}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">
                    {order[8]}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-right text-gray-700">
                    {order[9]}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-right text-gray-700">
                    {order[10]}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-right text-gray-700">
                    {order[11]}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-right text-gray-700">
                    {order[12]}
                  </td>
                </tr>
              ))}
              <tr className='bg-gray-100 font-bold'>
                <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">
                </td>
                <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">

                </td>
                <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">

                </td>
                <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">

                </td>
                <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">

                </td>
                <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">

                </td>
                <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">
                Total
                </td>
                <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">

                </td>
                <td className="border border-gray-300 px-4 py-2 text-sm text-right text-gray-700">
                  {totalPcs}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-sm text-right text-gray-700">
                  {totalQty}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-sm text-right text-gray-700">

                </td>
                <td className="border border-gray-300 px-4 py-2 text-sm text-right text-gray-700">
                  {totalAmount}.00
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
