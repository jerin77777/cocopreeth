import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

const GOOGLE_REVIEWS = [
  {
    id: 1,
    name: "manoj menon",
    avatar: "M",
    date: "8 months ago",
    stars: 5,
    text: "This is one of the best farm stays ever compared to any other place around bangalore. No matter how u go there,either couple or with friends or family.....you will for sure get ur weekend fulfilled with peacefulness and happiness as the place is surrounded with full of different plants and trees and various animals to enjoy with. I especially have to mention about the warm welcome and the way there treated us with full care and in a most friendly manner and the owner guided us with all the activities present there and he made us realize that its our own home for that day.Even he stood by our side on helping find auto and arranging while we were returning to our home. I will be giving 10 star to this place but unfortunately only 5 is present. The place reminds u of a old vibe with well maintained place and it was really mind blowing surprise for us after seeing the place.we enjoyed a lot there and we really appreciate the way they carry forward the place and maintain it so well.😊"
  },
  {
    id: 2,
    name: "ananya sharma",
    avatar: "A",
    date: "3 months ago",
    stars: 5,
    text: "A truly magical getaway. The farmhouse is clean, beautifully furnished, and the attention to detail is remarkable. The children had a wonderful time learning about organic vegetable farming and feeding the white horse. The host cooked us traditional organic food that was absolutely mouth-watering. 10/10 highly recommended for families looking to detox from screen time!"
  },
  {
    id: 3,
    name: "david miller",
    avatar: "D",
    date: "1 year ago",
    stars: 5,
    text: "Exceeded all expectations. Sitting on the vine-covered terrace at sunset with a cup of fresh tea was worth the trip alone. The rooms were spotless, comfortable, and had a lovely vintage aesthetic with modern facilities. The staff treats you like family. Will definitely return next winter!"
  }
];

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Track page scroll to shrink the navigation bar slightly
  const [scrolled, setScrolled] = useState(false)
  const [activeReviewIndex, setActiveReviewIndex] = useState(0)

  // --- STATE FOR HOME PAGE CONTENT AND DYNAMIC ADMIN CONTROL ---
  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem('cocopreeth_reviews')
    return saved ? JSON.parse(saved) : GOOGLE_REVIEWS
  })

  const [siteSettings, setSiteSettings] = useState(() => {
    const saved = localStorage.getItem('cocopreeth_settings')
    return saved ? JSON.parse(saved) : {
      hero_title: "Escape. Relax. Reconnect.",
      hero_desc: "Experience the perfect blend of nature, comfort and tranquility at COCO Preeth farmhouse. Slow down, breathe the clean air, and rediscover rural serenity.",
      about_subtitle: "About Us",
      about_title: "A Farm House Like No Other",
      about_text: "At COCO Preeth Farm House, we offer more than just a getaway. It's a sanctuary where you can escape the noise of city life, breathe pure mountain air, and engage with the peaceful rhythms of agricultural life. Whether you are strolling in our organic plantation, reading on our scenic terrace, or tasting pure farm-fresh ingredients, COCO Preeth is where lasting memories are grown.",
      hero_bg: "/images/hero_background.png",
      about_terrace: "/images/about_terrace.png",
      visible_sections: {
        hero: true,
        highlights: true,
        about: true,
        experiences: true,
        gallery: true,
        reviews: true,
        location: true
      },
      experiences: [
        { id: 1, title: "Barbecue & Camp Fire", desc: "Delicious barbecue, cozy conversations and warm campfire nights.", bgImage: "/images/activity_barbecue.png" },
        { id: 2, title: "Mountain Biking", desc: "Hit the trails and feel the thrill of mountain biking through scenic routes.", bgImage: "/images/activity_biking.png" },
        { id: 3, title: "Plantation Tour", desc: "Explore our lush organic plantations and learn about sustainable farming.", bgImage: "/images/activity_plantation.png" },
        { id: 4, title: "Nature Walks", desc: "Discover local wildlife and bird species on guided walking trails.", bgImage: "/images/activity_nature_walk.png" }
      ],
      gallery: [
        { id: 1, img: "/images/gallery_farmhouse.png", caption: "The Main House", sub: "Rustic Architecture" },
        { id: 2, img: "/images/gallery_farming.png", caption: "Organic Produce", sub: "Farm to Table" },
        { id: 3, img: "/images/gallery_bedroom.png", caption: "Comfortable Rooms", sub: "Modern Cozy Stay" },
        { id: 4, img: "/images/gallery_tea.png", caption: "Sunrise Breakfast", sub: "Scenic Dining" },
        { id: 5, img: "/images/gallery_horse.png", caption: "Meadow Companions", sub: "Horse Stable" }
      ]
    }
  })

  // Simulated page views, persists/increments in localStorage
  const [pageViews, setPageViews] = useState(() => {
    const saved = localStorage.getItem('cocopreeth_pageviews')
    const current = saved ? parseInt(saved, 10) : 3418
    return current
  })

  const DEFAULT_BOOKINGS = [
    { id: 1, name: "Alice Johnson", email: "alice@example.com", phone: "+91 98765 00001", checkIn: "2026-07-10", checkOut: "2026-07-15", guests: 3, status: "confirmed", createdAt: "2026-06-20T10:30:00" },
    { id: 2, name: "Bob Smith", email: "bob@example.com", phone: "+91 98765 00002", checkIn: "2026-07-18", checkOut: "2026-07-20", guests: 2, status: "pending", createdAt: "2026-06-22T14:45:00" },
    { id: 3, name: "Charlie Dev", email: "charlie@example.com", phone: "+91 98765 00003", checkIn: "2026-08-01", checkOut: "2026-08-04", guests: 4, status: "confirmed", createdAt: "2026-06-23T09:15:00" }
  ]

  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('cocopreeth_bookings')
    return saved ? JSON.parse(saved) : DEFAULT_BOOKINGS
  })

  // Fetch settings from Supabase projects table on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('structure')
          .eq('name', 'COCO Preeth Farmhouse Portal')
          .single()

        if (error) {
          console.error("Error fetching settings from database:", error)
          return
        }

        if (data && data.structure && data.structure.settings) {
          setSiteSettings(data.structure.settings)
        }
      } catch (err) {
        console.error("Failed to fetch settings from Supabase:", err)
      }
    }
    fetchSettings()
  }, [])

  // Save to localStorage when states change
  useEffect(() => {
    localStorage.setItem('cocopreeth_reviews', JSON.stringify(reviews))
  }, [reviews])

  useEffect(() => {
    localStorage.setItem('cocopreeth_settings', JSON.stringify(siteSettings))
  }, [siteSettings])

  useEffect(() => {
    localStorage.setItem('cocopreeth_bookings', JSON.stringify(bookings))
  }, [bookings])

  // Increment page view once when user visits home
  useEffect(() => {
    if (currentPath !== '/admin') {
      const nextViews = pageViews + 1
      setPageViews(nextViews)
      localStorage.setItem('cocopreeth_pageviews', nextViews.toString())
    }
  }, [currentPath])

  // --- ROUTING HANDLERS ---
  const navigate = (path: string) => {
    window.history.pushState({}, '', path)
    setCurrentPath(path)
  }

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // --- REVIEW CAROUSEL ACTIONS ---
  const nextReview = () => {
    if (reviews.length === 0) return
    setActiveReviewIndex((prevIndex) => (prevIndex + 1) % reviews.length)
  }

  const prevReview = () => {
    if (reviews.length === 0) return
    setActiveReviewIndex((prevIndex) => (prevIndex - 1 + reviews.length) % reviews.length)
  }

  // --- BOOKING MODAL ACTIONS ---
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    guests: 2
  })
  const [bookingSuccess, setBookingSuccess] = useState(false)

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!bookingForm.name || !bookingForm.email || !bookingForm.phone || !bookingForm.checkIn || !bookingForm.checkOut) {
      alert("Please fill in all fields.")
      return
    }

    const newBooking = {
      id: Date.now(),
      ...bookingForm,
      status: 'pending',
      createdAt: new Date().toISOString()
    }

    setBookings([newBooking, ...bookings])
    setBookingSuccess(true)
    setBookingForm({
      name: '',
      email: '',
      phone: '',
      checkIn: '',
      checkOut: '',
      guests: 2
    })
  }

  // --- ADMIN CONTROL PANEL STATE & ACTIONS ---
  const [activeAdminTab, setActiveAdminTab] = useState('dashboard')
  const [toast, setToast] = useState<string | null>(null)
  
  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  // Review editor state
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null)
  const [reviewForm, setReviewForm] = useState({
    name: '',
    avatar: '',
    date: 'Just now',
    stars: 5,
    text: ''
  })

  // Copy editing state
  const [copyForm, setCopyForm] = useState<any>({ ...siteSettings })
  const [uploadingImage, setUploadingImage] = useState<string | null>(null)
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false)
  const [editingActivityIndex, setEditingActivityIndex] = useState<number | null>(null)
  const [activityForm, setActivityForm] = useState({
    title: '',
    desc: '',
    bgImage: ''
  })
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false)
  const [editingGalleryIndex, setEditingGalleryIndex] = useState<number | null>(null)
  const [galleryForm, setGalleryForm] = useState({
    caption: '',
    sub: '',
    img: ''
  })

  useEffect(() => {
    setCopyForm({ ...siteSettings })
  }, [siteSettings])

  const handleImageUpload = async (file: File, onUploadSuccess: (url: string) => void) => {
    try {
      setUploadingImage(file.name)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`
      const filePath = `${fileName}`

      const { error } = await supabase.storage
        .from('images')
        .upload(filePath, file)

      if (error) {
        throw error
      }

      const { data: publicUrlData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      onUploadSuccess(publicUrlData.publicUrl)
      showToast(`Uploaded ${file.name} successfully!`)
    } catch (err: any) {
      console.error(err)
      alert(`Error uploading image: ${err.message || err}`)
    } finally {
      setUploadingImage(null)
    }
  }

  const handleSaveCopy = async (e: React.FormEvent) => {
    e.preventDefault()
    setSiteSettings(copyForm)
    
    try {
      // Fetch the current project configuration to preserve other structure keys
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('structure')
        .eq('name', 'COCO Preeth Farmhouse Portal')
        .single()

      if (fetchError) {
        showToast("Error updating copy settings: " + fetchError.message)
        return
      }

      const updatedStructure = {
        ...data.structure,
        settings: copyForm
      }

      const { error: updateError } = await supabase
        .from('projects')
        .update({ structure: updatedStructure })
        .eq('name', 'COCO Preeth Farmhouse Portal')

      if (updateError) {
        showToast("Error saving copy: " + updateError.message)
      } else {
        showToast("Website copy updated successfully in database!")
      }
    } catch (err: any) {
      showToast("Failed to save to database: " + (err.message || err))
    }
  }

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewForm.name || !reviewForm.text) {
      showToast("Name and text are required.")
      return
    }

    const avatar = reviewForm.name.trim().charAt(0).toUpperCase() || 'U'

    if (editingReviewId !== null) {
      setReviews(reviews.map((r: any) => r.id === editingReviewId ? { ...r, ...reviewForm, avatar } : r))
      setEditingReviewId(null)
      showToast("Review updated successfully!")
    } else {
      const newReview = {
        id: Date.now(),
        ...reviewForm,
        avatar
      }
      setReviews([newReview, ...reviews])
      showToast("New review added!")
    }

    setReviewForm({
      name: '',
      avatar: '',
      date: 'Just now',
      stars: 5,
      text: ''
    })
    setActiveReviewIndex(0)
  }

  const handleEditReviewClick = (review: any) => {
    setEditingReviewId(review.id)
    setReviewForm({
      name: review.name,
      avatar: review.avatar || '',
      date: review.date,
      stars: review.stars,
      text: review.text
    })
  }

  const handleDeleteReview = (id: number) => {
    if (confirm("Are you sure you want to delete this review?")) {
      setReviews(reviews.filter((r: any) => r.id !== id))
      setActiveReviewIndex(0)
      showToast("Review deleted.")
    }
  }

  const handleUpdateBookingStatus = (id: number, status: string) => {
    setBookings(bookings.map((b: any) => b.id === id ? { ...b, status } : b))
    showToast(`Booking status updated to ${status}.`)
  }

  const handleDeleteBooking = (id: number) => {
    if (confirm("Are you sure you want to delete this booking inquiry?")) {
      setBookings(bookings.filter((b: any) => b.id !== id))
      showToast("Booking inquiry deleted.")
    }
  }

  const openAddActivityModal = () => {
    setEditingActivityIndex(null)
    setActivityForm({ title: '', desc: '', bgImage: '' })
    setIsActivityModalOpen(true)
  }

  const openEditActivityModal = (activity: any, index: number) => {
    setEditingActivityIndex(index)
    setActivityForm({
      title: activity.title || '',
      desc: activity.desc || '',
      bgImage: activity.bgImage || ''
    })
    setIsActivityModalOpen(true)
  }

  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activityForm.title.trim()) {
      showToast("Activity title is required.")
      return
    }

    const activities = [...(copyForm.experiences || [])]
    const activityData = {
      id: editingActivityIndex !== null ? activities[editingActivityIndex]?.id : Date.now(),
      ...activityForm
    }

    if (editingActivityIndex !== null) {
      activities[editingActivityIndex] = activityData
      showToast("Activity updated. Save settings to publish.")
    } else {
      activities.push(activityData)
      showToast("Activity added. Save settings to publish.")
    }

    setCopyForm({ ...copyForm, experiences: activities })
    setIsActivityModalOpen(false)
  }

  const handleDeleteActivity = (index: number) => {
    if (confirm("Delete this activity?")) {
      const activities = [...(copyForm.experiences || [])]
      activities.splice(index, 1)
      setCopyForm({ ...copyForm, experiences: activities })
      showToast("Activity deleted. Save settings to publish.")
    }
  }

  const openAddGalleryModal = () => {
    setEditingGalleryIndex(null)
    setGalleryForm({ caption: '', sub: '', img: '' })
    setIsGalleryModalOpen(true)
  }

  const openEditGalleryModal = (galleryItem: any, index: number) => {
    setEditingGalleryIndex(index)
    setGalleryForm({
      caption: galleryItem.caption || '',
      sub: galleryItem.sub || '',
      img: galleryItem.img || ''
    })
    setIsGalleryModalOpen(true)
  }

  const handleSaveGalleryItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!galleryForm.caption.trim()) {
      showToast("Gallery caption is required.")
      return
    }

    const gallery = [...(copyForm.gallery || [])]
    const galleryData = {
      id: editingGalleryIndex !== null ? gallery[editingGalleryIndex]?.id : Date.now(),
      ...galleryForm
    }

    if (editingGalleryIndex !== null) {
      gallery[editingGalleryIndex] = galleryData
      showToast("Gallery photo updated. Save settings to publish.")
    } else {
      gallery.push(galleryData)
      showToast("Gallery photo added. Save settings to publish.")
    }

    setCopyForm({ ...copyForm, gallery })
    setIsGalleryModalOpen(false)
  }

  const handleDeleteGalleryItem = (index: number) => {
    if (confirm("Delete this gallery photo?")) {
      const gallery = [...(copyForm.gallery || [])]
      gallery.splice(index, 1)
      setCopyForm({ ...copyForm, gallery })
      showToast("Gallery photo deleted. Save settings to publish.")
    }
  }

  const isSectionVisible = (section: string) => siteSettings.visible_sections?.[section] !== false
  const isCopySectionVisible = (section: string) => copyForm.visible_sections?.[section] !== false

  const toggleCopySection = (section: string) => {
    setCopyForm({
      ...copyForm,
      visible_sections: {
        ...copyForm.visible_sections,
        [section]: !isCopySectionVisible(section)
      }
    })
  }

  const renderAdminSectionHeader = (title: string, section: string, extraStyle = {}) => (
    <div className="admin-content-section-header" style={extraStyle}>
      <h4>{title}</h4>
      <button
        type="button"
        className={`admin-switch ${isCopySectionVisible(section) ? 'active' : ''}`}
        role="switch"
        aria-checked={isCopySectionVisible(section)}
        onClick={() => toggleCopySection(section)}
      >
        <span className="admin-switch-track">
          <span className="admin-switch-thumb" />
        </span>
      </button>
    </div>
  )

  // --- WINDOW SCROLL EFFECT ---
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // --- RENDER ADMIN ROUTE ---
  if (currentPath === '/admin') {
    const pendingCount = bookings.filter((b: any) => b.status === 'pending').length
    const confirmedCount = bookings.filter((b: any) => b.status === 'confirmed').length
    
    return (
      <div className="admin-body">
        <div className="admin-layout">
          {/* Sidebar */}
          <aside className="admin-sidebar">
            <div className="admin-sidebar-header">
              <svg className="admin-logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <div>
                <h2 className="admin-sidebar-title">COCO Preeth</h2>
                <span className="admin-sidebar-subtitle">Control Panel</span>
              </div>
            </div>

            <nav className="admin-nav">
              <button 
                className={`admin-nav-item ${activeAdminTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveAdminTab('dashboard')}
              >
                Dashboard
              </button>
              <button 
                className={`admin-nav-item ${activeAdminTab === 'bookings' ? 'active' : ''}`}
                onClick={() => setActiveAdminTab('bookings')}
              >
                Manage Bookings {pendingCount > 0 && <span style={{backgroundColor: '#ef4444', color: 'white', padding: '2px 6px', borderRadius: '50%', fontSize: '0.7rem', marginLeft: 'auto'}}>{pendingCount}</span>}
              </button>
              <button 
                className={`admin-nav-item ${activeAdminTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveAdminTab('reviews')}
              >
                Google Reviews
              </button>
              <button 
                className={`admin-nav-item ${activeAdminTab === 'content' ? 'active' : ''}`}
                onClick={() => setActiveAdminTab('content')}
              >
                Website Copy
              </button>
            </nav>

            <div className="admin-sidebar-footer">
              <button className="btn-exit-admin" onClick={() => navigate('/')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Exit Portal
              </button>
            </div>
          </aside>

          {/* Main Dashboard Area */}
          <main className="admin-main">
            {/* Header */}
            <div className="admin-header">
              <div className="admin-header-title">
                <h1>
                  {activeAdminTab === 'dashboard' && 'Dashboard Overview'}
                  {activeAdminTab === 'bookings' && 'Manage Booking Inquiries'}
                  {activeAdminTab === 'reviews' && 'Google Reviews Manager'}
                  {activeAdminTab === 'content' && 'Edit Website Copy Settings'}
                </h1>
                <p>
                  {activeAdminTab === 'dashboard' && 'Key operational statistics and quick action items.'}
                  {activeAdminTab === 'bookings' && 'Confirm, complete, cancel or delete room reservations.'}
                  {activeAdminTab === 'reviews' && 'Add, edit, or remove customer feedback testimonials.'}
                  {activeAdminTab === 'content' && 'Customize headlines, hero text, and about descriptions.'}
                </p>
              </div>
            </div>

            {/* Content Renders */}
            {activeAdminTab === 'dashboard' && (
              <div>
                {/* Stats Grid */}
                <div className="admin-stats-grid">
                  <div className="admin-stat-card">
                    <svg className="admin-stat-card-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    <span className="admin-stat-label">Total Reservations</span>
                    <span className="admin-stat-value">{bookings.length}</span>
                    <span className="admin-stat-change up">{confirmedCount} Confirmed, {pendingCount} Pending</span>
                  </div>

                  <div className="admin-stat-card">
                    <svg className="admin-stat-card-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span className="admin-stat-label">Active Reviews</span>
                    <span className="admin-stat-value">{reviews.length}</span>
                    <span className="admin-stat-change up">★ 4.9 Average Rating</span>
                  </div>

                  <div className="admin-stat-card">
                    <svg className="admin-stat-card-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <span className="admin-stat-label">Page Visits</span>
                    <span className="admin-stat-value">{pageViews}</span>
                    <span className="admin-stat-change up">+12% Since yesterday</span>
                  </div>

                  <div className="admin-stat-card">
                    <svg className="admin-stat-card-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="20" x2="18" y2="10" />
                      <line x1="12" y1="20" x2="12" y2="4" />
                      <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                    <span className="admin-stat-label">Booking Rate</span>
                    <span className="admin-stat-value">{((bookings.length / pageViews) * 100).toFixed(1)}%</span>
                    <span className="admin-stat-change up">Conversion Stable</span>
                  </div>
                </div>

                <div className="admin-dashboard-row">
                  {/* Recent Bookings Panel */}
                  <div className="admin-section-card">
                    <div className="admin-section-header">
                      <h3 className="admin-section-title">Pending Booking Inquiries</h3>
                      <button className="btn-table-action-edit" onClick={() => setActiveAdminTab('bookings')}>View All</button>
                    </div>
                    <div className="admin-table-container">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Guest</th>
                            <th>Stay Dates</th>
                            <th>Guests</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookings.filter((b: any) => b.status === 'pending').slice(0, 3).map((booking: any) => (
                            <tr key={booking.id}>
                              <td style={{fontWeight: 600}}>{booking.name}</td>
                              <td>{booking.checkIn} to {booking.checkOut}</td>
                              <td>{booking.guests} Pax</td>
                              <td><span className="admin-badge pending">Pending</span></td>
                              <td>
                                <div className="admin-table-actions">
                                  <button className="btn-table-action-edit" onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}>Approve</button>
                                  <button className="btn-table-action-delete" onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}>Decline</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {bookings.filter((b: any) => b.status === 'pending').length === 0 && (
                            <tr>
                              <td colSpan={5} style={{textAlign: 'center', padding: '30px 0', color: '#94a3b8'}}>
                                No pending bookings found! All up-to-date.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Recent Reviews Sidebar Panel */}
                  <div className="admin-section-card">
                    <div className="admin-section-header">
                      <h3 className="admin-section-title">Latest Google Reviews</h3>
                      <button className="btn-table-action-edit" onClick={() => setActiveAdminTab('reviews')}>Manage</button>
                    </div>
                    <div>
                      {reviews.slice(0, 3).map((review: any) => (
                        <div key={review.id} className="quick-review-item">
                          <div className="quick-review-avatar">
                            {review.avatar || (review.name && review.name.charAt(0).toUpperCase())}
                          </div>
                          <div className="quick-review-content">
                            <div className="admin-flex-row" style={{marginBottom: '2px'}}>
                              <span className="quick-review-name">{review.name}</span>
                              <span style={{color: '#eab308', fontSize: '0.8rem'}}>{"★".repeat(review.stars)}</span>
                            </div>
                            <p className="quick-review-text">"{review.text}"</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeAdminTab === 'bookings' && (
              <div className="admin-section-card">
                <h3 className="admin-section-title" style={{marginBottom: '20px'}}>All Reservations List</h3>
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Guest</th>
                        <th>Contact Details</th>
                        <th>Dates (Check-in/Out)</th>
                        <th>Guests</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b: any) => (
                        <tr key={b.id}>
                          <td>
                            <div style={{fontWeight: 600, fontSize: '0.95rem'}}>{b.name}</div>
                            <div style={{fontSize: '0.75rem', color: '#64748b'}}>Submitted: {new Date(b.createdAt).toLocaleDateString()}</div>
                          </td>
                          <td>
                            <div>{b.email}</div>
                            <div style={{fontSize: '0.8rem', color: '#94a3b8'}}>{b.phone}</div>
                          </td>
                          <td>
                            <div style={{fontWeight: 500}}>{b.checkIn}</div>
                            <div style={{fontSize: '0.8rem', color: '#94a3b8'}}>to {b.checkOut}</div>
                          </td>
                          <td>{b.guests} Guests</td>
                          <td>
                            <span className={`admin-badge ${b.status}`}>
                              {b.status}
                            </span>
                          </td>
                          <td>
                            <div className="admin-table-actions">
                              {b.status === 'pending' && (
                                <button className="btn-table-action-edit" onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')}>Confirm</button>
                              )}
                              {b.status === 'confirmed' && (
                                <button className="btn-table-action-edit" style={{color: '#10b981'}} onClick={() => handleUpdateBookingStatus(b.id, 'completed')}>Complete</button>
                              )}
                              {b.status !== 'cancelled' && b.status !== 'completed' && (
                                <button className="btn-table-action-delete" onClick={() => handleUpdateBookingStatus(b.id, 'cancelled')}>Cancel</button>
                              )}
                              <button className="btn-table-action-delete" style={{marginLeft: '10px'}} onClick={() => handleDeleteBooking(b.id)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {bookings.length === 0 && (
                        <tr>
                          <td colSpan={6} style={{textAlign: 'center', padding: '40px 0', color: '#94a3b8'}}>
                            No booking inquiries received yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeAdminTab === 'reviews' && (
              <div className="admin-grid-2">
                {/* Form */}
                <div className="admin-form-card">
                  <h3 className="admin-section-title" style={{marginBottom: '20px'}}>
                    {editingReviewId ? 'Edit Review Post' : 'Add New Google Review'}
                  </h3>
                  <form onSubmit={handleSaveReview}>
                    <div className="admin-form-group">
                      <label>Guest Name</label>
                      <input 
                        type="text" 
                        className="admin-form-input" 
                        placeholder="e.g. John Doe"
                        value={reviewForm.name} 
                        onChange={(e) => setReviewForm({...reviewForm, name: e.target.value})} 
                      />
                    </div>
                    <div className="admin-form-row-2" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                      <div className="admin-form-group">
                        <label>Rating (Stars)</label>
                        <select 
                          className="admin-form-select"
                          value={reviewForm.stars}
                          onChange={(e) => setReviewForm({...reviewForm, stars: parseInt(e.target.value, 10)})}
                        >
                          <option value="5">5 Stars</option>
                          <option value="4">4 Stars</option>
                          <option value="3">3 Stars</option>
                          <option value="2">2 Stars</option>
                          <option value="1">1 Star</option>
                        </select>
                      </div>
                      <div className="admin-form-group">
                        <label>Relative Time Date</label>
                        <input 
                          type="text" 
                          className="admin-form-input" 
                          placeholder="e.g. 2 months ago"
                          value={reviewForm.date} 
                          onChange={(e) => setReviewForm({...reviewForm, date: e.target.value})} 
                        />
                      </div>
                    </div>
                    <div className="admin-form-group">
                      <label>Review Text Content</label>
                      <textarea 
                        className="admin-form-textarea" 
                        rows={6}
                        placeholder="Write customer feedback text here..."
                        value={reviewForm.text} 
                        onChange={(e) => setReviewForm({...reviewForm, text: e.target.value})}
                      />
                    </div>
                    <div className="admin-form-actions">
                      {editingReviewId && (
                        <button 
                          type="button" 
                          className="btn-admin-secondary"
                          onClick={() => {
                            setEditingReviewId(null)
                            setReviewForm({ name: '', avatar: '', date: 'Just now', stars: 5, text: '' })
                          }}
                        >
                          Cancel Edit
                        </button>
                      )}
                      <button type="submit" className="btn-admin-primary">
                        {editingReviewId ? 'Save Changes' : 'Publish Review'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* List */}
                <div className="admin-section-card">
                  <h3 className="admin-section-title" style={{marginBottom: '20px'}}>Active Reviews Carousel</h3>
                  <div style={{maxHeight: '520px', overflowY: 'auto'}}>
                    {reviews.map((review: any) => (
                      <div key={review.id} className="quick-review-item" style={{alignItems: 'center'}}>
                        <div className="quick-review-avatar">
                          {review.avatar || review.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="quick-review-content">
                          <div className="admin-flex-row" style={{marginBottom: '0px'}}>
                            <span className="quick-review-name">{review.name}</span>
                            <span style={{fontSize: '0.8rem', color: '#94a3b8'}}>{review.date}</span>
                          </div>
                          <div style={{color: '#eab308', fontSize: '0.75rem', marginBottom: '4px'}}>
                            {"★".repeat(review.stars)}{"☆".repeat(5 - review.stars)}
                          </div>
                          <p style={{fontSize: '0.85rem', color: '#cbd5e1', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>{review.text}</p>
                        </div>
                        <div className="admin-table-actions" style={{flexDirection: 'column', gap: '4px', marginLeft: '10px'}}>
                          <button className="btn-table-action-edit" onClick={() => handleEditReviewClick(review)}>Edit</button>
                          <button className="btn-table-action-delete" onClick={() => handleDeleteReview(review.id)}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeAdminTab === 'content' && (
              <div className="admin-form-card" style={{maxWidth: '800px'}}>
                <h3 className="admin-section-title" style={{marginBottom: '25px'}}>Homepage Section Headers & Copy</h3>
                <form onSubmit={handleSaveCopy}>
                  {renderAdminSectionHeader('Hero Banner Section', 'hero')}
                  
                  <div className="admin-form-group">
                    <label>Hero Title Headline</label>
                    <input 
                      type="text" 
                      className="admin-form-input"
                      value={copyForm.hero_title || ''}
                      onChange={(e) => setCopyForm({...copyForm, hero_title: e.target.value})}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Hero Subtitle / Description</label>
                    <textarea 
                      className="admin-form-textarea"
                      rows={3}
                      value={copyForm.hero_desc || ''}
                      onChange={(e) => setCopyForm({...copyForm, hero_desc: e.target.value})}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Hero Background Image</label>
                    {copyForm.hero_bg && (
                      <label className="admin-image-upload">
                        <img src={copyForm.hero_bg} alt="Hero BG Preview" className="admin-image-upload-preview" />
                        <span className="admin-image-upload-overlay">
                          {uploadingImage ? 'Uploading...' : 'Change'}
                        </span>
                        <input 
                          type="file" 
                          accept="image/*"
                          className="admin-image-upload-input"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageUpload(file, (url) => setCopyForm({ ...copyForm, hero_bg: url }));
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>

                  {renderAdminSectionHeader('Highlights Section', 'highlights', { marginTop: '35px' })}

                  {renderAdminSectionHeader('About Us Section', 'about', { marginTop: '35px' })}
                  
                  <div className="admin-form-row-2" style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px'}}>
                    <div className="admin-form-group">
                      <label>About Subtitle</label>
                      <input 
                        type="text" 
                        className="admin-form-input"
                        value={copyForm.about_subtitle || ''}
                        onChange={(e) => setCopyForm({...copyForm, about_subtitle: e.target.value})}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>About Heading Title</label>
                      <input 
                        type="text" 
                        className="admin-form-input"
                        value={copyForm.about_title || ''}
                        onChange={(e) => setCopyForm({...copyForm, about_title: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="admin-form-group">
                    <label>About Narrative Description</label>
                    <textarea 
                      className="admin-form-textarea"
                      rows={5}
                      value={copyForm.about_text || ''}
                      onChange={(e) => setCopyForm({...copyForm, about_text: e.target.value})}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>About Terrace Image</label>
                    {copyForm.about_terrace && (
                      <label className="admin-image-upload">
                        <img src={copyForm.about_terrace} alt="About Terrace Preview" className="admin-image-upload-preview" />
                        <span className="admin-image-upload-overlay">
                          {uploadingImage ? 'Uploading...' : 'Change'}
                        </span>
                        <input 
                          type="file" 
                          accept="image/*"
                          className="admin-image-upload-input"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageUpload(file, (url) => setCopyForm({ ...copyForm, about_terrace: url }));
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>

                  {renderAdminSectionHeader('Activities Section', 'experiences', { marginTop: '35px' })}
                  <div className="admin-activity-toolbar">
                    <button type="button" className="btn-admin-primary" onClick={openAddActivityModal}>
                      Add Activity
                    </button>
                  </div>
                  <div className="admin-activities-grid">
                    {(copyForm.experiences || []).map((activity: any, index: number) => (
                      <div key={activity.id || index} className="admin-activity-card">
                        <img src={activity.bgImage || '/images/activity_plantation.png'} alt={activity.title || 'Activity'} className="admin-activity-img" />
                        <div className="admin-activity-info">
                          <h5>{activity.title || `Activity ${index + 1}`}</h5>
                          <p>{activity.desc || 'No description added yet.'}</p>
                        </div>
                        <div className="admin-activity-actions">
                          <button type="button" className="btn-admin-secondary" onClick={() => openEditActivityModal(activity, index)}>
                            Edit
                          </button>
                          <button type="button" className="btn-admin-danger" onClick={() => handleDeleteActivity(index)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {renderAdminSectionHeader('Gallery Section', 'gallery', { marginTop: '35px' })}
                  <div className="admin-activity-toolbar">
                    <button type="button" className="btn-admin-primary" onClick={openAddGalleryModal}>
                      Add Gallery Photo
                    </button>
                  </div>
                  <div className="admin-gallery-grid">
                    {(copyForm.gallery || []).map((galleryItem: any, index: number) => (
                      <div key={galleryItem.id || index} className="admin-gallery-card">
                        <img src={galleryItem.img || '/images/gallery_farmhouse.png'} alt={galleryItem.caption || 'Gallery photo'} className="admin-gallery-img" />
                        <div className="admin-gallery-info">
                          <h5>{galleryItem.caption || `Gallery Photo ${index + 1}`}</h5>
                          <p>{galleryItem.sub || 'No subtitle added yet.'}</p>
                        </div>
                        <div className="admin-gallery-actions">
                          <button type="button" className="btn-admin-secondary" onClick={() => openEditGalleryModal(galleryItem, index)}>
                            Edit
                          </button>
                          <button type="button" className="btn-admin-danger" onClick={() => handleDeleteGalleryItem(index)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {renderAdminSectionHeader('Google Reviews Section', 'reviews', { marginTop: '35px' })}

                  {renderAdminSectionHeader('Location Section', 'location', { marginTop: '35px' })}

                  <div className="admin-form-actions" style={{ marginTop: '30px' }}>
                    <button type="submit" className="btn-admin-primary" style={{padding: '14px 40px'}}>
                      Save All Settings
                    </button>
                  </div>
                </form>
              </div>
            )}
          </main>
        </div>

        {/* Toast Toast Alert */}
        {toast && (
          <div className="toast-notification">
            {toast}
          </div>
        )}

        {uploadingImage && (
          <div className="toast-notification" style={{ backgroundColor: '#0284c7', bottom: '80px' }}>
            Uploading {uploadingImage}...
          </div>
        )}

        {isActivityModalOpen && (
          <div className="booking-modal-overlay">
            <div className="booking-modal admin-activity-modal">
              <div className="booking-modal-header">
                <h3>{editingActivityIndex !== null ? 'Edit Activity' : 'Add Activity'}</h3>
                <button className="btn-close-modal" onClick={() => setIsActivityModalOpen(false)}>×</button>
              </div>

              <div className="booking-modal-body">
                <form onSubmit={handleSaveActivity}>
                  <div className="admin-form-group">
                    <label>Activity Title</label>
                    <input
                      type="text"
                      required
                      className="admin-form-input"
                      value={activityForm.title}
                      onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Description</label>
                    <textarea
                      className="admin-form-textarea"
                      rows={4}
                      value={activityForm.desc}
                      onChange={(e) => setActivityForm({ ...activityForm, desc: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Background Image</label>
                    {activityForm.bgImage && (
                      <img src={activityForm.bgImage} alt="Activity Preview" className="admin-activity-modal-preview" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ color: '#94a3b8' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file, (url) => setActivityForm({ ...activityForm, bgImage: url }));
                        }
                      }}
                    />
                  </div>

                  <div className="admin-form-actions">
                    <button type="button" className="btn-admin-secondary" onClick={() => setIsActivityModalOpen(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-admin-primary">
                      {editingActivityIndex !== null ? 'Save Activity' : 'Add Activity'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {isGalleryModalOpen && (
          <div className="booking-modal-overlay">
            <div className="booking-modal admin-gallery-modal">
              <div className="booking-modal-header">
                <h3>{editingGalleryIndex !== null ? 'Edit Gallery Photo' : 'Add Gallery Photo'}</h3>
                <button className="btn-close-modal" onClick={() => setIsGalleryModalOpen(false)}>×</button>
              </div>

              <div className="booking-modal-body">
                <form onSubmit={handleSaveGalleryItem}>
                  <div className="admin-form-group">
                    <label>Caption Title</label>
                    <input
                      type="text"
                      required
                      className="admin-form-input"
                      value={galleryForm.caption}
                      onChange={(e) => setGalleryForm({ ...galleryForm, caption: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Subtitle / Description</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={galleryForm.sub}
                      onChange={(e) => setGalleryForm({ ...galleryForm, sub: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Gallery Image</label>
                    {galleryForm.img && (
                      <img src={galleryForm.img} alt="Gallery Preview" className="admin-gallery-modal-preview" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ color: '#94a3b8' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file, (url) => setGalleryForm({ ...galleryForm, img: url }));
                        }
                      }}
                    />
                  </div>

                  <div className="admin-form-actions">
                    <button type="button" className="btn-admin-secondary" onClick={() => setIsGalleryModalOpen(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-admin-primary">
                      {editingGalleryIndex !== null ? 'Save Photo' : 'Add Photo'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // --- RENDER MAIN HOME / LANDING PAGE ---
  return (
    <>
      {/* Header & Sticky Navbar */}
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="logo-container">
          <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 22h20" />
            <path d="M19 22V11l-7-5-7 5v11" />
            <path d="M12 2a15 15 0 0 1 5 10c0 4-3 6-5 6s-5-2-5-6A15 15 0 0 1 12 2z" fill="currentColor" opacity="0.15" />
            <path d="M12 2v16" />
          </svg>
          <div>
            <span className="logo-text">COCO Preeth</span>
            <span className="logo-subtext">Farm House</span>
          </div>
        </div>

        <nav>
          <ul className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
            {isSectionVisible('hero') && <li><a href="#home" className="nav-link active" onClick={() => setIsMenuOpen(false)}>Home</a></li>}
            {isSectionVisible('about') && <li><a href="#about" className="nav-link" onClick={() => setIsMenuOpen(false)}>About</a></li>}
            {isSectionVisible('experiences') && <li><a href="#experiences" className="nav-link" onClick={() => setIsMenuOpen(false)}>Activities</a></li>}
            {isSectionVisible('gallery') && <li><a href="#gallery" className="nav-link" onClick={() => setIsMenuOpen(false)}>Gallery</a></li>}
            <li><button className="nav-link" style={{textAlign: 'left'}} onClick={() => { setIsMenuOpen(false); navigate('/admin'); }}>Admin Control</button></li>
          </ul>
        </nav>

        <button className="btn-book" onClick={() => { setIsBookingModalOpen(true); setBookingSuccess(false); }}>BOOK NOW</button>

        <div className={`menu-toggle ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </header>

      {/* Hero Section */}
      {isSectionVisible('hero') ? (
        <section id="home" className="hero" style={siteSettings.hero_bg ? { backgroundImage: `url('${siteSettings.hero_bg}')` } : {}}>
          <div className="hero-content">
            <h1>{siteSettings.hero_title || siteSettings.heroTitle}</h1>
            <p>{siteSettings.hero_desc || siteSettings.heroDesc}</p>
            <button className="btn-hero" onClick={() => { setIsBookingModalOpen(true); setBookingSuccess(false); }}>
              BOOK YOUR STAY
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        </section>
      ) : (
        <div className="hidden-hero-spacer" />
      )}

      {/* Highlights / Features Section */}
      {isSectionVisible('highlights') && <section className="highlights">
        <div className="highlight-card">
          <svg className="highlight-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2Z" />
            <path d="M9.8 6.1C12 8 15 11 15 16" />
          </svg>
          <h3 className="highlight-title">Natural Beauty</h3>
          <p className="highlight-desc">Peaceful surroundings and lush green orchard views.</p>
        </div>

        <div className="highlight-card">
          <svg className="highlight-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <h3 className="highlight-title">Comfortable Stay</h3>
          <p className="highlight-desc">Well-furnished rooms combining rustic charm and modern amenities.</p>
        </div>

        <div className="highlight-card">
          <svg className="highlight-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12h18M3 12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2M3 12l2-6h14l2 6" />
            <path d="M14 6a4 4 0 0 0-8 0" />
            <path d="M8 14v4M12 14v4M16 14v4" />
          </svg>
          <h3 className="highlight-title">Farm Fresh Food</h3>
          <p className="highlight-desc">Savor healthy, home-cooked organic meals harvested from our fields.</p>
        </div>

        <div className="highlight-card">
          <svg className="highlight-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 22h14" />
            <path d="M17 18a5 5 0 0 0-10 0" />
            <path d="M12 2c0 4-3 5-3 9a3 3 0 0 0 6 0c0-4-3-5-3-9z" />
          </svg>
          <h3 className="highlight-title">Memorable Experiences</h3>
          <p className="highlight-desc">Enjoy nature trails, bird watching, and bonfires with loved ones.</p>
        </div>
      </section>}

      {/* About Us Section */}
      {isSectionVisible('about') && <section id="about" className="about">
        <div className="about-image-wrapper">
          <img src={siteSettings.about_terrace || "/images/about_terrace.png"} alt="COCO Preeth Patio Terrace" className="about-image" />
        </div>
        <div className="about-content">
          <span className="section-subtitle">{siteSettings.about_subtitle || siteSettings.aboutSubtitle}</span>
          <h2 className="section-title">{siteSettings.about_title || siteSettings.aboutTitle}</h2>
          <p className="about-text">{siteSettings.about_text || siteSettings.aboutText}</p>
        </div>
      </section>}

      {/* Activities Section */}
      {isSectionVisible('experiences') && <section id="experiences" className="experiences-section">
        <span className="section-subtitle">Activities</span>
        <h2 className="section-title">Adventure. Fun. Memories.</h2>

        <div className="experiences-grid">
          {(siteSettings.experiences || []).map((exp: any, index: number) => (
            <div key={exp.id || index} className="experience-card" style={{ backgroundImage: `url('${exp.bgImage || ''}')` }} onClick={() => { setIsBookingModalOpen(true); setBookingSuccess(false); }}>
              <div className="experience-overlay">
                <div className="experience-icon">
                  {exp.id === 1 && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3.5z"/>
                    </svg>
                  )}
                  {exp.id === 2 && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="5.5" cy="17.5" r="2.5" />
                      <circle cx="18.5" cy="17.5" r="2.5" />
                      <path d="M15 12.5 12 9 8.5 12H5" />
                      <path d="M12 9V5h3" />
                      <path d="m12 9-2.5 6" />
                    </svg>
                  )}
                  {exp.id === 3 && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2Z" />
                      <path d="M9.8 6.1C12 8 15 11 15 16" />
                    </svg>
                  )}
                  {exp.id === 4 && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                    </svg>
                  )}
                </div>
                <div className="experience-content">
                  <h3 className="experience-title">{exp.title}</h3>
                  <p className="experience-desc">{exp.desc}</p>
                  <button className="btn-experience-learn">
                    BOOK NOW
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>}

      {/* Gallery Section */}
      {isSectionVisible('gallery') && <section id="gallery" className="gallery-section">
        <span className="section-subtitle">Our Gallery</span>
        <h2 className="section-title">Moments from Our Farm House</h2>

        <div className="gallery-grid">
          {(siteSettings.gallery || []).map((gal: any, index: number) => {
            const isViewMore = index === 3;
            return (
              <div key={gal.id || index} className={`gallery-item ${isViewMore ? 'view-more-container' : ''}`}>
                <img src={gal.img || ''} alt={gal.caption || ''} className="gallery-img" />
                <div className="gallery-overlay">
                  <h4 className="gallery-caption">{gal.caption}</h4>
                  <span className="gallery-sub">{gal.sub}</span>
                </div>
                {isViewMore && (
                  <div className="gallery-view-more-overlay">
                    <span className="view-more-plus">+</span>
                    <span className="view-more-text">View More</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button className="btn-gallery">VIEW MORE PHOTOS</button>
      </section>}

      {/* Google Reviews Section */}
      {isSectionVisible('reviews') && <section className="reviews-section">
        <div className="reviews-header">
          <div className="google-title-container">
            <svg className="google-g-icon" viewBox="0 0 24 24" width="24" height="24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <h2 className="google-title">Google Reviews</h2>
          </div>
          
          <div className="rating-summary">
            <div className="stars-container">
              {[...Array(5)].map((_, i) => (
                <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
            <span className="rating-number">4.9</span>
            <span className="rating-count">({reviews.length} reviews)</span>
          </div>

          <p className="recent-reviews-subtitle">
            Recent reviews shown below. <a href="https://google.com" target="_blank" rel="noopener noreferrer">Click here for more reviews</a>
          </p>
        </div>

        {reviews.length > 0 && (
          <div className="reviews-carousel-container">
            <button className="carousel-arrow" onClick={prevReview} aria-label="Previous review">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <div key={activeReviewIndex} className="review-card animate-fade">
              <div className="review-user">
                <div className="user-avatar">{reviews[activeReviewIndex]?.avatar || (reviews[activeReviewIndex]?.name && reviews[activeReviewIndex]?.name.charAt(0).toUpperCase()) || 'U'}</div>
                <div className="user-meta">
                  <span className="user-name">{reviews[activeReviewIndex]?.name}</span>
                  <span className="review-date">{reviews[activeReviewIndex]?.date}</span>
                </div>
              </div>
              
              <div className="review-stars">
                {[...Array(reviews[activeReviewIndex]?.stars || 5)].map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>

              <p className="review-text">
                "{reviews[activeReviewIndex]?.text}"
              </p>
            </div>

            <button className="carousel-arrow" onClick={nextReview} aria-label="Next review">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}
      </section>}

      {/* Location / Getting Here Section */}
      {isSectionVisible('location') && <section id="location" className="location-section">
        <div className="location-content">
          <span className="location-subtitle">Farm Location</span>
          <h2 className="location-title">Getting here</h2>
          <p className="location-text">
            COCO Preeth Farm House, Near Green Hills, Countryside Road, Wayallur, India - 123456
          </p>
          <a
            href="https://www.google.com/maps?q=10.945198,76.785408"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-direction"
          >
            <span className="direction-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </span>
            <span className="direction-text">Get Direction</span>
          </a>
        </div>
        <div className="location-map">
          <iframe
            src="https://maps.google.com/maps?q=10.945198,76.785408&t=&z=15&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="COCO Preeth Farm House Location Map"
          ></iframe>
        </div>
      </section>}

      {/* Footer Section */}
      <footer id="contact" className="footer">
        <div className="footer-grid">
          <div className="footer-col-about">
            <div className="logo-container">
              <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 22h20" />
                <path d="M19 22V11l-7-5-7 5v11" />
                <path d="M12 2a15 15 0 0 1 5 10c0 4-3 6-5 6s-5-2-5-6A15 15 0 0 1 12 2z" fill="currentColor" opacity="0.15" />
                <path d="M12 2v16" />
              </svg>
              <div>
                <span className="logo-text">COCO Preeth</span>
                <span className="logo-subtext">Farm House</span>
              </div>
            </div>
            <p>
              A peaceful farmhouse getaway surrounded by nature, offering ultimate relaxation, plantation tours, organic culinary delights, and unforgettable experiences.
            </p>
            <div className="social-links">
              <a href="https://facebook.com" className="social-icon" target="_blank" rel="noopener noreferrer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="https://instagram.com" className="social-icon" target="_blank" rel="noopener noreferrer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="https://youtube.com" className="social-icon" target="_blank" rel="noopener noreferrer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                  <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              {isSectionVisible('hero') && <li><a href="#home" className="footer-link">Home</a></li>}
              {isSectionVisible('about') && <li><a href="#about" className="footer-link">About Us</a></li>}
              {isSectionVisible('experiences') && <li><a href="#experiences" className="footer-link">Activities</a></li>}
              {isSectionVisible('gallery') && <li><a href="#gallery" className="footer-link">Gallery</a></li>}
              <li><button className="footer-link" onClick={() => navigate('/admin')}>Admin Panel</button></li>
            </ul>
          </div>

          {isSectionVisible('experiences') && <div>
            <h4 className="footer-title">Activities</h4>
            <ul className="footer-links">
              <li><a href="#experiences" className="footer-link">Plantation Tour</a></li>
              <li><a href="#experiences" className="footer-link">Nature Walks</a></li>
              <li><a href="#experiences" className="footer-link">Bonfire Nights</a></li>
              <li><a href="#experiences" className="footer-link">Outdoor Games</a></li>
              <li><a href="#experiences" className="footer-link">Organic Farming</a></li>
            </ul>
          </div>}

          <div>
            <h4 className="footer-title">Contact Us</h4>
            <div className="contact-info">
              <div className="contact-item">
                <svg className="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span className="contact-text">+91 98765 43210</span>
              </div>
              <div className="contact-item">
                <svg className="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span className="contact-text">info@cocopreeth.com</span>
              </div>
              <div className="contact-item">
                <svg className="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="contact-text">
                  COCO Preeth Farm House,<br />
                  Near Green Hills, Countryside Road,<br />
                  Wayallur, India - 123456
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span className="copyright">© 2026 COCO Preeth Farm House. All rights reserved.</span>
        </div>

        {/* Decorative corner leaves SVG */}
        <svg className="decorative-leaf" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C6.5 2 2 6.5 2 12c0 3 1.5 6 4 8l6-6 6 6c2.5-2 4-5 4-8 0-5.5-4.5-10-10-10z" />
          <path d="M12 2v10" />
          <path d="M12 8c1-1 3-2 3-2M12 6c-1-1-3-2-3-2M12 10c2-1.5 4-1.5 4-1.5" />
        </svg>
      </footer>

      {/* Booking Form Dialog Modal */}
      {isBookingModalOpen && (
        <div className="booking-modal-overlay">
          <div className="booking-modal">
            <div className="booking-modal-header">
              <h3>
                {bookingSuccess ? "Booking Confirmed" : "Request Reservation"}
              </h3>
              <button className="btn-close-modal" onClick={() => setIsBookingModalOpen(false)}>×</button>
            </div>
            
            <div className="booking-modal-body">
              {bookingSuccess ? (
                <div className="booking-success-message">
                  <div className="booking-success-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <h4 className="booking-success-title">Thank You!</h4>
                  <p>
                    Your reservation request has been received. Our manager will contact you shortly to confirm the booking details.
                  </p>
                  <button className="btn-submit-booking" style={{marginTop: '20px'}} onClick={() => setIsBookingModalOpen(false)}>
                    Close Window
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit}>
                  <div className="booking-form-group">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      required 
                      className="booking-form-input" 
                      placeholder="e.g. John Doe"
                      value={bookingForm.name} 
                      onChange={(e) => setBookingForm({...bookingForm, name: e.target.value})} 
                    />
                  </div>
                  
                  <div className="booking-form-row">
                    <div className="booking-form-group">
                      <label>Email Address</label>
                      <input 
                        type="email" 
                        required 
                        className="booking-form-input" 
                        placeholder="john@example.com"
                        value={bookingForm.email} 
                        onChange={(e) => setBookingForm({...bookingForm, email: e.target.value})} 
                      />
                    </div>
                    <div className="booking-form-group">
                      <label>Phone Number</label>
                      <input 
                        type="tel" 
                        required 
                        className="booking-form-input" 
                        placeholder="+91 98765 43210"
                        value={bookingForm.phone} 
                        onChange={(e) => setBookingForm({...bookingForm, phone: e.target.value})} 
                      />
                    </div>
                  </div>

                  <div className="booking-form-row">
                    <div className="booking-form-group">
                      <label>Check-in Date</label>
                      <input 
                        type="date" 
                        required 
                        className="booking-form-input" 
                        value={bookingForm.checkIn} 
                        onChange={(e) => setBookingForm({...bookingForm, checkIn: e.target.value})} 
                      />
                    </div>
                    <div className="booking-form-group">
                      <label>Check-out Date</label>
                      <input 
                        type="date" 
                        required 
                        className="booking-form-input" 
                        value={bookingForm.checkOut} 
                        onChange={(e) => setBookingForm({...bookingForm, checkOut: e.target.value})} 
                      />
                    </div>
                  </div>

                  <div className="booking-form-group">
                    <label>Number of Guests</label>
                    <select 
                      className="booking-form-input"
                      value={bookingForm.guests}
                      onChange={(e) => setBookingForm({...bookingForm, guests: parseInt(e.target.value, 10)})}
                    >
                      <option value="1">1 Guest</option>
                      <option value="2">2 Guests</option>
                      <option value="3">3 Guests</option>
                      <option value="4">4 Guests</option>
                      <option value="5">5 Guests</option>
                      <option value="6">6+ Guests</option>
                    </select>
                  </div>

                  <div className="booking-modal-footer">
                    <button type="submit" className="btn-submit-booking">
                      SUBMIT BOOKING REQUEST
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default App
