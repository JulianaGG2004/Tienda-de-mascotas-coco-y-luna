import sendEmail from '../config/sendEmail.js'
import UserModel from '../models/user.model.js'
import bcryptjs from 'bcryptjs'
import verifyEmailTemplate from '../utils/verifyEmailTemplate.js'
import generatedAccessToken from '../utils/generatedAccessToken.js'
import generatedRefreshToken from '../utils/generatedRefreshToken.js'
import uploadImageCloudinary from '../utils/uploadImageCloudinary.js'
import generatedOtp from '../utils/generatedOtp.js'
import forgotPasswordTemplate from '../utils/forgotPasswordTemplate.js'
import jwt from 'jsonwebtoken'

export async function registerUserController(request, response) {
    try {
        const { name, email, password} = request.body
        
        if(!name || !email || !password){
            return response.status(400).json({
                message : "Ingrese el correo, nombre de usuario y contraseña",
                error : true,
                success : false
            })
        }

        const user = await UserModel.findOne({ email })

        if (user){
            return response.json({
                message : "Error, el correo ya existe",
                error : true,
                success : false
            })
        }

        const salt = await bcryptjs.genSalt(10)
        const hashPassword = await bcryptjs.hash(password,salt)

        const payload = {
            name,
            email,
            password : hashPassword
        }

        const newUser = new UserModel(payload)
        const save = await newUser.save()

        const VerifyEmailUrl = `${process.env.FRONTEND_URL}/verify-email?code=${save?._id}`

        const verifyEmail = await sendEmail({
            sendTo: email,
            subject: "Verificar el correo desde TiendaMascotasCyL",
            html : verifyEmailTemplate({
                name,
                utl : VerifyEmailUrl
            })
        })

        return response.json({
            message : "Usuario registrado con exito",
            error : false,
            success : true,
            data : save
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error: true,
            success : false
        })
    }
}

export async function verifyEmailController(request,response) {
    try {
        const { code } = request.body
        
        const user = await UserModel.findOne({_id : code})

        if(!user){
            return response.status(400).json({
                message : "Codigo invalido",
                error : true,
                success : false
            })
        }

        const updateUser = await UserModel.updateOne({_id : code},{
            verify_email : true
        })

        return response.json({
            message : "Se ha verificado el correo",
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
    
}
//Controlador del login

export async function loginController(request, response){
    try {
        const {  email, password } = request.body

        if (!email || !password){
            return response.status(400).json({
                message : "Ingrese el email o contraseña",
                error : true,
                success : false
            })
        }
        const user = await UserModel.findOne({ email })

        if(!user){
            return response.status(400).json({
                message: "Usuario no esta registrado",
                error: true,
                success : false
            })
        }

        if(user.status !== "Active"){
            return response.status(400).json({
                message : "Contacte al administrador",
                error : true,
                success : false
            })
        }

        const checkPassword = await bcryptjs.compare(password, user.password)

        if(!checkPassword){
            return response.status(400).json({
                message : "Verifica tu contraseña",
                error : true,
                success : false
            })
        }

        const accesstoken = await generatedAccessToken(user._id)
        const refreshToken = await generatedRefreshToken(user._id)

        const updateUser = await UserModel.findByIdAndUpdate(user?._id,{
            last_login_date : new Date()
        })

        const cookiesOption = {
            httpOnly : true,
            secure : true,
            samSite : "None"
        }

        response.cookie('accessToken', accesstoken, cookiesOption)
        response.cookie('refreshToken', refreshToken, cookiesOption)

        return response.json({
            message : "Inicio de sesión Exitoso",
            error : false,
            success : true,
            data : {
                accesstoken,
                refreshToken
            }
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//Controlador de logout
export async function logoutController(request,response) {
    try {

        const userid = request.userid //middleware
        const cookiesOption = {
            httpOnly : true,
            secure : true,
            samSite : "None"
        }

        response.clearCookie("accessToken", cookiesOption)
        response.clearCookie("refreshToken", cookiesOption)

        const removeRefreshToken = await UserModel.findByIdAndUpdate(userid,{
            refresh_token : ""
        })

        return response.json({
            message : "Cierre de sesión exitoso",
            error : false,
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
    
}
//Cargar avatar del usuario

export async function uploadAvatar(request,response) {
    try {
        const userId = request.userId
        const image = request.file

        const upload = await uploadImageCloudinary(image)


        const updateUser = await UserModel.findByIdAndUpdate(userId,{
            avatar : upload.url
        })

        return response.json({
            message : "Subir Perfil",
            success : true,
            error : false,
            data : {
                _id : userId,
                avatar : upload.url
            }
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
    
}

// Actualizar detalle de usuario

export async function updateUserDetails(request,response) {
    try {
        const userId = request.userId //auth middleware
        const {name,email,mobile,password} = request.body

        let hashPassword = ""

        if(password){
            const salt = await bcryptjs.genSalt(10)
            hashPassword = await bcryptjs.hash(password,salt)
        }

        const updateUser = await UserModel.updateOne({ _id : userId},{
            ...(name && {name : name}),
            ...(email && {email : email}),
            ...(mobile && {mobile : mobile}),
            ...(password && {password : hashPassword})

        })


        return response.json({
            message: "Se actualizo usuario correctamente",
            error : false,
            success : true,
            data : updateUser
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
    
}

//Recuperar contraseña olvidada
export async function forgotPasswordController(request,response) {
    try {

        const { email } = request.body 

        const user = await UserModel.findOne({ email })

        if(!user){
            return response.status(400).json({
                message : "Correo electronico no esta disponible",
                error : true,
                success : false
            })
        }
        
        const otp = generatedOtp()
        const expireTime = new Date() + 60 * 60 * 1000 //1hr

        const update = await UserModel.findByIdAndUpdate(user._id,{
            forgot_password_otp : otp,
            forgot_password_expiry : new Date(expireTime).toISOString()
        })

        await sendEmail({
            sendTo : email,
            subject : "Olvide mi contraseña de la TiendaMascotasCyL",
            html: forgotPasswordTemplate({
                name: user.name,
                otp : otp
            })
        })

        return response.json({
            message : "Verifica tu email",
            error : false,
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
    
}

// verificar contraseña olvidada OTP
export async function verifyForgotPasswordOtp(request, response) {
    try {
        const { email , otp } = request.body

        if(!email || !otp){
            return response.status(400).json({
                message : "Proporcione el correo electrónico en el campo obligatorio.",
                error : true,
                success : false
            })
        }

        const user = await UserModel.findOne({ email })

        if(!user){
            return response.status(400).json({
                message : "Correo electronico no esta disponible",
                error : true,
                success : false
            })
        }

        const currentTime = new Date().toISOString()

        if(user.forgot_password_expiry < currentTime){
            return response.status(400).json({
                message: "OTP esta expirado",
                error : true,
                success : false
            })
        }

        if(otp !== user.forgot_password_otp){
            return response.status(400).json({
                message : "OTP Invalido",
                error : true,
                success : false
            })
        }

        //if otp is not expired
        //otp === user.forgot_password_otp

        const updateUser = await UserModel.findByIdAndUpdate(user?._id,{
            forgot_password_otp : "",
            forgot_password_expiry : ""
        })

        return response.json({
            message : "Verificacion de OTP Exitosa",
            error : false,
            success : true
        })

        
    } catch (error) {
          return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
    
}

export async function resetpassword(request, response) {
    try {
        const { email, newPassword, confirmPassword } = request.body
        if(!email || !newPassword || !confirmPassword){
            return response.status(400).json({
                message : "Ingrese los campos requeridos correo, contraseña y confiracion de contraseña",

            })
        }

        const user = await UserModel.findOne({ email })

        if(!user){
            return response.status(400).json({
                message : "El correo no esta disponible.",
                error : true,
                success : false
            })
        }

        if(newPassword !== confirmPassword){
            return response.status(400).json({
                message : "La nueva contraseña y la confirmacion de contraseña deben coincidir.",
                error : true,
                success : false
            })
        }

        const salt = await bcryptjs.genSalt(10)
        const hashPassword = await bcryptjs.hash(newPassword,salt)

        const update = await UserModel.findOneAndUpdate(user._id,{
            password : hashPassword
        })

        return response.json({
            message : "Contraseña actualizada exitosamente",
            error : false,
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
    
}

export async function refreshToken(request, response) {
    try {
        const refreshToken = request.cookies.refreshToken || request?.headers?.
        authorization?.split(" ")[1]

        if(!refreshToken){
            return response.status(401).json({
                message : "Token invalido",
                error : true,
                success : false
            })
        }

        const verifyToken = await jwt.verify(refreshToken, process.env.
            SECRET_KEY_REFRESH_TOKEN)

        if(!verifyToken){
            return response.status(401).json({
                message :"El token esta expirado",
                error : true,
                success : false
            })
        }

        const userId = verifyToken._id

        const newAccessToken = await generatedAccessToken(userId)

        const cookiesOption = {
            httpOnly : true,
            secure : true,
            sameSite : "None"
        }

        response.cookie('accessToken', newAccessToken,cookiesOption)

        return response.json({
            message : "Nuevo token de acceso generado.",
            error : false,
            success : true,
            data : {
                accessToken : newAccessToken
            }
        })


    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
    
}

export async function userDetails(request, response) {
    try {
        const userId = request.userId
        const user = await UserModel.findById(userId).select('-password -refresh_token')

        return response.json({
            message : 'user details',
            data : user,
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : "Hubo un error trayendo la información",
            error : true,
            success : false
        })
    }
    
}