import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Profile() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const [editing, setEditing] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })

  if (!user) {
    navigate('/login')
    return null
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      const res = await axios.put('https://trendywear-3uam.onrender.com/api/auth/update', {
        id: user._id,
        name: form.name,
        phone: form.phone,
      })
      const updatedUser = { ...user, name: form.name, phone: form.phone }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setSuccess('Profile updated successfully!')
      setEditing(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed!')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div style={{ backgroundColor: '#0d0d0d', minHeight: '100vh', padding: '50px 20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>

        {/* Header */}
        <div className="text-center mb-5">
          <div style={{ width: '90px', height: '90px', borderRadius: '50%', backgroundColor: '#b8860b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 15px' }}>
            👤
          </div>
          <h2 style={{ color: '#b8860b', fontFamily: 'Georgia, serif' }}>My Profile</h2>
          <p style={{ color: '#888' }}>Manage your TrendyWear account</p>
        </div>

        {/* Card */}
        <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #b8860b', borderRadius: '16px', padding: '35px', boxShadow: '0 8px 32px rgba(184,134,11,0.2)' }}>

          {/* Success / Error */}
          {success && (
            <div style={{ backgroundColor: '#0a2d0a', border: '1px solid #44ff44', borderRadius: '8px', padding: '10px 15px', marginBottom: '20px', color: '#66ff66', fontSize: '0.9rem' }}>
              ✅ {success}
            </div>
          )}
          {error && (
            <div style={{ backgroundColor: '#2d0a0a', border: '1px solid #ff4444', borderRadius: '8px', padding: '10px 15px', marginBottom: '20px', color: '#ff6666', fontSize: '0.9rem' }}>
              ⚠️ {error}
            </div>
          )}

          {!editing ? (
            /* View Mode */
            <div>
              {[
                { label: 'Full Name', value: form.name, icon: '👤' },
                { label: 'Email Address', value: form.email, icon: '📧' },
                { label: 'Phone Number', value: form.phone, icon: '📱' },
              ].map((item, i) => (
                <div key={i} style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#2a2a2a', borderRadius: '10px', border: '1px solid #333' }}>
                  <p style={{ color: '#d4af37', fontSize: '0.8rem', marginBottom: '4px' }}>{item.icon} {item.label}</p>
                  <p style={{ color: '#fff', fontSize: '1rem', margin: 0 }}>{item.value}</p>
                </div>
              ))}

              <div style={{ display: 'flex', gap: '12px', marginTop: '25px' }}>
                <button onClick={() => setEditing(true)}
                  style={{ flex: 1, backgroundColor: '#b8860b', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '0.95rem', fontWeight: 'bold', cursor: 'pointer' }}>
                  ✏️ Edit Profile
                </button>
                <button onClick={() => navigate('/complaints')}
                  style={{ flex: 1, backgroundColor: '#2a2a2a', color: '#d4af37', border: '1px solid #b8860b', borderRadius: '8px', padding: '12px', fontSize: '0.95rem', fontWeight: 'bold', cursor: 'pointer' }}>
                  🎫 My Complaints
                </button>
              </div>

              <button onClick={handleLogout}
                style={{ width: '100%', marginTop: '12px', backgroundColor: 'transparent', color: '#ff6666', border: '1px solid #ff4444', borderRadius: '8px', padding: '12px', fontSize: '0.95rem', fontWeight: 'bold', cursor: 'pointer' }}>
                🚪 Logout
              </button>
            </div>
          ) : (
            /* Edit Mode */
            <form onSubmit={handleUpdate}>
              <div className="mb-3">
                <label style={{ color: '#d4af37', fontSize: '0.9rem', marginBottom: '6px', display: 'block' }}>Full Name</label>
                <input
                  type="text" name="name" value={form.name}
                  onChange={handleChange} required
                  style={{ width: '100%', backgroundColor: '#2a2a2a', border: '1px solid #b8860b', borderRadius: '8px', padding: '12px 15px', color: '#fff', outline: 'none', fontSize: '0.95rem' }}
                />
              </div>

              <div className="mb-3">
                <label style={{ color: '#d4af37', fontSize: '0.9rem', marginBottom: '6px', display: 'block' }}>Email Address</label>
                <input
                  type="email" value={form.email} disabled
                  style={{ width: '100%', backgroundColor: '#1a1a1a', border: '1px solid #444', borderRadius: '8px', padding: '12px 15px', color: '#666', outline: 'none', fontSize: '0.95rem' }}
                />
                <p style={{ color: '#666', fontSize: '0.8rem', marginTop: '4px' }}>Email cannot be changed</p>
              </div>

              <div className="mb-4">
                <label style={{ color: '#d4af37', fontSize: '0.9rem', marginBottom: '6px', display: 'block' }}>Phone Number</label>
                <input
                  type="tel" name="phone" value={form.phone}
                  onChange={handleChange} required
                  style={{ width: '100%', backgroundColor: '#2a2a2a', border: '1px solid #b8860b', borderRadius: '8px', padding: '12px 15px', color: '#fff', outline: 'none', fontSize: '0.95rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit"
                  style={{ flex: 1, backgroundColor: '#b8860b', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '0.95rem', fontWeight: 'bold', cursor: 'pointer' }}>
                  💾 Save Changes
                </button>
                <button type="button" onClick={() => setEditing(false)}
                  style={{ flex: 1, backgroundColor: '#2a2a2a', color: '#fff', border: '1px solid #555', borderRadius: '8px', padding: '12px', fontSize: '0.95rem', fontWeight: 'bold', cursor: 'pointer' }}>
                  ✕ Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
