import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { collection, getDocs, doc, setDoc, addDoc, deleteDoc, query, where } from 'firebase/firestore'
import { webforgeDb, db } from './lib/firebase'
import DynamicRenderer, {
  type ComponentNode,
  ensureUniqueIds,
  findNodeById,
  updateNodeById,
} from './components/DynamicRenderer'
import { PropertiesSidebar } from './components/PropertiesSidebar'
import { DataEditor } from './components/DataEditor'
import './index.css'

// ── Types ────────────────────────────────────────────────────────────────────
export interface FirestorePage {
  id: string
  name: string
  path: string
  isHome?: boolean
  status?: string
  params?: string[]
  data?: ComponentNode | null
}

export interface CollectionMeta {
  id: string
  name: string
  description?: string
  data?: {
    fields?: Array<{ name: string; type: string }>
  }
}

const PROJECT_ID = 'coco-preeth'
const PROJECT_NAME = 'coco preeth'
const PROJECT_LOGO: string = ""
const ADMIN_USERNAME: string = "admin"
const ADMIN_PASSWORD: string = "admin"
const R2_CONFIG = {"accountId":"71bc8f7c9330711ef38061c7728f06fd","bucketName":"default","accessKey":"f03794336a31f5b83d11a658430abcef","secretKey":"9b5d2508c50233fa536520eb68687dfd0b4e135fd3666a9d5bca058c3278cc5a","customDomain":"https://pub-7c0358b46be54ed2a9dab23e45071844.r2.dev"}

// ── Firestore helpers ────────────────────────────────────────────────────────
const pagesColRef = () => collection(webforgeDb, 'pages')
const pageDocRef = (id: string) => doc(webforgeDb, 'pages', id)

// ── Fetch all project pages from WebForge Firestore ─────────────────────────
async function fetchProjectPages(): Promise<FirestorePage[]> {
  try {
    console.log('[WebForge] Fetching project pages from Firestore | projectId:', PROJECT_ID)
    const q = query(pagesColRef(), where('projectId', '==', PROJECT_ID))
    const snap = await getDocs(q)
    console.log('[WebForge] Pages fetched:', snap.size)
    const pages: FirestorePage[] = snap.docs.map((d) => {
      const data = d.data()
      return {
        id: d.id,
        name: data.name || 'Untitled Page',
        path: data.path ? (data.path.startsWith('/') ? data.path : '/' + data.path) : '/',
        isHome: Boolean(data.isHome),
        status: data.status || 'published',
        params: data.params || [],
        data: (data.data as ComponentNode) || null,
      }
    })

    return pages.sort((a, b) => {
      if (a.isHome && !b.isHome) return -1
      if (!a.isHome && b.isHome) return 1
      return a.name.localeCompare(b.name)
    })
  } catch (e) {
    console.error('[WebForge] fetchProjectPages error:', e)
    throw e
  }
}

// ── Fetch a single page schema by document id ────────────────────────────────
async function fetchPageSchema(pageId: string): Promise<ComponentNode | null> {
  try {
    console.log('[WebForge] Fetching page schema | pageId:', pageId, '| projectId:', PROJECT_ID)
    const q = query(pagesColRef(), where('projectId', '==', PROJECT_ID))
    const snap = await getDocs(q)
    const docSnap = snap.docs.find((d) => d.id === pageId)
    if (!docSnap) {
      console.error('[WebForge] Page doc not found for id:', pageId)
      return null
    }
    const schema = docSnap.data()?.data ?? null
    return schema as ComponentNode | null
  } catch (e) {
    console.error('[WebForge] fetchPageSchema error:', e)
    return null
  }
}

// ── Public page view for routes ──────────────────────────────────────────────
function DynamicPageView({ pageId, initialSchema }: { pageId: string; initialSchema?: ComponentNode | null }) {
  const [schema, setSchema] = useState<ComponentNode | null>(initialSchema ?? null)
  const [loading, setLoading] = useState(!initialSchema)
  const [error, setError] = useState<string | null>(null)
  const pathParams = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const routeParams = useMemo(() => {
    const combined: Record<string, string> = { ...(pathParams as Record<string, string>) }
    searchParams.forEach((val, key) => {
      combined[key] = val
    })
    return combined
  }, [pathParams, searchParams])

  useEffect(() => {
    if (initialSchema) {
      setSchema(ensureUniqueIds(initialSchema))
      setLoading(false)
      return
    }
    setLoading(true)
    fetchPageSchema(pageId)
      .then((s) => {
        setSchema(s ? ensureUniqueIds(s) : null)
        setLoading(false)
      })
      .catch((e) => {
        setError(String(e))
        setLoading(false)
      })
  }, [pageId, initialSchema])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0a0a0f', color: '#64748b', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #1e293b', borderTopColor: '#7c5cfc', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontSize: '0.9rem' }}>Loading page from WebForge…</span>
      </div>
    )
  }

  if (error || !schema) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0a0a0f', color: '#f87171', flexDirection: 'column', gap: '12px' }}>
        <span style={{ fontSize: '2rem' }}>⚠️</span>
        <p style={{ fontSize: '0.9rem' }}>{error ? 'Failed to load page schema.' : 'Page not found.'}</p>
        <button className="btn btn-ghost" onClick={() => navigate('/')}>Return Home</button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#171717' }}>
      <DynamicRenderer
        config={schema}
        interactive={false}
        onNavigate={(path) => navigate(path)}
        routeParams={routeParams as Record<string, string>}
        firestoreDb={db}
        r2Config={R2_CONFIG}
      />
    </div>
  )
}

// ── Admin login page ─────────────────────────────────────────────────────────
function AdminLoginPage({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    setTimeout(() => {
      const validUser = ADMIN_USERNAME || 'admin'
      const validPass = ADMIN_PASSWORD || 'admin'

      if (username.trim() === validUser && password === validPass) {
        sessionStorage.setItem('webforge_admin_auth_' + PROJECT_ID, 'true')
        onLoginSuccess()
      } else {
        setError('Invalid admin username or password. Please try again.')
        setLoading(false)
      }
    }, 250)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      padding: '24px',
      fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
      color: '#0f172a'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '20px',
        padding: '40px 36px',
        boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.08), 0 0 1px 1px rgba(15, 23, 42, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          {PROJECT_LOGO && (PROJECT_LOGO.startsWith('http') || PROJECT_LOGO.startsWith('/') || PROJECT_LOGO.startsWith('data:')) ? (
            <img
              src={PROJECT_LOGO}
              alt={PROJECT_NAME}
              style={{
                maxHeight: '54px',
                maxWidth: '180px',
                objectFit: 'contain',
                borderRadius: '12px',
                marginBottom: '6px'
              }}
            />
          ) : (
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              boxShadow: '0 8px 20px rgba(79, 70, 229, 0.25)',
              marginBottom: '6px'
            }}>
              {PROJECT_LOGO || '🔒'}
            </div>
          )}
          <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            {PROJECT_NAME}
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
            Studio Admin &amp; Data Management Portal
          </p>
        </div>

        {error && (
          <div style={{
            padding: '12px 14px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '10px',
            color: '#dc2626',
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 500
          }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
              Admin Username
            </label>
            <input
              type="text"
              autoFocus
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              style={{
                width: '100%',
                padding: '11px 14px',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                color: '#0f172a',
                fontSize: '0.92rem',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s, box-shadow 0.15s, background-color 0.15s'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
              Admin Password
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                style={{
                  width: '100%',
                  padding: '11px 42px 11px 14px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  color: '#0f172a',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s, box-shadow 0.15s, background-color 0.15s'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '6px',
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              border: 'none',
              borderRadius: '10px',
              color: '#ffffff',
              fontSize: '0.94rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'transform 0.1s, box-shadow 0.15s'
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Studio Admin'}
          </button>
        </form>

        <div style={{ textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: '0.84rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            ← Return to Public Website
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Admin editor page ─────────────────────────────────────────────────────────
function AdminPage({ onPagesUpdated }: { onPagesUpdated?: () => void }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('webforge_admin_auth_' + PROJECT_ID) === 'true'
  })

  if (!isAuthenticated) {
    return <AdminLoginPage onLoginSuccess={() => setIsAuthenticated(true)} />
  }

  const handleLogout = () => {
    sessionStorage.removeItem('webforge_admin_auth_' + PROJECT_ID)
    setIsAuthenticated(false)
  }

  const navigate = useNavigate()
  const [pagesOpen, setPagesOpen] = useState(true)
  const [dataOpen, setDataOpen] = useState(true)
  const [activeSection, setActiveSection] = useState<'page' | 'collection' | 'settings'>('page')

  const [pages, setPages] = useState<{ id: string; name: string; path: string; isHome?: boolean }[]>([])
  const [pagesLoading, setPagesLoading] = useState(true)
  const [selectedPageId, setSelectedPageId] = useState<string>('')

  // Selected Page Schema Editor State
  const [schema, setSchema] = useState<ComponentNode | null>(null)
  const [pageLoading, setPageLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'canvas' | 'json'>('canvas')
  const [jsonText, setJsonText] = useState('')
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  // Collections metadata in WebForge Firestore
  const [cols, setCols] = useState<CollectionMeta[]>([])
  const [colsLoading, setColsLoading] = useState(true)
  const [selectedColId, setSelectedColId] = useState<string>('')
  const [showAddColModal, setShowAddColModal] = useState(false)
  const [newColName, setNewColName] = useState('')
  const [newColDesc, setNewColDesc] = useState('')

  const selectedPage = pages.find((p) => p.id === selectedPageId)
  const selectedCol = cols.find((c) => c.id === selectedColId)

  // ── Fetch Pages for Admin ──────────────────────────────────────────────────
  const loadAdminPages = useCallback(async () => {
    setPagesLoading(true)
    try {
      const fetched = await fetchProjectPages()
      setPages(fetched)
      setSelectedPageId((curr) => curr || (fetched.length > 0 ? fetched[0].id : ''))
    } catch (e) {
      console.error('Error loading admin pages:', e)
    } finally {
      setPagesLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAdminPages()
  }, [loadAdminPages])

  // ── Fetch Collections for Admin ───────────────────────────────────────────
  const loadAdminCols = useCallback(async () => {
    setColsLoading(true)
    try {
      const q = query(collection(webforgeDb, 'collections'), where('projectId', '==', PROJECT_ID))
      const snap = await getDocs(q)
      const fetched = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as CollectionMeta[]
      setCols(fetched)
      setSelectedColId((curr) => curr || (fetched.length > 0 ? fetched[0].id : ''))
    } catch (e) {
      console.error('Error loading collections:', e)
    } finally {
      setColsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAdminCols()
  }, [loadAdminCols])

  const loadPage = useCallback(async (id: string) => {
    setPageLoading(true)
    setSelectedNodeId(null)
    setJsonError(null)
    const s = await fetchPageSchema(id)
    const safe = s ? ensureUniqueIds(s) : null
    setSchema(safe)
    setJsonText(safe ? JSON.stringify(safe, null, 2) : '')
    setPageLoading(false)
  }, [])

  useEffect(() => {
    if (selectedPageId && activeSection === 'page') loadPage(selectedPageId)
  }, [selectedPageId, activeSection])

  const handleJsonChange = (val: string) => {
    setJsonText(val)
    try {
      setSchema(ensureUniqueIds(JSON.parse(val)))
      setJsonError(null)
    } catch (e) {
      setJsonError(e instanceof Error ? e.message : 'Invalid JSON')
    }
  }

  const handleSelectNode = (node: ComponentNode) => setSelectedNodeId(node.id ?? null)
  const selectedNode = schema ? findNodeById(schema, selectedNodeId) : null

  const handleUpdateNode = (updatedFields: Partial<ComponentNode>) => {
    if (!selectedNodeId || !schema) return
    const next = updateNodeById(schema, selectedNodeId, updatedFields)
    setSchema(next)
    setJsonText(JSON.stringify(next, null, 2))
    if (updatedFields.id) setSelectedNodeId(updatedFields.id as string)
  }

  const handleSave = async () => {
    if (!schema || !selectedPageId) return
    setSaving(true)
    setSaveMsg(null)
    try {
      await setDoc(pageDocRef(selectedPageId), { data: schema }, { merge: true })
      setSaveMsg('✅ Saved')
      onPagesUpdated?.()
    } catch (e) {
      setSaveMsg('❌ Failed: ' + String(e))
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMsg(null), 3000)
    }
  }

  const deleteNodeRecursive = (root: ComponentNode, targetId: string): ComponentNode | null => {
    if (root.id === targetId) return null
    if ('children' in root && Array.isArray((root as any).children)) {
      return {
        ...root,
        children: (root as any).children
          .map((child: ComponentNode) => deleteNodeRecursive(child, targetId))
          .filter(Boolean) as ComponentNode[],
      }
    }
    if ('child' in root && (root as any).child) {
      const updatedChild = deleteNodeRecursive((root as any).child, targetId)
      return {
        ...root,
        child: updatedChild || undefined,
      }
    }
    return root
  }

  const handleDeleteNode = () => {
    if (!selectedNodeId || !schema) return
    const next = deleteNodeRecursive(schema, selectedNodeId)
    setSchema(next)
    setSelectedNodeId(null)
    setJsonText(next ? JSON.stringify(next, null, 2) : '')
  }

  const handleCreateCollection = async () => {
    if (!newColName.trim()) return
    try {
      const name = newColName.trim().toLowerCase()
      const colData = {
        projectId: PROJECT_ID,
        name,
        description: newColDesc.trim(),
        createdAt: new Date().toISOString(),
        data: { fields: [{ name: 'id', type: 'string' }] },
      }
      const ref = await addDoc(collection(webforgeDb, 'collections'), colData)
      const newColItem: CollectionMeta = { id: ref.id, ...colData }
      setCols((prev) => [...prev, newColItem])
      setSelectedColId(ref.id)
      setActiveSection('collection')
      setShowAddColModal(false)
      setNewColName('')
      setNewColDesc('')
    } catch (e) {
      alert('Error creating collection: ' + (e instanceof Error ? e.message : String(e)))
    }
  }

  return (
    <div className="admin-layout">
      {/* ══ SIDEBAR ══════════════════════════════════════════════════════════ */}
      <aside className="admin-sidebar">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <button className="btn btn-ghost" style={{ justifyContent: 'flex-start', fontSize: '0.78rem', color: '#818cf8', padding: '4px 8px' }} onClick={() => navigate('/')}>
            ← View Website
          </button>
          <button className="btn btn-ghost" style={{ fontSize: '0.78rem', color: '#f87171', padding: '4px 8px' }} onClick={handleLogout} title="Log Out of Admin">
            🚪 Log Out
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          {PROJECT_LOGO ? (
            (PROJECT_LOGO.startsWith('http') || PROJECT_LOGO.startsWith('/') || PROJECT_LOGO.startsWith('data:')) ? (
              <img src={PROJECT_LOGO} alt={PROJECT_NAME} style={{ width: '24px', height: '24px', objectFit: 'contain', borderRadius: '6px' }} />
            ) : (
              <span style={{ fontSize: '1.1rem' }}>{PROJECT_LOGO}</span>
            )
          ) : (
            <span style={{ fontSize: '1.1rem' }}>🌐</span>
          )}
          <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#f8fafc' }}>{PROJECT_NAME}</span>
        </div>

        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: '10px' }}>
          Navigation & Data
        </div>

        {/* ── PAGES TREE NODE ── */}
        <div className="tree-node">
          <div className="tree-node-header" onClick={() => setPagesOpen((o) => !o)}>
            <div className="tree-node-left">
              <span className={`tree-chevron ${pagesOpen ? 'open' : ''}`}>▶</span>
              <span style={{ fontSize: '1rem' }}>📁</span>
              <span className="tree-node-title">Pages</span>
              <span className="tree-badge">{pages.length}</span>
            </div>
          </div>
          {pagesOpen && (
            <div className="tree-children-container">
              {pagesLoading && <div style={{ fontSize: '0.75rem', color: '#475569', padding: '4px 8px' }}>Loading Firestore…</div>}
              {!pagesLoading && pages.length === 0 && <div style={{ fontSize: '0.75rem', color: '#475569', padding: '4px 8px' }}>No pages found.</div>}
              {pages.map((p) => {
                const active = activeSection === 'page' && p.id === selectedPageId
                return (
                  <div
                    key={p.id}
                    className={`tree-item ${active ? 'active' : ''}`}
                    onClick={() => {
                      setActiveSection('page')
                      setSelectedPageId(p.id)
                    }}
                  >
                    <div className="tree-item-left">
                      <span className="tree-item-icon">{active ? '⚡' : '📄'}</span>
                      <span className="tree-item-name">{p.name}</span>
                    </div>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.62rem', color: '#818cf8', background: 'rgba(124,92,252,0.12)', padding: '1px 5px', borderRadius: '4px', flexShrink: 0 }}>
                      {p.path}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── DATA TREE NODE (Project Firestore collections) ── */}
        <div className="tree-node">
          <div className="tree-node-header" onClick={() => setDataOpen((o) => !o)}>
            <div className="tree-node-left">
              <span className={`tree-chevron ${dataOpen ? 'open' : ''}`}>▶</span>
              <span style={{ fontSize: '1rem' }}>🗄️</span>
              <span className="tree-node-title">Data</span>
              <span className="tree-badge" style={{ backgroundColor: 'rgba(56,189,248,0.15)', color: '#38bdf8', borderColor: 'rgba(56,189,248,0.3)' }}>
                {cols.length}
              </span>
            </div>
            <button
              className="btn-tree-add"
              onClick={(e) => {
                e.stopPropagation()
                setShowAddColModal(true)
              }}
              title="Add Custom Collection"
            >
              + Add
            </button>
          </div>
          {dataOpen && (
            <div className="tree-children-container">
              {colsLoading && <div style={{ fontSize: '0.75rem', color: '#475569', padding: '4px 8px' }}>Loading collections…</div>}
              {!colsLoading && cols.length === 0 && <div style={{ fontSize: '0.75rem', color: '#475569', padding: '4px 8px' }}>No collections yet.</div>}
              {cols.map((c) => {
                const active = activeSection === 'collection' && c.id === selectedColId
                return (
                  <div
                    key={c.id}
                    className={`tree-item ${active ? 'active' : ''}`}
                    onClick={() => {
                      setActiveSection('collection')
                      setSelectedColId(c.id)
                    }}
                  >
                    <div className="tree-item-left">
                      <span className="tree-item-icon">📦</span>
                      <span className="tree-item-name">{c.name}</span>
                    </div>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.62rem', color: '#64748b', background: 'rgba(255,255,255,0.05)', padding: '1px 5px', borderRadius: '4px', flexShrink: 0 }}>
                      col
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── SETTINGS NODE ── */}
        <div className="tree-node">
          <div
            className="tree-node-header"
            onClick={() => setActiveSection('settings')}
            style={{ cursor: 'pointer', background: activeSection === 'settings' ? 'rgba(124,92,252,0.12)' : undefined }}
          >
            <div className="tree-node-left">
              <span style={{ fontSize: '1rem' }}>⚙️</span>
              <span className="tree-node-title">Settings</span>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#64748b', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
              Config
            </span>
          </div>
        </div>
      </aside>

      {/* ══ MAIN CONTENT ═════════════════════════════════════════════════════ */}
      <div className="admin-main">
        {/* CASE 1: PAGE DESIGNER CANVAS */}
        {activeSection === 'page' && (
          <>
            <div className="admin-topbar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.95rem' }}>{selectedPage?.name ?? '—'}</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#818cf8', background: 'rgba(124,92,252,0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                  {selectedPage?.path ?? ''}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button className={`btn ${viewMode === 'canvas' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setViewMode('canvas')}>
                  Canvas
                </button>
                <button className={`btn ${viewMode === 'json' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setViewMode('json')}>
                  JSON
                </button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ marginLeft: '8px' }}>
                  {saving ? 'Saving…' : '💾 Save'}
                </button>
                {saveMsg && <span style={{ fontSize: '0.8rem', color: saveMsg.startsWith('✅') ? '#34d399' : '#f87171' }}>{saveMsg}</span>}
              </div>
            </div>
            <div className="admin-canvas" onClick={() => setSelectedNodeId(null)}>
              {pageLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#64748b', margin: 'auto' }}>
                  <div style={{ width: '24px', height: '24px', border: '2px solid #1e293b', borderTopColor: '#7c5cfc', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Loading schema…
                </div>
              )}
              {!pageLoading && viewMode === 'canvas' && schema && (
                <div style={{ width: '100%', maxWidth: '1200px' }}>
                  <DynamicRenderer
                    config={schema}
                    interactive={true}
                    selectedNodeId={selectedNodeId}
                    hoveredNodeId={hoveredNodeId}
                    onHoverNode={(id) => setHoveredNodeId(id)}
                    onSelectNode={handleSelectNode}
                    firestoreDb={db}
                    r2Config={R2_CONFIG}
                  />
                </div>
              )}
              {!pageLoading && viewMode === 'canvas' && !schema && (
                <div style={{ margin: 'auto', color: '#475569', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📭</div>
                  <p>No schema found. Switch to JSON tab to paste one or add components.</p>
                </div>
              )}
              {!pageLoading && viewMode === 'json' && (
                <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {jsonError && <div style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#f87171', fontSize: '0.8rem' }}>{jsonError}</div>}
                  <textarea
                    value={jsonText}
                    onChange={(e) => handleJsonChange(e.target.value)}
                    spellCheck={false}
                    style={{ width: '100%', minHeight: '70vh', background: '#020617', color: '#e2e8f0', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', fontFamily: 'monospace', fontSize: '13px', lineHeight: 1.6, resize: 'vertical', outline: 'none' }}
                  />
                </div>
              )}
            </div>
          </>
        )}

        {/* CASE 2: COLLECTION DATA DOCUMENTS MANAGER (Project Firestore) */}
        {activeSection === 'collection' && selectedCol && (
          <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <DataEditor
              collection={selectedCol as any}
              projectFirestore={db}
              onUpdateCollectionData={async (collectionId, data) => {
                await setDoc(doc(webforgeDb, 'collections', collectionId), { data, updatedAt: new Date().toISOString() }, { merge: true })
                setCols((current) => current.map((c) => c.id === collectionId ? { ...c, data } : c))
              }}
              isFirebaseConfigured={Boolean(db)}
              r2Config={R2_CONFIG}
            />
          </div>
        )}

        {/* CASE 3: SETTINGS CONFIGURATION */}
        {activeSection === 'settings' && (
          <div style={{ padding: '32px', color: '#e2e8f0', maxWidth: '650px', overflowY: 'auto' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>⚙️ Project & Cloud Settings</div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '24px' }}>
              Dual Firebase and Cloudflare R2 storage architecture configuration
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '16px', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '0.82rem' }}>
                <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>WebForge Firebase (Internal Metadata)</div>
                <div><span style={{ color: '#94a3b8' }}>Project ID:</span> <code style={{ color: '#818cf8' }}>webforge-studios</code></div>
                <div style={{ marginTop: '4px', color: '#64748b', fontSize: '0.75rem' }}>Used for page schemas, routes, and collection metadata.</div>
              </div>

              <div style={{ padding: '16px', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '0.82rem' }}>
                <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>Project Firebase (Website Data)</div>
                <div><span style={{ color: '#94a3b8' }}>Project ID:</span> <code style={{ color: '#38bdf8' }}></code></div>
                <div style={{ marginTop: '4px', color: '#64748b', fontSize: '0.75rem' }}>Used for products and all custom collection documents.</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══ PROPERTIES PANEL ═════════════════════════════════════════════════ */}
      {activeSection === 'page' && (
        <aside className="admin-props">
          <PropertiesSidebar
            selectedNode={selectedNode}
            onUpdateNode={handleUpdateNode}
            onDeleteNode={handleDeleteNode}
            onSelectNode={handleSelectNode}
            pageSchema={schema}
            syncStatus={saving ? 'syncing' : saveMsg?.includes('Failed') ? 'error' : 'synced'}
            r2Config={R2_CONFIG}
          />
        </aside>
      )}


      {/* ══ MODAL: ADD CUSTOM COLLECTION METADATA (webforgeDb) ═══════════════ */}
      {showAddColModal && (
        <div className="modal-overlay" onClick={() => setShowAddColModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.05rem', fontWeight: 700 }}>+ Add Custom Collection</h3>
              <button className="btn btn-ghost" style={{ padding: '2px 8px' }} onClick={() => setShowAddColModal(false)}>✕</button>
            </div>
            <div className="form-group">
              <label className="form-label">Collection Name (e.g. products, categories, reviews)</label>
              <input
                type="text"
                className="form-input"
                placeholder="products"
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description (optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Product inventory items"
                value={newColDesc}
                onChange={(e) => setNewColDesc(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
              <button className="btn btn-ghost" onClick={() => setShowAddColModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreateCollection} disabled={!newColName.trim()}>
                Create Collection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── App router with dynamic page routing from Firestore ─────────────────────
function AppRoutes() {
  const [pages, setPages] = useState<FirestorePage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const loadPages = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const fetched = await fetchProjectPages()
      setPages(fetched)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to connect to WebForge Firestore')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPages()
  }, [loadPages])

  if (loading) {
    return <div style={{ minHeight: '100vh', background: '#ffffff' }} />
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#ffffff', color: '#dc2626', flexDirection: 'column', gap: '16px', padding: '24px', textAlign: 'center' }}>
        <span style={{ fontSize: '2.5rem' }}>⚠️</span>
        <h2 style={{ fontSize: '1.2rem', color: '#111827' }}>Error Loading Pages</h2>
        <p style={{ maxWidth: '500px', fontSize: '0.85rem', color: '#6b7280' }}>{error}</p>
        <button style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }} onClick={loadPages}>Retry</button>
      </div>
    )
  }

  const homePage = pages.find((p) => p.isHome) || pages.find((p) => p.path === '/') || pages[0]
  const hasRootRoute = pages.some((p) => p.path === '/')

  return (
    <Routes>
      {/* Dynamic routes fetched from WebForge Firestore */}
      {pages.map((page) => (
        <Route
          key={page.id}
          path={page.path}
          element={<DynamicPageView pageId={page.id} initialSchema={page.data} />}
        />
      ))}

      {/* Fallback root route if no page is explicitly mapped to '/' */}
      {!hasRootRoute && homePage && (
        <Route
          path="/"
          element={<DynamicPageView pageId={homePage.id} initialSchema={homePage.data} />}
        />
      )}

      {/* Studio Admin Suite */}
      <Route path="/admin" element={<AdminPage onPagesUpdated={loadPages} />} />
      <Route path="/admin/*" element={<AdminPage onPagesUpdated={loadPages} />} />

      {/* Catch-all route */}
      <Route
        path="*"
        element={
          homePage ? (
            <DynamicPageView pageId={homePage.id} initialSchema={homePage.data} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0a0a0f', color: '#f87171', flexDirection: 'column', gap: '16px' }}>
              <span style={{ fontSize: '2.5rem' }}>📭</span>
              <p style={{ fontSize: '1rem', color: '#e2e8f0' }}>No pages found for project <code>{PROJECT_ID}</code>.</p>
              <button className="btn btn-primary" onClick={() => navigate('/admin')}>Open Studio Editor</button>
            </div>
          )
        }
      />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
