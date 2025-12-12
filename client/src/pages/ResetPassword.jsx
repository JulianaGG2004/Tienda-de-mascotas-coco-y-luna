import React, {useEffect, useState} from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FaRegEyeSlash } from "react-icons/fa6";
import { FaRegEye } from "react-icons/fa6";
import toast from 'react-hot-toast';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import Axios from '../utils/Axios';

const ResetPassword = () => {

    const location = useLocation()
    const navigate = useNavigate()

    const [data,setData] = useState({
        email : "",
        newPassword : "",
        confirmPassword : ""
    })
    

    const [showPassword,setShowPassword] = useState(false)
    const [showConfirmPassword,setShowConfirmPassword] = useState(false)
    const valideValue = Object.values(data).every(el => el)

    useEffect(()=>{
        if(!(location?.state?.data?.success)){
            navigate("/")
        }

        if(location?.state?.email){
            setData((preve)=>{
                return{ 
                ...preve,
                email: location?.state?.email
                }
            })
        }
    },[])

    const handleChange = (e)=>{
        const {name, value} = e.target

        setData((preve)=>{
            return{
                ...preve,
                [name] : value
            }
        })
    }

     const handleSubmit = async(e)=>{
        e.preventDefault()
        if(data.newPassword !== data.confirmPassword){
            toast.error( "Nueva contraseña y confirmación de contraseña deben ser iguales.")
            return
        }

        try {
            const response = await Axios({
                ...SummaryApi.resetPassword,
                data : data

            })

            if(response.data.error){
                toast.error(response.data.message)
            }

            if(response.data.success){
                toast.success(response.data.message)
                navigate("/login")
                setData({
                    email : "",
                    newPassword : "",
                    confirmPassword : ""
                })
                
            }
        } catch (error) {
            AxiosToastError(error)
        }
    }


  return (
     <section className='w-full container mx-auto px-2'>
        <div className='bg-white my-4 w-full max-w-lg mx-auto rounded p-7'>
            <p className='font-semibold text-lg text-center'>Ingresa tu nueva contraseña</p>
            <form className='grid gap-4 py-4' onSubmit={handleSubmit}>
                <div className='grid gap-1'>
                    <label htmlFor="newPassword">Nueva contraseña:</label>
                    <div className='bg-slate-100 p-2 border rounded flex items-center focus-within:border-primary-400'>
                        <input 
                            type={showConfirmPassword ? "text" : "password"}
                            id='newPassword'
                            className='w-full outline-none'
                            name='newPassword'
                            value={data.newPassword} 
                            onChange={handleChange}
                            placeholder='Ingresa tu nueva contraseña'
                        />
                        <div onClick={()=> setShowConfirmPassword(preve => !preve)} className='cursor'>
                            {
                                showConfirmPassword ? (
                                    <FaRegEye/>      
                                ) : (
                                    <FaRegEyeSlash/>
                                )
                            }
                        </div>
                    </div>
                </div>
                <div className='grid gap-1'>
                    <label htmlFor="confirmPassword">Confirmar contraseña:</label>
                    <div className='bg-slate-100 p-2 border rounded flex items-center focus-within:border-primary-400'>
                        <input 
                            type={showPassword ? "text" : "password"}
                            id='confirmPassword'
                            className='w-full outline-none'
                            name='confirmPassword'
                            value={data.confirmPassword} 
                            onChange={handleChange}
                            placeholder='Ingresa la confirmacion de contraseña'
                        />
                        <div onClick={()=> setShowPassword(preve => !preve)} className='cursor'>
                            {
                                showPassword ? (
                                    <FaRegEye/>      
                                ) : (
                                    <FaRegEyeSlash/>
                                )
                            }
                        </div>
                    </div>
                </div>                            
                <button  disabled={!valideValue} className={` ${valideValue ? "bg-primary-300 hover:bg-primary-500" : "bg-gray-500" }  text-white py-3 rounded-full 
                font-semibold my-3 tracking-wide`}>Cambiar contraseña</button>
            </form>
            <p>
               Ya tienes una cuenta? <Link to={"/login"} 
                className='font-semibold text-primary-400 hover:text-primary-500'>Iniciar Sesión</Link>
            </p>
        </div>
      
    </section>
  )
}

export default ResetPassword
