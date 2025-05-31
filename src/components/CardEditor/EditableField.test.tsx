import { render, screen, fireEvent } from '@testing-library/react';
import EditableField from './EditableField';

const mockHandleInput = jest.fn();

describe('EditableField Component', () => {
  beforeEach(() => {
    render(<EditableField field="name" value="John Doe" onChange={mockHandleInput} style={{}} />);
  });

  it('renders with initial value', () => {
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('calls onChange when text is edited', () => {
    const field = screen.getByText('John Doe');
    fireEvent.input(field, { target: { innerHTML: 'Jane Doe' } });
    expect(mockHandleInput).toHaveBeenCalledWith('name', 'Jane Doe');
  });

  it('applies style when updated', () => {
    const field = screen.getByText('John Doe');
    fireEvent.input(field, { target: { innerHTML: '<span style="font-weight: bold;">John Doe</span>' } });
    const styledElement = screen.getByText('John Doe', { selector: 'span' });
    expect(styledElement).toHaveStyle('font-weight: bold');
  });
});