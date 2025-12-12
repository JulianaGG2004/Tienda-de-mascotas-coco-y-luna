import React, { useState } from 'react'
import EditProductAdmin from './EditProductAdmin'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import toast from 'react-hot-toast'
import Axios from '../utils/Axios'
import ConfirmBox from './ConfirmBox'

const ProductCardAdmin = ({ data, fetchProductData }) => {
  const [editOpen,setEditOpen]= useState(false)
  const [openConfirmBoxDelete, setOpenConfirmBoxDelete] = useState(false)

  const handleDeleteProduct = async()=>{
    try {
      const response = await Axios({
        ...SummaryApi.deleteProduct,
         data : {
          _id : data._id
        }
      })

      const { data : responseData } = response

      if(responseData.success){
          toast.success(responseData.message)
          if(fetchProductData){
            fetchProductData()
          }
          setOpenConfirmBoxDelete(false)
      }
    } catch (error) {
      AxiosToastError(error)
    }
  }

  return (
    <div className='w-38 p-4 bg-white rounded flex flex-col justify-between h-full min-h-80'>
      <div className='w-full h-60 group rounded bg-white' >
        <img 
            src={data?.image[0]}
            alt={data?.name}
            className='w-full h-full object-scale-down'
        />
      </div>
      <p className='text-ellipsis line-clamp-2 font-medium'>{data.name}</p>
      <p className='text-slate-400'>{data?.unit}</p>
      <div className='grid grid-cols-2 gap-3 py-2'>
        <button onClick={()=>setEditOpen(true)}
         className='flex-1 bg-primary-300 hover:bg-primary-500 text-white font-medium py-2 rounded-full'>
          Editar
        </button>
        <button onClick={()=>setOpenConfirmBoxDelete(true)}
        className='flex-1 bg-secondary-300 hover:bg-secondary-500 text-white font-medium py-2 rounded-full'>
          Eliminar
        </button>
      </div>
      {
        editOpen && (
          <EditProductAdmin fetchProductData={fetchProductData} data={data} close={()=>setEditOpen(false)}/>
        )
      }
      {
        openConfirmBoxDelete && (
          <ConfirmBox close={()=>setOpenConfirmBoxDelete(false)} cancel={()=>setOpenConfirmBoxDelete(false)} confirm={handleDeleteProduct}/>
        )
      }
      
    </div>
  )
}

export default ProductCardAdmin
