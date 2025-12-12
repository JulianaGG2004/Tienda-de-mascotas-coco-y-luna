import React from 'react'
import SummaryApi from '../common/SummaryApi'
import { useState } from 'react'
import Axios from '../utils/Axios'
import AxiosToastError from '../utils/AxiosToastError'

const Product = () => {
    const [productData,setProductData] = useState([])
    const [page,setPage] = useState(1)

    const fetchProductData = async()=>{
    try {
        const response = await Axios({
            ...SummaryApi.getProduct,
            data : {
                page : page,
            }
        })

        const { data : responseData } = response 
        if(responseData.success){
            
            setProductData(responseData.data)
        }

    } catch (error) {
        AxiosToastError(error)
    }
  }

    useEffect(()=>{
        fetchProductData()
    },[])
  return (
    <div>
      Product
    </div>
  )
}

export default Product
