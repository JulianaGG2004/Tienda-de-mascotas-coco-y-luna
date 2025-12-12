import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FaUserCircle } from "react-icons/fa";
import UserProfileAvatarEdit from '../components/UserProfileAvatarEdit';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import toast from 'react-hot-toast';
import { setUserDetails } from '../store/userSlice';
import fetchUserDetails from '../utils/fetchUserDetails';

const Profile = () => {
    const user = useSelector(state => state.user)
    const [openProfileAvatarEdit,setProfileAvatarEdit] = useState(false)
    const [userData, setUserData] = useState({
        name: user.name,
        email : user.email,
        mobile : user.mobile
    })
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()

    useEffect(()=>{
        setUserData({
            name: user.name,
            email : user.email,
            mobile : user.mobile
        })
    },[user])

    const handleOnChange = async(e)=>{
        const { name, value} = e.target

        setUserData((preve)=>{
            return{
                ...preve,
                [name] : value
            }
        })

    }

    const handleSubmit = async(e)=>{
        e.preventDefault()
        try {
            setLoading(true)
            const response = await Axios({
                ...SummaryApi.updateUserDetails,
                data : userData
            })

            const {data : responseData }= response
            if(responseData.success){
                toast.success(responseData.message)
                const userData = await fetchUserDetails()
                dispatch(setUserDetails(userData.data))
            }
        } catch (error) {
            AxiosToastError(error)
        } finally {
            setLoading(false)
        }
    }

  return (
    <div className='p-4'>
        {/**Sección para actualizar imagen de perfil */}
        <div className='w-20 h-20 flex items-center justify-center rounded-full overflow-hidden drop-shadow-sm'>
            {
                user.avatar ? (
                    <img 
                    alt = {user.name}
                    src = {user.avatar}
                    className='w-full h-full'
                    />
                ) : (
                    <FaUserCircle size={65}/>
                )
            }
            
        </div>
        <button onClick={()=>setProfileAvatarEdit(true)} className='text-sm min-w-20 border border-primary-400 hover:bg-primary-500 px-3 py-2 rounded-full mt-3 text-white bg-primary-300'>Editar Imagen</button>
        {
            openProfileAvatarEdit && (
                <UserProfileAvatarEdit close={()=>setProfileAvatarEdit(false)}/>
            )
        }
        {/**Sección para actualizar demas información de perfil */}
        <form className='my-4 grid gap-4' onSubmit={handleSubmit}>
            <div className='grid'>
                <label>Nombre: </label>
                <input 
                    type="text"
                    placeholder='Ingresa tu nombre'
                    className='bg-slate-100 p-2 border rounded 
                    outline-none focus:border-primary-400'
                    value ={userData.name}
                    name = 'name'
                    onChange={handleOnChange}
                    required
                />

            </div>
            <div className='grid'>
                <label htmlFor='email'>Correo Electronico: </label>
                <input 
                    type="email"
                    id = 'email'
                    placeholder='Ingresa tu correo electronico'
                    className='bg-slate-100 p-2 border rounded 
                    outline-none focus:border-primary-400'
                    value ={userData.email}
                    name = 'email'
                    onChange={handleOnChange}
                    required
                />
            </div>
            <div className='grid'>
                <label htmlFor='mobile'>Numero de Telefono: </label>
                <input 
                    type="text"
                    id = 'mobile'
                    placeholder='Ingresa tu numero de telefono'
                    className='bg-slate-100 p-2 border rounded 
                    outline-none focus:border-primary-400'
                    value ={userData.mobile}
                    name = 'mobile'
                    onChange={handleOnChange}
                    required
                />
            </div>

            <button className='border px-4 py-2 font-semibold bg-primary-300 hover:bg-primary-500 text-white rounded-full'>
                {
                    loading ? "Cargando..." : "Actualizar perfil"
                }
            </button>
        </form>
    </div>
  )
}

export default Profile
