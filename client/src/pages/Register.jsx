import React, { useState } from 'react'
import {Link, useNavigate} from 'react-router-dom'
import { FaRegEyeSlash } from "react-icons/fa6";
import { FaRegEye } from "react-icons/fa6";
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';

const Register = () => {
    const [data, setData] = useState({
        name : "",
        email : "",
        password : "",
        confirmPassword : ""
    })
    
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const navigate = useNavigate()

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

        if(data.password !== data.confirmPassword){
            toast.error(
                "Contraseña y confirmación de contraseña deben ser iguales"
            )
            return
        }

        try {
            const response = await Axios({
                ...SummaryApi.register,
                data : data

            })

            if(response.data.error){
                toast.error(response.data.message)
            }

            if(response.data.success){
                toast.success(response.data.message)
                setData({
                    name : "",
                    email : "",
                    password : "",
                    confirmPassword : ""
                })
                navigate("/login")
            }
        } catch (error) {
            AxiosToastError(error)
        }
    }

  return (
    <section className='w-full container mx-auto px-2'>
        <div className='bg-white my-4 w-full max-w-lg mx-auto rounded p-7'>
            <p className='font-semibold text-lg text-center'>Bienvenido a la Tienda de mascotas Coco & Luna</p>
            <form className='grid gap-4 mt-6' onSubmit={handleSubmit}>
                <div className='grid gap-1'>
                    <label htmlFor="name">Nombre:</label>
                    <input 
                        type="text"
                        id='name'
                        autoFocus
                        className='bg-slate-100 p-2 border rounded outline-none focus:border-primary-400'
                        name='name'
                        value={data.name} 
                        onChange={handleChange}
                        placeholder='Ingresa tu nombre'
                    />
                </div>
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
                </div>
                <div className='grid gap-1'>
                    <label htmlFor="confirmPassword">Confirmar contraseña:</label>
                    <div className='bg-slate-100 p-2 border rounded flex items-center focus-within:border-primary-400'>
                        <input 
                            type={showConfirmPassword ? "text" : "password"}
                            id='confirmPassword'
                            className='w-full outline-none'
                            name='confirmPassword'
                            value={data.confirmPassword} 
                            onChange={handleChange}
                            placeholder='Ingresa la confirmación de contraseña'
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

                <button  disabled={!valideValue} className={` ${valideValue ? "bg-primary-300 hover:bg-primary-500" : "bg-gray-500" }  text-white py-3 rounded-full 
                font-semibold my-3 tracking-wide`}>Registrarse</button>
            </form>
            <p>
                Ya tienes una cuenta? <Link to={"/login"} 
                className='font-semibold text-primary-400 hover:text-primary-500'>Iniciar Sesión</Link>
            </p>
        </div>
      
    </section>
  )
}

export default Register
