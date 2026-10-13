import { useEffect, useState, useCallback } from "react";
import { collection, getDocs, query, where, addDoc, doc, setDoc } from "firebase/firestore";
import { webforgeDb } from "../lib/firebase";

export interface CollectionField {
  name: string;
  type: "string" | "number" | "boolean" | "timestamp" | "object" | "array" | "image";
}

export interface CollectionData {
  fields: CollectionField[];
}

export interface DataCollectionItem {
  id: string;
  projectId?: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  data?: CollectionData;
}

const DEFAULT_COLLECTION_FIELDS: CollectionField[] = [{ name: "id", type: "string" }];

export function useCollections(projectId: string | null) {
  const [collections, setCollections] = useState<DataCollectionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCollections = useCallback(async () => {
    if (!projectId) {
      setCollections([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let fetchedCols: DataCollectionItem[] = [];

      const mainColRef = collection(webforgeDb, "collections");
      const q = query(mainColRef, where("projectId", "==", projectId));
      const mainSnap = await getDocs(q);
      fetchedCols = mainSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as DataCollectionItem[];

      setCollections(fetchedCols);
    } catch (err) {
      console.error("Error fetching collections:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data collections");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const addCollection = async (name: string, description: string = "") => {
    if (!projectId) return;

    const colData = {
      projectId,
      name: name.trim().toLowerCase(),
      description: description.trim(),
      createdAt: new Date().toISOString(),
      data: { fields: DEFAULT_COLLECTION_FIELDS } satisfies CollectionData,
    };

    try {
      const mainColRef = collection(webforgeDb, "collections");
      const docRef = await addDoc(mainColRef, colData);

      const newCol: DataCollectionItem = {
        id: docRef.id,
        ...colData,
      };

      setCollections((prev) => [newCol, ...prev]);
      return newCol;
    } catch (err) {
      console.error("Error adding collection to Firebase:", err);
      throw err;
    }
  };

  const updateCollectionData = async (collectionId: string, data: CollectionData) => {
    if (!projectId || !collectionId) return;
    await setDoc(doc(webforgeDb, "collections", collectionId), { data, updatedAt: new Date().toISOString() }, { merge: true });
    setCollections((current) => current.map((item) => item.id === collectionId ? { ...item, data } : item));
  };

  return { collections, loading, error, refetch: fetchCollections, addCollection, updateCollectionData };
}
