import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import {useState} from 'react';

import {FloatingPortal, useFloating} from '../../src';

function App(props: {root?: HTMLElement | null; id?: string}) {
  const [open, setOpen] = useState(false);
  const {reference, floating} = useFloating({
    open,
    onOpenChange: setOpen,
  });

  return (
    <>
      <button
        data-testid="reference"
        ref={reference}
        onClick={() => setOpen(!open)}
      />
      <FloatingPortal {...props}>
        {open && <div ref={floating} data-testid="floating" />}
      </FloatingPortal>
    </>
  );
}

test('creates a custom id node', () => {
  render(<App id="custom-id" />);
  expect(document.querySelector('#custom-id')).toBeInTheDocument();
  cleanup();
});

test('allows direct roots', () => {
  render(<App root={document.body} />);
  fireEvent.click(screen.getByTestId('reference'));
  expect(screen.getByTestId('floating').parentNode).toBe(document.body);
  cleanup();
});

test('empty id string does not add id attribute', () => {
  render(<App id="" />);
  fireEvent.click(screen.getByTestId('reference'));
  expect(screen.getByTestId('floating').parentElement?.hasAttribute('id')).toBe(
    false
  );
  cleanup();
});
