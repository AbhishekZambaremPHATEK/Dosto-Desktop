import * as React from 'react';
import { ActionCreatorsMapObject, bindActionCreators } from 'redux';
import { useDispatch } from 'react-redux';
import { first, last, noop } from 'lodash';

// Restore focus on teardown
export const useRestoreFocus = (
  // The ref for the element to receive initial focus
  focusRef: React.RefObject<any>,
  // Allow for an optional root element that must exist
  root: boolean | HTMLElement | null = true
) => {
  React.useEffect(() => {
    if (!root) {
      return;
    }

    const lastFocused = document.activeElement as any;
    if (focusRef.current) {
      focusRef.current.focus();
    }

    return () => {
      // This ensures that the focus is returned to
      // previous element
      setTimeout(() => {
        if (lastFocused && lastFocused.focus) {
          lastFocused.focus();
        }
      });
    };
  }, [focusRef, root]);
};

export const useBoundActions = <T extends ActionCreatorsMapObject>(
  actions: T
) => {
  const dispatch = useDispatch();

  return React.useMemo(() => {
    return bindActionCreators(actions, dispatch);
  }, [dispatch]);
};

function getTop(element: Readonly<Element>): number {
  return element.getBoundingClientRect().top;
}

function isWrapped(element: Readonly<null | HTMLElement>): boolean {
  if (!element) {
    return false;
  }

  const { children } = element;
  const firstChild = first(children);
  const lastChild = last(children);

  return Boolean(
    firstChild &&
      lastChild &&
      firstChild !== lastChild &&
      getTop(firstChild) !== getTop(lastChild)
  );
}

export function useHasWrapped<T extends HTMLElement>(): [
  React.Ref<T>,
  boolean
] {
  const [element, setElement] = React.useState<null | T>(null);

  const [hasWrapped, setHasWrapped] = React.useState(isWrapped(element));

  React.useEffect(() => {
    if (!element) {
      return noop;
    }

    // We can remove this `any` when we upgrade to TypeScript 4.2+, which adds
    //   `ResizeObserver` type definitions.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const observer = new (window as any).ResizeObserver(() => {
      setHasWrapped(isWrapped(element));
    });
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [element]);

  return [setElement, hasWrapped];
}