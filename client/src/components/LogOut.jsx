import React from 'react'
import useLogOut from '../hooks/useLogOut'
import { FiLogOut } from "react-icons/fi";

export default function LogOut() {
    const { logOut } = useLogOut()
    return (
        <button 
            className='bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-3 sm:p-4 rounded-2xl bottom-24 sm:bottom-20 right-4 sm:right-6 fixed z-50 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 group' 
            onClick={logOut}
            title="Logout"
        >
            <div className="flex items-center space-x-2">
                <FiLogOut className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="hidden sm:inline text-sm font-medium">Logout</span>
            </div>
        </button>
    )
}
