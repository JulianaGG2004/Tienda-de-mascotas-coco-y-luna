import React from 'react'
import { FaFacebook } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";


const Footer = () => {
  return (
    <footer className='border-t'>
        <div className=' mx-auto p-8 text-center flex flex-col lg:flex-row lg:justify-between gap-2'>
            <p>© Derechos reservados por Tienda de mascotas Coco y Luna</p>
            <div className='flex items-center gap-4 justify-center text-2xl'>
                <a href='' className="hover:text-primary-500">
                    <FaFacebook/>
                </a>
                <a href='' className="hover:text-primary-500">
                    <FaInstagram/>
                </a>
                <a href='' className="hover:text-primary-500">
                    <FaLinkedin/>
                </a>
            </div>
        </div>
    </footer>
  )
}

export default Footer
