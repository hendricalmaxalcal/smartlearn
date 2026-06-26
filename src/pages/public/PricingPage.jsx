import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

const PLANS = [
  {
    name: 'Free',
    price: 'TSh 0',
    period: '/mo',
    desc: 'Perfect for getting started',
    highlight: false,
    cta: 'Get started free',
    ctaLink: '/register',
    features: [
      { text: 'Form 1 & 2 courses', included: true },
      { text: 'Social feed & messaging', included: true },
      { text: 'Study groups', included: true },
      { text: 'Events & announcements', included: true },
      { text: 'Video lessons', included: false },
      { text: 'PDF downloads', included: false },
      { text: 'Form 3–6 content', included: false },
      { text: 'Certificates', included: false },
    ],
  },
  {
    name: 'Basic',
    price: 'TSh 9,000',
    period: '/mo',
    desc: 'Great for serious learners',
    highlight: true,
    badge: 'Most popular',
    cta: 'Get Basic',
    ctaLink: '/register',
    features: [
      { text: 'All Form 1–4 courses', included: true },
      { text: 'Video lessons', included: true },
      { text: 'PDF downloads', included: true },
      { text: 'Social feed & messaging', included: true },
      { text: 'Study groups', included: true },
      { text: 'Events & announcements', included: true },
      { text: 'Form 5 & 6 content', included: false },
      { text: 'Certificates', included: false },
    ],
  },
  {
    name: 'Premium',
    price: 'TSh 18,000',
    period: '/mo',
    desc: 'Everything you need to excel',
    highlight: false,
    cta: 'Get Premium',
    ctaLink: '/register',
    features: [
      { text: 'All courses Form 1–6', included: true },
      { text: 'Video lessons', included: true },
      { text: 'PDF downloads', included: true },
      { text: 'Certificates', included: true },
      { text: 'Priority support', included: true },
      { text: 'Offline access', included: true },
      { text: 'Social feed & messaging', included: true },
      { text: 'Study groups', included: true },
    ],
  },
]

const FAQS = [
  {
    q: 'Can I switch plans anytime?',
    a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.',
  },
  {
    q: 'Is there a free trial for paid plans?',
    a: 'The Free plan gives you permanent access to Form 1 & 2 content. You can upgrade whenever you are ready.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept M-Pesa, Tigo Pesa, Airtel Money, and bank transfers.',
  },
  {
    q: 'Can I share my account?',
    a: 'No — each account is for one student. Sharing accounts violates our terms of service.',
  },
  {
    q: 'What happens when my subscription expires?',
    a: 'You automatically drop to the Free plan. Your progress and data are never deleted.',
  },
  {
    q: 'Do you offer school or group discounts?',
    a: 'Yes! Contact us for special pricing for schools and institutions.',
  },
]

export default function PricingPage() {
  const { user } = useSelector((s) => s.auth)
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="bg-white border-b border-gray-200 py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-medium text-gray-900 mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-gray-500 text-lg">
            Start for free. Upgrade when you are ready.
            Cancel anytime.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-2xl p-6 ${
                  plan.highlight
                    ? 'border-2 border-primary-400 shadow-sm'
                    : 'border border-gray-200'
                }`}
              >
                {plan.badge && (
                  <div className="text-xs bg-primary-50 text-primary-600 font-medium px-3 py-1 rounded-full inline-block mb-4">
                    {plan.badge}
                  </div>
                )}

                <div className="mb-4">
                  <div className="font-medium text-gray-900 text-lg mb-1">
                    {plan.name}
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-medium text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-gray-400 text-sm">{plan.period}</span>
                  </div>
                  <div className="text-sm text-gray-500">{plan.desc}</div>
                </div>

                <div className="space-y-2.5 mb-6">
                  {plan.features.map((f) => (
                    <div
                      key={f.text}
                      className={`flex items-center gap-2 text-sm ${
                        f.included ? 'text-gray-700' : 'text-gray-300'
                      }`}
                    >
                      <span className={f.included ? 'text-green-500' : ''}>
                        {f.included ? '✓' : '✕'}
                      </span>
                      {f.text}
                    </div>
                  ))}
                </div>

                {user ? (
                  <Link
                    to="/app/dashboard"
                    className={`block text-center py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      plan.highlight
                        ? 'bg-primary-600 text-white hover:bg-primary-800'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Go to dashboard
                  </Link>
                ) : (
                  <Link
                    to={plan.ctaLink}
                    className={`block text-center py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      plan.highlight
                        ? 'bg-primary-600 text-white hover:bg-primary-800'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature comparison */}
      <section className="py-16 px-6 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-medium text-gray-900 text-center mb-10">
            Compare all features
          </h2>
          <div className="card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Feature</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Free</th>
                  <th className="text-center px-4 py-3 text-primary-600 font-medium">Basic</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Premium</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Form 1 & 2 courses',    free: true,  basic: true,  premium: true },
                  { feature: 'Form 3 & 4 courses',    free: false, basic: true,  premium: true },
                  { feature: 'Form 5 & 6 courses',    free: false, basic: false, premium: true },
                  { feature: 'Video lessons',         free: false, basic: true,  premium: true },
                  { feature: 'PDF downloads',         free: false, basic: true,  premium: true },
                  { feature: 'Social feed',           free: true,  basic: true,  premium: true },
                  { feature: 'Messaging',             free: true,  basic: true,  premium: true },
                  { feature: 'Study groups',          free: true,  basic: true,  premium: true },
                  { feature: 'Events',                free: true,  basic: true,  premium: true },
                  { feature: 'Certificates',          free: false, basic: false, premium: true },
                  { feature: 'Offline access',        free: false, basic: false, premium: true },
                  { feature: 'Priority support',      free: false, basic: false, premium: true },
                ].map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-gray-100 last:border-0 ${
                      i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-3 text-gray-700">{row.feature}</td>
                    <td className="px-4 py-3 text-center">
                      {row.free
                        ? <span className="text-green-500 text-base">✓</span>
                        : <span className="text-gray-300 text-base">✕</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.basic
                        ? <span className="text-green-500 text-base">✓</span>
                        : <span className="text-gray-300 text-base">✕</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.premium
                        ? <span className="text-green-500 text-base">✓</span>
                        : <span className="text-gray-300 text-base">✕</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-medium text-gray-900 text-center mb-10">
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-medium text-gray-900 text-sm">
                    {faq.q}
                  </span>
                  <span className="text-gray-400 ml-3 flex-shrink-0">
                    {openFaq === i ? '▲' : '▼'}
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                )}
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
            Join over 2,400 students already learning on SmartLearn
          </p>
          {user ? (
            <Link
              to="/app/dashboard"
              className="inline-block bg-white text-primary-600 font-medium px-8 py-3 rounded-xl text-sm hover:bg-primary-50 transition-colors"
            >
              Go to dashboard
            </Link>
          ) : (
            <Link
              to="/register"
              className="inline-block bg-white text-primary-600 font-medium px-8 py-3 rounded-xl text-sm hover:bg-primary-50 transition-colors"
            >
              Create free account
            </Link>
          )}
        </div>
      </section>

    </div>
  )
}