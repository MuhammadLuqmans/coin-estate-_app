import HeaderSection from '@/components/Dashboard/MarketPlace/HeaderSection';
import Tabs from '@/components/Dashboard/MarketPlace/Tabs';
import { useQueryGetMarketPlaceList, useQueryGetMintedTokenlist } from '@/hooks/query';
import Layout from '@/layout/Dashboard';
import { useParams } from 'next/navigation';

export default function MarketPlace() {
  const params = useParams();
  const { data: mintedNftsList } = useQueryGetMintedTokenlist();
  const { data: getPropertyList } = useQueryGetMarketPlaceList();

  const selectedNFT = getPropertyList?.filter((item) => item.id === params?.market_place)?.[0];

  return (
    <div>
      <Layout>
        <div className='px-6 lg:px-10 '>
          <div className='w-full max-w-[1161px] mx-auto my-10 '>
            <HeaderSection selectedNFT={selectedNFT} />
            <Tabs selectedNFT={selectedNFT} />
          </div>
        </div>
      </Layout>
    </div>
  );
}
