import React from 'react'
import banner from '../assets/banner.jpg'
import bannerMobile from '../assets/banner_mobil.jpg'
import { useSelector } from 'react-redux'
import { valideURLConvert } from '../utils/validateURLConvert'
import { useNavigate } from 'react-router-dom'
import CategoryWiseProductDisplay from '../components/CategoryWiseProductDisplay'

const Home = () => {
  const loadingCategory = useSelector(state => state.product.loadingCategory)
  const categoryData = useSelector(state => state.product.allCategory)
  const subCategoryData = useSelector(state => state.product.allSubCategory)
  const navigate = useNavigate()


   const handleRedirectProductListpage = (id,cat)=>{
    console.log(id,cat)
    console.log(subCategoryData)
        const subcategory = subCategoryData.find(sub =>{
        
        const filterData = sub.category.some(c => {
          return c._id == id
        })

        return filterData ? true : null
      })
      const url = `/${valideURLConvert(cat)}-${id}/${valideURLConvert(subcategory.name)}-${subcategory._id}`

      navigate(url)
      console.log(url)
  }

  return (
    <section className='bg-white'>
      <div className='container mx-auto'>
          <div className={`w-full h-full min-h-48 bg-blue-100 rounded ${!banner && "animate-pulse my-2" } `}>
              <img
                src={banner}
                className='w-full h-full hidden lg:block'
                alt='banner' 
              />
              <img
                src={bannerMobile}
                className='w-full h-full lg:hidden'
                alt='banner' 
              />
          </div>
      </div>
      <div className='container mx-auto px-4 my-2 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2'>
        {

          loadingCategory ? (
            new Array(5).fill(null).map((c,index)=>{
            return (
              <div key={index+"loadingcategory"} className='bg-white rounded p-4 min-h-36 grid gap-2 shadow-md animate-pulse'>
                <div className='bg-blue-100 min-h-30 rounded'></div>
                <div className='bg-blue-100 h-8 rounded'></div>
              </div>
            )
          }) 
          ) : (
            categoryData.map((cat,index)=>{
              return(
                <div key={cat._id+"displayCategory"} className="flex flex-col sm:flex-row items-center  rounded-full shadow-sm p-3 bg-white" onClick={()=>handleRedirectProductListpage(cat._id,cat.name)}>
                <img 
                  src={cat.image}
                  className="w-20 h-20 object-contain"
                  alt={cat.name}
                />
                <p className="font-semibold text-gray-700 text-center text-lg ">
                  {cat.name}
                </p>
              </div>
              )
            })
            
          )
          
        }
      </div>
          {/***display category product */}
      {
        categoryData?.map((c,index)=>{
          return(
            <CategoryWiseProductDisplay 
              key={c?._id+"CategorywiseProduct"} 
              id={c?._id} 
              name={c?.name}
            />
          )
        })
      }

    </section>
  )
}

export default Home
