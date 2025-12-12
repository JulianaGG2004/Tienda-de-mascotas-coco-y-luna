import React, { useState } from 'react'
import {Link, useNavigate} from 'react-router-dom'
import { FaRegEyeSlash } from "react-icons/fa6";
import { FaRegEye } from "react-icons/fa6";
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import fetchUserDetails from '../utils/fetchUserDetails';
import { useDispatch } from 'react-redux';
import { setUserDetails } from '../store/userSlice';

const Login = () => {
    const [data, setData] = useState({
        email : "",
        password : ""
    })
    
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch()


    const handleChange = (e)=>{
        const {name, value} = e.target

        setData((preve)=>{
            return{
                ...preve,
                [name] : value
            }
        })
    }

    const valideValue = Object.values(data).every(el => el)

    const handleSubmit = async(e)=>{
        e.preventDefault()

        try {
            const response = await Axios({
                ...SummaryApi.login,
                data : data

            })

            if(response.data.error){
                toast.error(response.data.message)
            }

            if(response.data.success){
                toast.success(response.data.message)
                localStorage.setItem('accesstoken', response.data.data.accesstoken)
                localStorage.setItem('refreshToken', response.data.data.refreshToken)

                const userDetails = await fetchUserDetails()
                dispatch(setUserDetails(userDetails.data))

                setData({
                    email : "",
                    password : "",
                })
                navigate("/")
            }
        } catch (error) {
            AxiosToastError(error)
        }
    }

  return (
    <section className='w-full container mx-auto px-2'>
        <div className='bg-white my-4 w-full max-w-lg mx-auto rounded p-7'>
            <p className='font-semibold text-lg text-center'>Iniciar Sesión</p>
            <form className='grid gap-4 py-4' onSubmit={handleSubmit}>
                <div className='grid gap-1'>
                    <label htmlFor="email">Correo Electronico:</label>
                    <input 
                        type="email"
                        id='email'
                        className='bg-slate-100 p-2 border rounded outline-none focus:border-primary-400'
                        name='email'
                        value={data.email} 
                        onChange={handleChange}
                        placeholder='Ingresa tu correo electronico'
                    />
                </div>
                <div className='grid gap-1'>
                    <label htmlFor="password">Contraseña:</label>
                    <div className='bg-slate-100 p-2 border rounded flex items-center focus-within:border-primary-400'>
                        <input 
                            type={showPassword ? "text" : "password"}
                            id='password'
                            className='w-full outline-none'
                            name='password'
                            value={data.password} 
                            onChange={handleChange}
                            placeholder='Ingresa tu contraseña'
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
                    <Link to={"/forgot-password"} className='block ml-auto hover:text-primary-300'>Olvidaste tu contraseña?</Link>
                </div>

                <button  disabled={!valideValue} className={` ${valideValue ? "bg-primary-300 hover:bg-primary-500" : "bg-gray-500" }  text-white py-3 rounded-full 
                font-semibold my-3 tracking-wide`}>Iniciar Sesión</button>
            </form>
            <p>
                Aun no tienes una cuenta? <Link to={"/register"} 
                className='font-semibold text-primary-400 hover:text-primary-500'>Registrarse</Link>
            </p>
        </div>
      
    </section>
  )
}

export default Login
