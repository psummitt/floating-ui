import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import {useState} from 'react';

import {useClick, useFloating, useInteractions} from '../../src';
import type {Props} from '../../src/hooks/useClick';

function App({
  button = true,
  typeable = false,
  initialOpen = false,
  ...props
}: Props & {button?: boolean; typeable?: boolean; initialOpen?: boolean}) {
  const [open, setOpen] = useState(initialOpen);
  const {reference, floating, context} = useFloating({
    open,
    onOpenChange: setOpen,
  });
  const {getReferenceProps, getFloatingProps} = useInteractions([
    useClick(context, props),
  ]);

  const Tag = typeable ? 'input' : button ? 'button' : 'div';

  return (
    <>
      <Tag {...getReferenceProps({ref: reference})} data-testid="reference" />
      {open && <div role="tooltip" {...getFloatingProps({ref: floating})} />}
    </>
  );
}

describe('default', () => {
  test('changes `open` state to `true` after click', () => {
    render(<App />);
    const button = screen.getByRole('button');

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    fireEvent.click(button);

    expect(screen.queryByRole('tooltip')).toBeInTheDocument();

    cleanup();
  });

  test('changes `open` state to `false` after two clicks', () => {
    render(<App />);
    const button = screen.getByRole('button');

    fireEvent.click(button);
    fireEvent.click(button);

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    cleanup();
  });
});

describe('mousedown `event` prop', () => {
  test('changes `open` state to `true` after click', () => {
    render(<App event="mousedown" />);
    const button = screen.getByRole('button');

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    fireEvent.click(button);

    expect(screen.queryByRole('tooltip')).toBeInTheDocument();

    cleanup();
  });

  test('changes `open` state to `false` after two clicks', () => {
    render(<App event="mousedown" />);
    const button = screen.getByRole('button');

    fireEvent.click(button);
    fireEvent.click(button);

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    cleanup();
  });
});

describe('`toggle` prop', () => {
  test('changes `open` state to `true` after click', () => {
    render(<App toggle={false} />);
    const button = screen.getByRole('button');

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    fireEvent.click(button);

    expect(screen.queryByRole('tooltip')).toBeInTheDocument();

    cleanup();
  });

  test('`open` state remains `true` after two clicks', () => {
    render(<App toggle={false} />);
    const button = screen.getByRole('button');

    fireEvent.click(button);
    fireEvent.click(button);

    expect(screen.queryByRole('tooltip')).toBeInTheDocument();

    cleanup();
  });

  test('`open` state remains `true` after two clicks with `mousedown`', () => {
    render(<App toggle={false} event="mousedown" />);
    const button = screen.getByRole('button');

    fireEvent.click(button);
    fireEvent.click(button);

    expect(screen.queryByRole('tooltip')).toBeInTheDocument();

    cleanup();
  });

  test('`open` state becomes `false` after clicking when initially open', () => {
    render(<App initialOpen={true} />);
    const button = screen.getByRole('button');

    fireEvent.click(button);

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    cleanup();
  });
});

describe('`ignoreMouse` prop', () => {
  // TODO — not sure how to test this in JSDOM
});

describe('non-buttons', () => {
  test('adds Enter keydown', () => {
    render(<App button={false} />);

    const button = screen.getByTestId('reference');
    fireEvent.keyDown(button, {key: 'Enter'});

    expect(screen.queryByRole('tooltip')).toBeInTheDocument();
    cleanup();
  });

  test('adds Space keyup', () => {
    render(<App button={false} />);

    const button = screen.getByTestId('reference');
    fireEvent.keyUp(button, {key: ' '});

    expect(screen.queryByRole('tooltip')).toBeInTheDocument();
    cleanup();
  });

  test('typeable reference does not receive space key handler', async () => {
    render(<App typeable={true} />);

    const button = screen.getByTestId('reference');
    fireEvent.keyDown(button, {key: ' '});
    fireEvent.keyUp(button, {key: ' '});

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    cleanup();
  });

  test('typeable reference does receive Enter key handler', async () => {
    render(<App typeable={true} />);

    const button = screen.getByTestId('reference');
    fireEvent.keyDown(button, {key: 'Enter'});

    expect(screen.queryByRole('tooltip')).toBeInTheDocument();
    cleanup();
  });
});
