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

      {(city === 'Surat' || city === 'Bangladesh') ?
        <div >
          {/* View Toggle Button - Top Right */}
          <div className="fixed bottom-24 sm:bottom-20 left-4 sm:left-6 z-50">
            <button
              onClick={toggle}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-3 sm:p-4 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 group"
              title={viewSales ? 'Switch to Stocks' : 'Switch to Sales'}
            >
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
                  {viewSales ? (
                    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  ) : (
                    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  )}
                </div>
                <span className="hidden sm:inline text-sm font-medium">
                  {viewSales ? 'View Stocks' : 'View Sales'}
                </span>
              </div>
            </button>
          </div>

          {/* Content */}
          {viewSales ? <MySales /> : <YourStocks />}
        </div> :
        <YourStocks />
      }
    </div>
  )
}

export default HomeScreen