import { useCallback, useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc, type Firestore } from "firebase/firestore";

export interface ExternalCollectionDocument {
  id: string;
  [field: string]: unknown;
}

export function useExternalCollectionDocuments(firestore: Firestore | null, collectionName: string | null) {
  const [documents, setDocuments] = useState<ExternalCollectionDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    if (!firestore || !collectionName) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const snapshot = await getDocs(collection(firestore, collectionName));
      setDocuments(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    } catch (err) {
      setDocuments([]);
      setError(err instanceof Error ? err.message : "Failed to fetch collection documents");
    } finally {
      setLoading(false);
    }
  }, [firestore, collectionName]);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  const addDocument = async (data: Record<string, unknown>) => {
    if (!firestore || !collectionName) throw new Error("Firebase has not been set up for this project.");
    const documentReference = await addDoc(collection(firestore, collectionName), data);
    const createdDocument = { id: documentReference.id, ...data };
    setDocuments((current) => [createdDocument, ...current]);
    return createdDocument;
  };

  const deleteDocument = async (id: string) => {
    if (!firestore || !collectionName) throw new Error("Firebase has not been set up for this project.");
    await deleteDoc(doc(firestore, collectionName, id));
    setDocuments((current) => current.filter((d) => d.id !== id));
  };

  const updateDocument = async (id: string, data: Record<string, unknown>) => {
    if (!firestore || !collectionName) throw new Error("Firebase has not been set up for this project.");
    await updateDoc(doc(firestore, collectionName, id), data);
    setDocuments((current) => current.map((d) => d.id === id ? { ...d, ...data } : d));
  };

  return { documents, loading, error, refetch: fetchDocuments, addDocument, deleteDocument, updateDocument };
}
