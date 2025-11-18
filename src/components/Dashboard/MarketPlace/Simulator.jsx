'use client';
import InfoTooltip from '@/components/InfoIcon';
import { useQueryGetTokenCopPrice } from '@/hooks/query';
import { useGlobalStore } from '@/store/useGlobalStates';
import { useGlobalStates } from '@/store/useStore';
import { formatNumberIndianStyle } from '@/utils/wagmiConfig';
/* eslint-disable react/no-unescaped-entities */
import { useState } from 'react';

const handleCalculate = (PropertyValueWithTime, value, tokenPrice, tokenCalculationPrice, nft) => {
  const result = PropertyValueWithTime.map((item, index) => {
    const realAppreciationYear = Math.max(
      0,
      PropertyValueWithTime[index + 1] - Math.max(item, nft?.totalInvestmentPrice),
    );
    // result = 30
    const earningValue = realAppreciationYear * (value / tokenCalculationPrice) * tokenPrice;
    return earningValue;
  });
  console.log({result})

  result.pop()
  result.pop()

  const realAppreciationYear = Math.max(
    0,
    PropertyValueWithTime[6] -
      Math.max(PropertyValueWithTime[5], nft?.totalInvestmentPrice) -
      0.05 * PropertyValueWithTime[6],
  );
  const earningValue = realAppreciationYear * (value / tokenCalculationPrice) * tokenPrice;
  return [...result,earningValue];
};

export default function Simulator({ nft }) {
  const amount = useGlobalStore(state => state.amount);
  const setAmount = useGlobalStore(state => state.setAmount);
  const [investmentYears, setInvestmentYears] = useState(1);
  const [reinvest, setReinvest] = useState(false);
  const [rentability, setRentability] = useState(0);
  const { data: tokenPrice } = useQueryGetTokenCopPrice();
  const setSimulator = useGlobalStates((state) => state.setSimulator);
  const simulator = useGlobalStates((state) => state.simulator);

  // Update the value as the user swipes
  const handleChange = (e) => {
    setAmount(e.target.value);
  };

  let calculation = tokenPrice * amount;
  calculation = calculation.toFixed(2);
  calculation = Number(calculation);
  calculation = formatNumberIndianStyle(calculation);
  const tokenCalculationPrice = nft?.totalInvestmentPrice / nft?.tokenPrice;

  const handleSimulate = () => {
    const years = [1, 2, 3, 4, 5, 6];
    
    const propertyValueByYear = years.map((year) => nft.propertyPrice * Math.pow(1.06, year));
    
    const PropertyValueWithTime = [nft?.propertyPrice, ...propertyValueByYear];
    
    const rentalIncome = Number(amount) * nft?.tokenPrice * (nft?.expectedIncome / 100) * tokenPrice;
    const earning = handleCalculate(PropertyValueWithTime, amount, tokenPrice, tokenCalculationPrice, nft);
    const totalOfYear = earning.map((i)=>i+rentalIncome);
    
    // total earn year t (1) + ( # Tokens to purchase * Token price * COP USD Rate)
    const totalCoinEstate = totalOfYear[0] + (Number(amount) * nft?.tokenPrice * tokenPrice);
    // Total en CoinEstate (t-1) + total earn year t 
    const forNextYearCoinEstate = totalOfYear.reduce((acc, curr, idx) => {
      if (idx === 0) return [totalCoinEstate];
      return [...acc, acc[idx - 1] + curr];
    }, []);

    // Total earn year t / (# Tokens to purchase * Token price * COP USD Rate)
    const rateOfReturn = totalOfYear.map((i,idx)=> i / (Number(amount) * nft?.tokenPrice * tokenPrice));

//     Accumulated gain  t (1) = Total earn year 1
// Accumulated gain t > 1 =accumulated gain (t-1) + total earn year (t) 
 const accumulatedGain = totalOfYear.reduce((acc, curr, idx)=> {
  if (idx === 0) return [totalOfYear[0]];
  return [...acc, acc[idx - 1] + curr];
 }, []);

    const projectsOnInterest = {
      earning: earning,
      rentalIncome: rentalIncome,
      totalOfYear:totalOfYear,
      totalCoinEstate:forNextYearCoinEstate,
      rateOfReturn:rateOfReturn,
      accumulatedGain:accumulatedGain
    };


    // (1+( annual rent / 12 ) ) ^12
const growthRate = Math.pow(1+( (nft?.expectedIncome/100) / 12 ), 12)
// Tokens to purchase * token price * COP USD rate
const growthRateForYear1 = Number(amount) * nft?.tokenPrice * tokenPrice
// Initial balance t-1 * Growth rate
const initialBalance = years.reduce((acc, year, idx) => {
  if (idx === 0) return [growthRateForYear1];
  return [...acc, acc[idx - 1] * growthRate];
}, []);

    const interestIncome = initialBalance.map((i,idx)=> i * (growthRate -1))
    // Initial Balance t / (Total token supply *COP USD rate)
    const interestEarning = initialBalance.map((i,idx)=> i / (nft.totalInvestmentPrice * tokenPrice))
    // Initial Balance t / (Total token supply *COP USD rate*Token price) 
    const earningVulation1 = initialBalance.map((i,idx)=> i / ((nft.totalInvestmentPrice/nft?.tokenPrice) * tokenPrice * nft?.tokenPrice))
    // (Initial Balance t * Growth rate) / ( Token Price * Tokens total supply * USD COP rate )
    const earningVulation2 = initialBalance.map((i,idx)=> (i * growthRate) / ((nft.totalInvestmentPrice/nft?.tokenPrice) * tokenPrice * nft?.tokenPrice))
    // (Initial Proportion t + Final Proportion t ) / 2
    const averageEarning = earningVulation1.map((i,idx)=> (i + earningVulation2[idx]) / 2)
    // Real appreciation t * COP USD Rate * Average proportion t 
    
    
    // ===========================================================
    
    // MAX ( 0; Year 1 asset value - MAX ( Year 0 asset value; Total investment ) )
    
    // Real appreciation t 6 : =  (MAX ( 0; Year 6 asset value - MAX ( Year 5 asset value; Total investment ) ) - (0,05*Asset price year 6) )
    // Calculate real appreciation for each year
    const realAppreciationByYear = PropertyValueWithTime.map((currentYearValue, idx) => {
      if (idx === 0) return 0; // No appreciation for year 0
      const previousYearValue = PropertyValueWithTime[idx - 1];
      const totalInvestment = nft?.totalInvestmentPrice;
      
      if (idx === 6) {
        // Special calculation for year 6
        return Math.max(0, currentYearValue - Math.max(previousYearValue, totalInvestment) - (0.05 * currentYearValue));
      }
      
      // For years 1-5: MAX(0, Current year value - MAX(Previous year value, Total investment))
      return Math.max(0, currentYearValue - Math.max(previousYearValue, totalInvestment));
    });
     realAppreciationByYear.shift()

    // Annual Appreciation earns t = Real appreciation t * COP USD Rate * Average proportion t
    const annualAppreciationEarning = realAppreciationByYear.map((i,idx)=> {
      const calculation = i * Number(tokenPrice) * averageEarning[idx]
      return calculation
    })
    
    
    // ===========================================================
    // anual income (t) + “appreciation earns anual” (t) 
    const totalProfitYear = interestIncome.map((i,idx)=> i + annualAppreciationEarning[idx])

    // Total en CoinEstate t (1) = total earn year t (1) + ( # Tokens to purchase * Token price * COP USD Rate) 
    // Total en CoinEstate t > 1 = Total en CoinEstate (t-1) + total earn year t 

    const totalCoinEstateCompound = totalProfitYear.reduce((acc, curr, idx) => {
      if (idx === 0) {
        return [curr + (Number(amount) * nft?.tokenPrice * tokenPrice)];
      }
      return [...acc, acc[acc.length - 1] + curr];
    }, []);

    // ==============================================================
    // Total earn year t / (# Tokens to purchase * Token price * COP USD Rate)
    const rateOfReturnCompound = totalProfitYear.map((i,idx)=> i / (Number(amount) * nft?.tokenPrice * tokenPrice))

    // ==============================================================

    //     Accumulated profit (1) = Total earn year 1
    // Accumulated profit t > 1 = Accumulated profit (t-1) + total earn year (t) 
    const accumulatedProfit = totalProfitYear.reduce((acc, curr, idx)=> {
      if (idx === 0) return [totalProfitYear[0]];
      return [...acc, acc[idx - 1] + curr];
    }, []);

    console.log({earning:projectsOnInterest.earning})

    const interestCompounded = {
      rentalIncome: interestIncome,
      earning: annualAppreciationEarning,
      totalOfYear: totalProfitYear,
      totalCoinEstate: totalCoinEstateCompound,
      rateOfReturn:rateOfReturnCompound,
      accumulatedGain:accumulatedProfit,
    }

    setSimulator({ PropertyValueWithTime,projectsOnInterest,interestCompounded, investmentYears,reinvest });
  };
  return (
    <div className='w-full mt-6  '>
      <div className='border border-base-800 glass rounded-[8px] p-5 w-full '>
        <p className='text-20 sm:text-24 font-bold text-center '>Simulator</p>
        <div>
          <p className='text-14 sm:text-16 font-medium font-ubuntu text-center mt-2 '>Current Exchange Rate</p>
          <p className='text-14 sm:text-16 font-ubuntu text-center mb-5 '>
            1 USD= {formatNumberIndianStyle(tokenPrice)} COP
          </p>
          <p className=' font-medium font-ubuntu '>
            ¿Cuántos <span className='text-yellow'>tokens</span> quieres?
          </p>
        </div>
        <div className='w-full  flex items-center gap-3 justify-between '>
          <input
            type='range'
            min='2'
            max={tokenCalculationPrice}
            value={amount}
            onChange={handleChange}
            className='w-full h-1 bg-Yellow-300 rounded-lg appearance-none cursor-pointer accent-indigo-500 range-slider'
          />
          <input
            type='number'
            value={amount}
            min={2}
            max={tokenCalculationPrice}
            onChange={(e) => setAmount(e.target.value)}
            className='w-20 h-10 bg-[transparent] border border-base-800 p-1 rounded-md appearance-none cursor-pointer accent-indigo-500 range-slider'
          />
        </div>

        <p className='font-medium font-ubuntu mt-5'>Rentabilidad líquida (% anual):</p>
        <input
          type='number'
          value={nft?.expectedIncome}
          readOnly
          onChange={(e) => setRentability(e.target.value)}
          className='w-20 h-10 bg-[transparent] border border-base-800 p-1 rounded-md appearance-none cursor-pointer accent-indigo-500 range-slider'
        />

        <p className='font-medium font-ubuntu mt-5'>Tiempo ( años ):</p>
        <div className='w-full  flex items-center gap-3 justify-between '>
          <input
            type='range'
            min='1'
            max='6'
            value={investmentYears}
            onChange={(e) => setInvestmentYears(e.target.value)}
            className='w-full h-1 bg-Yellow-300 rounded-lg appearance-none cursor-pointer accent-indigo-500 range-slider'
          />
          <input
            type='number'
            value={investmentYears}
            min='1'
            max={6}
            onChange={(e) => setInvestmentYears(e.target.value)}
            className='w-20 h-10 bg-[transparent] border border-base-800 p-1 rounded-md appearance-none cursor-pointer accent-indigo-500 range-slider'
          />
        </div>

        <div className='sm:text-20 font-medium font-ubuntu text-center mt-5 '>
          <div className='flex gap-2 justify-start font-bold text-14 '>
            <input
              id='compoundCheck'
              type='checkbox'
              checked={reinvest}
              onChange={() => setReinvest(!reinvest)}
              className='w-5 h-5 border-2 border-yellow bg-transparent rounded ring-1 focus:ring-0 focus:outline-none'
            />
            <label htmlFor='compoundCheck'>¿Con interés compuesto?</label>{' '}
            <InfoTooltip
              message={
                'Al reinvertir tus ganancias mensuales, aprovechas el interés compuesto para maximizar tu rentabilidad a largo plazo, sin embargo ten en cuenta que las cifras mostradas son proyecciones, y debido a cambios en las condiciones de mercado y demás factores externos, podrían no reflejar la realidad'
              }
            />
          </div>
          <button
            onClick={() => handleSimulate()}
            className='bg-Yellow-100 text-black-100 w-full rounded-lg p-2 font-bold mt-4'>
            Simulate
          </button>

          <div className='mt-4 bg-black-100 p-3 rounded-lg w-full capitalize '>

          <div className='flex justify-between items-center gap-2 text-left '>
           
            <p className='text-14  font-medium font-ubuntu '>Ingresos anuales <span className='text-yellow text-12'>(COP)</span></p>
            <p className='text-14 sm:text-16 font-ubuntu '>
              {reinvest ? formatNumberIndianStyle(simulator?.interestCompounded?.rentalIncome?.[investmentYears -1]) || 0 : formatNumberIndianStyle(simulator?.projectsOnInterest?.rentalIncome) || 0}
            </p>
            </div>
            <hr className='border-base-800 col-span-2 space-y-2' />
            <div className='flex justify-between items-center gap-2 mt-2'>
                <div className='flex items-center gap-2 text-left  '>
            <InfoTooltip
              message={
                'Estas proyecciones no tienen en cuenta la variación del dólar, que históricamente ha tendido a la alza con respecto al COP, y como moneda refugio para protegerse de la inflación en Colombia.'
              }
            />
            <p className='text-14 font-medium font-ubuntu  '>Ganancia acumulada <span className='text-yellow text-12'>(COP)</span></p>
            </div>
            <p className='text-14 sm:text-16 font-ubuntu'>
            {reinvest ? formatNumberIndianStyle(simulator?.interestCompounded?.accumulatedGain?.[investmentYears -1]) || 0 : formatNumberIndianStyle(simulator?.projectsOnInterest?.accumulatedGain?.[investmentYears-1]) || 0}
            </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
