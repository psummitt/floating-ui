import type {Side} from '../types';
import {getOppositeSide} from './getOppositeSide';

export function getOppositePlacement<T extends string>(placement: T): T {
  return placement.replace(/left|right|bottom|top/g, (side) =>
    getOppositeSide(side as Side)
  ) as T;
}
