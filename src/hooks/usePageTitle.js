import { useEffect } from 'react';

export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | TaskLink` : 'TaskLink — Need something done? Find someone nearby.';
  }, [title]);
}
