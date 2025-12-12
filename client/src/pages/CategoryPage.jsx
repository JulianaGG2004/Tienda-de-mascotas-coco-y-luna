import React, { useEffect, useState } from 'react'
import UploadCategoryModel from '../components/UploadCategoryModel'
import Loading from '../components/Loading'
import NoData from '../components/NoData'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import EditCategory from '../components/EditCategory'
import ConfirmBox from '../components/ConfirmBox'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import { useSelector } from 'react-redux'

const CategoryPage = () => {

  const [openUploadCategory, setOpenUploadCategory] = useState(false)
  const [loading, setLoading] = useState(false)
  const [categoryData, setCategoryData] = useState([])
  const [openEdit,setOpenEdit] = useState(false)
  const [editData,setEditData] =  useState({
    name : "",
    image : ""
  })

  const [openConfirmBoxDelete, setOpenConfirmBoxDelete] = useState(false)
  const [deleteCategory, setDeleteCategoty] = useState({
    _id : ""
  })
  // const allCategory = useSelector(state => state.product.allCategory)

  // useEffect(()=>{
  //   setCategoryData(allCategory)
  // },[allCategory])
  const fetchCategory = async()=>{
    try {
      setLoading(true)
      const response = await Axios({
        ...SummaryApi.getCategory
      })
      const { data : responseData } = response

      if(responseData.success){
        setCategoryData(responseData.data)
      }
    } catch (error) {
      
    }finally{
      setLoading(false)
    }
  }

  useEffect(()=>{
    fetchCategory()
  },[])

  const handleDeleteCategory = async()=>{
    try {
      const response = await Axios({
        ...SummaryApi.deleteCategory,
        data : deleteCategory
      })

      const { data : responseData } = response

      if(responseData.success){
        toast.success(responseData.message)
        fetchCategory()
        setOpenConfirmBoxDelete(false)
      }
    } catch (error) {
      AxiosToastError(error)
    }
  }

  return (
    <section>
      <div className='p-2 bg-white shadow-md flex items-center justify-between'>
        <h2 className='font-semibold'>Categorías</h2>
        <button onClick={()=> setOpenUploadCategory(true)} className='text-sm border border-primary-400 hover:bg-primary-400
         px-3 py-1 rounded-full text-primary-400 hover:text-white'>Añadir Categoría</button>
      </div>
      {
        !categoryData[0] && !loading && (
          <NoData/>
        )
      }
      {
        loading && (
          <Loading/>
        )
      }

      <div className='p-4 bg-slate-100 grid gap-4 grid-cols-[repeat(auto-fill,minmax(160px,1fr))]'>
        {
        categoryData.map((category,index)=>{
          return(
            <div className='w-full h-60 group rounded shadow-md bg-white' key={category._id}>
              <img
                alt={category.name}
                src={category.image} 
                
                className='w-full h-36 object-contain' 
              />
              <p className="font-medium text-center mt-3 h-8">{category.name}</p>
              <div className='items-center h-9 flex gap-2 p-3'>
                <button onClick={()=>{
                  setOpenEdit(true)
                  setEditData(category)
                }} className='flex-1 bg-primary-300 hover:bg-primary-500 text-white font-medium py-2 rounded-full'>
                  Editar
                </button>
                <button onClick={()=>{
                  setOpenConfirmBoxDelete(true)
                  setDeleteCategoty(category)
                }}className='flex-1 bg-secondary-300 hover:bg-secondary-500 text-white font-medium py-2 rounded-full'>
                  Eliminar
                </button>
              </div>
            </div>
          )
        })
      }
      </div>

      {
        openUploadCategory && (
          <UploadCategoryModel fetchData={fetchCategory} close={()=>setOpenUploadCategory(false)}/>
        )
      }
      {
        openEdit && (
          <EditCategory data={editData} close={()=>setOpenEdit(false)} fetchData={fetchCategory}/>
        )
      }
      {
        openConfirmBoxDelete && (
          <ConfirmBox close={()=>setOpenConfirmBoxDelete(false)} cancel={()=>setOpenConfirmBoxDelete(false)} confirm={handleDeleteCategory}/>
        )
      }
      
    </section>
  )
}

export default CategoryPage
