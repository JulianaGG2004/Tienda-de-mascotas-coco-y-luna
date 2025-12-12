import React from 'react'
import noDataImage from '../assets/nothing_here_yet-removebg-preview.png'

const NoData = () => {
  return (
    <div className='flex flex-col items-center justify-center p-4 gap-2'>
      <img 
        src={noDataImage} 
        alt="no data"
        className='w-36' 
      />
      <p className='text-neutral-500'>¡No hay datos!</p>
    </div>
  )
}

export default NoData
