// @ts-nocheck
/**
 * DataEditor.tsx
 * ──────────────────────────────────────────────────────────────────────────────
 * Self-contained Data Collection & Document Editor component.
 *
 * Features:
 *  - Collection field schema editor (add, edit, delete fields with type definitions)
 *  - Document management (fetch, add, edit, delete documents in Firebase Firestore)
 *  - Direct browser-to-Cloudflare R2 image uploading via AWS4-signed PUT requests
 *  - Responsive data tables with image thumbnails and type badges
 *  - Built-in modals for adding/editing fields and documents
 *
 * NOTE: This file is generated automatically by scripts/generateDataEditor.ts.
 * ──────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect, useRef } from 'react';
import type { Firestore } from 'firebase/firestore';
import { useExternalCollectionDocuments } from '../hooks/useExternalCollectionDocuments';
import {
  type CollectionField,
  type CollectionData,
  type DataCollectionItem,
} from '../hooks/useCollections';
import { encodeR2Image, buildR2ImageUrl } from '../utils/r2Image';

export interface R2Config {
  accountId?: string;
  bucketName?: string;
  accessKey?: string;
  secretKey?: string;
  customDomain?: string;
}

export interface DataEditorProps {
  /** The selected collection to view and edit */
  collection: DataCollectionItem;
  /** Firestore instance configured for the user's project data */
  projectFirestore: Firestore | null;
  /** Callback to update collection schema metadata (fields) in WebForge */
  onUpdateCollectionData: (collectionId: string, data: CollectionData) => Promise<void>;
  /** Whether external Firebase credentials have been configured */
  isFirebaseConfigured: boolean;
  /** Cloudflare R2 credentials for image upload and rendering */
  r2Config?: R2Config;
}

const FIELD_TYPE_OPTIONS: { value: CollectionField['type']; label: string; icon: string; description: string }[] = [
  { value: 'string',    label: 'string',    icon: '𝐓',  description: 'Plain text' },
  { value: 'number',    label: 'number',    icon: '#',  description: 'Integer or float' },
  { value: 'boolean',   label: 'boolean',   icon: '◑',  description: 'true / false' },
  { value: 'timestamp', label: 'timestamp', icon: '⏱',  description: 'Date & time' },
  { value: 'object',    label: 'object',    icon: '{}', description: 'Nested JSON object' },
  { value: 'array',     label: 'array',     icon: '[]', description: 'List of values' },
  { value: 'image',     label: 'image',     icon: '🖼', description: 'R2 image reference' },
];

function FieldTypeSelect({
  value,
  onChange,
}: {
  value: CollectionField['type'];
  onChange: (v: CollectionField['type']) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = FIELD_TYPE_OPTIONS.find((o) => o.value === value) ?? FIELD_TYPE_OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="fts-root" style={{ position: 'relative' }}>
      <button
        type="button"
        className="fts-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="fts-trigger-left">
          <span className="fts-icon">{selected.icon}</span>
          <span className="fts-label">{selected.label}</span>
        </span>
        <span className={`fts-chevron ${open ? 'open' : ''}`}>
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>

      {open && (
        <ul className="fts-menu" role="listbox">
          {FIELD_TYPE_OPTIONS.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={`fts-option ${opt.value === value ? 'selected' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(opt.value);
                setOpen(false);
              }}
            >
              <span className="fts-opt-icon">{opt.icon}</span>
              <span className="fts-opt-body">
                <span className="fts-opt-label">{opt.label}</span>
                <span className="fts-opt-desc">{opt.description}</span>
              </span>
              {opt.value === value && (
                <span className="fts-opt-check">✓</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const DEFAULT_COLLECTION_FIELDS: CollectionField[] = [{ name: 'id', type: 'string' }];

export const DataEditor: React.FC<DataEditorProps> = ({
  collection: selectedCollection,
  projectFirestore,
  onUpdateCollectionData,
  isFirebaseConfigured,
  r2Config,
}) => {
  const r2AccountId = r2Config?.accountId || '';
  const r2BucketName = r2Config?.bucketName || '';
  const r2AccessKey = r2Config?.accessKey || '';
  const r2SecretKey = r2Config?.secretKey || '';
  const r2CustomDomain = r2Config?.customDomain || '';

  // ── Document management hook ───────────────────────────────────────────────
  const {
    documents: externalDocuments,
    loading: externalDocumentsLoading,
    error: externalDocumentsError,
    addDocument: addExternalDocument,
    deleteDocument: deleteExternalDocument,
    updateDocument: updateExternalDocument,
  } = useExternalCollectionDocuments(projectFirestore, selectedCollection?.name ?? null);

  // ── Field Schema State ─────────────────────────────────────────────────────
  const [collectionFields, setCollectionFields] = useState<CollectionField[]>(DEFAULT_COLLECTION_FIELDS);
  const [collectionFieldsError, setCollectionFieldsError] = useState<string | null>(null);

  useEffect(() => {
    const fields = selectedCollection?.data?.fields;
    setCollectionFields(fields && fields.length > 0 ? fields : DEFAULT_COLLECTION_FIELDS);
    setCollectionFieldsError(null);
  }, [selectedCollection?.id, selectedCollection?.data]);

  const saveCollectionFields = async (fields: CollectionField[]) => {
    if (!selectedCollection) return;
    setCollectionFields(fields);
    try {
      await onUpdateCollectionData(selectedCollection.id, { fields });
      setCollectionFieldsError(null);
    } catch (error) {
      setCollectionFieldsError(error instanceof Error ? error.message : 'Failed to save collection fields');
      throw error;
    }
  };

  // ── Add Field Modal State ──────────────────────────────────────────────────
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<CollectionField['type']>('string');
  const [submittingField, setSubmittingField] = useState(false);
  const [fieldSubmitError, setFieldSubmitError] = useState<string | null>(null);

  // ── Edit Field Modal State ─────────────────────────────────────────────────
  const [showEditFieldModal, setShowEditFieldModal] = useState(false);
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [editFieldName, setEditFieldName] = useState('');
  const [editFieldType, setEditFieldType] = useState<CollectionField['type']>('string');
  const [editFieldSubmitError, setEditFieldSubmitError] = useState<string | null>(null);

  const openAddFieldModal = () => {
    setNewFieldName('');
    setNewFieldType('string');
    setFieldSubmitError(null);
    setShowAddFieldModal(true);
  };

  const openEditFieldModal = (index: number) => {
    const field = collectionFields[index];
    setEditingFieldIndex(index);
    setEditFieldName(field.name);
    setEditFieldType(field.type);
    setEditFieldSubmitError(null);
    setShowEditFieldModal(true);
  };

  const handleAddField = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = newFieldName.trim();
    if (!name) {
      setFieldSubmitError('Field name is required.');
      return;
    }
    if (collectionFields.some((field) => field.name.toLowerCase() === name.toLowerCase())) {
      setFieldSubmitError(`A field named "${name}" already exists.`);
      return;
    }
    setSubmittingField(true);
    setFieldSubmitError(null);
    try {
      await saveCollectionFields([...collectionFields, { name, type: newFieldType }]);
      setShowAddFieldModal(false);
    } catch (error) {
      setFieldSubmitError(error instanceof Error ? error.message : 'Failed to save field');
    } finally {
      setSubmittingField(false);
    }
  };

  const handleEditField = async (event: React.FormEvent) => {
    event.preventDefault();
    if (editingFieldIndex === null) return;
    const name = editFieldName.trim();
    if (!name) {
      setEditFieldSubmitError('Field name is required.');
      return;
    }
    if (collectionFields.some((field, i) => i !== editingFieldIndex && field.name.toLowerCase() === name.toLowerCase())) {
      setEditFieldSubmitError(`A field named "${name}" already exists.`);
      return;
    }
    setSubmittingField(true);
    setEditFieldSubmitError(null);
    try {
      const updated = collectionFields.map((field, i) => (i === editingFieldIndex ? { name, type: editFieldType } : field));
      await saveCollectionFields(updated);
      setShowEditFieldModal(false);
    } catch (error) {
      setEditFieldSubmitError(error instanceof Error ? error.message : 'Failed to save field');
    } finally {
      setSubmittingField(false);
    }
  };

  const displayDocumentValue = (value: unknown) => {
    if (value === undefined || value === null) return '—';
    if (typeof value === 'object' && value && 'toDate' in value && typeof (value as { toDate?: unknown }).toDate === 'function') {
      return (value as { toDate: () => Date }).toDate().toLocaleString();
    }
    return typeof value === 'string' ? value : JSON.stringify(value);
  };

  // ── Document Modals State ──────────────────────────────────────────────────
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false);
  const [documentValues, setDocumentValues] = useState<Record<string, string>>({});
  const [pendingImageFiles, setPendingImageFiles] = useState<Record<string, File>>({});
  const [documentSubmitError, setDocumentSubmitError] = useState<string | null>(null);
  const [submittingDocument, setSubmittingDocument] = useState(false);

  // Edit document modal state
  const [showEditDocumentModal, setShowEditDocumentModal] = useState(false);
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null);
  const [editDocumentValues, setEditDocumentValues] = useState<Record<string, string>>({});
  const [editPendingImageFiles, setEditPendingImageFiles] = useState<Record<string, File>>({});
  const [editDocumentError, setEditDocumentError] = useState<string | null>(null);
  const [submittingEditDocument, setSubmittingEditDocument] = useState(false);

  // Delete confirmation state
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null);

  const openAddDocumentModal = () => {
    setDocumentValues(Object.fromEntries(collectionFields.filter((field) => field.name !== 'id').map((field) => [field.name, ''])));
    setPendingImageFiles({});
    setDocumentSubmitError(null);
    setShowAddDocumentModal(true);
  };

  // Performs an AWS4-signed PUT to Cloudflare R2 directly from the browser.
  const r2PutFile = async (file: File, key: string): Promise<void> => {
    const accountId = r2AccountId.trim();
    const bucketName = r2BucketName.trim();
    const accessKey = r2AccessKey.trim();
    const secretKey = r2SecretKey.trim();
    if (!accountId || !bucketName || !accessKey || !secretKey) {
      throw new Error('R2 credentials not configured. Add them in project Settings.');
    }

    const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
    const url = `${endpoint}/${bucketName}/${key}`;
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]/g, '').replace(/\.\d+/, '');
    const dateStamp = amzDate.slice(0, 8);
    const region = 'auto', service = 's3';

    const enc = new TextEncoder();
    const importHmacKey = (raw: ArrayBuffer | string) =>
      crypto.subtle.importKey('raw', typeof raw === 'string' ? enc.encode(raw) : raw, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const hmac = (key: CryptoKey, data: string) =>
      crypto.subtle.sign('HMAC', key, enc.encode(data));
    const hex = (buf: ArrayBuffer) =>
      Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');

    const bodyBuf = await file.arrayBuffer();
    const payloadHash = hex(await crypto.subtle.digest('SHA-256', bodyBuf));

    const headers: Record<string, string> = {
      'x-amz-date': amzDate,
      'x-amz-content-sha256': payloadHash,
      'content-type': file.type || 'application/octet-stream',
      'host': `${accountId}.r2.cloudflarestorage.com`,
    };

    const headerKeys = Object.keys(headers).sort();
    const canonicalHeaders = headerKeys.map((k) => `${k}:${headers[k]}`).join('\n') + '\n';
    const signedHeaders = headerKeys.join(';');
    const canonicalUri = `/${bucketName}/${encodeURIComponent(key).replace(/%2F/g, '/')}`;
    const canonicalRequest = ['PUT', canonicalUri, '', canonicalHeaders, signedHeaders, payloadHash].join('\n');

    const credScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const strToSign = ['AWS4-HMAC-SHA256', amzDate, credScope,
      hex(await crypto.subtle.digest('SHA-256', enc.encode(canonicalRequest)))].join('\n');

    const kDate = await hmac(await importHmacKey(`AWS4${secretKey}`), dateStamp);
    const kReg = await hmac(await importHmacKey(kDate), region);
    const kSvc = await hmac(await importHmacKey(kReg), service);
    const kSign = await hmac(await importHmacKey(kSvc), 'aws4_request');
    const signature = hex(await hmac(await importHmacKey(kSign), strToSign));

    const authHeader = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const res = await fetch(url, {
      method: 'PUT',
      headers: { ...headers, Authorization: authHeader },
      body: file,
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => res.statusText);
      throw new Error(`R2 upload failed (${res.status}): ${msg}`);
    }
  };

  const handleAddDocument = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittingDocument(true);
    setDocumentSubmitError(null);
    try {
      const data: Record<string, unknown> = {};

      for (const field of collectionFields.filter((item) => item.name && item.name !== 'id')) {
        const value = documentValues[field.name] ?? '';

        if (field.type === 'image') {
          const file = pendingImageFiles[field.name];
          if (file) {
            const customDomain = r2CustomDomain.trim().replace(/\/$/, '');
            if (!customDomain) throw new Error('R2 Custom Domain not set in project Settings.');
            const ext = file.name.split('.').pop() ?? 'bin';
            const key = `webforge-images/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
            await r2PutFile(file, key);
            data[field.name] = encodeR2Image({
              key,
              bucketName: r2BucketName.trim() || undefined,
              accountId: r2AccountId.trim() || undefined,
              customDomain: customDomain || undefined,
            });
          } else {
            data[field.name] = value; // empty string — no image chosen
          }
        } else if (field.type === 'number') {
          data[field.name] = Number(value);
        } else if (field.type === 'boolean') {
          data[field.name] = value === 'true';
        } else if (field.type === 'array' || field.type === 'object') {
          data[field.name] = value ? JSON.parse(value) : field.type === 'array' ? [] : {};
        } else {
          data[field.name] = value;
        }
      }

      await addExternalDocument(data);
      setPendingImageFiles({});
      setShowAddDocumentModal(false);
    } catch (error) {
      setDocumentSubmitError(error instanceof Error ? error.message : 'Failed to add document');
    } finally {
      setSubmittingDocument(false);
    }
  };

  const openEditDocumentModal = (document: Record<string, unknown> & { id: string }) => {
    setEditingDocumentId(document.id);
    const vals: Record<string, string> = {};
    for (const field of collectionFields.filter((f) => f.name && f.name !== 'id')) {
      const v = document[field.name];
      if (v === undefined || v === null) vals[field.name] = '';
      else if (typeof v === 'object') vals[field.name] = JSON.stringify(v);
      else vals[field.name] = String(v);
    }
    setEditDocumentValues(vals);
    setEditPendingImageFiles({});
    setEditDocumentError(null);
    setShowEditDocumentModal(true);
  };

  const handleEditDocument = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingDocumentId) return;
    setSubmittingEditDocument(true);
    setEditDocumentError(null);
    try {
      const data: Record<string, unknown> = {};
      for (const field of collectionFields.filter((item) => item.name && item.name !== 'id')) {
        const value = editDocumentValues[field.name] ?? '';
        if (field.type === 'image') {
          const file = editPendingImageFiles[field.name];
          if (file) {
            const customDomain = r2CustomDomain.trim().replace(/\/$/, '');
            if (!customDomain) throw new Error('R2 Custom Domain not set in project Settings.');
            const ext = file.name.split('.').pop() ?? 'bin';
            const key = `webforge-images/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
            await r2PutFile(file, key);
            data[field.name] = encodeR2Image({
              key,
              bucketName: r2BucketName.trim() || undefined,
              accountId: r2AccountId.trim() || undefined,
              customDomain: customDomain || undefined,
            });
          } else {
            data[field.name] = value;
          }
        } else if (field.type === 'number') {
          data[field.name] = Number(value);
        } else if (field.type === 'boolean') {
          data[field.name] = value === 'true';
        } else if (field.type === 'array' || field.type === 'object') {
          data[field.name] = value ? JSON.parse(value) : field.type === 'array' ? [] : {};
        } else {
          data[field.name] = value;
        }
      }
      await updateExternalDocument(editingDocumentId, data);
      setEditPendingImageFiles({});
      setShowEditDocumentModal(false);
    } catch (error) {
      setEditDocumentError(error instanceof Error ? error.message : 'Failed to update document');
    } finally {
      setSubmittingEditDocument(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    setDeletingDocumentId(id);
    try {
      await deleteExternalDocument(id);
    } catch (err) {
      console.error('Delete failed', err);
    } finally {
      setDeletingDocumentId(null);
    }
  };

  return (
    <div className="data-collection-card">
      {/* ── Collection Header ─────────────────────────────────────────────── */}
      <div className="main-page-header">
        <div className="main-page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 className="main-page-title" style={{ color: '#38bdf8' }}>
              🗄️ Collection: {selectedCollection.name}
            </h2>
            <span className="status-badge published">
              <span className="status-dot-small" />
              Firebase Firestore
            </span>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
            {selectedCollection.description || 'Firebase document collection for website storage'}
          </p>
        </div>
      </div>

      {/* ── Collection Fields Section ─────────────────────────────────────── */}
      <div style={{ marginTop: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>📋 Collection Fields</h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
              Saved as <code>data.fields</code> on this collection in WebForge Studio Firestore.
            </p>
          </div>
          <button className="btn-primary" onClick={openAddFieldModal} style={{ backgroundColor: '#0284c7', padding: '7px 12px', fontSize: '0.8rem' }}>
            + Add field
          </button>
        </div>
        {collectionFieldsError && <p style={{ color: '#f87171' }}>{collectionFieldsError}</p>}
        <div className="data-table-container" style={{ maxWidth: '600px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Field name</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {collectionFields.map((field, index) => (
                <tr key={`${field.name}-${index}`}>
                  <td style={{ color: '#e2e8f0', fontFamily: 'monospace', fontSize: '0.88rem' }}>{field.name}</td>
                  <td>
                    <span style={{ background: '#1e293b', color: '#7dd3fc', border: '1px solid #334155', borderRadius: '4px', padding: '2px 8px', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                      {field.type}
                    </span>
                  </td>
                  <td>
                    {field.name === 'id' ? (
                      <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Required</span>
                    ) : (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          title="Edit field"
                          onClick={() => openEditFieldModal(index)}
                          style={{ background: 'none', border: '1px solid #334155', borderRadius: '5px', padding: '4px 7px', cursor: 'pointer', color: '#94a3b8', lineHeight: 1, display: 'flex', alignItems: 'center' }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button
                          title="Delete field"
                          onClick={() => void saveCollectionFields(collectionFields.filter((_, fieldIndex) => fieldIndex !== index))}
                          style={{ background: 'none', border: '1px solid #7f1d1d', borderRadius: '5px', padding: '4px 7px', cursor: 'pointer', color: '#f87171', lineHeight: 1, display: 'flex', alignItems: 'center' }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Documents Section ─────────────────────────────────────────────── */}
      <div style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>📄 Documents</h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
              Records from <code>{selectedCollection.name}</code> in the configured Firebase project.
            </p>
          </div>
          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{externalDocuments.length} record{externalDocuments.length === 1 ? '' : 's'}</span>
          <button
            className="btn-primary"
            disabled={!isFirebaseConfigured}
            onClick={openAddDocumentModal}
            style={{ backgroundColor: '#0284c7', padding: '7px 12px', fontSize: '0.8rem' }}
          >
            + Add Document
          </button>
        </div>

        {!isFirebaseConfigured && (
          <p style={{ color: '#fbbf24' }}>Firebase credentials must be saved in Settings before documents can be loaded.</p>
        )}
        {externalDocumentsLoading && <p style={{ color: '#94a3b8' }}>Loading documents from Firebase…</p>}
        {externalDocumentsError && <p style={{ color: '#f87171' }}>{externalDocumentsError}</p>}
        {isFirebaseConfigured && !externalDocumentsLoading && !externalDocumentsError && externalDocuments.length === 0 && (
          <p style={{ color: '#94a3b8' }}>No documents found in this collection.</p>
        )}

        {isFirebaseConfigured && externalDocuments.length > 0 && (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="doc-col-id">DOCUMENT ID</th>
                  {collectionFields.filter((f) => f.name !== 'id').map((field) => (
                    <th key={field.name} className="doc-col-field">{field.name.toUpperCase()}</th>
                  ))}
                  <th className="doc-col-actions">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {externalDocuments.map((document) => (
                  <tr key={document.id}>
                    <td className="doc-col-id">
                      <code className="doc-id-code">{document.id}</code>
                    </td>
                    {collectionFields.filter((f) => f.name !== 'id').map((field) => {
                      const val = document[field.name];
                      if (field.type === 'image' && typeof val === 'string' && val) {
                        const url = buildR2ImageUrl(val, { accountId: r2AccountId, customDomain: r2CustomDomain, bucketName: r2BucketName });
                        return (
                          <td key={field.name} className="doc-col-field doc-cell-image">
                            {url ? (
                              <img src={url} alt={field.name} className="doc-img-thumb" />
                            ) : (
                              <span className="doc-cell-muted">encoded</span>
                            )}
                          </td>
                        );
                      }
                      return (
                        <td key={field.name} className="doc-col-field">
                          <span className="doc-cell-text">{displayDocumentValue(val)}</span>
                        </td>
                      );
                    })}
                    <td className="doc-col-actions">
                      <div className="doc-actions-wrap">
                        <button
                          className="doc-action-btn edit"
                          onClick={() => openEditDocumentModal(document as Record<string, unknown> & { id: string })}
                          title="Edit document"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Edit
                        </button>
                        <button
                          className="doc-action-btn delete"
                          onClick={() => handleDeleteDocument(document.id)}
                          disabled={deletingDocumentId === document.id}
                          title="Delete document"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                          </svg>
                          {deletingDocumentId === document.id ? '…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add Field Modal ───────────────────────────────────────────────── */}
      {showAddFieldModal && (
        <div className="modal-overlay" onClick={() => setShowAddFieldModal(false)}>
          <div className="modal-dialog" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Field to {selectedCollection.name}</h3>
              <button className="modal-close" onClick={() => setShowAddFieldModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddField}>
              <div className="form-group">
                <label className="form-label">Field name</label>
                <input
                  className="form-input"
                  type="text"
                  value={newFieldName}
                  onChange={(event) => setNewFieldName(event.target.value)}
                  placeholder="e.g. title, price, isPublished"
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <FieldTypeSelect value={newFieldType} onChange={setNewFieldType} />
              </div>
              {fieldSubmitError && <p className="error-message" style={{ marginBottom: '16px' }}>{fieldSubmitError}</p>}
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddFieldModal(false)} disabled={submittingField}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ backgroundColor: '#0284c7' }} disabled={submittingField}>
                  {submittingField ? 'Saving...' : 'Save field'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Field Modal ──────────────────────────────────────────────── */}
      {showEditFieldModal && editingFieldIndex !== null && (
        <div className="modal-overlay" onClick={() => setShowEditFieldModal(false)}>
          <div className="modal-dialog" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Field</h3>
              <button className="modal-close" onClick={() => setShowEditFieldModal(false)}>✕</button>
            </div>
            <form onSubmit={handleEditField}>
              <div className="form-group">
                <label className="form-label">Field name</label>
                <input
                  className="form-input"
                  type="text"
                  value={editFieldName}
                  onChange={(event) => setEditFieldName(event.target.value)}
                  placeholder="e.g. title, price, isPublished"
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <FieldTypeSelect value={editFieldType} onChange={setEditFieldType} />
              </div>
              {editFieldSubmitError && <p className="error-message" style={{ marginBottom: '16px' }}>{editFieldSubmitError}</p>}
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowEditFieldModal(false)} disabled={submittingField}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ backgroundColor: '#0284c7' }} disabled={submittingField}>
                  {submittingField ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add Document Modal ────────────────────────────────────────────── */}
      {showAddDocumentModal && (
        <div className="modal-overlay" onClick={() => setShowAddDocumentModal(false)}>
          <div className="modal-dialog" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Document to {selectedCollection.name}</h3>
              <button className="modal-close" onClick={() => setShowAddDocumentModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddDocument}>
              {collectionFields.filter((field) => field.name && field.name !== 'id').map((field) => (
                <div className="form-group" key={field.name}>
                  <label className="form-label">{field.name} <span style={{ color: '#64748b' }}>({field.type})</span></label>
                  {field.type === 'boolean' ? (
                    <select className="form-select" value={documentValues[field.name] ?? 'false'} onChange={(event) => setDocumentValues((current) => ({ ...current, [field.name]: event.target.value }))}>
                      <option value="false">false</option><option value="true">true</option>
                    </select>
                  ) : field.type === 'image' ? (
                    <div className="img-picker-wrap">
                      <label className="img-picker-btn" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') (e.currentTarget.querySelector('input') as HTMLInputElement)?.click() }}>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setPendingImageFiles((prev) => ({ ...prev, [field.name]: file }));
                            setDocumentValues((prev) => ({ ...prev, [field.name]: file.name }));
                            e.target.value = '';
                          }}
                        />
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                        </svg>
                        {pendingImageFiles[field.name] ? 'Change image' : 'Choose image'}
                      </label>
                      {pendingImageFiles[field.name] ? (
                        <div className="img-picker-preview">
                          <img
                            src={URL.createObjectURL(pendingImageFiles[field.name])}
                            alt="preview"
                            className="img-picker-thumb"
                          />
                          <span className="img-picker-filename">{pendingImageFiles[field.name].name}</span>
                          <button
                            type="button"
                            className="img-picker-clear"
                            onClick={() => {
                              setPendingImageFiles((prev) => { const n = { ...prev }; delete n[field.name]; return n; });
                              setDocumentValues((prev) => ({ ...prev, [field.name]: '' }));
                            }}
                            aria-label="Remove image"
                          >✕</button>
                        </div>
                      ) : (
                        <span className="img-picker-empty">No image selected — will be uploaded on submit</span>
                      )}
                    </div>
                  ) : (
                    <input
                      className="form-input"
                      type={field.type === 'number' ? 'number' : field.type === 'timestamp' ? 'datetime-local' : 'text'}
                      value={documentValues[field.name] ?? ''}
                      placeholder={field.type === 'object' ? '{ "key": "value" }' : field.type === 'array' ? '["item"]' : undefined}
                      onChange={(event) => setDocumentValues((current) => ({ ...current, [field.name]: event.target.value }))}
                    />
                  )}
                </div>
              ))}
              {collectionFields.length === 1 && <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Firestore will generate the document ID.</p>}
              {documentSubmitError && <p className="error-message" style={{ marginBottom: '16px' }}>{documentSubmitError}</p>}
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddDocumentModal(false)} disabled={submittingDocument}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ backgroundColor: '#0284c7' }} disabled={submittingDocument}>
                  {submittingDocument ? 'Adding...' : 'Add Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Document Modal ───────────────────────────────────────────── */}
      {showEditDocumentModal && (
        <div className="modal-overlay" onClick={() => setShowEditDocumentModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Document</h3>
              <button className="modal-close" onClick={() => setShowEditDocumentModal(false)}>✕</button>
            </div>
            <form onSubmit={handleEditDocument}>
              {collectionFields.filter((field) => field.name && field.name !== 'id').map((field) => (
                <div className="form-group" key={field.name}>
                  <label className="form-label">{field.name} <span style={{ color: '#64748b' }}>({field.type})</span></label>
                  {field.type === 'boolean' ? (
                    <select className="form-select" value={editDocumentValues[field.name] ?? 'false'} onChange={(e) => setEditDocumentValues((c) => ({ ...c, [field.name]: e.target.value }))}>
                      <option value="false">false</option><option value="true">true</option>
                    </select>
                  ) : field.type === 'image' ? (
                    <div className="img-picker-wrap">
                      {(() => {
                        const pending = editPendingImageFiles[field.name];
                        const existingRef = editDocumentValues[field.name];
                        const existingUrl = existingRef
                          ? buildR2ImageUrl(existingRef, { accountId: r2AccountId, customDomain: r2CustomDomain, bucketName: r2BucketName })
                          : null;

                        if (pending) {
                          return (
                            <div className="img-edit-preview">
                              <div className="img-edit-thumb-wrap">
                                <img src={URL.createObjectURL(pending)} alt="new preview" className="img-edit-thumb" />
                                <span className="img-edit-badge new">New</span>
                              </div>
                              <div className="img-edit-meta">
                                <span className="img-picker-filename">{pending.name}</span>
                                <button
                                  type="button"
                                  className="img-edit-revert"
                                  onClick={() => {
                                    setEditPendingImageFiles((p) => { const n = { ...p }; delete n[field.name]; return n; });
                                    setEditDocumentValues((p) => ({ ...p, [field.name]: existingRef ?? '' }));
                                  }}
                                >
                                  ↩ Revert to current
                                </button>
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                id={`edit-img-${field.name}`}
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  setEditPendingImageFiles((prev) => ({ ...prev, [field.name]: file }));
                                  setEditDocumentValues((prev) => ({ ...prev, [field.name]: file.name }));
                                  e.target.value = '';
                                }}
                              />
                            </div>
                          );
                        }

                        if (existingUrl) {
                          return (
                            <div className="img-edit-current">
                              <label className="img-edit-thumb-wrap" htmlFor={`edit-img-${field.name}`} title="Click to replace">
                                <img src={existingUrl} alt="current" className="img-edit-thumb" />
                                <div className="img-edit-hover-overlay">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                                  </svg>
                                  Replace
                                </div>
                              </label>
                              <input
                                type="file"
                                accept="image/*"
                                id={`edit-img-${field.name}`}
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  setEditPendingImageFiles((prev) => ({ ...prev, [field.name]: file }));
                                  setEditDocumentValues((prev) => ({ ...prev, [field.name]: file.name }));
                                  e.target.value = '';
                                }}
                              />
                            </div>
                          );
                        }

                        return (
                          <label className="img-picker-btn" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') (e.currentTarget.querySelector('input') as HTMLInputElement)?.click() }}>
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setEditPendingImageFiles((prev) => ({ ...prev, [field.name]: file }));
                                setEditDocumentValues((prev) => ({ ...prev, [field.name]: file.name }));
                                e.target.value = '';
                              }}
                            />
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                            </svg>
                            Choose image
                          </label>
                        );
                      })()}
                    </div>
                  ) : (
                    <input
                      className="form-input"
                      type={field.type === 'number' ? 'number' : field.type === 'timestamp' ? 'datetime-local' : 'text'}
                      value={editDocumentValues[field.name] ?? ''}
                      placeholder={field.type === 'object' ? '{ "key": "value" }' : field.type === 'array' ? '["item"]' : undefined}
                      onChange={(e) => setEditDocumentValues((c) => ({ ...c, [field.name]: e.target.value }))}
                    />
                  )}
                </div>
              ))}
              {editDocumentError && <p className="error-message" style={{ marginBottom: '16px' }}>{editDocumentError}</p>}
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowEditDocumentModal(false)} disabled={submittingEditDocument}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ backgroundColor: '#7c3aed' }} disabled={submittingEditDocument}>
                  {submittingEditDocument ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
