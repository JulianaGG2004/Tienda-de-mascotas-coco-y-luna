import React from 'react'
import { Link } from 'react-router-dom'

const Cancel = () => {
  return (
    <div className='m-2 w-full max-w-md bg-secondary-200 p-4 py-5 rounded mx-auto flex flex-col justify-center items-center gap-5'>
        <p className='text-secondary-500 font-bold text-lg text-center'>Pedido cancelado</p>
        <Link to="/" className="border border-red-900 text-red-900 hover:bg-red-900 hover:text-white transition-all px-4 py-1">Ir a inicio</Link>
    </div>
  )
}

export default Cancel