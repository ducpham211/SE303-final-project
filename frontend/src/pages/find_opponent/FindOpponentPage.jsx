import { useState } from 'react'
import ManualMatch from './components/ManualMatch'
import AutoMatch from './components/AutoMatch'
import { FaPlus, FaGlobe, FaListAlt, FaHistory, FaRobot } from 'react-icons/fa';

const tabs = [
  {
    key: 'all',
    label: (<> <FaGlobe className="inline-block mr-2" />Bảng chung </>)},
  {
    key: 'mine',
    label: (<> <FaListAlt className="inline-block mr-2" />Bài của tôi </>)},
  {
    key: 'history',
    label: (<> <FaHistory className="inline-block mr-2" />Lịch sử </>)}
]

export default function FindOpponentPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isAutoOpen, setIsAutoOpen] = useState(false)

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600">Bảng Tin Giao Hữu</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">
              Tìm kiếm đối thủ, tự động ghép trận
            </h1>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {tabs.filter((tab) => tab.key !== 'auto').map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    activeTab === tab.key
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAutoOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#60D86E] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#45c45a]"
              >
                <FaRobot />Tự động ghép
              </button>
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#60D86E] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#45c45a]"
              >
                <FaPlus />Đăng tin
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[28px] border border-dashed border-slate-300 bg-white/80 p-12 text-center text-slate-500 shadow-sm">
          <p className="text-lg font-medium text-slate-700">Hiện chưa có bài đăng tìm đối thủ nào.</p>
        </div>

        <ManualMatch
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={(post) => {
            console.log('submit post', post)
            setIsCreateOpen(false)
          }}
          fields={[]}
        />

        <AutoMatch
          isOpen={isAutoOpen}
          onClose={() => setIsAutoOpen(false)}
          onSubmit={(criteria) => {
            console.log('submit auto match criteria', criteria)
            setIsAutoOpen(false)
          }}
        />

      </section>
    </main>

  )
}
