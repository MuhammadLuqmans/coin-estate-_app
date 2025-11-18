/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
'use client';
import InfoTooltip from '@/components/InfoIcon';
import ProgressBar from '@/components/ProgressBar';
import StyledImage from '@/components/StyedImage';
import { useMutationInitiatePayment } from '@/hooks/mutation';
import { useQueryGetTokenCopPrice } from '@/hooks/query';
import { SourceUrl } from '@/hooks/queryContants';
import { useGlobalStore } from '@/store/useGlobalStates';
import clsxm from '@/utils/clsxm';
import { formatNumberIndianStyle } from '@/utils/wagmiConfig';
import { useParams, usePathname } from 'next/navigation';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { toast } from 'react-toastify';
import InvestmentUpgradeModal from '../InvestmentUpgradeModal';

export default function HeaderSection({ selectedNFT, userData }) {
  const router = useRouter();
  const params = useParams();
  const [showModal, setShowModal] = useState(false);
  const { data: tokenPrice } = useQueryGetTokenCopPrice();
  const amount = useGlobalStore(state => state.amount);
  const setAmount = useGlobalStore(state => state.setAmount);

  const remaining = userData?.filter((item) => item.propertyId === params?.market_place)?.[0];
  const onSuccess = () => {
    router.push(
      `/dashboard/market-place/processing/pay-by-card?tab=checkout&id=${selectedNFT?.id}&amount=${amount}&tokenAddress=${selectedNFT?.mint?.tokenAddress}`,
    );
  };
  const { mutate: createIntend, isPending: isLoading } = useMutationInitiatePayment(onSuccess);

  const [isSelected, setIsSelected] = useState(false);
  const location = usePathname();
  const paths = {
    '/admin/market-place': 'MarketPlace',
  };

  const MarketPlace_Total_Investments_Data = [
    {
      id: 1,
      title: 'Precio de listado',
      ratio: `${selectedNFT?.totalInvestmentPrice || 0}` + ' $',
      imgUrl: '/assets/svg/Exclamation.svg',
      message: 'Este valor puede ser distinto al precio total del inmueble si se usa apalancamiento en la operación para financiar una parte del inmueble con deuda, y potenciar las posibles ganancias del proyecto',
    },
    {
      id: 2,
      title: 'Renta neta por alquiler anual',
      ratio: selectedNFT?.expectedIncome + '%' || ' 9.93%',
      imgUrl: '/assets/svg/Exclamation.svg',
      message: 'Estimación rentabilidad anual proveniente de los ingresos de alquiler',
    },
    {
      id: 3,
      title: 'Valorización promedio dólar',
      ratio: selectedNFT?.averageDollar + '%' || '2%',
      imgUrl: '/assets/svg/Exclamation.svg',
      message: 'Variación esperada de la divisa en la que están tus activos (según el promedio de los últimos 10 años). No se suma al % estimado de rentabilidad, pero aumenta tu capital en COP.',
    },
    {
      id: 4,
      title: 'Ganancia estimada valorización',
      ratio: selectedNFT?.expectedAnnual + '%' || '7%',
      imgUrl: '/assets/svg/Exclamation.svg',
      message: 'Este valor es un estimado que se basa en estudios de mercado locales, la ganancia de valorización dependerá del precio final del inmueble tras finalizado el periodo del proyecto y puede estar sujeta a variaciones en los factores macro y mirco económicos ',
    },
    {
      id: 5,
      title: 'Periodo de proyecto',
      ratio: '$' + selectedNFT?.totalReturn || '$ 10.179',
      color: '#FFCC00',
      imgUrl: '/assets/svg/Exclamation.svg',
      message: 'porcentaje de ganancia total al final del proyecto, incluyendo costos de listado. Por ejemplo, si dice 35 % es la ganancia total, no anual. Para ver la duración, revisa sección “Detalles y proyecciones”.',
    },
  ];
  // - remaining?.remaining
  const totalTokens = selectedNFT?.totalInvestmentPrice / selectedNFT?.tokenPrice;
  let remainingTokens = remaining?.remaining / selectedNFT?.tokenPrice;
  remainingTokens = totalTokens - remainingTokens;

  remainingTokens = Number(remainingTokens?.toFixed(4));
  let currentValue = 500000 / tokenPrice;
  currentValue = currentValue / selectedNFT?.tokenPrice;

  const handleUpgrade = () => {
    // Auto-set investment to 500,000 COP
    console.log('User opted for Platino — adjust investment value');
    setShowModal(false);
    setAmount(Number(currentValue).toFixed(2));
    // Example: setInvestmentAmount(500000);
  };

  const handleInvest = () => {
    if (Number(amount) < 2.5) {
      toast.error('your amount must be greater then 2.5');
      setAmount(2.5);
      return;
    }
    if (Number(amount) < currentValue) {
      setShowModal(true);
    } else {
      if (amount <= remainingTokens) {
        createIntend({ id: selectedNFT?.id, amount });
      } else {
        toast.error('your amount must be lower then remaining tokens ');
      }
    }
  };

  const handleContinue = () => {
    console.log('User continues with current investment');
    setShowModal(false);
    if (Number(amount) < 2.5) {
      toast.error('your amount must be greater then 2.5');
      setAmount(2.5);
      return;
    }
    if (amount <= remainingTokens) {
      createIntend({ id: selectedNFT?.id, amount });
    } else {
      toast.error('your amount must be lower then remaining tokens ');
    }
    // Continue to checkout, KYC, etc.
  };

  return (
    <div className='font-ubuntu '>
      {showModal && <InvestmentUpgradeModal onUpgrade={handleUpgrade} onContinue={handleContinue} />}
      <p className='text-28 text-center font-ubuntu font-bold lg:hidden leading-none text-white w-full '>
        {paths[location]}
      </p>
      <div className='mt-3 lg:mt-5 '>
        <div className='grid grid-rows-2 grid-cols-4 gap-2 rounded-[10px] glass overflow-hidden '>
          <img
            src={SourceUrl + selectedNFT?.image}
            className='w-full h-full row-span-2 col-span-2 object-contain shadow-lg shadow-black-300'
          />
          {selectedNFT?.subImages.map((img, idx) => {
            return (
              <img
                key={idx + img}
                src={SourceUrl + img}
                className='w-full h-full shadow-lg object-cover shadow-black-300'
              />
            );
          })}
        </div>
      </div>
      <div className='grid xl:grid-cols-3 gap-8 mt-10 md:mt-20 '>
        <div className='col-span-2 w-full '>
          <div className='grid sm:grid-cols-3 w-full gap-5 '>
            <div className='flex items-center justify-center gap-5 col-span-3 border glass border-base-800 rounded-[8px] w-full p-5 sm:col-span-2 '>
              <div className='flex items-center pr-5 gap-2 border-r border-r-base-800 '>
                <StyledImage src='/assets/svg/GoldenTokens.svg' className='w-14 h-14 ' />
                <div className='text-center '>
                  <p className='text-20 text-Yellow-100  '>
                    {formatNumberIndianStyle(remainingTokens)}
                    {/* {formatNumberIndianStyle(selectedNFT?.totalInvestmentPrice / selectedNFT?.tokenPrice)} */}
                  </p>

                  {/* <p className='text-20 text-Yellow-100  '>{selectedNFT?.tokenPrice - remaining?.remaining}</p> */}
                  <p className='sm:text-20 font-bold text-white sm:mt-2 leading-none '>Tokens Disponibles</p>
                </div>
              </div>
              <div className='text-center '>
                <p className='text-20 text-Yellow-100 '>${formatNumberIndianStyle(selectedNFT?.tokenPrice)} USD</p>
                <p className='sm:text-20 font-bold leading-none '>Precio del Token</p>
              </div>
            </div>
            <div className='border border-base-800 rounded-[8px] glass p-3 sm:p-5 w-full flex flex-col items-center col-span-3 sm:col-span-1 '>
              <p className='sm:text-20 font-bold '>Managed by</p>
              <StyledImage src='/assets/images/NewPython.png' className='w-16 h-16 mt-1 ' />
            </div>
          </div>
          <div className='mt-7 md:mt-14 '>
            <p className='text-20 font-bold mt-8 '>Progreso de Venta:</p>
            <ProgressBar
              totalValue={selectedNFT?.totalInvestmentPrice / selectedNFT?.tokenPrice}
              value={remaining?.remaining / selectedNFT?.tokenPrice}
            />
            <div className='flex items-center justify-between mt-4 '>
              <p className='sm:text-20 font-bold '>{remaining?.remaining / selectedNFT?.tokenPrice || 0}</p>
              <div className='sm:text-20 font-bold text-center leading-none '>
                <p className=' '>
                  {formatNumberIndianStyle(selectedNFT?.totalInvestmentPrice / selectedNFT?.tokenPrice)}

                  {/* <span className='text-lightGray-600 text-14 font-semibold'>/ {selectedNFT?.tokenPrice}</span> */}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className=' w-full col-span-2 xl:col-span-1'>
          <div className='border glass border-base-800 rounded-[8px] p-6 '>
            <div className='flex items-center justify-center sm:justify-start gap-2'>
              {' '}
              <p className='text-20 font-bold '>Resumen Financiero</p>
              <InfoTooltip message='Este resumen financiero agrupa los indicadores clave de tu inversión: la rentabilidad anual esperada, el valor total, la renta neta por alquiler, la valorización del dolar y la apreciación proyectada. Con estos datos, podrás entender mejor el potencial de crecimiento y rendimiento de este proyecto en tu portafolio de inversión.' />
            </div>
            <div className='flex items-center justify-between sm:gap-4 mt-4'>
              <div className='flex items-center gap-2'>
                <InfoTooltip message='Estimación rentabilidad anual proveniente de los ingresos de alquiler' />
                <p className='text-14 font-bold text-Yellow-100 flex justify-center items-center'>
                  Renta neta anual por alquiler
                </p>
              </div>
              <p className='sm:text-20 font-bold text-Yellow-100 '>{selectedNFT?.roiExpected}%</p>
            </div>
            <div className='flex items-center justify-between sm:gap-4 mt-4'>
              <div className='flex items-center gap-2'>
                <InfoTooltip message='porcentaje de ganancia total al final del proyecto, incluyendo costos de listado. Por ejemplo, si dice 35 % es la ganancia total, no anual. Para ver la duración, revisa sección “Detalles y proyecciones”.' />
                <p className='text-14 font-bold text-Yellow-100 '>Valorización total proyecto</p>
              </div>

              <p className='sm:text-20 font-bold text-Yellow-100 '>{selectedNFT?.roiExpected}%</p>
            </div>

            <div className='mt-8 w-full'>
              {MarketPlace_Total_Investments_Data.map((item, idx) => {
                return (
                  <div
                    key={idx}
                    className={clsxm(
                      'flex items-center justify-between gap-5 text-14 mt-3 pb-1 ',
                      idx === 4 ? '' : 'border-b border-b-Yellow-100 ',
                    )}>
                      
                    <div className='flex items-center gap-2'>
                      {item.imgUrl && <InfoTooltip message={item.message} />}
                    <p className='te '>{item.title}</p>
                  </div>
                      <p style={{ color: `${item.color}` }}>{item.ratio}</p>{' '}
                    </div>
                );
              })}
            </div>

            {/* <div className='flex items-center justify-between gap-2 border-t border-t-Yellow-100 pt-4 mt-4'>
              <p className='text-16 font-bold text-grey-300 '>{amount || 0} =</p>
              <p className='sm:text-18 font-bold text-Yellow-100 '>{amount * selectedNFT?.tokenPrice} <span className='text-14 text-grey-300 '>USD</span></p>
            </div> */}
          </div>
          <div className='mt-4 glass border border-base-800 rounded-[8px] p-4'>
          <p className='text-14 font-bold text-Yellow-100'> ¿Cuántos tokens deseas comprar?</p>
          <div className='flex gap-2 items-center mt-4'>
            <input
              min={'2.5'}
              step={'0.01'}
              type='number'
              max={remainingTokens}
              value={amount}
              className='w-full p-2 glass rounded-sm outline-none border'
              onChange={(e) => setAmount(e.target.value)}
            />
            <p className='sm:text-18 font-bold text-Yellow-100 max-w-[100px] w-full overflow-auto glass h-full py-2 rounded-sm'>
              {' '}
              = ${formatNumberIndianStyle(amount * selectedNFT?.tokenPrice)}{' '}
            </p>

            <button
              onClick={() => setAmount(remainingTokens)}
              className='bg-Yellow-100 p-3 rounded-[8px] text-14 font-medium text-black-100 '>
              Max
            </button>
          </div>
          <button
            onClick={handleInvest}
            className='bg-Yellow-100 p-3 rounded-[8px] text-20 sm:text-28 w-full mt-4 font-medium text-black-100 '>
            {isLoading ? 'Laoding...' : 'Investing'}
          </button>
              </div>
        </div>
      </div>
    </div>
  );
}
