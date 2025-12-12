const forgotPasswordTemplate = ({name,otp})=>{
    return `
<div>
    <p> Querid@, ${name}</p>
    <p>Has solicitado restablecer tu contraseña. 
    Utiliza el siguiente código OTP para hacerlo. </p>    
     <div style="background:yellow; font-size:20px;padding:20px;text-align:center;font-weight : 800;">
        ${otp}
    </div>
    <p>Este código OTP es válido solo por 1 hora. Ingresa este código OTP en el 
    sitio web de TiendaMascotasCyL para proceder a restablecer tu contraseña.</p>
    <br/>
    </br>
    <p> Gracias </p>
    <p> Tienda de Mascotas Coco y Luna </p>
</div>`
}

export default forgotPasswordTemplate

