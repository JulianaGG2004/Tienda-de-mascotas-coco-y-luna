import axios from "axios";
import SummaryApi, { baseURL } from "../common/SummaryApi";

const Axios = axios.create({
    baseURL : baseURL,
    withCredentials : true
})
//enviando el token de acceso en la cabecera
Axios.interceptors.request.use(
    async(config)=>{
        const accessToken = localStorage.getItem('accesstoken')

        if(accessToken){
            config.headers.Authorization = `Bearer ${accessToken}` 
        }

        return config
    },
    (error)=>{
        return Promise.reject(error)
    }
)

//Prolongar la vida útil del token de acceso con la ayuda de la actualización
Axios.interceptors.request.use(
    (response)=>{
        return response
    },
    async(error)=>{
        let originalRequest = error.config
        if(error.response.status === 401 && !originalRequest.retry){
            originalRequest.retry = true
            const refreshToken = localStorage.getItem("refreshToken")

            if(refreshToken){
                const newAccessToken = await refreshAccessToken(refreshToken)

                if(newAccessToken){
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
                    return Axios(originalRequest) 
                }
            }
        }

        return Promise.reject(error)
    }
)

const refreshAccessToken = async(refreshToken)=>{
    try {
        const response = await Axios({
            ...SummaryApi.refreshToken,
            headers : {
                Authorization : `Bearer ${refreshToken}`
            }
        })

        const accessToken = response.data.data.accessToken
        localStorage.setItem('accesstoken',accessToken)
        return accessToken
    } catch (error) {
        
    }
}

export default Axios