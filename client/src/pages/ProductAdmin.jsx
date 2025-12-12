import React from 'react'
import SummaryApi from '../common/SummaryApi'
import { useEffect, useState } from 'react'
import Axios from '../utils/Axios'
import AxiosToastError from '../utils/AxiosToastError'
import ProductCardAdmin from '../components/ProductCardAdmin'
import Loading from '../components/Loading'
import { IoSearchOutline } from "react-icons/io5";

const ProductAdmin = () => {

  const [productData,setProductData] = useState([])
  const [page,setPage] = useState(1)
  const [loading,setLoading] = useState(false)
  const [totalPageCount,setTotalPageCount] = useState(1)
  const [search,setSearch] = useState("")

  const fetchProductData = async()=>{
  try {
      setLoading(true)
      const response = await Axios({
          ...SummaryApi.getProduct,
          data : {
              page : page,
              limit : 10,
              search : search
          }
      })

      const { data : responseData } = response 
      if(responseData.success){
          setTotalPageCount(responseData.totalNoPage)
          setProductData(responseData.data)
      }

    }catch (error) {
        AxiosToastError(error)
    }finally{
      setLoading(false)
    }
  }

  useEffect(()=>{
      fetchProductData()
  },[page])

  const handleNext = ()=>{
    if(page !== totalPageCount){
      setPage(preve => preve + 1)
    }
  }

  const handlePrevious = ()=>{
    if(page > 1){
      setPage(preve => preve - 1)
    }
  }

  const handleOnChange = (e)=>{
    const { value } = e.target
    setSearch(value)
    setPage(1)
  }

  useEffect(()=>{
    let flag = true 

    const interval = setTimeout(() => {
      if(flag){
        fetchProductData()
        flag = false
      }
    }, 300);

    return ()=>{
      clearTimeout(interval)
    }
  },[search])

  return (
    <section>
      <div className='p-2 bg-white shadow-md flex items-center justify-between gap-4'>
        <h2 className='font-semibold'>Productos</h2>
        <div className='h-full min-w-24 max-w-56 w-full ml-auto bg-slate-100 px-4 flex items-center gap-3 py-2 rounded  border focus-within:border-primary-300'>
          <IoSearchOutline size={25}/>
          <input
            type='text'
            placeholder='Buscar ...' 
            className='h-full w-full outline-none bg-transparent'
            value={search}
            onChange={handleOnChange}
          />
        </div>
      </div>
      {
        loading && (
          <Loading/>
        )
      }

      <div className='p-4 bg-slate-100'>
        <div className=''>
          <div className='p-4 grid gap-4 grid-cols-[repeat(auto-fill,minmax(160px,1fr))]'>
            {
              productData.map((p,index)=>{ 
                return(
                  <ProductCardAdmin data={p} fetchProductData={fetchProductData}/>
                )
              })
            }
          </div>
        </div>
        
        <div className='flex justify-between my-4'>
              <button onClick={handlePrevious}  className="border border-primary-300 px-4 py-1 hover:bg-primary-300">Anterior</button>
              <button className='w-full bg-slate-200'>{page}/{totalPageCount}</button>
              <button onClick={handleNext} className="border border-primary-300 px-4 py-1 hover:bg-primary-300">Siguiente</button>
            </div>
      </div>
    </section>
  )
}

export default ProductAdmin
