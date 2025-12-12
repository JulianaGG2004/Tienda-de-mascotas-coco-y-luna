import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import Divider from './Divider'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import { logout } from '../store/userSlice'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import { FaUserCircle, FaRegListAlt } from "react-icons/fa";
import { BiSolidCategory } from "react-icons/bi";
import { MdCategory, MdPets, MdLogout } from "react-icons/md";
import { FiPackage } from "react-icons/fi";
import { FaHouseUser } from "react-icons/fa6";
import isAdmin from '../utils/isAdmin'

const UserMenu = ({close}) => {

    const user = useSelector((state)=> state.user)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleLogout = async()=>{
        try {
            const response = await Axios({
                ...SummaryApi.logout
            })

            if(response.data.success){
                if(close){
                close()
                }  
                dispatch(logout())
                localStorage.clear()
                toast.success(response.data.message)
                navigate("/")
            }
        } catch (error) {
            AxiosToastError(error)
        }
    }

    const handleClose = ()=>{
        if(close){
            close()
        }
    }
    return (
        <div className=''>
            <div className='font-semibold'>Mi cuenta</div>
            <div className='text-sm flex items-center gap-2'>
                <span className='max-w-52 text-ellipsis line-clamp-1'>{user.name || user.mobile} <span>{user.role === "ADMIN" ? "(Admin)" : ""}</span></span>
                <Link onClick={handleClose} to={"/dashboard/profile"} className='hover:text-primary-300'>
                <FaUserCircle size={15}/>
                </Link>
            </div>
            <Divider/>

            <div className='text-sm grid gap-2'>
                {
                    isAdmin(user.role) && (
                        <Link onClick={handleClose} to={"/dashboard/category"} className='flex items-center gap-2 px-2 hover:bg-primary-200 py-1'><BiSolidCategory/>Categorías</Link>
                    )
                }
                {
                    isAdmin(user.role) && (
                        <Link onClick={handleClose} to={"/dashboard/subcategory"} className='flex items-center gap-2 px-2 hover:bg-primary-200 py-1'><MdCategory/>Subcategorías</Link>
                    )
                }
                {
                    isAdmin(user.role) && (
                        <Link onClick={handleClose} to={"/dashboard/upload-product"} className='flex items-center gap-2 px-2 hover:bg-primary-200 py-1'><MdPets/>Registrar Producto</Link>
                    )
                }
                {
                    isAdmin(user.role) && (
                        <Link onClick={handleClose} to={"/dashboard/products"} className='flex items-center gap-2 px-2 hover:bg-primary-200 py-1'><FaRegListAlt/> Listar Productos</Link>
                    )
                }

                <Link onClick={handleClose} to={"/dashboard/myorders"} className='flex items-center gap-2 px-2 hover:bg-primary-200 py-1'><FiPackage/>Mis pedidos</Link>
                <Link onClick={handleClose} to={"/dashboard/address"} className='flex items-center gap-2 px-2 hover:bg-primary-200 py-1'><FaHouseUser/>Mis direcciones</Link>
                <button  onClick={handleLogout} className='text-left flex items-center gap-2 px-2 hover:bg-primary-200 py-1'><MdLogout/>Cerrar Sesión</button>
            </div>
        </div>
    )
}

export default UserMenu
