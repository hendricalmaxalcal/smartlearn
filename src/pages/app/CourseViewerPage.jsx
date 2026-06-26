import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import ReactPlayer from 'react-player'

export default function CourseViewerPage() {
  const { slug } = useParams()
  const queryClient = useQueryClient()
  const [activeResource, setActiveResource] = useState(null)
  const [openChapter, setOpenChapter] = useState(0)

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', slug],
    queryFn: () => api.get(`/courses/${slug}`).then((r) => r.data),
  })

  const markComplete = useMutation({
    mutationFn: (resourceId) =>
      api.post('/students/progress', { resource_id: resourceId, completed: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['course', slug])
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="text-gray-400">Loading course...</div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="p-6 text-center">
        <div className="text-4xl mb-3">😕</div>
        <h2 className="text-lg font-medium text-gray-900 mb-2">Course not found</h2>
        <Link to="/app/my-courses" className="btn-primary">
          Back to my courses
        </Link>
      </div>
    )
  }

  const allResources = course.chapters?.flatMap((ch) => ch.resources || []) || []
  const currentResource = activeResource || allResources[0]

  return (
    <div className="flex h-screen overflow-hidden">

      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <Link
            to="/app/my-courses"
            className="text-xs text-primary-600 hover:underline mb-2 block"
          >
            Back to my courses
          </Link>
          <h2 className="font-medium text-gray-900 text-sm leading-snug">
            {course.title}
          </h2>
          <div className="flex gap-1 mt-2">
            <span className={`badge-${course.stream}`}>{course.stream}</span>
            <span className="bg-primary-50 text-primary-800 text-xs px-2 py-0.5 rounded-full">
              {course.form_level?.replace('form', 'Form ')}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {course.chapters?.map((chapter, chIndex) => (
            <div key={chapter.id}>
              <button
                onClick={() => setOpenChapter(openChapter === chIndex ? -1 : chIndex)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 border-b border-gray-100"
              >
                <span className="text-left leading-snug">{chapter.title}</span>
                <span className="text-gray-400 ml-2 flex-shrink-0">
                  {openChapter === chIndex ? '▲' : '▼'}
                </span>
              </button>

              {openChapter === chIndex && (
                <div className="bg-gray-50">
                  {(chapter.resources || []).map((resource) => (
                    <button
                      key={resource.id}
                      onClick={() => setActiveResource(resource)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs text-left transition-colors border-b border-gray-100 ${
                        currentResource?.id === resource.id
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-600 hover:bg-white'
                      }`}
                    >
                      <span className="flex-shrink-0">
                        {resource.type === 'video' ? '▶' :
                         resource.type === 'pdf'   ? '📄' :
                         resource.type === 'note'  ? '📝' : '📊'}
                      </span>
                      <span className="flex-1 leading-snug">{resource.title}</span>
                      {resource.completed && (
                        <span className="text-green-500 flex-shrink-0">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {currentResource ? (
          <div className="max-w-4xl mx-auto p-6">

            {/* Resource title */}
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-medium text-gray-900">
                {currentResource.title}
              </h1>
              <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                currentResource.type === 'video'
                  ? 'bg-primary-50 text-primary-700'
                  : currentResource.type === 'pdf'
                  ? 'bg-red-50 text-red-700'
                  : 'bg-green-50 text-green-700'
              }`}>
                {currentResource.type}
              </span>
            </div>

            {/* Video player */}
            {currentResource.type === 'video' && currentResource.file_url && (
              <div className="bg-black rounded-xl overflow-hidden mb-6 aspect-video">
                <ReactPlayer
                  url={currentResource.file_url}
                  width="100%"
                  height="100%"
                  controls
                  onEnded={() => markComplete.mutate(currentResource.id)}
                />
              </div>
            )}

            {/* PDF viewer */}
            {currentResource.type === 'pdf' && currentResource.file_url && (
              <div className="bg-white rounded-xl border border-gray-200 mb-6 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    PDF Document
                  </span>
                  
                    <button
                    onClick={() => window.open(currentResource.file_url, '_blank')}
                    className="btn-outline text-xs py-1 px-3"
                  >
                    Open in new tab
                  </button>
                </div>
                <iframe
                  src={currentResource.file_url}
                  className="w-full h-96"
                  title={currentResource.title}
                />
              </div>
            )}

            {/* Notes or slides */}
            {(currentResource.type === 'note' || currentResource.type === 'slide') && (
              <div className="bg-white rounded-xl border border-gray-200 mb-6 p-8 text-center">
                <div className="text-5xl mb-4">
                  {currentResource.type === 'note' ? '📝' : '📊'}
                </div>
                <p className="text-gray-500 text-sm mb-4">
                  {currentResource.type === 'note' ? 'Study notes' : 'Slide deck'}
                </p>
                {currentResource.file_url && (
                  
                  <button
                    onClick={() => window.open(currentResource.file_url, '_blank')}
                    className="btn-primary text-sm px-6"
                  >
                    Open {currentResource.type}
                  </button>
                )}
              </div>
            )}

            {/* No content yet */}
            {!currentResource.file_url && (
              <div className="bg-white rounded-xl border border-gray-200 mb-6 p-10 text-center">
                <div className="text-4xl mb-3">🔒</div>
                <p className="text-gray-500 text-sm">Content coming soon</p>
              </div>
            )}

            {/* Mark complete */}
            <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-sm text-gray-600">
                {currentResource.completed
                  ? '✅ You have completed this lesson'
                  : 'Mark this lesson as complete when done'}
              </div>
              {!currentResource.completed && (
                <button
                  onClick={() => markComplete.mutate(currentResource.id)}
                  disabled={markComplete.isPending}
                  className="btn-primary text-sm px-4 py-2"
                >
                  {markComplete.isPending ? 'Saving...' : 'Mark complete'}
                </button>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-4">
              <button
                onClick={() => {
                  const idx = allResources.findIndex((r) => r.id === currentResource.id)
                  if (idx > 0) setActiveResource(allResources[idx - 1])
                }}
                disabled={allResources.findIndex((r) => r.id === currentResource.id) === 0}
                className="btn-outline text-sm px-4 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => {
                  const idx = allResources.findIndex((r) => r.id === currentResource.id)
                  if (idx < allResources.length - 1) setActiveResource(allResources[idx + 1])
                }}
                disabled={allResources.findIndex((r) => r.id === currentResource.id) === allResources.length - 1}
                className="btn-primary text-sm px-4"
              >
                Next
              </button>
            </div>

          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-5xl mb-4">👈</div>
              <p className="text-gray-500">
                Select a lesson from the sidebar to start
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}