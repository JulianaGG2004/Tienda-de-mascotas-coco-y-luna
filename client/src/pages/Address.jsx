import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import AddAddress from '../components/AddAddress'
import { MdDelete } from "react-icons/md";
import { MdEdit } from "react-icons/md";
import EditAddressDetails from '../components/EditAddressDetails';
import { useGlobalContext } from '../provider/GlobalProvider';
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import AxiosToastError from '../utils/AxiosToastError';
import SummaryApi from '../common/SummaryApi';

const Address = () => {
  const addressList = useSelector(state => state.addresses.addressList)
  const [openAddress,setOpenAddress] = useState(false)
  const [OpenEdit,setOpenEdit] = useState(false)
  const [editData,setEditData] = useState({})
  const { fetchAddress} = useGlobalContext()

  const handleDisableAddress = async(id)=>{
    try {
      const response = await Axios({
        ...SummaryApi.disableAddress,
        data : {
          _id : id
        }
      })
      if(response.data.success){
        toast.success("Dirección eliminada")
        if(fetchAddress){
          fetchAddress()
        }
      }
    } catch (error) {
      AxiosToastError(error)
    }
  }
  return (
    <div className='bg-slate-100 h-full'>
      <div className=' bg-white shadow-lg px-2 py-2 flex justify-between gap-4 items-center '>
            <h2 className='font-semibold text-ellipsis line-clamp-1'>Direcciones</h2>
            <button onClick={()=>setOpenAddress(true)} className='border border-primary-300 text-primary-300 px-3 hover:bg-primary-300 hover:text-white py-1 rounded-full'>
                Agregar dirección
            </button>
      </div>
      <div className='bg-slate-100 p-2 grid gap-4'>
            {
                addressList.map((address, index) => {
                    return (
                          <div className={`border rounded p-3 flex gap-3 bg-white ${!address.status && 'hidden'}`}>
                            <div className='w-full'>
                                <p>{address.city}</p>
                                <p>{address.department}</p>
                                <p>{address.address_detail}/{address.neighborhood}</p>
                                <p>{address.additional_information}</p>
                                <p>{address.mobile}</p>
                            </div>
                            <div className='grid gap-5'>
                              <button onClick={()=>{
                                setOpenEdit(true)
                                setEditData(address)}}
                               className='bg-primary-300 p-3 rounded hover:text-white hover:bg-primary-500 items-center'>
                                <MdEdit size={25}/>
                              </button>
                              <button onClick={()=>
                                handleDisableAddress(address._id)} 
                                className='bg-secondary-300 p-3 rounded hover:text-white hover:bg-secondary-500 items-center'>
                                <MdDelete size={25}/>  
                              </button>
                          </div>
                          </div>
                        )
                    })
            }
        <div onClick={() => setOpenAddress(true)} className='h-16 bg-blue-50 border-2 border-dashed flex justify-center items-center cursor-pointer'>
            Agregar Dirección
        </div>
      </div>

      {
        openAddress && (
          <AddAddress close={()=>setOpenAddress(false)}/>
        )
      }
      {
        OpenEdit && (
          <EditAddressDetails data={editData} close={()=>setOpenEdit(false)}/>
        )
      }

    </div>
  )
}

export default Address
