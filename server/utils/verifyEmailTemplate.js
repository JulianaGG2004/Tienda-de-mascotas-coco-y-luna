const verifyEmailTemplate = ({name,url})=>{
    return`
<p> Querid@ ${name}</p>
<p>Gracias por registrarte en TiendasMascotasCyL.</p>
<a href=${url} style="color:black;background :orange;margin-top : 10px,padding:20px,display:block">
Verificar Email
<a/>
    `
}

export default verifyEmailTemplate