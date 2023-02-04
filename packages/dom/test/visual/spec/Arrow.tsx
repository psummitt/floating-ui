import type {Placement} from '@floating-ui/core';
import {arrow, autoUpdate, shift, useFloating} from '@floating-ui/react-dom';
import {useLayoutEffect, useRef, useState} from 'react';

import {allPlacements} from '../utils/allPlacements';
import {Controls} from '../utils/Controls';
import {useScroll} from '../utils/useScroll';

export function Arrow() {
  const [placement, setPlacement] = useState<Placement>('bottom');
  const arrowRef = useRef<HTMLDivElement | null>(null);
  const [padding, setPadding] = useState(0);
  const [floatingSize, setFloatingSize] = useState(75);
  const [referenceSize, setReferenceSize] = useState(125);

  const {
    x,
    y,
    reference,
    floating,
    strategy,
    update,
    placement: resultantPlacement,
    middlewareData: {arrow: {x: arrowX, y: arrowY} = {}},
    refs,
  } = useFloating({
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [shift({padding: 10}), arrow({element: arrowRef, padding})],
  });

  useLayoutEffect(update, [update, padding, referenceSize, floatingSize]);

  const oppositeSidesMap: {[key: string]: string} = {
    top: 'bottom',
    left: 'right',
    right: 'left',
    bottom: 'top',
  };

  const staticSide = oppositeSidesMap[resultantPlacement.split('-')[0]];

  const {scrollRef} = useScroll({refs, update});

  return (
    <>
      <h1>Arrow</h1>
      <p></p>
      <div className="container">
        <div
          className="scroll"
          ref={scrollRef}
          data-x
          style={{position: 'relative'}}
        >
          <div
            ref={reference}
            className="reference"
            style={{
              width: referenceSize,
              height: referenceSize,
            }}
          >
            Reference
          </div>
          <div
            ref={floating}
            className="floating"
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
              width: floatingSize,
              height: floatingSize,
            }}
          >
            Floating
            <div
              ref={arrowRef}
              className="arrow"
              style={{
                position: 'absolute',
                top: arrowY != null ? arrowY : '',
                left: arrowX != null ? arrowX : '',
                right: '',
                bottom: '',
                [staticSide]: -15,
              }}
            />
          </div>
        </div>
      </div>

      <h2>Reference size</h2>
      <Controls>
        {[25, 125].map((size) => (
          <button
            key={size}
            data-testid={`reference-${size}`}
            onClick={() => setReferenceSize(size)}
            style={{
              backgroundColor: size === referenceSize ? 'black' : '',
            }}
          >
            {size}
          </button>
        ))}
      </Controls>

      <h2>Floating size</h2>
      <Controls>
        {[75, 150].map((size) => (
          <button
            key={size}
            data-testid={`floating-${size}`}
            onClick={() => setFloatingSize(size)}
            style={{
              backgroundColor: size === floatingSize ? 'black' : '',
            }}
          >
            {size}
          </button>
        ))}
      </Controls>

      <h2>Arrow padding</h2>
      <Controls>
        {[0, 20].map((size) => (
          <button
            key={size}
            data-testid={`arrow-padding-${size}`}
            onClick={() => setPadding(size)}
            style={{
              backgroundColor: size === padding ? 'black' : '',
            }}
          >
            {size}
          </button>
        ))}
      </Controls>

      <Controls>
        {allPlacements.map((localPlacement) => (
          <button
            key={localPlacement}
            data-testid={`placement-${localPlacement}`}
            onClick={() => setPlacement(localPlacement)}
            style={{
              backgroundColor: localPlacement === placement ? 'black' : '',
            }}
          >
            {localPlacement}
          </button>
        ))}
      </Controls>
    </>
  );
}
