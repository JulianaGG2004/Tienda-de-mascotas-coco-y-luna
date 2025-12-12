import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Success = () => {
  const location = useLocation()
    
    console.log("location",)  
  return (
    <div className='m-2 w-full max-w-md bg-primary-200 p-4 py-5 rounded mx-auto flex flex-col justify-center items-center gap-5'>
        <p className='text-primary-500 font-bold text-lg text-center'>{Boolean(location?.state?.text) ? location?.state?.text : "!Pago" }  realizado con exito¡</p>
        <Link to="/" className="border border-green-900 text-primary-500 hover:bg-primary-500 hover:text-white transition-all px-4 py-1">Ir a inicio</Link>
    </div>
  )
}

export default Success