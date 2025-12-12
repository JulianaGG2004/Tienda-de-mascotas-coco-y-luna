import React from 'react'
import { IoClose } from 'react-icons/io5'
import { Link, useNavigate } from 'react-router-dom'
import { useGlobalContext } from '../provider/GlobalProvider'
import { DisplayPriceInPesos } from '../utils/DisplayPriceInPesos'
import { FaCaretRight } from "react-icons/fa";
import { useSelector } from 'react-redux'
import AddToCartButton from './AddToCartButton'
import imageEmpty from '../assets/empty_card-Photoroom.png'
import toast from 'react-hot-toast'

const DisplayCartItem = ({close}) => {
    const { totalPrice ,totalQty} = useGlobalContext()
    const cartItem  = useSelector(state => state.cartItem.cart)
    const user = useSelector(state => state.user)
    const navigate = useNavigate()

    const redirectToCheckoutPage = ()=>{
        if(user?._id){
            navigate("/checkout")
            if(close){
                close()
            }
            return
        }
        toast("Por favor Inicia Sesión")
    }
  return (
    <section className='bg-neutral-900 fixed top-0 bottom-0 right-0 left-0 bg-opacity-70 z-50 '>
        <div className='bg-white w-full max-w-sm max-h-screen ml-auto min-h-[75vh]'>
            <div className='flex items-center p-4 shadow-md gap-3 justify-between'>
                <h2 className='font-semibold'>Carrito</h2>
                <Link to={"/"} className='lg:hidden'>
                    <IoClose size={25}/>
                </Link>
                <button onClick={close} className='hidden lg:block'>
                    <IoClose size={25}/>
                </button>
            </div>
            <div className='min-h-[75vh] lg:min-h-[80vh] h-full max-h-[calc(100vh-150px)] bg-slate-100 p-2 flex flex-col gap-4'>
                {/**Display items*/}
                {
                    cartItem[0] ? (
                        <>
                        <div className='flex items-center justify-between px-4 py-2 bg-blue-100 text-blue-500 rounded-full'>
                            <p>Total de tu compra:</p>
                            <p>{DisplayPriceInPesos(totalPrice)}</p>
                        </div>
                        <div className='bg-white rounded-lg p-4 grid gap-5 overflow-auto'>
                            {
                                cartItem[0] && (
                                    cartItem.map((item,index)=>{
                                        return(
                                            <div key={item?._id+"cartItemDisplay"} className='flex w-full gap-4'>
                                                <div className='w-16 h-16 min-h-16 min-w-16 bg-red-500 border rounded'>
                                                    <img
                                                        src={item?.productId?.image[0]}
                                                        className='object-scale-down'
                                                    />
                                                </div>
                                                <div className='w-full max-w-sm text-xs'>
                                                    <p className='text-xs text-ellipsis line-clamp-2'>{item?.productId?.name}</p>
                                                    <p className='text-neutral-400'>{item?.productId?.unit} / {DisplayPriceInPesos(item?.productId?.price)} </p>
                                                    <p className='font-semibold'>{DisplayPriceInPesos(item?.productId?.price * item?.quantity)}</p>
                                                </div>
                                                <div>
                                                    <AddToCartButton data={item?.productId}/>
                                                </div>
                                            </div>
                                        )
                                    })
                                )
                            }
                        </div>
                        <div className='bg-white p-4'>
                            <h3 className='font-semibold'>Detalle de la factura</h3>
                            <div className='flex gap-4 justify-between ml-1'>
                                <p>Sub total:</p>
                                <p className='flex items-center gap-2'>{DisplayPriceInPesos(totalPrice)}</p>
                            </div>
                            <div className='flex gap-4 justify-between ml-1'>
                                <p>Cantidad total:</p>
                                <p className='flex items-center gap-2'>{totalQty} Productos</p>
                            </div>
                            <div className='flex gap-4 justify-between ml-1'>
                                <p>Envío:</p>
                                <p className='flex items-center gap-2'>GRATIS</p>
                            </div>
                            <div className='font-semibold flex items-center justify-between gap-4'>
                                <p >Total</p>
                                <p>{DisplayPriceInPesos(totalPrice)}</p>
                            </div>
                        </div>
                        </>
                    ) : (
                        <div className=' flex flex-col justify-center items-center'>
                            <img
                                src={imageEmpty}
                                className='w-full h-full object-scale-down' 
                            />
                            <Link onClick={close} to={"/"} className='block bg-primary-300 px-4 py-2 text-white rounded'>¡Compra Ahora!</Link>
                        </div>
                    )
                }
                
            </div>
            {
                cartItem[0] && (
                <div className='p-2'>
                    <div className='bg-primary-300 text-neutral-100 px-4 font-bold text-base py-4 static bottom-3 rounded flex items-center gap-4 justify-between'>
                        <div>{DisplayPriceInPesos(totalPrice)}</div>               
                        <button onClick={redirectToCheckoutPage} className='flex items-center gap-1'>
                        Proceder con el pago
                        <span><FaCaretRight/></span>
                    </button>
                    </div>
                    
                </div>
                )
            }

        </div>
    </section>
  )
}

export default DisplayCartItem
