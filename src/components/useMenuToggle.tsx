import { RefObject, useEffect, useState } from 'react';

const useMenuToggle = (
  ref: RefObject<HTMLElement>,
  initState = false
): [boolean, (val: boolean) => void] => {
  const [menuActive, setMenuActive] = useState(initState);

  const toggleMenu = (val: boolean) => setMenuActive(val);

  useEffect(() => {
    const clickHandler = (evt: MouseEvent) => {
      if (ref.current !== null && !ref.current.contains(evt.target as Node)) {
        setMenuActive(false);
      }
    };

    if (menuActive) {
      console.log('settings event listener');
      window.addEventListener('click', clickHandler);
    }

    return () => {
      window.removeEventListener('click', clickHandler);
    };
  }, [menuActive, ref]);

  return [menuActive, toggleMenu];
};

export default useMenuToggle;
