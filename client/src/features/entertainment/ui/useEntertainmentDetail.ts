import { useNavigate } from 'react-router-dom';

import { useGetDramaSerialQuery } from '../api/entertainmentApi';
import { entertainmentPaths } from '../lib/entertainmentPaths';

/** Drama serial query for EntertainmentDetailPage. */
export function useEntertainmentDetail(serialId: number | null) {
  const navigate = useNavigate();
  const {
    data: serial,
    isLoading,
    isError,
    refetch,
  } = useGetDramaSerialQuery(serialId ?? 0, {
    skip: serialId == null,
  });

  function goList() {
    navigate(entertainmentPaths.list());
  }

  return {
    serial,
    isLoading,
    isError,
    refetch,
    goList,
  };
}
