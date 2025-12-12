import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import SummaryApi from '../common/SummaryApi'
import Axios from '../utils/Axios'
import AxiosToastError from '../utils/AxiosToastError'
import { FaAngleRight,FaAngleLeft } from "react-icons/fa6";
import { DisplayPriceInPesos } from '../utils/DisplayPriceInPesos.js'
import Divider from '../components/Divider'
import AddToCartButton from '../components/AddToCartButton.jsx'

const ProductDisplayPage = () => {
  const params = useParams()
  let productId = params?.product?.split("-")?.slice(-1)[0]
  const [data,setData] = useState({
    name : "",
    image : []
  })

  const [image,setImage] = useState(0)
  const [loading,setLoading] = useState(false)
  const imageContainer = useRef()

   const fetchProductDetails = async()=>{
      try {
          const response = await Axios({
            ...SummaryApi.getProductDetails,
            data : {
              productId : productId 
            }
          })

          const { data : responseData } = response

          if(responseData.success){
            setData(responseData.data)
          }
      } catch (error) {
        AxiosToastError(error)
      }finally{
        setLoading(false)
      }
    }

    useEffect(()=>{
      fetchProductDetails()
    },[params])

    const handleScrollRight = ()=>{
      imageContainer.current.scrollLeft += 100
    }
    const handleScrollLeft = ()=>{
      imageContainer.current.scrollLeft -= 100
    }
  return (
    <section className=' mx-auto p-4 grid lg:grid-cols-4'>
        <div className='col-span-2'>
          <div className='bg-white lg:min-h-[72vh] lg:max-h-[72vh] rouded min-h-56 max-h-56 h-full w-full'>
           <img
                src={data.image[image]}
                className='w-full h-full object-scale-down'
            /> 
          </div>
          <div className='flex items-center justify-center gap-3 my-2'>
            {
              data.image.map((img,index)=>{
                return(
                  <div key={img+index+"point"} className={`bg-slate-200 w-3 h-3 lg:w-5 lg:h-5 rounded-full ${index === image && "bg-slate-300"}`}></div>
                )
              })
            }
          </div>
           <div className='grid relative'>
              <div ref={imageContainer} className='flex gap-4 z-10 relative w-full overflow-x-auto scrollbar-none'>
                    {
                      data.image.map((img,index)=>{
                        return(
                          <div className='w-20 h-20 min-h-20 min-w-20 scr cursor-pointer shadow-md' key={img+index}>
                            <img
                                src={img}
                                alt='min-product'
                                onClick={()=>setImage(index)}
                                className='w-full h-full object-scale-down' 
                            />
                          </div>
                        )
                      })
                    }
              </div>
              <div className='w-full -ml-3 h-full hidden lg:flex justify-between absolute  items-center'>
                  <button onClick={handleScrollLeft} className='z-10 bg-white relative p-1 rounded-full shadow-lg'>
                      <FaAngleLeft/>
                  </button>
                  <button onClick={handleScrollRight} className='z-10 bg-white relative p-1 rounded-full shadow-lg'>
                      <FaAngleRight/>
                  </button>
              </div>
            </div>
        </div>

        <div className=' col-span-2 p-2 lg:pl-7 text-base lg:text-lg w-full'>
          <p className='bg-green-300 w-fit px-2 rounded-full'>10 Min</p>
          <h2 className='text-lg font-semibold lg:text-3xl '>{data.name}</h2>
          <p className=''>{data.unit}</p> 
            <Divider/>
          <div>
            <p className=''>Precio:</p> 
              <div className='flex items-center gap-2 lg:gap-4'>
                <div className='border border-primary-500 px-4 py-2 rounded bg-primary-200 w-fit'>
                    <p className='font-semibold text-lg lg:text-xl'>{DisplayPriceInPesos(data.price)}</p>
                </div>
              </div>
          </div>
            {
              data.status === false ? (
                <p className='text-lg text-secondary-300 my-2'>No Disponible</p>
              ) : (
                //<button className='my-4 px-4 py-1 bg-primary-300 hover:bg-primary-500 text-white rounded'>Añadir producto</button>
                <div className='my-4'>
                  <AddToCartButton data={data}/>
                </div>
              )
            }
          <Divider/>
          <div className='flex items-center gap-2 lg:gap-4'>
               <div>
                    <p className='font-semibold'>Descripcion:</p>
                    <p className='text-base'>{data.description}</p>
                </div>
          </div>
        </div>

    </section>
  )
}

export default ProductDisplayPage
