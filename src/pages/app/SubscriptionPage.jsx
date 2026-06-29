import { Link } from 'react-router-dom'

export default function SubscriptionPage() {
  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-medium mb-4">Subscription</h1>
      <p className="text-gray-500 mb-6">Manage your subscription plan</p>
      <Link to="/pricing" className="btn-primary">View plans</Link>
    </div>
  )
}
