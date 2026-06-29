import { Link } from 'react-router-dom'

const TEAM = [
  {
    name: 'Dr. Amina Hassan',
    role: 'Founder & CEO',
    stream: 'Science',
    avatar: 'AH',
    color: 'bg-primary-100 text-primary-600',
    bio: 'Former Biology teacher with 15 years experience in Tanzanian secondary education.',
  },
  {
    name: 'John Mwangi',
    role: 'Head of Content',
    stream: 'Arts',
    avatar: 'JM',
    color: 'bg-blue-100 text-blue-600',
    bio: 'Curriculum specialist with expertise in Form 1–6 Arts and Humanities subjects.',
  },
  {
    name: 'Fatuma Kipanga',
    role: 'Lead Developer',
    stream: 'Business',
    avatar: 'FK',
    color: 'bg-emerald-100 text-emerald-600',
    bio: 'Software engineer passionate about building education technology for Africa.',
  },
  {
    name: 'David Osei',
    role: 'Head of Teachers',
    stream: 'Science',
    avatar: 'DO',
    color: 'bg-amber-100 text-amber-600',
    bio: 'Coordinates our network of qualified teachers across all three academic streams.',
  },
]

const VALUES = [
  {
    icon: '📚',
    title: 'Quality education for all',
    desc: 'We believe every student in Tanzania deserves access to high quality academic content regardless of their location or financial situation.',
  },
  {
    icon: '🤝',
    title: 'Community learning',
    desc: 'Learning is better together. Our social features help students connect, collaborate and support each other through their academic journey.',
  },
  {
    icon: '🎯',
    title: 'Results focused',
    desc: 'Everything we build is designed to help students perform better in their exams and build a strong academic foundation for the future.',
  },
  {
    icon: '🌍',
    title: 'Built for Tanzania',
    desc: 'Our content follows the Tanzania Institute of Education curriculum exactly — covering Arts, Science and Business streams from Form 1 to Form 6.',
  },
]

const STATS = [
  { value: '2,400+', label: 'Students enrolled' },
  { value: '180+',   label: 'Courses available' },
  { value: '40+',    label: 'Expert teachers' },
  { value: '3',      label: 'Academic streams' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="bg-white border-b border-gray-200 py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <img
            src="/smartlearn.png"
            alt="SmartLearn"
            className="w-20 h-20 rounded-2xl object-cover mx-auto mb-6"
          />
          <h1 className="text-4xl font-medium text-gray-900 mb-4">
            About SmartLearn
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed">
            We are on a mission to make quality secondary education
            accessible to every student in Tanzania — from Form 1 to Form 6,
            across Arts, Science and Business streams.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary-600 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-medium text-white mb-1">
                  {s.value}
                </div>
                <div className="text-primary-100 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our story */}
      <section className="py-16 px-6 bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-medium text-gray-900 mb-6 text-center">
            Our story
          </h2>
          <div className="prose text-gray-600 text-sm leading-relaxed space-y-4">
            <p>
              SmartLearn was founded in 2024 by a group of educators and
              technologists who saw firsthand how difficult it was for students
              in Tanzania to access quality study materials outside of school.
              Many students relied on expensive private tutoring or outdated
              textbooks that were hard to find.
            </p>
            <p>
              We built SmartLearn to change that. Our platform brings together
              qualified teachers from across Tanzania to create structured,
              curriculum-aligned content for every subject and every form level.
              Students can learn at their own pace, revisit lessons as many
              times as they need, and connect with classmates who are on the
              same journey.
            </p>
            <p>
              Today SmartLearn serves thousands of students across Tanzania
              and we are just getting started. Our goal is to become the most
              trusted learning platform for every secondary school student
              in East Africa.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-6 bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-medium text-gray-900 mb-10 text-center">
            What we believe in
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className="card">
                <div className="text-3xl mb-3">{v.icon}</div>
                <h3 className="font-medium text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-6 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-medium text-gray-900 mb-3 text-center">
            Meet the team
          </h2>
          <p className="text-gray-500 text-center text-sm mb-10">
            Educators and builders working together to improve learning in Tanzania
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((member) => (
              <div key={member.name} className="card text-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-medium mx-auto mb-4 ${member.color}`}>
                  {member.avatar}
                </div>
                <div className="font-medium text-gray-900 text-sm mb-1">
                  {member.name}
                </div>
                <div className="text-xs text-primary-600 font-medium mb-1">
                  {member.role}
                </div>
                <div className="mb-3">
                  <span className={`badge-${member.stream.toLowerCase()}`}>
                    {member.stream}
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 px-6 bg-gray-50 border-b border-gray-200">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-medium text-gray-900 mb-3">
            Get in touch
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            Have questions or want to partner with us? We would love to hear from you.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: '📧', label: 'Email us', value: 'hello@smartlearn.co.tz' },
              { icon: '📱', label: 'Call us', value: '+255 700 000 000' },
              { icon: '📍', label: 'Find us', value: 'Dar es Salaam, Tanzania' },
            ].map((c) => (
              <div key={c.label} className="card text-center">
                <div className="text-2xl mb-2">{c.icon}</div>
                <div className="text-xs text-gray-400 mb-1">{c.label}</div>
                <div className="text-sm font-medium text-gray-900">{c.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-primary-600 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-medium text-white mb-3">
            Ready to start learning?
          </h2>
          <p className="text-primary-100 mb-6 text-sm">
            Join thousands of students already learning on SmartLearn
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/register"
              className="inline-block bg-white text-primary-600 font-medium px-8 py-3 rounded-xl text-sm hover:bg-primary-50 transition-colors"
            >
              Create free account
            </Link>
            <Link
              to="/courses"
              className="inline-block border border-primary-400 text-white font-medium px-8 py-3 rounded-xl text-sm hover:bg-primary-700 transition-colors"
            >
              Browse courses
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}