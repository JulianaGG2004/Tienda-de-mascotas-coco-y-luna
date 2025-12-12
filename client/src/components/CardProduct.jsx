import React from 'react'
import { DisplayPriceInPesos } from '../utils/DisplayPriceInPesos'
import { Link } from 'react-router-dom'
import { valideURLConvert } from '../utils/validateURLConvert'
import { useState } from 'react'
import AddToCartButton from './AddToCartButton'

const CardProduct = ({data}) => {
const url = `/product/${valideURLConvert(data.name)}-${data._id}`
const [loading,setLoading] = useState(false)

  return (
    <Link to={url} className='border lg:p-2 grid gap-3 w-40 lg:w-52 rounded-xl bg-white shadow-sm shrink-0  '>
      <div className='min-h-20 w-full max-h-24 lg:max-h-32 rounded overflow-hidden'>
        <img 
            src={data.image[0]}
            className='w-full h-full object-contain lg:scale-135'
        />
      </div>
      <div className='flex items-center gap-1'>
        <div className='rounded text-xs w-fit p-[1px] px-2 text-green-600 bg-green-50'>
              10 min 
        </div>
      </div>
      <div className='px-2 lg:px-0 font-medium text-ellipsis text-sm lg:text-base line-clamp-2 truncate'>
        {data.name}
      </div>
      <div className='w-fit gap-1 px-2 lg:px-0 text-sm lg:text-base'>
        {data.unit}
      </div>
      <div className='px-2 flex items-center justify-between gap-2'>
        <div className='flex items-center gap-1'>
          <div className='font-semibold text-secondary-300'>
              {DisplayPriceInPesos(data.price)} 
          </div>
        </div>
        <div className='p-2 rounded w-20 '>
          {
            data.status == false ? (
              <p className='text-secondary-300 text-sm text-center' >No disponible</p>
            ) : (
              <AddToCartButton data={data}/>
            )
          }
        </div>
      </div>

    </Link>
  )
}

export default CardProduct
