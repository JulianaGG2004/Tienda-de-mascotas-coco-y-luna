import React from 'react'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import toast from 'react-hot-toast'
import { useGlobalContext } from '../provider/GlobalProvider'
import { useState } from 'react'
import Axios from '../utils/Axios'
import Loading from './Loading'
import { useSelector } from 'react-redux'
import { FaMinus, FaPlus } from "react-icons/fa6";
import { useEffect } from 'react'

const AddToCartButton =  ({ data }) => {
    const { fetchCartItem, updateCartItem, deleteCartItem } = useGlobalContext()
    const [loading, setLoading] = useState(false)
    const cartItem = useSelector(state => state.cartItem.cart)
    const [isAvailableCart, setIsAvailableCart] = useState(false)
    const [qty, setQty] = useState(0)
    const [cartItemDetails,setCartItemsDetails] = useState()


    const handleADDTocart = async (e) => {
        e.preventDefault()
        e.stopPropagation()

        try {
            setLoading(true)

            const response = await Axios({
                ...SummaryApi.addToCart,
                data: {
                    productId: data?._id
                }
            })

            const { data: responseData } = response

            if (responseData.success) {
                toast.success(responseData.message)
                if (fetchCartItem) {
                    fetchCartItem()
                }
            }
        } catch (error) {
            AxiosToastError(error)
        } finally {
            setLoading(false)
        }

    }

    useEffect(() => {
        const checkingitem = cartItem.some(item => item.productId._id === data._id)
        setIsAvailableCart(checkingitem)

        const product = cartItem.find(item => item.productId._id === data._id)
        setQty(product?.quantity)
        setCartItemsDetails(product)
    }, [data, cartItem])


    const increaseQty = async(e) => {
        e.preventDefault()
        e.stopPropagation()
    
       const response = await  updateCartItem(cartItemDetails?._id,qty+1)
        
       if(response.success){
        toast.success("Carrito actualizado")
       }
    }

    const decreaseQty = async(e) => {
        e.preventDefault()
        e.stopPropagation()
        if(qty === 1){
            deleteCartItem(cartItemDetails?._id)
        }else{
            const response = await updateCartItem(cartItemDetails?._id,qty-1)

            if(response.success){
                toast.success("Producto eliminado")
            }
        }
    }
  return (
    <div className='w-full max-w-[150px]'>
        {
            isAvailableCart ? (
                <div className='flex w-full h-full'>
                    <button onClick={decreaseQty} className='bg-primary-300 hover:bg-primary-500 text-white flex-1 w-full p-1 rounded flex items-center justify-center'><FaMinus /></button>

                    <p className='flex-1 w-full font-semibold px-1 flex items-center justify-center'>{qty}</p>

                    <button onClick={increaseQty} className='bg-primary-300 hover:bg-primary-500 text-white flex-1 w-full p-1 rounded flex items-center justify-center'><FaPlus /></button>
                </div>
            ) : (
                <button onClick={handleADDTocart} className='flex-1 bg-primary-300 hover:bg-primary-500 text-white font-medium py-2 rounded p-1'>
                    {loading ? <Loading /> : "Añadir"}
                </button>
            )
        }

    </div>
  )
}

export default AddToCartButton
