import { Link } from 'react-router-dom'

const features = [
  {
    icon: '📚',
    title: 'Structured courses',
    desc: 'Form 1–6 content organised by stream — Arts, Science, Business — with chapters, videos and notes.',
  },
  {
    icon: '👥',
    title: 'Study groups',
    desc: 'Join or create private study groups by form level and stream. Collaborate and share resources.',
  },
  {
    icon: '💬',
    title: 'Real-time messaging',
    desc: 'Direct messages and group chats with classmates. Share files and discuss topics instantly.',
  },
  {
    icon: '📅',
    title: 'Events & announcements',
    desc: 'Stay updated on school events, exam schedules and important announcements from teachers.',
  },
  {
    icon: '📊',
    title: 'Progress tracking',
    desc: 'See your completion rate, quiz scores and learning streaks on your personal dashboard.',
  },
  {
    icon: '📱',
    title: 'Learn anywhere',
    desc: 'Mobile-friendly design lets you study from any device, online or with downloaded resources.',
  },
]

const courses = [
  {
    title: 'Biology Form 4 — Cell division',
    stream: 'science',
    form: 'Form 4',
    lessons: 24,
    rating: '4.8',
    bg: '#EEEDFE',
    icon: '🔬',
  },
  {
    title: 'Accounts Form 5 — Financial statements',
    stream: 'business',
    form: 'Form 5',
    lessons: 18,
    rating: '4.9',
    bg: '#FAEEDA',
    icon: '💰',
    premium: true,
  },
  {
    title: 'History Form 3 — Colonial era',
    stream: 'arts',
    form: 'Form 3',
    lessons: 20,
    rating: '4.7',
    bg: '#E6F1FB',
    icon: '✏️',
  },
]

const plans = [
  {
    name: 'Free',
    price: 'TSh 0',
    period: '/mo',
    desc: 'Form 1–2 content only',
    features: ['Form 1 & 2 courses', 'Social feed & messaging'],
    missing: ['Video lessons', 'PDF downloads', 'Form 5 & 6 content'],
    cta: 'Sign up free',
    highlight: false,
  },
  {
    name: 'Basic',
    price: 'TSh 9,000',
    period: '/mo',
    desc: 'Form 1–4, all streams',
    features: ['All Form 1–4 courses', 'Video lessons', 'PDF downloads', 'Social feed & messaging'],
    missing: ['Form 5 & 6 content'],
    cta: 'Get Basic',
    highlight: true,
  },
  {
    name: 'Premium',
    price: 'TSh 18,000',
    period: '/mo',
    desc: 'All forms 1–6',
    features: ['All courses Form 1–6', 'Certificates', 'Priority support', 'Offline downloads'],
    missing: [],
    cta: 'Get Premium',
    highlight: false,
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="bg-white border-b border-gray-200 py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center mb-6">
            <img
              src="/smartlearn.png"
              alt="SmartLearn"
              className="w-20 h-20 rounded-2xl object-cover"
            />
          </div>
          <h1 className="text-4xl font-medium text-gray-900 mb-4 leading-tight">
            Learn smarter from{' '}
            <span className="text-primary-600">Form 1 to Form 6</span>
          </h1>
          <p className="text-gray-500 text-lg mb-8 leading-relaxed">
            Quality academic content for Arts, Science and Business students —
            taught by qualified teachers, accessible anywhere.
          </p>
          <div className="flex gap-3 justify-center mb-12">
            <Link to="/register" className="btn-primary px-8 py-3 text-base">
              Start for free
            </Link>
            <Link to="/courses" className="btn-outline px-8 py-3 text-base">
              Browse courses
            </Link>
          </div>
          <div className="flex justify-center gap-10 flex-wrap">
            {[
              { value: '2,400+', label: 'Students enrolled' },
              { value: '180+',   label: 'Courses available' },
              { value: '40+',    label: 'Expert teachers' },
              { value: '3',      label: 'Academic streams' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-medium text-gray-900">{s.value}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-medium text-gray-900 mb-2">
              Everything a student needs
            </h2>
            <p className="text-gray-500">
              One platform covering academics, social learning and collaboration
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.title} className="card hover:border-primary-200 transition-colors">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-medium text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular courses */}
      <section className="py-16 px-6 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-medium text-gray-900 mb-1">Popular courses</h2>
              <p className="text-gray-500">Browse top-rated content across all streams</p>
            </div>
            <Link to="/courses" className="btn-outline text-sm">
              View all courses
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {courses.map((c) => (
              <div
                key={c.title}
                className="border border-gray-200 rounded-xl overflow-hidden hover:border-primary-200 transition-colors cursor-pointer"
              >
                <div
                  className="h-28 flex items-center justify-center text-4xl"
                  style={{ background: c.bg }}
                >
                  {c.icon}
                </div>
                <div className="p-4">
                  <h4 className="font-medium text-gray-900 text-sm mb-2 leading-snug">
                    {c.title}
                  </h4>
                  <div className="flex flex-wrap gap-1 mb-2">
                    <span className={`badge-${c.stream}`}>{c.stream}</span>
                    <span className="bg-primary-50 text-primary-800 text-xs px-2 py-0.5 rounded-full">
                      {c.form}
                    </span>
                    {c.premium && <span className="badge-premium">Premium</span>}
                  </div>
                  <div className="text-xs text-gray-400">
                    {c.lessons} lessons · {c.rating} ★
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-medium text-gray-900 mb-2">
              Simple, transparent pricing
            </h2>
            <p className="text-gray-500">Upgrade anytime. Cancel anytime.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`bg-white rounded-xl p-6 ${
                  p.highlight
                    ? 'border-2 border-primary-400'
                    : 'border border-gray-200'
                }`}
              >
                {p.highlight && (
                  <div className="text-xs bg-primary-50 text-primary-600 font-medium px-3 py-1 rounded-full inline-block mb-3">
                    Most popular
                  </div>
                )}
                <div className="font-medium text-gray-900 mb-1">{p.name}</div>
                <div className="mb-1">
                  <span className="text-3xl font-medium text-gray-900">{p.price}</span>
                  <span className="text-gray-400 text-sm">{p.period}</span>
                </div>
                <div className="text-xs text-gray-400 mb-4">{p.desc}</div>
                <div className="space-y-2 mb-6">
                  {p.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-green-500 text-base">✓</span> {f}
                    </div>
                  ))}
                  {p.missing.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="text-base">✕</span> {f}
                    </div>
                  ))}
                </div>
                <Link
                  to="/register"
                  className={`block text-center py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    p.highlight
                      ? 'bg-primary-600 text-white hover:bg-primary-800'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-16 px-6 bg-primary-600 text-center">
        <div className="max-w-xl mx-auto">
          <img
            src="/smartlearn.png"
            alt="SmartLearn"
            className="w-14 h-14 rounded-xl object-cover mx-auto mb-4"
          />
          <h2 className="text-2xl font-medium text-white mb-3">
            Ready to start learning?
          </h2>
          <p className="text-primary-100 mb-6 text-sm">
            Join over 2,400 students already learning on SmartLearn
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-primary-600 font-medium px-8 py-3 rounded-lg text-sm hover:bg-primary-50 transition-colors"
          >
            Create free account
          </Link>
        </div>
      </section>

    </div>
  )
}