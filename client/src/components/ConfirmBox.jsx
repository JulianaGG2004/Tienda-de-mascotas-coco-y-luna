import React from 'react'
import { IoClose } from "react-icons/io5";
const ConfirmBox = ({cancel,confirm,close}) => {
  return (
    <div className='fixed top-0 bottom-0 left-0 right-0 p-4 bg-neutral-800 bg-opacity-60 
        flex items-center justify-center z-[100]'>
       <div className='bg-white w-full max-w-md p-4 rounded'>
            <div className='flex justify-between items-center gap-3'>
                <h1 className='font-semibold'>Eliminación permanente</h1>
                <button onClick={close}>
                    <IoClose size={25}/>
                </button>
            </div>
            <p className='my-4'>Estas seguro de eliminar permanentemente este registro?</p>
            <div className='w-fit ml-auto flex items-center gap-3'>
                <button onClick={cancel} className='px-4 border bg-secondary-300 hover:bg-secondary-500 text-white py-2 rounded-full'>Cancelar</button>
                <button onClick={confirm} className='px-4 border bg-primary-300 hover:bg-primary-500 text-white font-medium py-2 rounded-full'>Confirmar</button>
            </div>
       </div>
    </div>
  )
}

export default ConfirmBox
