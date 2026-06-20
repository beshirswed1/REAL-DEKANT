"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getDocument,
  getDocuments,
  addDocument,
  updateDocument,
  deleteDocument,
} from "@/lib/firebase/firestore";
import type { QueryConstraint } from "firebase/firestore";

interface UseFirestoreReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Fetch a single Firestore document by id.
 */
export function useDocument<T>(
  collectionName: string,
  docId: string | null
): UseFirestoreReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (!docId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getDocument<T>(collectionName, docId)
      .then((result) => {
        setData(result);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [collectionName, docId, trigger]);

  const refetch = useCallback(() => setTrigger((t) => t + 1), []);

  return { data, loading, error, refetch };
}

/**
 * Fetch a collection of Firestore documents with optional query constraints.
 */
export function useCollection<T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): UseFirestoreReturn<T[]> {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  // Stringify constraints to use as dependency (avoid infinite re-renders)
  const constraintKey = JSON.stringify(constraints.map((c) => c.type));

  useEffect(() => {
    setLoading(true);
    getDocuments<T>(collectionName, constraints)
      .then((result) => {
        setData(result);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, constraintKey, trigger]);

  const refetch = useCallback(() => setTrigger((t) => t + 1), []);

  return { data, loading, error, refetch };
}

/**
 * Mutations — add, update, delete.
 */
export function useFirestoreMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = useCallback(
    async (collectionName: string, data: object) => {
      setLoading(true);
      try {
        const ref = await addDocument(collectionName, data);
        return ref.id;
      } catch (err) {
        setError((err as Error).message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const update = useCallback(
    async (collectionName: string, docId: string, data: object) => {
      setLoading(true);
      try {
        await updateDocument(collectionName, docId, data);
      } catch (err) {
        setError((err as Error).message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const remove = useCallback(
    async (collectionName: string, docId: string) => {
      setLoading(true);
      try {
        await deleteDocument(collectionName, docId);
      } catch (err) {
        setError((err as Error).message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { add, update, remove, loading, error };
}
