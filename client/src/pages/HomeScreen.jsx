import React, { useState } from 'react'
import YourStocks from '../components/MyStocks'
import LogOut from '../components/LogOut'
import MySales from '../components/MySales';
import { Link } from 'react-router-dom';

function HomeScreen() {
  const [viewSales, setViewSales] = useState(false)
  const authUser = JSON.parse(localStorage.getItem("authUser")) || {
    customerName: "",
    customerType: "",
    city: ""
  };
  const [city] = useState(authUser.city || "");
  
  const toggle = () => {
    setViewSales(!viewSales)
  }
  return (
    <div>
      <LogOut />

      {city === 'Surat' ?
        <div>
          <div onClick={toggle} className={`${city == 'Surat' ? 'block' : 'hidden'} cursor-pointer bottom-40 left-4 h-16 w-16 bg-yellow-100 shadow-lg fixed z-50 rounded-3xl flex justify-center items-center`}>
            <div className='text-center'>
              {viewSales ? 'View Stocks' : 'View Sales'}
            </div>
          </div>
          {viewSales ? <MySales /> : <YourStocks />}
        </div> :
        <YourStocks />

      }
    </div>
  )
}

export default HomeScreen