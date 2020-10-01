import { DependencyList, useCallback, useEffect } from 'react';

function useAsyncEffect(
  fn: (...args: any) => Promise<any>,
  deps: DependencyList = []
) {
  const cbFn = useCallback(() => {
    fn();
  }, deps);

  useEffect(cbFn, deps);
}

export default useAsyncEffect;
