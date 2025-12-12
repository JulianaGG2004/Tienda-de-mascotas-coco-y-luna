import React, { useState } from 'react'
import logo from '../assets/logo.png'
import Search from './Search'
import {Link, useLocation, useNavigate} from 'react-router-dom'
import { FaUserCircle } from "react-icons/fa";
import useMobile from '../hooks/useMobile';
import { BsCart4 } from "react-icons/bs";
import { useSelector } from 'react-redux';
import { GoTriangleDown, GoTriangleUp  } from "react-icons/go";
import UserMenu from './UserMenu';
import { DisplayPriceInPesos } from '../utils/DisplayPriceInPesos';
import { useGlobalContext } from '../provider/GlobalProvider';
import DisplayCartItem from './DisplayCartItem';

const Header = () => {
    const [ isMobile ] = useMobile()
    const location = useLocation()
    const isSearchPage = location.pathname === "/search"
    const navigate = useNavigate()
    const user = useSelector((state)=> state?.user)
    const [openUserMenu,setOpenUserMenu] = useState(false)
    const cartItem = useSelector(state => state.cartItem.cart)
    const { totalPrice, totalQty} = useGlobalContext()
    const [openCartSection,setOpenCartSection] = useState(false)

    const redirectToLoginPage = ()=>{
        navigate("/login")
    }

    const handleCloseUserMenu = ()=>{
        setOpenUserMenu(false)
    }

    const handleMobileUser = ()=>{
        if(!user._id){
            navigate("/login")
            return
        }
        navigate("/user")

    } 

  return (
    <header className='z-50 h-24 lg:h-20 lg:shadow-md sticky top-0 flex flex-col  justify-center gap-1 bg-primary-400'>
        {
            !(isSearchPage && isMobile)&&(
                <div className=' pl-10 w-full max-w-full mx-auto flex items-center px-2 justify-between'> 
                    {/**logo */}
                    <div className='h-full'>
                        <Link to={'/'} className='h-full felx justify-center items-center' >
                            <img
                            src={logo}
                            width={280}
                            height={60}
                            alt='logo'
                            className='hidden  lg:block'
                            />
                            <img
                            src={logo}
                            width={120}
                            height={60}
                            alt='logo'
                            className='lg:hidden'
                            />
                        </Link>
                    </div>
                    {/**Search */}
                    <div className='hidden lg:block'>
                        <Search/>
                    </div>
                    {/**login and my card */}
                    <div className=''>
                        {/** icono de usuario solo para version de celular**/}
                        <button className='text-neutral-100 lg:hidden' onClick={handleMobileUser}>
                            <FaUserCircle size={26}/>
                        </button>
                        <div className='hidden lg:flex items-center gap-10'>
                            {
                                user?._id ? (
                                    <div className='relative'>
                                        <div onClick={()=>setOpenUserMenu(preve => !preve)} className='flex select-none items-center gap-1 cursor-pointer text-white'>
                                            <p className=''>Cuenta</p>
                                            {
                                                openUserMenu ? (
                                                        <GoTriangleUp size={25}/> 
                                                ) : (
                                                    <GoTriangleDown size={25}/>
                                                )
                                            }
                                            
                                        </div>
                                        {
                                            openUserMenu && (
                                                <div className='absolute right-0 top-12'>
                                                    <div className='bg-white rounded p-4 min-w-52 lg:shadow-lg'>
                                                        <UserMenu close={handleCloseUserMenu}/>
                                                    </div>
                                                </div>
                                            )
                                        }
                                        
                                    </div>
                                ) : (
                                    <button onClick={redirectToLoginPage} className='text-lg px-2 text-white'>Iniciar Sesión</button>
                                )
                            }
                            
                            
                            <button onClick={()=>setOpenCartSection(true)} className='flex items-center gap-2 hover:bg-primary-500 px-3 py-1 rounded-2xl border border-white text-white'>
                                {/**  agregar a carrito icono**/}
                                <div className='animate-bounce'>
                                    <BsCart4 size={26}/>
                                </div>
                                <div className='font-semibold text-sm'>
                                    {
                                        cartItem[0] ? (
                                            <div>
                                                <p>{totalQty} Productos</p>
                                                <p>{DisplayPriceInPesos(totalPrice)}</p>
                                            </div>
                                        ) : (
                                            <p>Mi carrito</p>
                                        )
                                    }
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )
        }
        <div className='container mx-auto px-2 lg:hidden'>
            <Search/>
        </div>
        {
            openCartSection && (
                <DisplayCartItem close={()=>setOpenCartSection(false)}/>
            )
        }
    </header>
  )
}

export default Header
