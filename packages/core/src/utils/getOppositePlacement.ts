import type {Side} from '../types';

export const oppositeSideMap = {
  left: 'right',
  right: 'left',
  bottom: 'top',
  top: 'bottom',
} as const;

export function getOppositePlacement<T extends string>(placement: T): T {
  return placement.replace(
    /left|right|bottom|top/g,
    (side) => oppositeSideMap[side as Side]
  ) as T;
}
