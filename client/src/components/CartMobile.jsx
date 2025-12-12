import React from 'react'
import { useGlobalContext } from '../provider/GlobalProvider'
import { FaCartShopping } from 'react-icons/fa6'
import { Link } from 'react-router-dom'
import { FaCaretRight } from "react-icons/fa";
import { useSelector } from 'react-redux'
import { DisplayPriceInPesos } from '../utils/DisplayPriceInPesos'

const CartMobileLink = () => {
    const { totalPrice, totalQty } = useGlobalContext()
    const cartItem = useSelector(state => state.cartItem.cart)

  return (
    <>
        {
            cartItem[0] && (
            <div className='sticky bottom-4 p-2'>
            <div className='bg-primary-300 px-2 py-1 rounded text-neutral-100 text-sm  flex items-center justify-between gap-3 lg:hidden'>
                    <div className='flex items-center gap-2'>
                        <div className='p-2 bg-primary-500 rounded w-fit'>
                            <FaCartShopping/>
                        </div>
                        <div className='text-xs'>
                                <p>{totalQty} Productos</p>
                                <p>{DisplayPriceInPesos(totalPrice)}</p>
                        </div>
                    </div>

                    <Link to={"/cart"} className='flex items-center gap-1'>
                        <span className='text-sm'>Ver Carrito</span>
                        <FaCaretRight/>
                    </Link>
                </div>
            </div>
            )
        }
    </>
    
  )
}

export default CartMobileLink