import React from 'react'
import { useForm } from "react-hook-form"
import { IoClose } from "react-icons/io5";
import SummaryApi from '../common/SummaryApi';
import Axios from '../utils/Axios';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError';
import { useGlobalContext } from '../provider/GlobalProvider';

const EditAddressDetails = ({close, data}) => {
    const { register, handleSubmit,reset } = useForm({
        defaultValues : {
            _id : data._id,
            userId : data.userId,
            city : data.city,
            department : data.department,
            address_detail : data.address_detail,
            additional_information : data.additional_information,
            neighborhood : data.neighborhood,
            mobile : data.mobile
        }
    })
    const { fetchAddress } = useGlobalContext()

    const onSubmit = async(data)=>{
    
        try {
            const response = await Axios({
                ...SummaryApi.updateAddress,
                data : {
                    ...data,
                    city :data.city,
                    department : data.department,
                    address_detail : data.address_detail,
                    additional_information : data.additional_information,
                    neighborhood : data.neighborhood,
                    mobile : data.mobile
                }
            })

            const { data : responseData } = response
            
            if(responseData.success){
                toast.success(responseData.message)
                if(close){
                    close()
                    reset()
                    fetchAddress()
                }
            }
        } catch (error) {
            AxiosToastError(error)
        }
    }
  return (
    <section className='bg-black fixed top-0 left-0 right-0 bottom-0 z-50 bg-opacity-70 h-screen overflow-auto'>
        <div className='bg-white p-4 w-full max-w-lg mt-8 mx-auto rounded'>
             <div className='flex justify-between items-center gap-4 border-b py-2'>
                <h2 className='font-semibold'>Actualizar dirección</h2>
                <button onClick={close} className='hover:text-secondary-300'>
                    <IoClose  size={25}/>
                </button>
            </div>
            <form className='mt-4 grid gap-4' onSubmit={handleSubmit(onSubmit)}>
                <div className='grid gap-1'>
                    <label htmlFor='city'>Ciudad:</label>
                    <input
                        type='text'
                        id='city' 
                        className='focus-within:border-primary-400 border bg-slate-100 p-2 rounded outline-none'
                        {...register("city",{required : true})}
                    />
                </div>
                <div className='grid gap-1'>
                    <label htmlFor='department'>Departamento:</label>
                    <input
                        type='text'
                        id='department' 
                        className='focus-within:border-primary-400 border bg-slate-100 p-2 rounded outline-none'
                        {...register("department",{required : true})}
                    />
                </div>
                <div className='grid gap-1'>
                    <label htmlFor='address_detail'>Detalle de dirección:</label>
                    <input
                        type='text'
                        id='address_detail' 
                        className='focus-within:border-primary-400 border bg-slate-100 p-2 rounded outline-none'
                        {...register("address_detail",{required : true})}
                    />
                </div>
                <div className='grid gap-1'>
                    <label htmlFor='neighborhood'>Barrio:</label>
                    <input
                        type='text'
                        id='neighborhood' 
                        className='focus-within:border-primary-400 border bg-slate-100 p-2 rounded outline-none'
                        {...register("neighborhood",{required : true})}
                    />
                </div>
                <div className='grid gap-1'>
                    <label htmlFor='additional_information'>Información adicional:</label>
                    <input
                        type='text'
                        id='additional_information' 
                        className='focus-within:border-primary-400 border bg-slate-100 p-2 rounded outline-none'
                        {...register("additional_information",{required : true})}
                    />
                </div>
                <div className='grid gap-1'>
                    <label htmlFor='mobile'>Telefono de contato:</label>
                    <input
                        type='text'
                        id='mobile' 
                        className='focus-within:border-primary-400 border bg-slate-100 p-2 rounded outline-none'
                        {...register("mobile",{required : true})}
                    />
                </div>

                <button type='submit' className='bg-primary-300 w-full  py-2 font-semibold mt-4 hover:bg-primary-500 text-white rounded-full'>Actualizar dirección</button>
            </form>

        </div>
    </section>
  )
}

export default EditAddressDetails
