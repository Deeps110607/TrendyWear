import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match!')
      return
    }
    try {
      setLoading(true)
      const res = await axios.post('https://trendywear-3uam.onrender.com/api/auth/register', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password
      })
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ backgroundColor: '#0d0d0d', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #b8860b', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '480px', boxShadow: '0 8px 32px rgba(184,134,11,0.2)' }}>

        {/* Header */}
        <div className="text-center mb-4">
          <h2 style={{ color: '#b8860b', fontFamily: 'Georgia, serif', fontSize: '2rem' }}>👗 TrendyWear</h2>
          <h4 style={{ color: '#fff', marginTop: '8px' }}>Create Account</h4>
          <p style={{ color: '#888', fontSize: '0.9rem' }}>Join us for exclusive fashion collections</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ backgroundColor: '#2d0a0a', border: '1px solid #ff4444', borderRadius: '8px', padding: '10px 15px', marginBottom: '20px', color: '#ff6666', fontSize: '0.9rem' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label style={{ color: '#d4af37', fontSize: '0.9rem', marginBottom: '6px', display: 'block' }}>Full Name</label>
            <input
              type="text" name="name" value={form.name}
              onChange={handleChange} required placeholder="Enter your full name"
              style={{ width: '100%', backgroundColor: '#2a2a2a', border: '1px solid #b8860b', borderRadius: '8px', padding: '12px 15px', color: '#fff', outline: 'none', fontSize: '0.95rem' }}
            />
          </div>

          <div className="mb-3">
            <label style={{ color: '#d4af37', fontSize: '0.9rem', marginBottom: '6px', display: 'block' }}>Email Address</label>
            <input
              type="email" name="email" value={form.email}
              onChange={handleChange} required placeholder="Enter your email"
              style={{ width: '100%', backgroundColor: '#2a2a2a', border: '1px solid #b8860b', borderRadius: '8px', padding: '12px 15px', color: '#fff', outline: 'none', fontSize: '0.95rem' }}
            />
          </div>

          <div className="mb-3">
            <label style={{ color: '#d4af37', fontSize: '0.9rem', marginBottom: '6px', display: 'block' }}>Phone Number</label>
            <input
              type="tel" name="phone" value={form.phone}
              onChange={handleChange} required placeholder="Enter your phone number"
              style={{ width: '100%', backgroundColor: '#2a2a2a', border: '1px solid #b8860b', borderRadius: '8px', padding: '12px 15px', color: '#fff', outline: 'none', fontSize: '0.95rem' }}
            />
          </div>

          <div className="mb-3">
            <label style={{ color: '#d4af37', fontSize: '0.9rem', marginBottom: '6px', display: 'block' }}>Password</label>
            <input
              type="password" name="password" value={form.password}
              onChange={handleChange} required placeholder="Create a password"
              style={{ width: '100%', backgroundColor: '#2a2a2a', border: '1px solid #b8860b', borderRadius: '8px', padding: '12px 15px', color: '#fff', outline: 'none', fontSize: '0.95rem' }}
            />
          </div>

          <div className="mb-4">
            <label style={{ color: '#d4af37', fontSize: '0.9rem', marginBottom: '6px', display: 'block' }}>Confirm Password</label>
            <input
              type="password" name="confirmPassword" value={form.confirmPassword}
              onChange={handleChange} required placeholder="Confirm your password"
              style={{ width: '100%', backgroundColor: '#2a2a2a', border: '1px solid #b8860b', borderRadius: '8px', padding: '12px 15px', color: '#fff', outline: 'none', fontSize: '0.95rem' }}
            />
          </div>

          <button type="submit" disabled={loading}
            style={{ width: '100%', backgroundColor: '#b8860b', color: '#fff', border: 'none', borderRadius: '8px', padding: '13px', fontSize: '1rem', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? '⏳ Creating Account...' : '✨ Create Account'}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center mt-4">
          <p style={{ color: '#888', fontSize: '0.9rem' }}>
            Already have an account?{' '}
            <a href="/login" style={{ color: '#b8860b', textDecoration: 'none', fontWeight: 'bold' }}>Login here</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
