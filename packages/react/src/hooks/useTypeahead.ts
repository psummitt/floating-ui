import * as React from 'react';
import useLayoutEffect from 'use-isomorphic-layout-effect';

import type {ElementProps, FloatingContext, ReferenceType} from '../types';
import {activeElement} from '../utils/activeElement';
import {getDocument} from '../utils/getDocument';
import {getTarget} from '../utils/getTarget';
import {isElement} from '../utils/is';
import {stopEvent} from '../utils/stopEvent';
import {useEvent} from './utils/useEvent';
import {useLatestRef} from './utils/useLatestRef';

export interface Props {
  listRef: React.MutableRefObject<Array<string | null>>;
  activeIndex: number | null;
  onMatch?: (index: number) => void;
  enabled?: boolean;
  findMatch?:
    | null
    | ((
        list: Array<string | null>,
        typedString: string
      ) => string | null | undefined);
  resetMs?: number;
  ignoreKeys?: Array<string>;
  selectedIndex?: number | null;
}

/**
 * Provides a matching callback that can be used to focus an item as the user
 * types, often used in tandem with `useListNavigation()`.
 * @see https://floating-ui.com/docs/useTypeahead
 */
export const useTypeahead = <RT extends ReferenceType = ReferenceType>(
  {open, dataRef}: FloatingContext<RT>,
  {
    listRef,
    activeIndex,
    onMatch: unstable_onMatch = () => {},
    enabled = true,
    findMatch = null,
    resetMs = 1000,
    ignoreKeys = [],
    selectedIndex = null,
  }: Props = {
    listRef: {current: []},
    activeIndex: null,
  }
): ElementProps => {
  const timeoutIdRef = React.useRef<any>();
  const stringRef = React.useRef('');
  const prevIndexRef = React.useRef<number | null>(
    selectedIndex ?? activeIndex ?? -1
  );
  const matchIndexRef = React.useRef<number | null>(null);

  const onMatch = useEvent(unstable_onMatch);
  const findMatchRef = useLatestRef(findMatch);
  const ignoreKeysRef = useLatestRef(ignoreKeys);

  useLayoutEffect(() => {
    if (open) {
      clearTimeout(timeoutIdRef.current);
      matchIndexRef.current = null;
      stringRef.current = '';
    }
  }, [open]);

  useLayoutEffect(() => {
    // Sync arrow key navigation but not typeahead navigation.
    if (open && stringRef.current === '') {
      prevIndexRef.current = selectedIndex ?? activeIndex ?? -1;
    }
  }, [open, selectedIndex, activeIndex]);

  return React.useMemo(() => {
    if (!enabled) {
      return {};
    }

    function onKeyDown(event: React.KeyboardEvent) {
      // Correctly scope nested non-portalled floating elements. Since the nested
      // floating element is inside of the another, we find the closest role
      // that indicates the floating element scope.
      const target = getTarget(event.nativeEvent);

      if (
        isElement(target) &&
        (activeElement(getDocument(target)) !== event.currentTarget
          ? target.closest(
              '[role="dialog"],[role="menu"],[role="listbox"],[role="tree"],[role="grid"]'
            ) !== event.currentTarget
          : false)
      ) {
        return;
      }

      if (stringRef.current.length > 0 && stringRef.current[0] !== ' ') {
        dataRef.current.typing = true;

        if (event.key === ' ') {
          stopEvent(event);
        }
      }

      const listContent = listRef.current;

      if (
        listContent == null ||
        ignoreKeysRef.current.includes(event.key) ||
        // Character key.
        event.key.length !== 1 ||
        // Modifier key.
        event.ctrlKey ||
        event.metaKey ||
        event.altKey
      ) {
        return;
      }

      // Bail out if the list contains a word like "llama" or "aaron". TODO:
      // allow it in this case, too.
      const allowRapidSuccessionOfFirstLetter = listContent.every((text) =>
        text
          ? text[0]?.toLocaleLowerCase() !== text[1]?.toLocaleLowerCase()
          : true
      );

      // Allows the user to cycle through items that start with the same letter
      // in rapid succession.
      if (
        allowRapidSuccessionOfFirstLetter &&
        stringRef.current === event.key
      ) {
        stringRef.current = '';
        prevIndexRef.current = matchIndexRef.current;
      }

      stringRef.current += event.key;
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = setTimeout(() => {
        stringRef.current = '';
        prevIndexRef.current = matchIndexRef.current;
        dataRef.current.typing = false;
      }, resetMs);

      const prevIndex = prevIndexRef.current;

      const orderedList = [
        ...listContent.slice((prevIndex || 0) + 1),
        ...listContent.slice(0, (prevIndex || 0) + 1),
      ];

      const str = findMatchRef.current
        ? findMatchRef.current(orderedList, stringRef.current)
        : orderedList.find(
            (text) =>
              text
                ?.toLocaleLowerCase()
                .indexOf(stringRef.current.toLocaleLowerCase()) === 0
          );

      const index = str ? listContent.indexOf(str) : -1;

      if (index !== -1) {
        onMatch(index);
        matchIndexRef.current = index;
      }
    }

    return {
      reference: {onKeyDown},
      floating: {onKeyDown},
    };
  }, [
    enabled,
    dataRef,
    listRef,
    resetMs,
    ignoreKeysRef,
    findMatchRef,
    onMatch,
  ]);
};
