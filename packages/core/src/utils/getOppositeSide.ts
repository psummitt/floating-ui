import type {Placement, Side} from '../types';
import {getSide} from './getSide';

const oppositeSideMap = {
  left: 'right',
  right: 'left',
  bottom: 'top',
  top: 'bottom',
} as const;

export function getOppositeSide(placement: Placement): Side {
  return oppositeSideMap[getSide(placement)];
}
