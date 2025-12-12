import React, { useState } from 'react'
import { FaCloudUploadAlt } from "react-icons/fa";
import uploadImage from '../utils/UploadImage';
import Loading from '../components/Loading';
import ViewImage from '../components/ViewImage';
import { MdDelete } from "react-icons/md";
import { useSelector } from 'react-redux'
import { IoClose } from "react-icons/io5";
import SummaryApi from '../common/SummaryApi';
import Axios from '../utils/Axios';
import AxiosToastError from '../utils/AxiosToastError';
import successAlert from '../utils/SuccessAlert';

const EditProductAdmin = ({close,data : propsData, fetchProductData}) => {
  const [data,setData]= useState({
    _id : propsData._id,
    name: propsData.name,
    image: propsData.image,
    category: propsData.category,
    subCategory: propsData.subCategory,
    unit: propsData.unit,
    stock: propsData.stock,
    status: propsData.status,
    price: propsData.price,
    description: propsData.description,
  })

  const [imageLoading,setImageLoading] = useState(false)
  const [ViewImageURL,setViewImageURL] = useState("")
  const allCategory = useSelector(state => state.product.allCategory)
  const [selectCategory,setSelectCategory] = useState("")
  const [selectSubCategory,setSelectSubCategory] = useState("")
  const allSubCategory = useSelector(state => state.product.allSubCategory)

  const handleChange = (e)=>{
    const {name, value} = e.target

    setData((preve)=>{
      return{
        ...preve,
        [name] : value
      }
    })
  }

  const handleUploadImage = async(e)=>{
    const file = e.target.files[0]

    if(!file){
      return
    }
    setImageLoading(true)
    const response = await uploadImage(file)
    const { data : ImageResponse } = response
    const imageUrl = ImageResponse.data.url

    setData((preve)=>{
      return{
        ...preve,
        image : [...preve.image, imageUrl]
      }
    })
    setImageLoading(false)
  }

  const handleDeleteImage = async(index)=>{
      data.image.splice(index,1)
      setData((preve)=>{
        return{
            ...preve
        }
      })
  }

  const handleRemoveCategory = async(index)=>{
    data.category.splice(index,1)
    setData((preve)=>{
      return{
        ...preve
      }
    })
  }

  const handleRemoveSubCategory = async(index)=>{
    data.subCategory.splice(index,1)
    setData((preve)=>{
      return{
        ...preve
      }
    })
  }

  const handleSubmit = async(e)=>{
    e.preventDefault()
    console.log("data",data)

    try {
      const response = await Axios({
          ...SummaryApi.updateProductDetails,
          data : data
      })
      const { data : responseData} = response

      if(responseData.success){
          successAlert(responseData.message)
          if(close){
            close()
          }
          fetchProductData()
          setData({
            name : "",
            image : [],
            category : [],
            subCategory : [],
            unit : "",
            stock : "",
            price : "",
            description : ""
          })

      }
    } catch (error) {
        AxiosToastError(error)
    }
  }


  return (
    <section className='fixed top-0 bottom-0 left-0 right-0 p-4 bg-neutral-800 bg-opacity-60 
            flex items-center justify-center z-[100]'>
        <div className='bg-white w-full p-4 max-w-2xl mx-auto rounded overflow-y-auto h-full max-h-[95vh]'>
                <section>
            <div className='p-2 bg-white shadow-md flex items-center justify-between'>
                <h2 className='font-semibold'>Actualizar Producto</h2>
                <button onClick={close}>
                    <IoClose size={20}/>
                </button>
            </div>
            <div className='grid p-3'>
                <form className='grid gap-4' onSubmit={handleSubmit}>
                <div className='grid gap-1'>
                    <label htmlFor='name' className='font-medium'>Nombre:</label>
                    <input
                        id='name'
                        type="text"
                        placeholder='Ingresar nombre del producto'
                        name='name'
                        value={data.name}
                        onChange={handleChange}
                        required
                        className='bg-slate-100 p-2 border rounded focus-within:border-primary-400 outline-none'
                    />
                </div>
                <div className='grid gap-1'>
                    <label htmlFor='description' className='font-medium'>Descripción:</label>
                    <textarea
                        id='description'
                        type="text"
                        placeholder='Ingresar la descripción del producto'
                        name='description'
                        value={data.description}
                        onChange={handleChange}
                        required
                        multiple
                        rows={3}
                        className='bg-slate-100 p-2 border rounded focus-within:border-primary-400 outline-none'
                    />
                </div>
                <div>
                    <p className='font-medium'>Imagen</p>
                    <div>
                    <label htmlFor='productImage' className='bg-slate-100 h-24 border rounded flex justify-center items-center cursor-pointer'>
                        <div className='text-certer flex justify-center items-center flex-col'>
                        {
                            imageLoading ?  <Loading/> : (
                                <>
                                    <FaCloudUploadAlt size={35}/>
                                    <p>Cargar Imagen</p>
                                </>
                            )
                            }
                        </div>
                        <input 
                        type="file"
                        id='productImage'
                        className='hidden'
                        accept='image/*'
                        onChange={handleUploadImage}
                        />
                    </label>
                    {/**Display upload imagen */}
                    <div className='flex flex-wrap gap-4'>
                        {
                        data.image.map((img,index)=>{
                            return(
                            <div key={img+index} className='h-20 mt-1 w-20 min-w-20 bg-slate-100 border relative group'>
                                <img
                                src={img}
                                alt={img}
                                className='w-full h-full object-scale-down cursor-pointer' 
                                onClick={()=>setViewImageURL(img)}
                                />
                                <div onClick={()=>handleDeleteImage(index)} className='absolute bottom-0 right-0 p-1 bg-secondary-300 hover:bg-secondary-500 rounded text-white hidden group-hover:block cursor-pointer'>
                                <MdDelete/>
                                </div>
                            </div>
                            )
                        })
                        }
                    </div>
                    </div>
                </div>
                <div className='grid gap-1'>
                    <label className='font-medium'>Categoría</label>
                    <div>
                    <select
                    className='bg-slate-100 border w-full p-2 rounded'
                    value={selectCategory}
                    onChange={(e)=>{
                        const value = e.target.value 
                        const category = allCategory.find(el => el._id === value )
                        
                        setData((preve)=>{
                        return{
                            ...preve,
                            category : [...preve.category,category],
                        }
                        })
                        setSelectCategory("")
                    }}
                    >
                        <option value={""}>Seleccione una categoría</option>
                        {
                        allCategory.map((c,index)=>{
                            return(
                            <option value={c?._id}>{c.name}</option>
                            )
                        })
                        }
                    </select>
                    <div className='flex flex-wrap gap-3'>
                        {
                        data.category.map((c,index)=>{
                            return(
                            <div key={c._id+index+"productsection"} className='text-sm flex items-center gap-1 bg-blue-50 mt-2'>
                                <p>{c.name}</p>
                                <div className='hover:text-secondary-300 cursor-pointer' onClick={()=>handleRemoveCategory(index)}>
                                <IoClose size={20}/>
                                </div>
                            </div>
                            )
                        })
                        }
                    </div>
                    </div>
                </div>
                <div className='grid gap-1'>
                    <label className='font-medium'>Subcategoría</label>
                    <div>
                    <select
                    className='bg-slate-100 border w-full p-2 rounded'
                    value={selectSubCategory}
                    onChange={(e)=>{
                        const value = e.target.value 
                        const subCategory = allSubCategory.find(el => el._id === value )
                        
                        setData((preve)=>{
                        return{
                            ...preve,
                            subCategory : [...preve.subCategory,subCategory],
                        }
                        })
                        setSelectSubCategory("")
                    }}
                    >
                        <option value={""} className='text-neutral-600'>Seleccione una Subcategoría</option>
                        {
                        allSubCategory.map((c,index)=>{
                            return(
                            <option value={c?._id}>{c.name}</option>
                            )
                        })
                        }
                    </select>
                    <div className='flex flex-wrap gap-3'>
                        {
                        data.subCategory.map((c,index)=>{
                            return(
                            <div key={c._id+index+"productsection"} className='text-sm flex items-center gap-1 bg-blue-50 mt-2'>
                                <p>{c.name}</p>
                                <div className='hover:text-secondary-300 cursor-pointer' onClick={()=>handleRemoveSubCategory(index)}>
                                <IoClose size={20}/>
                                </div>
                            </div>
                            )
                        })
                        }
                    </div>
                    </div>
                </div>
                <div className='grid gap-1'>
                    <label htmlFor='unit' className='font-medium'>Unidad:</label>
                    <input
                        id='unit'
                        type="text"
                        placeholder='Ingresar la unidad del producto'
                        name='unit'
                        value={data.unit}
                        onChange={handleChange}
                        required
                        className='bg-slate-100 p-2 border rounded focus-within:border-primary-400 outline-none'
                    />
                </div>
                <div className='grid gap-1'>
                    <label htmlFor='stock' className='font-medium'>Numero de existencias:</label>
                    <input
                        id='stock'
                        type="number"
                        placeholder='Ingresar las existencias del producto'
                        name='stock'
                        value={data.stock}
                        onChange={handleChange}
                        required
                        className='bg-slate-100 p-2 border rounded focus-within:border-primary-400 outline-none'
                    />
                </div>
                <div className='grid gap-1'>
                    <label htmlFor='status' className='font-medium'>Estado del Producto:</label>

                    <select
                        id='status'
                        name='status'
                        value={data.status}
                        onChange={(e) =>
                        handleChange({
                            target: {
                            name: 'status',
                            value: e.target.value === 'true'   // convertir a booleano
                            }
                        })
                        }
                        required
                        className='bg-slate-100 p-2 border rounded focus-within:border-primary-400 outline-none'
                    >
                        <option value="true">Disponible</option>
                        <option value="false">No disponible</option>
                    </select>
                </div>
                <div className='grid gap-1'>
                    <label htmlFor='price' className='font-medium'>Precio:</label>
                    <input
                        id='price'
                        type="number"
                        placeholder='Ingresar el precio del producto'
                        name='price'
                        value={data.price}
                        onChange={handleChange}
                        required
                        className='bg-slate-100 p-2 border rounded focus-within:border-primary-400 outline-none'
                    />
                </div>

                <button className='py-3 font-semibold bg-primary-300 hover:bg-primary-500 text-white rounded-full'>
                    Actualizar Producto
                </button>

                </form>
            </div>

            {
                ViewImageURL && (
                <ViewImage url={ViewImageURL} close={()=>setViewImageURL("")}/>
                )
            }
            </section>
        </div>
    </section>
  )
}

export default EditProductAdmin
