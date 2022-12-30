import type {Side} from '../types';

const oppositeSideMap = {
  left: 'right',
  right: 'left',
  bottom: 'top',
  top: 'bottom',
} as const;

export function getOppositeSide(side: Side): Side {
  return oppositeSideMap[side];
}
