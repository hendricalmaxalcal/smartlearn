import { useState } from 'react'
import toast from 'react-hot-toast'

const PLANS = [
  {
    name: 'Free',
    price: 'TSh 0',
    period: '/mo',
    desc: 'Form 1–2 content only',
    color: 'bg-gray-50',
    features: ['Form 1 & 2 courses', 'Social feed', 'Messaging', 'Study groups'],
    missing: ['Video lessons', 'PDF downloads', 'Form 3–6 content', 'Certificates'],
  },
  {
    name: 'Basic',
    price: 'TSh 9,000',
    period: '/mo',
    desc: 'Form 1–4, all streams',
    color: 'bg-primary-50',
    highlight: true,
    features: ['All Form 1–4 courses', 'Video lessons', 'PDF downloads', 'Social feed', 'Messaging'],
    missing: ['Form 5 & 6 content', 'Certificates'],
  },
  {
    name: 'Premium',
    price: 'TSh 18,000',
    period: '/mo',
    desc: 'All forms 1–6',
    color: 'bg-amber-50',
    features: ['All courses Form 1–6', 'Video lessons', 'PDF downloads', 'Certificates', 'Priority support', 'Offline access'],
    missing: [],
  },
]

export default function AdminSubscriptions() {
  const [editing, setEditing] = useState(null)
  const [prices, setPrices] = useState({
    Free: 'TSh 0',
    Basic: 'TSh 9,000',
    Premium: 'TSh 18,000',
  })

  const handleSave = (name) => {
    toast.success(`${name} plan updated!`)
    setEditing(null)
  }

  return (
    <div className="p-6">

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-medium">Subscription plans</h2>
        <p className="text-gray-500 text-sm mt-1">
          Manage your subscription tiers and pricing
        </p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`card ${plan.highlight ? 'border-2 border-primary-400' : ''}`}
          >
            {plan.highlight && (
              <div className="text-xs bg-primary-50 text-primary-600 font-medium px-3 py-1 rounded-full inline-block mb-3">
                Most popular
              </div>
            )}

            <div className="flex items-center justify-between mb-2">
              <div className="font-medium text-gray-900">{plan.name}</div>
              <button
                onClick={() => setEditing(editing === plan.name ? null : plan.name)}
                className="text-xs text-primary-600 hover:underline"
              >
                {editing === plan.name ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {editing === plan.name ? (
              <div className="mb-3">
                <input
                  className="input text-sm mb-2"
                  value={prices[plan.name]}
                  onChange={(e) => setPrices({ ...prices, [plan.name]: e.target.value })}
                />
                <button
                  onClick={() => handleSave(plan.name)}
                  className="btn-primary text-xs w-full py-1.5"
                >
                  Save price
                </button>
              </div>
            ) : (
              <div className="mb-3">
                <span className="text-2xl font-medium text-gray-900">
                  {prices[plan.name]}
                </span>
                <span className="text-gray-400 text-sm">{plan.period}</span>
              </div>
            )}

            <div className="text-xs text-gray-400 mb-4">{plan.desc}</div>

            <div className="space-y-1.5">
              {plan.features.map((f) => (
                <div key={f} className="flex items-center gap-2 text-xs text-gray-700">
                  <span className="text-green-500">✓</span> {f}
                </div>
              ))}
              {plan.missing.map((f) => (
                <div key={f} className="flex items-center gap-2 text-xs text-gray-300">
                  <span>✕</span> {f}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div>
        <h3 className="text-base font-medium text-gray-900 mb-4">
          Subscription overview
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Free users',    value: '—', icon: '👤', color: 'bg-gray-50' },
            { label: 'Basic users',   value: '—', icon: '📚', color: 'bg-primary-50' },
            { label: 'Premium users', value: '—', icon: '⭐', color: 'bg-amber-50' },
          ].map((s) => (
            <div key={s.label} className={`${s.color} rounded-xl p-4`}>
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-2xl font-medium text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}