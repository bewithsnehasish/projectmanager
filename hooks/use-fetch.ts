import { useState } from "react";
import { toast } from "sonner";

/**
 * A custom React hook for handling asynchronous data fetching.
 * Manages loading state, error handling, and data storage.
 *
 * @template T - The type of the data returned by the callback function.
 * @template Args - The type of the arguments passed to the callback function.
 * @param cb - The callback function that performs the asynchronous operation (e.g., an API call).
 * @returns An object containing:
 *   - data: The response data from the callback.
 *   - loading: A boolean indicating whether the operation is in progress.
 *   - error: Any error that occurred during the operation.
 *   - fn: A function to execute the callback.
 *   - setData: A function to manually update the data state.
 */
const useFetch = <T, Args extends unknown[]>(
  cb: (...args: Args) => Promise<T>,
) => {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Executes the provided callback function and updates the state accordingly.
   * Handles loading state, error handling, and data storage.
   *
   * @param args - Arguments to pass to the callback function.
   */
  const fn = async (...args: Args) => {
    setLoading(true);
    setError(null);

    try {
      const response = await cb(...args);
      setData(response);
    } catch (error: unknown) {
      // Handle errors and display a toast notification
      if (error instanceof Error) {
        setError(error);
        toast.error(error.message);
      } else {
        const genericError = new Error("An unknown error occurred.");
        setError(genericError);
        toast.error(genericError.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn, setData };
};

export default useFetch;
