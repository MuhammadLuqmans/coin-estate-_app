import HeaderSection from '@/components/Dashboard/MarketPlace/HeaderSection';
import Tabs from '@/components/Dashboard/MarketPlace/Tabs';
import { useQueryGetActiveResults, useQueryGetMarketPlaceList } from '@/hooks/query';
import Layout from '@/layout/Dashboard';
import { useParams } from 'next/navigation';
import { useState } from 'react';

export default function MarketPlace() {
  const params = useParams();
  const { data: getPropertyList } = useQueryGetMarketPlaceList();
  const { data: userData } = useQueryGetActiveResults();
  const selectedNFT = getPropertyList?.filter((item) => item?.id === params?.market_place)?.[0];

  
  return (
    <div>
      <Layout>
        <div className='px-6 lg:px-10 '>
          <div className='w-full max-w-[1161px] mx-auto my-10 '>
            <div className='font-bold text-32 text-yellow'>{selectedNFT?.name}</div>
            <hr className=' text-yellow' />
            <hr className='mb-5 mt-1 text-yellow' />
            <HeaderSection userData={userData?.values} selectedNFT={selectedNFT} />
            <Tabs userData={userData?.values} selectedNFT={selectedNFT} />
          </div>
        </div>
      </Layout>
    </div>
  );
}
