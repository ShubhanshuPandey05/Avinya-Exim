import React from 'react'
import useLogOut from '../hooks/useLogOut'
import AddStocks from '../components/AddStocks'

function AddStocksPage() {
  const { logOut } = useLogOut()
  return (
    <div>
      <button className='bg-red-500 text-white w-20 h-10 rounded-lg m-5' onClick={logOut}>Logout</button>
      <AddStocks />
    </div>
  )
}

export default AddStocksPage