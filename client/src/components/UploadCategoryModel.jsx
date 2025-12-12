import React, { useState } from 'react'
import { IoClose } from "react-icons/io5";
import uploadImage from '../utils/UploadImage';
import toast from 'react-hot-toast';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import Axios from '../utils/Axios';

const UploadCategoryModel = ({close, fetchData}) => {
    const [data,setData] = useState({
      name : "",
      image : ""
    })

    const [loading,setLoading] = useState(false)

    const handleOnChange = (e)=>{
      const { name, value} = e.target

      setData((preve)=>{
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
          ...SummaryApi.addCategory,
          data : data
        })
        const { data : responseData } = response

        if(responseData.success){
          toast.success(responseData.message)
          close()
          fetchData()
        }
      } catch (error) {
        AxiosToastError(error)
      }finally{
        setLoading(false)

      }
    }

    const handleUploadCategoryImage = async(e)=>{
      const file = e.target.files[0]

      if(!file){
        return
      }

      const response = await uploadImage(file)
      const { data : ImageResponse } = response

        setData((preve)=>{
            return{
                ...preve,
                image : ImageResponse.data.url
            }
      })
    }

  return (
    <section className='fixed top-0 bottom-0 left-0 right-0 p-4 bg-neutral-800 bg-opacity-60 
    flex items-center justify-center z-[100]'>
      <div className='bg-white max-w-4xl w-full p-4 rounded '>
        <div className='flex items-center justify-between border-b pb-2'>
          <h1 className='font-semibold '>Categoría</h1>
          <button onClick={close} className='w-fit block ml-auto'>
            <IoClose size={25}/>
          </button>
        </div>
        <form className='my-3 grid gap-2' onSubmit={handleSubmit}>
          <div className='grid gap-1'>
            <label id='categoryName'>Nombre:</label>
            <input 
              type="text"
              id='categoryName'
              placeholder='Ingrese el nombre de la categoría'
              value={data.name}
              name='name'
              onChange={handleOnChange}
              className='bg-slate-100 p-2 border rounded focus-within:border-primary-400 outline-none'
            />
          </div>
          <div className='grid gap-1'>
            <p>Imagen</p>
            <div className='flex gap-4 flex-col lg:flex-row items-center'>
              <div className='border bg-slate-100 h-36 w-full lg:w-36 flex items-center justify-center rounded'>
                {
                  data.image ? (
                    <img 
                      alt='category'
                      src={data.image} 
                      className='w-full h-full object-scale-down'
                    />
                  ) : (
                      <p className='text-sm text-neutral-500'>No hay Imagen</p>
                  )
                }
              </div>
              <label htmlFor='uploadCategoryImage'>
                <div className={
                  `${!data.name ? "bg-gray-300" : "border-primary-400 hover:bg-primary-400 text-primary-400 hover:text-white"} 
                   px-4 py-2 rounded cursor-pointer border font-medium `
                }>Subir Imagen</div>
                <input disabled={!data.name} onChange={handleUploadCategoryImage} type="file" id='uploadCategoryImage' className='hidden'/>
              </label>
              
            </div>
          </div>

          <button
            className={`
            ${data.name && data.image ? "bg-primary-300 hover:bg-primary-500 text-white" : "bg-gray-300  "} 
             py-2 font-semibold rounded-full
            `}>
            Registrar categoría</button>
        </form>
      </div>
    </section>
  )
}

export default UploadCategoryModel
