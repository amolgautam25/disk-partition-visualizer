import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PartitionForm from '../components/PartitionForm';

const TOTAL_BLOCKS = 1000;

function renderForm(props = {}) {
  return render(
    <PartitionForm
      partitions={[]}
      overlaps={[]}
      totalBlocks={TOTAL_BLOCKS}
      onAdd={vi.fn()}
      onUpdate={vi.fn()}
      editIdx={null}
      setEditIdx={vi.fn()}
      {...props}
    />
  );
}

describe('PartitionForm — default values', () => {
  it('pre-fills startBlock with 0', () => {
    renderForm();
    const [startInput] = screen.getAllByRole('spinbutton');
    expect(startInput.value).toBe('0');
  });

  it('pre-fills endBlock with totalBlocks - 1', () => {
    renderForm();
    const [, endInput] = screen.getAllByRole('spinbutton');
    expect(endInput.value).toBe('999');
  });

  it('pre-fills endBlock with 999999 when totalBlocks is 0', () => {
    renderForm({ totalBlocks: 0 });
    const [, endInput] = screen.getAllByRole('spinbutton');
    expect(endInput.value).toBe('999999');
  });
});

describe('PartitionForm — submitting with default values', () => {
  it('calls onAdd with default values when Add is clicked without typing', () => {
    const onAdd = vi.fn();
    renderForm({ onAdd });
    fireEvent.click(screen.getByText('Add'));
    expect(onAdd).toHaveBeenCalledOnce();
    expect(onAdd).toHaveBeenCalledWith({ name: 'Partition 1', startBlock: 0, endBlock: 999 });
  });

  it('uses 999999 as default endBlock when totalBlocks is 0', () => {
    const onAdd = vi.fn();
    renderForm({ onAdd, totalBlocks: 0 });
    fireEvent.click(screen.getByText('Add'));
    expect(onAdd).toHaveBeenCalledWith({ name: 'Partition 1', startBlock: 0, endBlock: 999999 });
  });

  it('resets to default values after adding a partition', () => {
    const onAdd = vi.fn();
    renderForm({ onAdd });
    const [startInput, endInput] = screen.getAllByRole('spinbutton');
    fireEvent.change(startInput, { target: { value: '100' } });
    fireEvent.change(endInput, { target: { value: '200' } });
    fireEvent.click(screen.getByText('Add'));
    expect(startInput.value).toBe('0');
    expect(endInput.value).toBe('999');
  });

  it('respects manually entered values over defaults', () => {
    const onAdd = vi.fn();
    renderForm({ onAdd });
    const [startInput, endInput] = screen.getAllByRole('spinbutton');
    fireEvent.change(startInput, { target: { value: '100' } });
    fireEvent.change(endInput, { target: { value: '500' } });
    fireEvent.click(screen.getByText('Add'));
    expect(onAdd).toHaveBeenCalledWith({ name: 'Partition 1', startBlock: 100, endBlock: 500 });
  });
});

describe('PartitionForm — validation', () => {
  it('does not call onAdd when end < start', () => {
    const onAdd = vi.fn();
    renderForm({ onAdd });
    const [startInput, endInput] = screen.getAllByRole('spinbutton');
    fireEvent.change(startInput, { target: { value: '500' } });
    fireEvent.change(endInput, { target: { value: '100' } });
    fireEvent.click(screen.getByText('Add'));
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('does not call onAdd when start is negative', () => {
    const onAdd = vi.fn();
    renderForm({ onAdd });
    const [startInput] = screen.getAllByRole('spinbutton');
    fireEvent.change(startInput, { target: { value: '-1' } });
    fireEvent.click(screen.getByText('Add'));
    expect(onAdd).not.toHaveBeenCalled();
  });
});

describe('PartitionForm — editing', () => {
  it('loads partition values into form when editIdx is set', () => {
    const partitions = [{ name: 'Root', startBlock: 10, endBlock: 500 }];
    renderForm({ partitions, editIdx: 0 });
    const [startInput, endInput] = screen.getAllByRole('spinbutton');
    expect(startInput.value).toBe('10');
    expect(endInput.value).toBe('500');
  });

  it('calls onUpdate with edited values', () => {
    const partitions = [{ name: 'Root', startBlock: 10, endBlock: 500 }];
    const onUpdate = vi.fn();
    const setEditIdx = vi.fn();
    renderForm({ partitions, editIdx: 0, onUpdate, setEditIdx });
    fireEvent.click(screen.getByText('Update'));
    expect(onUpdate).toHaveBeenCalledWith(0, { name: 'Root', startBlock: 10, endBlock: 500 });
  });

  it('resets to defaults on cancel', () => {
    const partitions = [{ name: 'Root', startBlock: 10, endBlock: 500 }];
    const setEditIdx = vi.fn();
    renderForm({ partitions, editIdx: 0, setEditIdx });
    fireEvent.click(screen.getByText('Cancel'));
    expect(setEditIdx).toHaveBeenCalledWith(null);
  });
});
