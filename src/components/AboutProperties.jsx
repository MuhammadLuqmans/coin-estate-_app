import { useQueryGetRemainingTokens, useQueryGetUser } from '@/hooks/query';
import { SourceUrl } from '@/hooks/queryContants';
import clsxm from '@/utils/clsxm';
import { formatNumberIndianStyle } from '@/utils/wagmiConfig';
import { useRouter } from 'next/navigation';
import ProgressBar from './ProgressBar';
import InfoTooltip from './InfoIcon';

export default function AboutProperties({ getPropertyList, isDark }) {
  const router = useRouter();
  const { data: remainingTokensList } = useQueryGetRemainingTokens();
  const { data: getUser } = useQueryGetUser();

  return (
    <div className='mt-16 max-w-[1161px] mx-auto w-full'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {getPropertyList?.map((items, idx) => {
          const mainImage = SourceUrl + items?.image;
          const remaining = remainingTokensList?.filter((item) => item?.propertyId === items?.id)?.[0];
          let remainingTokens = items?.totalInvestmentPrice - remaining?.remaining;
          remainingTokens = remainingTokens / items?.tokenPrice;
          return (
            <div
              key={`${items?.id}___${idx}`}
              onClick={() =>
                getUser?.address ? router.push(`/dashboard/market-place/${items?.id}`) : router.push(`/auth/log-in`)
              }
              className={clsxm(
                'max-w-[371px]  p-3 mx-auto cursor-pointer lg:mx-0  rounded-[8px] ',
                isDark ? 'glass' : 'border border-grayTwo',
              )}>
              <div className='relative'>
                <div className='h-[247px] w-full'>
                  <img src={mainImage} alt='' className='h-full object-cover rounded-[8px] w-full' />
                </div>
                <div className='flex justify-between'>
                  <button className='absolute top-4 right-4 py-1.5 px-4 bg-black-100 rounded-full text-12 font-inter font-semibold text-white '>
                    {items?.propertyType}
                  </button>
                </div>
              </div>
              <div className='mt-4'>
                <div className='flex justify-between items-center'>
                  <h5 className='text-16 text-yellow font-inter font-semibold '>{items?.name}</h5>
                </div>
                <div className='mt-2 rounded-full'>
                  <ProgressBar
                    totalValue={items?.totalInvestmentPrice / items?.tokenPrice || 0}
                    value={remaining?.remaining / items?.tokenPrice || 0}
                  />
                </div>
                <div className='flex justify-between mt-3'>
                    <div className='flex items-center gap-2 flex-1'>
                      <p className='text-14 font-inter  font-regular text-grey-100'>Precio Del Token</p>
                      <InfoTooltip message='Este es el costo de cada token, el cual representa una fracción del inmueble. Su valor puede variar según la valorización de la propiedad y las condiciones del mercado.' />
                    </div>
                    <p className='text-14 font-inter  mt-1 font-semibold '>{items?.tokenPrice || 0}</p>
                </div>
                <div className='mt-3 flex gap-6 items-center'>
                    <div className='flex items-center gap-2 flex-1'>
                      <p className='text-14 font-inter  font-regular text-grey-100 capitalize'>Total tokens</p>
                      <InfoTooltip message='Este valor refleja el costo total del proyecto, que incluye la adquisición de la propiedad y los gastos asociados a su tokenización, operación y administración.' />
                    </div>
                    <p className='text-14 font-inter  mt-1 font-semibold text-end '>{formatNumberIndianStyle(items?.totalInvestmentPrice || 0)}</p>
                </div>

                  <div className='mt-4 flex gap-6 items-center'>
                      <div className='flex items-center gap-2 flex-1'>
                        <p className='text-14 font-inter  font-regular text-grey-100'>Ingresos Esperados</p>
                        <InfoTooltip message='Este valor representa el ingreso anual proyectado basado en la rentabilidad neta por alquiler. Se trata de una estimación sujeta a variaciones, ya que depende de factores como la ocupación, la demanda del mercado y otros imprevistos. No se incluyen posibles apreciaciones del inmueble.' />
                    </div>
                      <p className='text-14 font-inter  mt-1 font-semibold '>{items?.expectedIncome || 0}%</p>
                  </div>

                  <div className='mt-3 flex gap-6 items-center'>
                      <div className='flex items-center gap-2 flex-1'>
                        <p className='text-14 font-inter  font-regular text-grey-100'>Valorización estimada</p>
                        <InfoTooltip message='Ganancia estimada total por valorización durante el periodo completo del proyecto (Años que dure el proyecto) . Esta cifra es una estimación basada en estudios de mercado, análisis de tendencias históricas y supuestos de crecimiento económico, y está sujeta a variaciones según las condiciones macro y microeconómicas.' />
                      </div>
                      <p className='text-14 font-inter  mt-1 font-semibold text-end '>{items?.roiExpected || 0}% </p>
                  </div>
                <p className='mt-4 font-inter text-14 text-end font-semibold '>
                  Tokens Disponibles:{' '}
                  <span className='text-yellow  font-regular'>
                    {formatNumberIndianStyle(Number(remainingTokens?.toFixed(2)) || 0)}
                  </span>{' '}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
