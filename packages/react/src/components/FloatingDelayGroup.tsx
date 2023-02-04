import * as React from 'react';
import {getDelay} from '../hooks/useHover';
import type {FloatingContext} from '../types';

type Delay = number | Partial<{open: number; close: number}>;

interface GroupState {
  delay: Delay;
  initialDelay: Delay;
  currentId: any;
}

interface GroupContext extends GroupState {
  setCurrentId: React.Dispatch<React.SetStateAction<any>>;
  setState: React.Dispatch<React.SetStateAction<GroupState>>;
}

const FloatingDelayGroupContext = React.createContext<
  GroupState & {
    setCurrentId: (currentId: any) => void;
    setState: React.Dispatch<React.SetStateAction<GroupState>>;
  }
>({
  delay: 1000,
  initialDelay: 1000,
  currentId: null,
  setCurrentId: () => {},
  setState: () => {},
});

export const useDelayGroupContext = (): GroupContext =>
  React.useContext(FloatingDelayGroupContext);

/**
 * Provides context for a group of floating elements that should share a
 * `delay`.
 * @see https://floating-ui.com/docs/FloatingDelayGroup
 */
export const FloatingDelayGroup = ({
  children,
  delay,
}: {
  children?: React.ReactNode;
  delay: Delay;
}): JSX.Element => {
  const [state, setState] = React.useState<GroupState>({
    delay,
    initialDelay: delay,
    currentId: null,
  });

  const setCurrentId = React.useCallback((currentId: any) => {
    setState((state) => ({...state, currentId}));
  }, []);

  return (
    <FloatingDelayGroupContext.Provider
      value={React.useMemo(
        () => ({...state, setState, setCurrentId}),
        [state, setState, setCurrentId]
      )}
    >
      {children}
    </FloatingDelayGroupContext.Provider>
  );
};

interface UseGroupOptions {
  id: any;
}

export const useDelayGroup = (
  {open, onOpenChange}: FloatingContext,
  {id}: UseGroupOptions
) => {
  const {currentId, initialDelay, setState} = useDelayGroupContext();

  React.useEffect(() => {
    if (currentId) {
      setState((state) => ({
        ...state,
        delay: {open: 1, close: getDelay(initialDelay, 'close')},
      }));

      if (currentId !== id) {
        onOpenChange(false);
      }
    }
  }, [id, onOpenChange, setState, currentId, initialDelay]);

  React.useEffect(() => {
    if (!open && currentId === id) {
      onOpenChange(false);
      setState((state) => ({...state, delay: initialDelay, currentId: null}));
    }
  }, [open, setState, currentId, id, onOpenChange, initialDelay]);
};
