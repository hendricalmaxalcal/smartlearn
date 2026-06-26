import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage } from '../../firebase'
import {
  getCourses,
  getChapters,
  createChapter,
  createResource,
  getResources,
} from '../../services/firestore'

export default function AdminUpload() {
  const { user } = useSelector((s) => s.auth)
  const queryClient = useQueryClient()
  const [selectedCourse, setSelectedCourse] = useState('')
  const [selectedChapter, setSelectedChapter] = useState('')
  const [newChapterName, setNewChapterName] = useState('')
  const [showNewChapter, setShowNewChapter] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    type: 'video',
    is_published: true,
    order_index: 0,
  })

  const { data: courses } = useQuery({
    queryKey: ['admin-courses-list'],
    queryFn: () => getCourses({}),
    retry: false,
  })

  const { data: chapters } = useQuery({
    queryKey: ['chapters', selectedCourse],
    queryFn: () => getChapters(selectedCourse),
    enabled: !!selectedCourse,
    retry: false,
  })

  const { data: recentResources } = useQuery({
    queryKey: ['resources', selectedChapter],
    queryFn: () => getResources(selectedChapter),
    enabled: !!selectedChapter,
    retry: false,
  })

  const addChapter = useMutation({
    mutationFn: () => createChapter(
      selectedCourse,
      newChapterName,
      chapters?.length || 0
    ),
    onSuccess: () => {
      queryClient.invalidateQueries(['chapters', selectedCourse])
      setNewChapterName('')
      setShowNewChapter(false)
      toast.success('Chapter created!')
    },
    onError: () => toast.error('Failed to create chapter'),
  })

  const handleFileUpload = async (file) => {
    if (!file) return null
    setUploading(true)
    setUploadProgress(0)

    return new Promise((resolve, reject) => {
      const fileRef = ref(
        storage,
        `resources/${selectedCourse}/${Date.now()}_${file.name}`
      )
      const uploadTask = uploadBytesResumable(fileRef, file)

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          )
          setUploadProgress(progress)
        },
        (error) => {
          setUploading(false)
          toast.error('Upload failed')
          reject(error)
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref)
          setUploading(false)
          resolve(url)
        }
      )
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedChapter) {
      toast.error('Please select a chapter')
      return
    }

    const fileInput = document.getElementById('file-input')
    const file = fileInput?.files?.[0]
    let fileUrl = null

    if (file) {
      fileUrl = await handleFileUpload(file)
      if (!fileUrl) return
    }

    try {
      await createResource({
        ...form,
        chapter_id: selectedChapter,
        course_id: selectedCourse,
        file_url: fileUrl,
        uploaded_by: user.id,
      })
      queryClient.invalidateQueries(['resources', selectedChapter])
      setForm({ title: '', type: 'video', is_published: true, order_index: 0 })
      if (fileInput) fileInput.value = ''
      toast.success('Material uploaded successfully!')
    } catch {
      toast.error('Failed to save material')
    }
  }

  return (
    <div className="p-6 max-w-5xl">

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-medium">Upload material</h2>
        <p className="text-gray-500 text-sm mt-1">
          Add videos, PDFs, notes and slides to your courses
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">

        {/* Upload form */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Step 1 — Select course */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                1. Select course
              </label>
              <select
                className="input"
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value)
                  setSelectedChapter('')
                }}
                required
              >
                <option value="">Choose a course...</option>
                {(courses || []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2 — Select or create chapter */}
            {selectedCourse && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700">
                    2. Select chapter
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNewChapter(!showNewChapter)}
                    className="text-xs text-primary-600 hover:underline"
                  >
                    + New chapter
                  </button>
                </div>

                {showNewChapter && (
                  <div className="flex gap-2 mb-2">
                    <input
                      className="input flex-1 text-sm"
                      placeholder="Chapter title..."
                      value={newChapterName}
                      onChange={(e) => setNewChapterName(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => addChapter.mutate()}
                      disabled={!newChapterName.trim() || addChapter.isPending}
                      className="btn-primary text-sm px-3"
                    >
                      Add
                    </button>
                  </div>
                )}

                <select
                  className="input"
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(e.target.value)}
                  required
                >
                  <option value="">Choose a chapter...</option>
                  {(chapters || []).map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      {ch.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Step 3 — Material details */}
            {selectedChapter && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    3. Material title
                  </label>
                  <input
                    className="input"
                    placeholder="e.g. Introduction to Cell Division"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Resource type
                    </label>
                    <select
                      className="input"
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                    >
                      <option value="video">Video</option>
                      <option value="pdf">PDF</option>
                      <option value="note">Notes</option>
                      <option value="slide">Slide deck</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Order
                    </label>
                    <input
                      type="number"
                      className="input"
                      min="0"
                      value={form.order_index}
                      onChange={(e) => setForm({ ...form, order_index: Number(e.target.value) })}
                    />
                  </div>
                </div>

                {/* File upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload file
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-300 transition-colors">
                    <div className="text-3xl mb-2">📁</div>
                    <p className="text-sm text-gray-500 mb-1">
                      Drag & drop or click to browse
                    </p>
                    <p className="text-xs text-gray-400 mb-3">
                      MP4, PDF, DOCX, PPTX — max 500MB
                    </p>
                    <input
                      type="file"
                      id="file-input"
                      className="hidden"
                      accept="video/*,.pdf,.docx,.pptx"
                    />
                    <label
                      htmlFor="file-input"
                      className="btn-outline text-xs px-4 py-1.5 cursor-pointer"
                    >
                      Browse files
                    </label>
                  </div>

                  {/* Upload progress */}
                  {uploading && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="publish"
                    checked={form.is_published}
                    onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                  />
                  <label htmlFor="publish" className="text-sm text-gray-700">
                    Publish immediately
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full py-2.5"
                  disabled={uploading}
                >
                  {uploading ? `Uploading ${uploadProgress}%...` : 'Upload & save material'}
                </button>
              </>
            )}
          </form>
        </div>

        {/* Recently uploaded */}
        <div>
          <h3 className="text-base font-medium text-gray-900 mb-3">
            {selectedChapter ? 'Materials in this chapter' : 'Select a chapter to see materials'}
          </h3>

          {recentResources?.length ? (
            <div className="card p-0 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Title</th>
                    <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Type</th>
                    <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentResources.map((r) => (
                    <tr key={r.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-2 truncate max-w-40">
                        <div className="font-medium text-gray-900 truncate">
                          {r.title}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                          {r.type}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          r.is_published
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {r.is_published ? 'Live' : 'Draft'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="card text-center py-10">
              <div className="text-4xl mb-3">📂</div>
              <p className="text-gray-400 text-sm">
                {selectedChapter
                  ? 'No materials in this chapter yet'
                  : 'Select a course and chapter first'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}