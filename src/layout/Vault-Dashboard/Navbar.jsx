import UserProfile from '@/components/ProfileUser';
import StyledImage from '@/components/StyedImage';
import { useQueryGetActiveResults } from '@/hooks/query';
import { formatNumberIndianStyle } from '@/utils/wagmiConfig';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar({ toggleSidebar }) {
  const { data: userData } = useQueryGetActiveResults();
  const location = usePathname();
  const paths = {
    '/dashboard/dashboard-wallet': 'Wallet',
    '/dashboard/my-properties': 'My Properties',
    '/dashboard/market-place': 'Marketplace',
    adminWallet: 'Wallet',
  };
  const router = useRouter();
  return (
    <div className='glass lg:px-11 px-4 py-4 md:py-2 fixed top-0 left-0 right-0 z-50 flex items-center justify-between gap-28 shadow-lg'>
      <button onClick={() => router.push('/')}>
        <StyledImage src={'/assets/svg/LogoLight.svg'} className='w-[157px] h-9 ' />
      </button>
      <div className='w-full max-w-[83%] ml-auto hidden lg:flex items-center justify-between gap-10 '>
        {/* <p className='text-20 uppercase font-ubuntu font-medium leading-none text-white h-[50px] w-full pt-4 '>
          {paths[location]}
        </p> */}
        <div className='hidden lg:flex items-center gap-4 sm:gap-7 w-full justify-end  '>
          <div className='bg-black-600 py-3 px-4 rounded-[6px] w-full max-w-[183px] flex items-center justify-between '>
            <div className='flex items-center gap-3 w-full '>
              <div className='bg-black-700 w-full max-w-9 h-9 flex items-center justify-center rounded-[8px] p-1 '>
                <StyledImage src='/assets/svg/Token.svg' className='w-9 h-9 ' />
              </div>
              <p>${formatNumberIndianStyle(userData?.totalInvest)}</p>
            </div>
            <StyledImage src='/assets/svg/Exclamation.svg' className='w-8 h-8 ' />
          </div>
          <div className='bg-black-600 py-3 px-4 rounded-[6px] w-full max-w-[183px] flex items-center justify-between '>
            <div className='flex items-center gap-3 w-full '>
              <div className='bg-black-700 w-full max-w-9 h-9 flex items-center justify-center rounded-[8px] p-1 '>
                <StyledImage src='/assets/svg/Dollar.svg' className='w-9 h-9 ' />
              </div>
              <p>{formatNumberIndianStyle(userData?.totalEarningFromAllProperties?.toFixed(2))}</p>
            </div>
            <StyledImage src='/assets/svg/Exclamation.svg' className='w-8 h-8 ' />
          </div>
          {/* <div className='bg-black-600 px-5 py-[14px] w-full max-w-[76px] flex items-center justify-center rounded-[8px] '>
            <StyledImage src='/assets/svg/Notification.svg' className='w-[38px] h-[38px] ' />
          </div> */}
        </div>
        <UserProfile balance={formatNumberIndianStyle(userData?.totalEarningFromAllProperties)} />
      </div>
      <button onClick={toggleSidebar} className='xl:hidden block bg-black-600 p-1 rounded-[8px] '>
        <StyledImage src='/assets/svg/Menu.svg' className='w-6 h-6 ' />
      </button>
    </div>
  );
}
