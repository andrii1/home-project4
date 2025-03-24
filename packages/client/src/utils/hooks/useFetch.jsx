import { useState, useEffect } from 'react';

import { apiURL } from '../../apiURL';

export function useFetch(fetchFn, initialValue) {
  const [isFetching, setIsFetching] = useState();
  const [error, setError] = useState();
  const [fetchedData, setFetchedData] = useState(initialValue);

  useEffect(() => {
    async function fetchData() {
      setIsFetching(true);
      try {
        const data = await fetchFn();
        setFetchedData(data);
      } catch (e) {
        setError({ message: e.message || 'Failed to fetch data.' });
      }
      setIsFetching(false);
    }
    fetchData();
  }, [fetchFn]);

  return { isFetching, fetchedData, setFetchedData, error };
}
