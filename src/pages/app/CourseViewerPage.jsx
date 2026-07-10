import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { getCourseBySlug } from '../../services/firestore'

export default function CourseViewerPage() {
  const { slug } = useParams()
  const { user } = useSelector((s) => s.auth)
  const [activeChapter, setActiveChapter] = useState(null)
  const [activeResource, setActiveResource] = useState(null)

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', slug],
    queryFn: () => getCourseBySlug(slug),
    retry: false,
    staleTime: 0,
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
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Course not found</h2>
        <p className="text-gray-500 text-sm mb-4">This course may have been removed or the link is invalid.</p>
        <Link to="/app/my-courses" className="btn-primary">Back to my courses</Link>
      </div>
    )
  }

  const chapters = course.chapters || []
  const currentChapter = activeChapter || chapters[0]
  const currentResource = activeResource || currentChapter?.resources?.[0]
  const allResources = chapters.flatMap((ch) => ch.resources || [])
  const currentIndex = allResources.findIndex((r) => r.id === currentResource?.id)

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">

      <aside className="w-full md:w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col md:h-full overflow-y-auto order-2 md:order-1">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <Link to="/app/my-courses" className="text-xs text-gray-400 hover:text-primary-600 mb-2 block">
            Back to my courses
          </Link>
          <h2 className="font-medium text-gray-900 dark:text-white text-sm leading-snug">
            {course.title}
          </h2>
          <div className="flex gap-1 mt-2 flex-wrap">
            <span className={`badge-${course.stream}`}>{course.stream}</span>
            <span className="bg-primary-50 text-primary-800 text-xs px-2 py-0.5 rounded-full">
              {course.form_level?.replace('form', 'Form ')}
            </span>
          </div>
        </div>

        {chapters.length ? (
          <div className="flex-1 overflow-y-auto p-2">
            {chapters.map((chapter, ci) => (
              <div key={chapter.id} className="mb-2">
                <button
                  onClick={() => { setActiveChapter(chapter); setActiveResource(chapter.resources?.[0] || null) }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentChapter?.id === chapter.id
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="text-xs text-gray-400 block mb-0.5">Chapter {ci + 1}</span>
                  {chapter.title}
                </button>

                {currentChapter?.id === chapter.id && chapter.resources?.length > 0 && (
                  <div className="ml-3 mt-1 space-y-0.5">
                    {chapter.resources.map((resource) => (
                      <button
                        key={resource.id}
                        onClick={() => setActiveResource(resource)}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-2 ${
                          currentResource?.id === resource.id
                            ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span>
                          {resource.type === 'video' ? '▶️' :
                           resource.type === 'pdf'   ? '📄' :
                           resource.type === 'note'  ? '📝' : '📊'}
                        </span>
                        <span className="truncate">{resource.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <div className="text-3xl mb-2">📂</div>
              <p className="text-xs text-gray-400">No chapters yet</p>
            </div>
          </div>
        )}
      </aside>

      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 order-1 md:order-2">
        {currentResource ? (
          <div className="p-4 md:p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {currentResource.title}
              </h3>
              <p className="text-xs text-gray-400 mt-1 capitalize">
                {currentResource.type} · {currentChapter?.title}
              </p>
            </div>

            {currentResource.type === 'video' && currentResource.file_url ? (
              <div className="rounded-xl overflow-hidden bg-black mb-4">
                <video src={currentResource.file_url} controls className="w-full max-h-[60vh]" />
              </div>
            ) : currentResource.type === 'pdf' && currentResource.file_url ? (
              <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 mb-4">
                <iframe src={currentResource.file_url} className="w-full h-[70vh]" title={currentResource.title} />
              </div>
            ) : currentResource.file_url ? (
              <div className="card mb-4 text-center py-8">
                <div className="text-4xl mb-3">
                  {currentResource.type === 'note' ? '📝' : '📊'}
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{currentResource.title}</p>
                <a href={currentResource.file_url} target="_blank" rel="noopener noreferrer" className="btn-primary inline-block">
                  Open file
                </a>
              </div>
            ) : currentResource.note_content ? (
              <div className="card mb-4">
                <div className="prose dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {currentResource.note_content}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="card text-center py-12">
                <div className="text-4xl mb-3">📂</div>
                <p className="text-gray-500 text-sm">No content available for this resource</p>
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => {
                  if (currentIndex > 0) {
                    const prev = allResources[currentIndex - 1]
                    const prevChapter = chapters.find((ch) => ch.resources?.some((r) => r.id === prev.id))
                    setActiveChapter(prevChapter)
                    setActiveResource(prev)
                  }
                }}
                disabled={currentIndex === 0}
                className="btn-outline text-sm disabled:opacity-40"
              >
                ← Previous
              </button>

              <span className="text-xs text-gray-400">
                {currentIndex + 1} / {allResources.length}
              </span>

              <button
                onClick={() => {
                  if (currentIndex < allResources.length - 1) {
                    const next = allResources[currentIndex + 1]
                    const nextChapter = chapters.find((ch) => ch.resources?.some((r) => r.id === next.id))
                    setActiveChapter(nextChapter)
                    setActiveResource(next)
                  }
                }}
                disabled={currentIndex === allResources.length - 1}
                className="btn-primary text-sm disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-6">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {chapters.length ? 'Select a lesson to start' : 'No content yet'}
              </h3>
              <p className="text-gray-500 text-sm">
                {chapters.length ? 'Choose a chapter from the sidebar' : 'The teacher has not uploaded any content yet'}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
