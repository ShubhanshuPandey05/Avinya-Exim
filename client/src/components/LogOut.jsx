import React from 'react'
import useLogOut from '../hooks/useLogOut'
import { FiLogOut } from "react-icons/fi";


export default function LogOut() {
    const { logOut } = useLogOut()
    return (
        <button className='bg-red-500 text-white py-3 px-4 rounded-xl bottom-24 right-4 fixed z-50 text-2xl' onClick={logOut}><FiLogOut /></button>
    )
}
