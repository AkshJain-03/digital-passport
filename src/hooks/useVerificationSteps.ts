/**
 * useVerificationSteps
 *
 * Drives the step-by-step animation used in the ScanScreen and VerifyScreen.
 *
 * Usage:
 *   const { statuses, run, reset, isRunning } = useVerificationSteps(STEPS, 520);
 *   await run();   // resolves when all steps complete
 *
 * Each step transitions: idle → active → done
 * while the previous steps stay 'done'.
 */

import { useCallback, useRef, useState } from 'react';
import type { VerificationStepStatus } from '../domain/verification/verificationTypes';

type StepStatuses = VerificationStepStatus[];

interface UseVerificationStepsReturn {
  /** Current status of each step, index-aligned with the input steps array. */
  statuses:   StepStatuses;
  /** Starts the animation. Resolves when all steps complete. */
  run:        () => Promise<void>;
  /** Resets all steps back to 'idle'. */
  reset:      () => void;
  /** True while the animation is in progress. */
  isRunning:  boolean;
}

export const useVerificationSteps = (
  steps:    readonly string[],
  stepMs:   number = 520,
): UseVerificationStepsReturn => {
  const [statuses,  setStatuses]  = useState<StepStatuses>(steps.map(() => 'idle'));
  const [isRunning, setIsRunning] = useState(false);
  const runningRef = useRef(false);

  const run = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    setIsRunning(true);
    setStatuses(steps.map(() => 'idle'));

    for (let i = 0; i < steps.length; i++) {
      setStatuses(prev => prev.map((s, idx) =>
        idx < i  ? 'done'   :
        idx === i ? 'active' :
        'idle',
      ));
      await delay(stepMs);
    }

    setStatuses(steps.map(() => 'done'));
    setIsRunning(false);
    runningRef.current = false;
  }, [steps, stepMs]);

  const reset = useCallback(() => {
    runningRef.current = false;
    setIsRunning(false);
    setStatuses(steps.map(() => 'idle'));
  }, [steps]);

  return { statuses, run, reset, isRunning };
};

const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
