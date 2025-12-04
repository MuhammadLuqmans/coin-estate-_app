// import StyledImage from "@/components/StyedImage";
// import React from "react";

// export default function Projections() {
//   const tableData = [
//     { year: 2024, propertyValue: 100000, annualReturn: 6000, accumulatedRent: 6000, totalValue: 106000 },
//     { year: 2025, propertyValue: 103000, annualReturn: 6180, accumulatedRent: 12180, totalValue: 115180 },
//     { year: 2026, propertyValue: 106090, annualReturn: 6365, accumulatedRent: 18545, totalValue: 124635 },
//     { year: 2027, propertyValue: 109273, annualReturn: 6556, accumulatedRent: 25101, totalValue: 134374 },
//     { year: 2028, propertyValue: 112551, annualReturn: 6753, accumulatedRent: 31854, totalValue: 144405 }
//   ];
//   return (
//     <div className="font-ubuntu mt-6 md:mt-10 ">
//       <div className="overflow-x-auto">
//         {/* <table className="w-full border-collapse">
//           <tbody>
//             <tr className="border-b border-base-800">
//               <th className="p-3 text-left font-bold border border-base-800 bg-Yellow-100 text-black-100 w-1/4">Initial Investment</th>
//               <td className="p-3 border border-base-800">$100,000</td>
//             </tr>
//             <tr className="border-b border-base-800">
//               <th className="p-3 text-left font-bold border border-base-800 bg-Yellow-100 text-black-100 w-1/4">Annual Return Rate</th>
//               <td className="p-3 border border-base-800">6%</td>
//             </tr>
//             <tr className="border-b border-base-800">
//               <th className="p-3 text-left font-bold border border-base-800 bg-Yellow-100 text-black-100 w-1/4">Property Appreciation</th>
//               <td className="p-3 border border-base-800">3% per year</td>
//             </tr>
//             <tr className="border-b border-base-800">
//               <th className="p-3 text-left font-bold border border-base-800 bg-Yellow-100 text-black-100 w-1/4">Investment Period</th>
//               <td className="p-3 border border-base-800">5 years</td>
//             </tr>
//             <tr className="border-b border-base-800">
//               <th className="p-3 text-left font-bold border border-base-800 bg-Yellow-100 text-black-100 w-1/4">Total Expected Return</th>
//               <td className="p-3 border border-base-800">$44,405</td>
//             </tr>
//           </tbody>
//         </table> */}
//       </div>

//       <div className="overflow-x-auto">
//         <table className="w-full border-collapse">
//           <thead>
//             <tr className="bg-Yellow-100 text-black-100">
//               <th className="p-3 text-left font-bold border border-base-800">Year</th>
//               <th className="p-3 text-left font-bold border border-base-800">Property Value</th>
//               <th className="p-3 text-left font-bold border border-base-800">Annual Return</th>
//               <th className="p-3 text-left font-bold border border-base-800">Accumulated Rent</th>
//               <th className="p-3 text-left font-bold border border-base-800">Total Value</th>
//             </tr>
//           </thead>
//           <tbody>
//             {tableData.map((entry, index) => (
//               <tr key={index} className="border-b border-base-800 hover:bg-base-800/20">
//                 <td className="p-3 border border-base-800">{entry.year}</td>
//                 <td className="p-3 border border-base-800">${entry.propertyValue.toLocaleString()}</td>
//                 <td className="p-3 border border-base-800">${entry.annualReturn.toLocaleString()}</td>
//                 <td className="p-3 border border-base-800">${entry.accumulatedRent.toLocaleString()}</td>
//                 <td className="p-3 border border-base-800">${entry.totalValue.toLocaleString()}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

import { useGlobalStates } from '@/store/useStore';
import clsxm from '@/utils/clsxm';
import { formatNumberIndianStyle } from '@/utils/wagmiConfig';
import React from 'react';

// Utility function to calculate compound interest
const calculateCompoundInterest = (principal, rate, years) => {
  return principal * Math.pow(1 + rate, years);
};

const RealEstateProjection = ({ nft }) => {

  const simulator = useGlobalStates((state) => state.simulator);

  const years = [0, 1, 2, 3, 4, 5, 6];
  const initialValue = 100000; // Example initial value
  const annualRate = 0.06; // 6% annual rate

  // Calculate property values using compound interest
  // const propertyValues =  || [];

  const projectionData = {
    "Ingresos alquiler": [simulator?.projectsOnInterest?.rentalIncome,simulator?.projectsOnInterest?.rentalIncome,simulator?.projectsOnInterest?.rentalIncome,simulator?.projectsOnInterest?.rentalIncome,simulator?.projectsOnInterest?.rentalIncome,simulator?.projectsOnInterest?.rentalIncome     ] || [],
    "Ganancias valorización": simulator?.projectsOnInterest?.earning || [],
    "Total Ganancia año": simulator?.projectsOnInterest?.totalOfYear || [],
    "Total en CoinEstate": simulator?.projectsOnInterest?.totalCoinEstate || [],
    "Tasa de retorno ROI": simulator?.projectsOnInterest?.rateOfReturn || [],
    "Ganancia acumulada": simulator?.projectsOnInterest?.accumulatedGain || [],
  };
  const interestCompounded = {
    "Ingresos alquiler": simulator?.interestCompounded?.rentalIncome || [],
    "Ganancias valorización": simulator?.interestCompounded?.earning || [],
    "Total Ganancia año": simulator?.interestCompounded?.totalOfYear || [],
    "Total en CoinEstate": simulator?.interestCompounded?.totalCoinEstate || [],
    "Tasa de retorno ROI": simulator?.interestCompounded?.rateOfReturn || [],
    "Ganancia acumulada": simulator?.interestCompounded?.accumulatedGain || [],
  };

  // Debug logging


  if(!simulator?.projectsOnInterest || !simulator?.interestCompounded){
    return (
      <div className="text-white bg-black p-6 rounded-lg">
        <h2 className="text-yellow text-lg font-bold mb-2">Proyecciones con interés compuesto (COP)</h2>
        <p className="text-gray-400">No hay datos disponibles para mostrar las proyecciones.</p>
      </div>
    )
  }

//   Total ganancia anual interes simple = Line 3
// Total en CE interés simple =Line 4

  return (
    <div className="text-white bg-black mt-6 space-y-8 rounded-lg">
      {/* Table 1 */}
      <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg">
        <div className="bg-Yellow-100 text-black-100 px-6 py-4">
          <h2 className="text-xl font-bold">Valor esperado del inmueble en el tiempo (USD)</h2>
        </div>
        <div className="overflow-x-auto glass">
          <table className="w-full text-center">
            <thead>
              <tr className="bg-gray-800 border-b border-gray-700">
                <th className="px-6 py-4 text-left font-semibold text-Yellow-100">Año</th>
                {years.map((year) => (
                  <th key={year} className={clsxm(
                    "px-6 py-4 font-semibold text-Yellow-100 transition-all duration-300 hover:bg-Yellow-100 hover:text-black-100 cursor-pointer", 
                    !simulator?.reinvest ? year === simulator?.investmentYears ? 'glass bg-Yellow-100/20 text-Yellow-100 backdrop-blur-sm border border-Yellow-100/30' : 'bg-gray-700' : 'bg-gray-700'
                  )}>
                    {year}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-700 hover:bg-Yellow-100/10 hover:scale-[1.02] transition-all duration-300 group cursor-pointer">
                <td className="px-6 py-4 font-semibold text-left transition-colors group-hover:bg-gray-800/30">Valor del inmueble</td>
                {simulator?.PropertyValueWithTime?.map((value, index) => (
                  <td key={index} className={clsxm(
                    "px-6 py-4 font-mono text-green-400 transition-all duration-300 group-hover:bg-green-400/10",
                    !simulator?.reinvest ? index === simulator?.investmentYears ? 'glass bg-green-400/20 backdrop-blur-sm border border-green-400/30' : '' : ''
                  )}>
                    ${formatNumberIndianStyle(value)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 2 */}
      <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg glass">
        <div className="bg-Yellow-100 text-black-100 px-6 py-4">
          <h2 className="text-xl font-bold">Proyecciones con interés simple (COP)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead>
              <tr className="bg-gray-800 border-b border-gray-700">
                <th className="px-6 py-4 text-left font-semibold text-Yellow-100">Año</th>
                {[1, 2, 3, 4, 5, 6].map((year) => (
                  <th key={year} className={clsxm(
                    "px-6 py-4 font-semibold text-Yellow-100 transition-all duration-300 hover:bg-Yellow-100 hover:text-black-100 cursor-pointer",
                    !simulator?.reinvest ? year === simulator?.investmentYears ? 'glass bg-Yellow-100/20 text-Yellow-100 backdrop-blur-sm border border-Yellow-100/30' : 'bg-gray-700' : 'bg-gray-700'
                  )}>
                    {year}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object?.entries(projectionData).map(([label, values], rowIndex) => {
                // Ensure values is an array and has the correct length
                // const dataArray = Array.isArray(values) ? values : [];
                // const paddedArray = [...dataArray];
                // while (paddedArray.length < 6) {
                //   paddedArray.push(0);
                // }
                
                return (
                  <tr key={label} className={clsxm(
                    "border-b border-gray-700 hover:bg-Yellow-100/10 hover:scale-[1.02] transition-all duration-300 group cursor-pointer",
                    rowIndex % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800'
                  )}>
                    <td className="px-6 py-4 font-semibold text-left text-gray-300 transition-colors group-hover:bg-gray-800/30">{label}</td>
                    {values?.map((val, idx) => (
                      <td key={idx} className={clsxm(
                        'px-6 py-4 font-mono transition-all duration-300 group-hover:bg-green-400/10',
                        !simulator?.reinvest ? idx === simulator?.investmentYears - 1 ? 'glass bg-Yellow-100/20 text-Yellow-100 backdrop-blur-sm border border-Yellow-100/30 font-bold' : 'text-green-400' : 'text-green-400'
                      )}>
                        {formatNumberIndianStyle(val || 0)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 3 */}
      <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg glass">
        <div className="bg-Yellow-100 text-black-100 px-6 py-4">
          <h2 className="text-xl font-bold">Interés compuesto (COP)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead>
              <tr className="bg-gray-800 border-b border-gray-700">
                <th className="px-6 py-4 text-left font-semibold text-Yellow-100">Año</th>
                {[1, 2, 3, 4, 5, 6].map((year) => (
                  <th key={year} className={clsxm(
                    "px-6 py-4 font-semibold text-Yellow-100 transition-all duration-300 hover:bg-Yellow-100 hover:text-black-100 cursor-pointer",
                    simulator?.reinvest ? year === simulator?.investmentYears ? 'glass bg-Yellow-100/20 text-Yellow-100 backdrop-blur-sm border border-Yellow-100/30' : 'bg-gray-700' : 'bg-gray-700'
                  )}>
                    {year}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object?.entries(interestCompounded).map(([label, values], rowIndex) => {
                // Ensure values is an array and has the correct length
                // const dataArray = Array.isArray(values) ? values : [];
                // const paddedArray = [...dataArray];
                // while (paddedArray.length < 6) {
                //   paddedArray.push(0);
                // }
                
                return (
                  <tr key={label} className={clsxm(
                    "border-b border-gray-700 hover:bg-Yellow-100/10 hover:scale-[1.02] transition-all duration-300 group cursor-pointer",
                    rowIndex % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800'
                  )}>
                    <td className="px-6 py-4 font-semibold text-left text-gray-300 transition-colors group-hover:bg-gray-800/30">{label}</td>
                    {values?.map((val, idx) => (
                      <td key={idx} className={clsxm(
                        'px-6 py-4 font-mono transition-all duration-300 group-hover:bg-white/20',
                        simulator?.reinvest ? idx === simulator?.investmentYears - 1 ? 'glass bg-Yellow-100/20 text-Yellow-100 backdrop-blur-sm border border-Yellow-100/30 font-bold' : 'text-green-400' : 'text-green-400'
                      )}>
                        {/* {val} */}
                        {formatNumberIndianStyle(Number(val || 0))}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RealEstateProjection;

