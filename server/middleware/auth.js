import jwt from 'jsonwebtoken'

const auth = async(request, response, next)=>{
    try {
        const token = request.cookies.accessToken || request?.headers?.authorization?.split(" ")[1]
        
        if(!token){
            return response.status(401).json({
                message : "Proporcione un token"
            })
        }

        const decode = await jwt.verify(token,process.env.SECRET_KEY_ACCESS_TOKEN)

        if(!decode){
            return response.status(401).json({
                message : "Acceso no autorizado",
                error : true,
                success : false
            })
        }

        request.userId = decode.id

        next()
        console.log('decode', decode )
    } catch (error) {
        return response.status(500).json({
            message : "No has iniciado sesión",//error.message || error,
            error : true,
            success : false
        })
    }
}
export default auth