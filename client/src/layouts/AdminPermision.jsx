import React from 'react'
import { useSelector } from 'react-redux'
import isAdmin from '../utils/isAdmin'

const AdminPermision = ({children}) => {

    const user = useSelector(state => state.user)
  return (
    <>
    {
        isAdmin(user.role) ? children : <p className='text-secondary-500 bg-red-100 p-4'>No tienes permisos!!</p>
    }
    </>
  )
}

export default AdminPermision


{/**import React from 'react'
import { useSelector } from 'react-redux'
import isAdmin from '../utils/isAdmin'

const AdminPermision = ({children}) => {
    const user = useSelector(state => state.user)

    // 1. Mientras esté cargando o no hay user.role → no mostrar nada
    if (user.loading || !user.role) {
        return null // o un spinner si quieres
    }

    // 2. Cuando ya hay rol, evaluar permisos
    return (
        <>
            {
                isAdmin(user.role)
                    ? children
                    : <p className='text-secondary-500 bg-red-100 p-4'>No tienes permisos!!</p>
            }
        </>
    )
}

export default AdminPermision */}