
// import getProperty from '@/app/server/property/getAction';
// import getBlogsList from '@/app/server/blog/getBlogs';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { endPoint, queryKeys, user_auth } from './queryContants';



export const useQueryGetBlogList = () => {
  const { data: user } = useQueryGetUser()
  const queryKey = [queryKeys.getBlogList, user?.email];

  const queryFn = async () => {
    const config = {
      method: 'POST',
      maxBodyLength: Infinity,
      url: `${endPoint}/blog/getBlogs`,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${user?.token}`,
      },
    };

    const tx = await axios.request(config);

    return tx?.data?.data;
  };

  return useQuery({
    queryKey,
    queryFn,
    onError: (error) => {
      console.log(error);
    },
    onSuccess: (res) => {
      console.log(res);
    },
  });
};


export const useQueryGetProperty = () => {
  const { data: user } = useQueryGetUser()
  const queryKey = [queryKeys.getPropertiesList, user];

  const queryFn = async () => {
    const config = {
      method: 'POST',
      maxBodyLength: Infinity,
      url: `${endPoint}/property/getAction`,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${user?.token}`,
      },
    };

    const tx = await axios.request(config);

    return tx?.data?.data;
  };

  return useQuery({
    queryKey,
    queryFn,
    onError: (error) => {
      console.error("Query Error:", error);
    },
    onSuccess: (data) => {
      console.log("Query Success:", data);
    },
  });
};




export const useQueryGetUser = () => {
  const queryKey = [queryKeys.getUserDetails];

  const queryFn = async () => {
    const tx = await sessionStorage.getItem(user_auth);
    return JSON.parse(tx);
  };

  return useQuery({
    queryKey,
    queryFn,
    onError: (error) => {
      console.error("Query Error:", error);
    },
    onSuccess: (data) => {
      console.log("Query Success:", data);
    },
  });
};

