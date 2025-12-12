import React, { useState } from 'react'
import {Link, useNavigate} from 'react-router-dom'
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';

const ForgotPassword = () => {
    const [data, setData] = useState({
        email : ""
    })
    
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

        try {
            const response = await Axios({
                ...SummaryApi.forgot_password,
                data : data

            })

            if(response.data.error){
                toast.error(response.data.message)
            }

            if(response.data.success){
                toast.success(response.data.message)
                navigate("/verification-otp",{
                    state : data
                })
                setData({
                    email : ""
                })
                
            }
        } catch (error) {
            AxiosToastError(error)
        }
    }

  return (
    <section className='w-full container mx-auto px-2'>
        <div className='bg-white my-4 w-full max-w-lg mx-auto rounded p-7'>
            <p className='font-semibold text-lg text-center'>Recuperación de contraseña</p>
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

                <button  disabled={!valideValue} className={` ${valideValue ? "bg-primary-300 hover:bg-primary-500" : "bg-gray-500" }  text-white py-3 rounded-full 
                font-semibold my-3 tracking-wide`}>Enviar OTP</button>
            </form>
            <p>
               Ya tienes una cuenta? <Link to={"/login"} 
                className='font-semibold text-primary-400 hover:text-primary-500'>Iniciar Sesión</Link>
            </p>
        </div>
      
    </section>
  )
}

export default ForgotPassword
