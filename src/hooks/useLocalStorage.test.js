import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage Hook', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    window.localStorage.clear();
  });

  it('should use the initial value if localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test_key', 'initial'));
    expect(result.current[0]).toBe('initial');
  });

  it('should use the value from localStorage if it exists', () => {
    window.localStorage.setItem('test_key', JSON.stringify('stored_value'));
    const { result } = renderHook(() => useLocalStorage('test_key', 'initial'));
    expect(result.current[0]).toBe('stored_value');
  });

  it('should update localStorage when the state changes', () => {
    const { result } = renderHook(() => useLocalStorage('test_key', 'initial'));
    
    act(() => {
      result.current[1]('new_value');
    });

    expect(result.current[0]).toBe('new_value');
    expect(window.localStorage.getItem('test_key')).toBe(JSON.stringify('new_value'));
  });

  it('should support functional updates', () => {
    const { result } = renderHook(() => useLocalStorage('test_counter', 0));
    
    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
    expect(window.localStorage.getItem('test_counter')).toBe(JSON.stringify(1));
  });
});
