'use client';
import { Projection_Tab_Overview_Data } from '@/_mock/data';
import StyledImage from '@/components/StyedImage';
import clsxm from '@/utils/clsxm';
import React, { useState } from 'react';
import Simulator from './Simulator';
import Projections from './Projections';
import GoogleMapNew from '@/components/GoogleMap';

export default function ProjectionTab({ nft }) {
  const [isSelected, setIsSelected] = useState(false);

  const Projection_Tab_Overview_Data = [
    {
      id: 1,
      imgUrlActive: '/assets/svg/ProjectionTab/active/BedroomIcon.svg',
      imgUrlUnActive: '/assets/svg/ProjectionTab/unActive/BedroomIcon.svg',
      title: 'Bedroom',
      desc: nft?.bedRoom || '4',
    },
    // {
    //   id: 2,
    //   imgUrlActive: "/assets/svg/ProjectionTab/active/TypeIcon.svg",
    //   imgUrlUnActive: "/assets/svg/ProjectionTab/unActive/TypeIcon.svg",
    //   title: "Type",
    //   desc: nft.bedRoom || "Home",
    // },
    {
      id: 3,
      imgUrlActive: '/assets/svg/ProjectionTab/active/BathIcon.svg',
      imgUrlUnActive: '/assets/svg/ProjectionTab/unActive/BathIcon.svg',
      title: 'Bath',
      desc: nft?.bathRoom || '3',
    },
    // {
    //   id: 4,
    //   imgUrlActive: "/assets/svg/ProjectionTab/active/Parking.svg",
    //   imgUrlUnActive: "/assets/svg/ProjectionTab/unActive/Parking.svg",
    //   title: "Parking",
    //   desc: "Yes",
    // },
    {
      id: 5,
      imgUrlActive: '/assets/svg/ProjectionTab/active/Sqft.svg',
      imgUrlUnActive: '/assets/svg/ProjectionTab/unActive/Sqft.svg',
      title: 'Sqft',
      desc: nft?.roomSize || '2200',
    },
    {
      id: 6,
      imgUrlActive: '/assets/svg/ProjectionTab/active/BuildYear.svg',
      imgUrlUnActive: '/assets/svg/ProjectionTab/unActive/BuildYear.svg',
      title: 'Build Year',
      desc: nft?.constructionYear || '2020',
    },
  ];

  return (
    <div>
      <div className='grid xl:grid-cols-3 md:gap-8 '>
        <div className='mt-10  col-span-3 xl:col-span-2 w-full '>
          <div className='flex flex-col text-center xl:text-start md:flex-row items-center justify-center xl:justify-start w-full gap-5 md:gap-10 '>
            <StyledImage src='/assets/images/DetailsTabMainImg.png' className='w-[280px] h-[318px] ' />
            <div>
              <div>
                <p className='text-20 sm:text-24 font-semibold font-quickSand leading-none '>
                  ${nft?.netAnualIncome || 0.0} / Year
                </p>
                <div className='flex items-center justify-center md:justify-start gap-2 mt-3 '>
                  <StyledImage src='/assets/svg/LocationIcon.svg' className='w-4 h-4 ' />
                  <p className='text-12 text-grey-600'>{nft?.name}</p>
                </div>
              </div>
              <div className='border border-Yellow-100 w-10 h-[2px] my-5 mx-auto md:mx-0 ' />
              <div className='font-quickSand '>
                <p className='leading-none '>Overview</p>
                <div className='grid grid-cols-2 mt-5 gap-x-10 '>
                  {Projection_Tab_Overview_Data.map((item, idx) => {
                    return (
                      <button
                        className={clsxm(
                          'flex items-center gap-5 text-start ',
                          idx === 2 && 'my-5',
                          isSelected === item.id && 'text-Yellow-100',
                        )}
                        // onClick={() => setIsSelected(item.id)}
                        key={idx}>
                        <StyledImage
                          src={isSelected === item.id ? item.imgUrlActive : item.imgUrlUnActive}
                          className='w-10 h-10 '
                        />
                        <div>
                          <p>{item.title}</p>
                          <p
                            className={clsxm(
                              'text-14 text-grey-600 ',
                              isSelected === item.id && 'text-Yellow-100 text-14 ',
                            )}>
                            {item.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className='mt-6 w-full md:mt-10 '>
            <div className='flex items-center justify-between '>
              <div className='flex items-center '>
                <StyledImage src='/assets/svg/LocationWhite.svg' className='w-5 h-5 ' />
                <p className='text-20 font-medium font-ubuntu '>Description</p>
              </div>
              {/* <button className='text-Yellow-300 font-ubuntu '>Read More</button> */}
            </div>
            <p className='font-bold font-ubuntu border border-base-800 rounded-[8px] px-4 py-4 mt-4 '>
              {nft?.description}
            </p>
            <div className='my-4'>
              <GoogleMapNew
              // coordinates={nft?.location}
              />
            </div>
          </div>
        </div>
        <div className='col-span-3 w-full xl:col-span-1 '>
          <Simulator />
        </div>
      </div>
      <div className='w-full mt-6 md:mt-1 '>
        <p className='text-20 font-medium font-ubuntu text-center md:text-start '>why is it attractive?</p>
        <div className='w-full border border-base-800 rounded-[8px] mt-4 p-4 '>
          <p className='font-bold font-ubuntu w-full '>{nft?.attractive}</p>
        </div>
      </div>
      <Projections />
    </div>
  );
}
