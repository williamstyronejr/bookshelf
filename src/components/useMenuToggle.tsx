import { RefObject, useEffect, useState } from 'react';

// eslint-disable-next-line no-unused-vars
type Data = [boolean, any];

const useMenuToggle = (
  ref: RefObject<HTMLElement>,
  initState = false
): Data => {
  const [menuActive, setMenuActive] = useState(initState);

  const toggleMenu = (val: boolean | ((val: boolean) => boolean)) =>
    setMenuActive(val);

  useEffect(() => {
    const clickHandler = (evt: MouseEvent) => {
      if (ref.current !== null && !ref.current.contains(evt.target as Node)) {
        setMenuActive(false);
      }
    };

    if (menuActive) window.addEventListener('click', clickHandler);

    return () => {
      window.removeEventListener('click', clickHandler);
    };
  }, [menuActive, ref]);

  return [menuActive, toggleMenu];
};

export default useMenuToggle;
