import { useProgramStore } from '@/stores/program';

/**
 * Convenience hook for program — exposes store selectors with stable references.
 */
export function useProgram() {
  const program = useProgramStore((s) => s.program);
  const loading = useProgramStore((s) => s.loading);
  const error = useProgramStore((s) => s.error);
  const fetch = useProgramStore((s) => s.fetch);
  const isWeekAvailable = useProgramStore((s) => s.isWeekAvailable);
  const getUnlockInfo = useProgramStore((s) => s.getUnlockInfo);

  return {
    program,
    loading,
    error,
    fetch,
    isWeekAvailable,
    getUnlockInfo,
  };
}
