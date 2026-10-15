import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

// Report Item page (README.md "Your task").
// This page is already routed at /items/new (report) and /items/:id (edit),
// and both routes are wrapped in <ProtectedRoute>.

const defaults = { title: '', description: '', category: 'other', status: 'lost', location: '' }

export default function ItemForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  // Edit mode: load the item and copy only the editable fields into the form.
  // `?? ''` keeps optional fields controlled when the item has no location/description.
  useEffect(() => {
    if (!id) return
    api.get(`/items/${id}`)
      .then(res => {
        const { title, status, category, location, description } = res.data.item
        setForm({ title, status, category, location: location ?? '', description: description ?? '' })
      })
      .catch(err => setError(err?.response?.data?.message || 'Could not load item'))
  }, [id])

  // Every input has a `name` matching a key in `form`, so one handler covers them all.
  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // POST a new item, or PATCH the existing one when editing,
  // then go back to /items. Show the server's error message on failure.
  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      if (id) await api.patch(`/items/${id}`, form)
      else await api.post('/items', form)
      nav('/items')
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not save item')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'Report'} Item</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="input" name="title" placeholder="Title (e.g. Black backpack)" value={form.title} onChange={onChange} />
        <select className="input" name="status" value={form.status} onChange={onChange}>
          <option value="lost">lost</option>
          <option value="found">found</option>
          <option value="claimed">claimed</option>
        </select>
        <select className="input" name="category" value={form.category} onChange={onChange}>
          <option value="electronics">electronics</option>
          <option value="clothing">clothing</option>
          <option value="documents">documents</option>
          <option value="accessories">accessories</option>
          <option value="other">other</option>
        </select>
        <input className="input" name="location" placeholder="Location (optional, e.g. Library 2nd floor)" value={form.location} onChange={onChange} />
        <textarea className="input" name="description" placeholder="Description (optional)" rows={4} value={form.description} onChange={onChange} />

        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}
