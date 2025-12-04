import About from '@/components/About';
import AboutMarketPlace from '@/components/AboutMarketPlace';
import AboutProperties from '@/components/AboutProperties';
import Properties from '@/components/Properties';
import RegisterBottomBanner from '@/components/RegisterBottomBanner';
import { useQueryGetMarketPlaceList } from '@/hooks/query';
import Layout from '@/layout';
import React, { useEffect, useState } from 'react';

export default function Page() {
  const { data: getPropertyList } = useQueryGetMarketPlaceList();
  const [filtered, setFiltered] = useState();

  const handleFilter = (value) => {
    const filteredProperty =
      value !== 'all'
        ? getPropertyList?.filter((item) => item?.propertyType?.toLowerCase() === value?.toLowerCase())
        : getPropertyList;
    setFiltered(filteredProperty);
  };

  const handleSearch = (value) => {
    const searched = getPropertyList?.filter((item) => item?.name?.toLowerCase().includes(value?.toLowerCase()));
    setFiltered(searched);
  };

  useEffect(() => {
    if (getPropertyList?.length > 0) setFiltered(getPropertyList);
  }, [getPropertyList?.length]);

  return (
    <Layout>
      <div className='bg-lightblue'>
        <AboutMarketPlace />
        <div className='px-6 '>
          <Properties
            handleFilter={handleFilter}
            handleSearch={handleSearch}
            sortByMostRecent={(title) => {
              console.log({ title });
              if (title === 'Más recientes') {
                setFiltered(getPropertyList?.sort((a, b) => new Date(b?.createdAt) - new Date(a?.createdAt)));
              } else {
                setFiltered(getPropertyList);
              }
            }}
          />
          {filtered?.length ? <AboutProperties getPropertyList={filtered} /> : 'Loading...'}
          <RegisterBottomBanner />
        </div>
        <About />
      </div>
    </Layout>
  );
}
