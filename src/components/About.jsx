/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

export default function About() {
  const router = useRouter();
  return (
    <div className='px-6 mt-10 border-t border-gray-light pt-6'>
      <div className='max-w-[1161px] mx-auto w-full'>
        <div className=' pb-8'>
          <div className='grid grid-cols-2 md:grid-cols-3 '>
            <div>
              <h5 className='font-inter font-semibold text-16 text-black-100'>Links</h5>
              <div className='text-14 font-inter font-regular text-black-100   leading-6 mt-4'>
                <Link href={'/'}> Inicio</Link>
                <br />
                <Link href={'/working'}>¿Cómo Funciona?</Link>
                <br />
                <Link href={'/services'}>Servicios</Link> <br />
                <Link href={'/marketplace'}>Marketplace</Link> <br />
                <Link href={'/learn'}>Aprender</Link> <br />
              </div>
            </div>

            <div className='max-w-[176px] mx-auto'>
              <h5 className='font-inter font-semibold text-16 text-black-100'>Otros Links</h5>
              <div className='text-14 font-inter font-regular text-black-100   leading-6 mt-4'>
                <p>
                  {' '}
                  Política de <br /> Privacidad
                </p>
                <p>
                  Términos y <br /> Condiciones
                </p>
              </div>
            </div>

            <div className='mt-6 md:mt-0 max-w-[176px] ml-0 md:ml-auto'>
              <h5 className='font-inter font-semibold text-16 text-black-100'>Contáctanos</h5>
              <div className='   leading-6 mt-4'>
                <div className='flex  gap-2'>
                  <img src='/assets/svg/phone.svg' alt='' />
                  <p className='text-14 font-inter font-regular text-black-100'>
                    <a href='https://wa.me/573118867074' target='_blank'>
                      {' '}
                      +57 3118867074
                    </a>
                  </p>
                </div>
                <div className='flex  gap-2'>
                  <img src='/assets/svg/email.svg' alt='' />
                  <p className='text-14 font-inter font-regular text-black-100'>ayuda@coinestate.com.co</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
