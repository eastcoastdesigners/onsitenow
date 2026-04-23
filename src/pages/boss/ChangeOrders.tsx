import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, DollarSign, Check, X, FileEdit } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/StatusBadge'
import Modal from '../../components/Modal'
import type { ChangeOrderStatus } from '../../types'

export default function ChangeOrders() {
  const { t } = useTranslation()
  const { changeOrders, addChangeOrder, updateChangeOrder, jobSites } = useApp()
  const { currentUser } = useAuth()

  const [showModal, setShowModal] = useState(false)
  const [rejectModal, setRejectModal] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [filterStatus, setFilterStatus] = useState<ChangeOrderStatus | 'all'>('all')

  const [form, setForm] = useState({
    title: '',
    description: '',
    jobSiteId: '',
    estimatedCost: 0,
  })

  const filtered = filterStatus === 'all'
    ? changeOrders
    : changeOrders.filter(o => o.status === filterStatus)

  const totalApproved = changeOrders
    .filter(o => o.status === 'approved')
    .reduce((sum, o) => sum + o.estimatedCost, 0)

  const totalPending = changeOrders
    .filter(o => o.status === 'pending')
    .reduce((sum, o) => sum + o.estimatedCost, 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addChangeOrder({
      ...form,
      status: 'pending',
      requestedBy: currentUser!.id,
      photos: [],
    })
    setShowModal(false)
    setForm({ title: '', description: '', jobSiteId: '', estimatedCost: 0 })
  }

  const handleApprove = (id: string) => {
    updateChangeOrder(id, {
      status: 'approved',
      approvedBy: currentUser!.id,
      approvedAt: new Date().toISOString(),
    })
  }

  const handleReject = (id: string) => {
    updateChangeOrder(id, {
      status: 'rejected',
      rejectionReason,
    })
    setRejectModal(null)
    setRejectionReason('')
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-navy-900">{t('changeOrders.title')}</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-navy-900 hover:bg-navy-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          <Plus size={16} />
          {t('changeOrders.addChangeOrder')}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-3">
            <DollarSign size={20} className="text-green-600" />
          </div>
          <p className="text-2xl font-black text-navy-900">${totalApproved.toLocaleString()}</p>
          <p className="text-sm text-gray-500">{t('changeOrders.approvedValue')}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center mb-3">
            <DollarSign size={20} className="text-yellow-600" />
          </div>
          <p className="text-2xl font-black text-navy-900">${totalPending.toLocaleString()}</p>
          <p className="text-sm text-gray-500">{t('changeOrders.pendingValue')}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm col-span-2 lg:col-span-1">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
            <FileEdit size={20} className="text-blue-600" />
          </div>
          <p className="text-2xl font-black text-navy-900">{changeOrders.length}</p>
          <p className="text-sm text-gray-500">{t('changeOrders.totalOrders')}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
              filterStatus === s
                ? 'bg-navy-900 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {s === 'all' ? t('common.all') : t(`common.${s}`)}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <FileEdit size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{t('changeOrders.noOrders')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => {
            const site = jobSites.find(s => s.id === order.jobSiteId)
            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                  order.status === 'pending' ? 'border-yellow-200' : 'border-gray-100'
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-navy-900 mb-1">{order.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{order.description}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        {site && <span>📍 {site.name}</span>}
                        <span>Created {new Date(order.createdAt).toLocaleDateString()}</span>
                        {order.approvedAt && (
                          <span>Approved {new Date(order.approvedAt).toLocaleDateString()}</span>
                        )}
                        {order.rejectionReason && (
                          <span className="text-red-500">Reason: {order.rejectionReason}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <StatusBadge status={order.status} />
                      <span className="text-lg font-black text-navy-900">
                        ${order.estimatedCost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {order.status === 'pending' && (
                  <div className="px-5 py-3 bg-yellow-50 border-t border-yellow-100 flex items-center gap-2">
                    <span className="text-xs text-yellow-700 font-medium flex-1">{t('changeOrders.awaitingApproval')}</span>
                    <button
                      onClick={() => handleApprove(order.id)}
                      className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Check size={13} />
                      {t('changeOrders.approve')}
                    </button>
                    <button
                      onClick={() => setRejectModal(order.id)}
                      className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-600 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <X size={13} />
                      {t('changeOrders.reject')}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add Change Order Modal */}
      {showModal && (
        <Modal title={t('changeOrders.addChangeOrder')} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('changeOrders.orderTitle')} *</label>
              <input
                required
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="Upgrade to level 5 drywall finish"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('common.description')} *</label>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand resize-none"
                placeholder="Detailed description of the change..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('changeOrders.jobSiteLabel')} *</label>
              <select
                required
                value={form.jobSiteId}
                onChange={e => setForm(f => ({ ...f, jobSiteId: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand bg-white"
              >
                <option value="">{t('common.selectSite')}</option>
                {jobSites.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('changeOrders.estimatedCost')} *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">$</span>
                <input
                  required
                  type="number"
                  min={0}
                  value={form.estimatedCost}
                  onChange={e => setForm(f => ({ ...f, estimatedCost: Number(e.target.value) }))}
                  className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50">
                {t('common.cancel')}
              </button>
              <button type="submit" className="flex-1 py-2.5 bg-brand hover:bg-orange-600 text-white rounded-xl font-bold">
                {t('common.save')}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <Modal title={t('changeOrders.reject')} onClose={() => setRejectModal(null)} size="sm">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('changeOrders.rejectionReason')}</label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand resize-none"
                placeholder="Reason for rejection..."
              />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setRejectModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-semibold">
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={() => handleReject(rejectModal)}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold"
              >
                {t('changeOrders.reject')}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
