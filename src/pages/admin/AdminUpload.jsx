import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage } from '../../firebase'
import { getDocs, collection, query, orderBy } from 'firebase/firestore'
import { db } from '../../firebase'
import {
  getChapters,
  createChapter,
  createResource,
  getResources,
  deleteChapter,
  deleteResource,
} from '../../services/firestore'

export default function AdminUpload() {
  const { user } = useSelector((s) => s.auth)
  const queryClient = useQueryClient()
  const fileInputRef = useRef(null)

  const [selectedCourse, setSelectedCourse] = useState('')
  const [selectedChapter, setSelectedChapter] = useState('')
  const [newChapterName, setNewChapterName] = useState('')
  const [showNewChapter, setShowNewChapter] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [noteMode, setNoteMode] = useState('write')
  const [form, setForm] = useState({
    title: '',
    type: 'video',
    content: '',
    is_published: true,
    order_index: 0,
  })

  const { data: courses } = useQuery({
    queryKey: ['admin-courses-list'],
    queryFn: async () => {
      const snapshot = await getDocs(
        query(collection(db, 'courses'), orderBy('created_at', 'desc'))
      )
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
    },
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
    mutationFn: () => createChapter(selectedCourse, newChapterName, chapters?.length || 0),
    onSuccess: () => {
      queryClient.invalidateQueries(['chapters', selectedCourse])
      setNewChapterName('')
      setShowNewChapter(false)
      toast.success('Chapter created!')
    },
    onError: () => toast.error('Failed to create chapter'),
  })

  const removeChapter = useMutation({
    mutationFn: (chapterId) => deleteChapter(chapterId),
    onSuccess: () => {
      queryClient.invalidateQueries(['chapters', selectedCourse])
      queryClient.invalidateQueries(['resources', selectedChapter])
      if (selectedChapter === removeChapter.variables) {
        setSelectedChapter('')
      }
      toast.success('Chapter deleted!')
    },
    onError: () => toast.error('Failed to delete chapter'),
  })

  const removeResource = useMutation({
    mutationFn: (resourceId) => deleteResource(resourceId),
    onSuccess: () => {
      queryClient.invalidateQueries(['resources', selectedChapter])
      toast.success('Material deleted!')
    },
    onError: () => toast.error('Failed to delete material'),
  })

  const handleFileUpload = async (file) => {
    if (!file) return null
    setUploading(true)
    setUploadProgress(0)

    return new Promise((resolve, reject) => {
      const fileRef = ref(storage, `resources/${selectedCourse}/${Date.now()}_${file.name}`)
      const uploadTask = uploadBytesResumable(fileRef, file)

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
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

    try {
      let fileUrl = null
      let noteContent = null

      if (form.type === 'note' && noteMode === 'write') {
        if (!form.content.trim()) {
          toast.error('Please write some content for the note')
          return
        }
        noteContent = form.content
      } else {
        const file = fileInputRef.current?.files?.[0]
        if (file) {
          toast.loading('Uploading file...', { id: 'upload' })
          fileUrl = await handleFileUpload(file)
          toast.success('File uploaded!', { id: 'upload' })
        }
      }

      await createResource({
        ...form,
        chapter_id: selectedChapter,
        course_id: selectedCourse,
        file_url: fileUrl,
        note_content: noteContent,
        uploaded_by: user.id,
      })

      queryClient.invalidateQueries(['resources', selectedChapter])
      setForm({ title: '', type: 'video', content: '', is_published: true, order_index: 0 })
      if (fileInputRef.current) fileInputRef.current.value = ''
      toast.success('Material saved successfully!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to save material')
    }
  }

  const isNoteType = form.type === 'note'

  return (
    <div className="p-4 md:p-6 max-w-5xl">
      <div className="mb-6">
        <h2 className="text-xl font-medium text-gray-900 dark:text-white">Upload material</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Add videos, PDFs, notes and slides to your courses
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Left — Upload form */}
        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Step 1 — Select course */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                1. Select course
              </label>
              <select
                className="input"
                value={selectedCourse}
                onChange={(e) => { setSelectedCourse(e.target.value); setSelectedChapter('') }}
                required
              >
                <option value="">Choose a course...</option>
                {(courses || []).map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            {/* Step 2 — Chapters */}
            {selectedCourse && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
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

                {/* Chapter list with delete */}
                <div className="space-y-1 mb-2">
                  {(chapters || []).map((ch) => (
                    <div
                      key={ch.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                        selectedChapter === ch.id
                          ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary-200'
                      }`}
                      onClick={() => setSelectedChapter(ch.id)}
                    >
                      <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
                        {ch.title}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (window.confirm(`Delete chapter "${ch.title}" and all its materials?`)) {
                            removeChapter.mutate(ch.id)
                          }
                        }}
                        className="text-gray-300 hover:text-red-500 text-xs flex-shrink-0 transition-colors"
                        title="Delete chapter"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                  {!chapters?.length && (
                    <p className="text-xs text-gray-400 px-1">No chapters yet — create one above</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3 — Material details */}
            {selectedChapter && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Resource type
                    </label>
                    <select
                      className="input"
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                    >
                      <option value="video">📹 Video</option>
                      <option value="pdf">📄 PDF</option>
                      <option value="note">📝 Notes</option>
                      <option value="slide">📊 Slide deck</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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

                {/* Note mode toggle */}
                {isNoteType && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Note input method
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setNoteMode('write')}
                        className={`border-2 rounded-xl p-3 text-center transition-all ${
                          noteMode === 'write'
                            ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                            : 'border-gray-200 dark:border-gray-700 text-gray-500'
                        }`}
                      >
                        <span className="block text-2xl mb-1">✍️</span>
                        <span className="text-xs font-medium">Write notes</span>
                        <span className="block text-xs text-gray-400 mt-0.5">Type directly</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setNoteMode('upload')}
                        className={`border-2 rounded-xl p-3 text-center transition-all ${
                          noteMode === 'upload'
                            ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                            : 'border-gray-200 dark:border-gray-700 text-gray-500'
                        }`}
                      >
                        <span className="block text-2xl mb-1">📁</span>
                        <span className="text-xs font-medium">Upload file</span>
                        <span className="block text-xs text-gray-400 mt-0.5">PDF or DOCX</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Write notes */}
                {isNoteType && noteMode === 'write' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Note content
                    </label>
                    <textarea
                      className="input resize-none font-mono text-xs"
                      rows={10}
                      placeholder="Write your notes here..."
                      value={form.content}
                      onChange={(e) => setForm({ ...form, content: e.target.value })}
                      required
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>{form.content.length} characters</span>
                      <span>{form.content.split('\n').length} lines</span>
                    </div>
                  </div>
                ) : (
                  /* File upload */
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Upload file
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-primary-300 transition-colors">
                      <div className="text-3xl mb-2">📁</div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        Click to browse files
                      </p>
                      <p className="text-xs text-gray-400 mb-3">
                        {form.type === 'video' ? 'MP4, MOV — max 500MB' :
                         form.type === 'pdf'   ? 'PDF — max 50MB' :
                         form.type === 'note'  ? 'PDF, DOCX — max 20MB' :
                         'PPTX, PDF — max 50MB'}
                      </p>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept={
                          form.type === 'video' ? 'video/*' :
                          form.type === 'pdf'   ? '.pdf' :
                          form.type === 'note'  ? '.pdf,.docx,.doc' :
                          '.pptx,.pdf'
                        }
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-outline text-xs px-4 py-1.5"
                      >
                        Browse files
                      </button>
                    </div>

                    {uploading && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="publish"
                    checked={form.is_published}
                    onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                  />
                  <label htmlFor="publish" className="text-sm text-gray-700 dark:text-gray-300">
                    Publish immediately
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full py-2.5"
                  disabled={uploading}
                >
                  {uploading
                    ? `Uploading ${uploadProgress}%...`
                    : isNoteType && noteMode === 'write'
                    ? 'Save notes'
                    : 'Upload & save material'}
                </button>
              </>
            )}
          </form>
        </div>

        {/* Right — Materials list with delete */}
        <div>
          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-3">
            {selectedChapter ? 'Materials in this chapter' : 'Select a chapter to see materials'}
          </h3>

          {recentResources?.length ? (
            <div className="space-y-2">
              {recentResources.map((r) => (
                <div
                  key={r.id}
                  className="card py-3 px-4 flex items-start gap-3"
                >
                  <span className="text-xl flex-shrink-0">
                    {r.type === 'video' ? '▶️' :
                     r.type === 'pdf'   ? '📄' :
                     r.type === 'note'  ? '📝' : '📊'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {r.title}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full capitalize">
                        {r.type}{r.note_content ? ' (written)' : ''}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        r.is_published
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {r.is_published ? 'Live' : 'Draft'}
                      </span>
                    </div>
                    {r.note_content && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                        {r.note_content.substring(0, 60)}...
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete "${r.title}"?`)) {
                        removeResource.mutate(r.id)
                      }
                    }}
                    disabled={removeResource.isPending}
                    className="text-gray-300 hover:text-red-500 flex-shrink-0 transition-colors text-sm"
                    title="Delete material"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-10">
              <div className="text-4xl mb-3">📂</div>
              <p className="text-gray-400 dark:text-gray-500 text-sm">
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