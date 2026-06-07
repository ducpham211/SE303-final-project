import { useState, useEffect } from 'react'
import { FaPlus, FaGlobe, FaListAlt, FaHistory, FaRobot } from 'react-icons/fa';
import ManualMatch from './components/ManualMatch'
import AutoMatch from './components/AutoMatch'
import AutoMatchView from './components/AutoMatchView';
import { useAutoMatch } from './components/hooks/useAutoMatch';
import axiosClient from '../../api/axiosClient';

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
  const [fields, setFields] = useState([]);
  const [matches, setMatches] = useState([]);
  const [viewMode, setViewMode] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAutoOpen, setIsAutoOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState('');

  const autoMatch = useAutoMatch(currentUserId, (data) => setMatches(data), setViewMode);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const payloadBase64 = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        setCurrentUserId(decodedPayload.sub || decodedPayload.id || decodedPayload.userId || '');
      } catch (error) {
        console.error('Không thể đọc token', error);
      }
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [postsRes, fieldsRes] = await Promise.all([
          axiosClient.get('/match-posts?size=100'),
          axiosClient.get('/fields')
        ]);

        setMatches(postsRes.data.content || postsRes.data || []);
        setFields(fieldsRes.data.content || fieldsRes.data || []);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const refreshMatches = async () => {
    try {
      const postsRes = await axiosClient.get('/match-posts?size=100');
      setMatches(postsRes.data.content || postsRes.data || []);
    } catch (error) {
      console.error('Lỗi khi refresh match posts', error);
    }
  };

  const handleCreatePostSubmit = async (post) => {
    try {
      await axiosClient.post('/match-posts', post);
      await refreshMatches();
      setIsCreateOpen(false);
    } catch (error) {
      console.error(error);
      alert('Không thể tạo bài đăng. Vui lòng thử lại!');
    }
  };

  const publicMatches = matches.filter((m) =>
    (m.status === 'OPEN' || m.status === 'OPENING') &&
    (!m.message || !m.message.startsWith('[LIVE_MATCH]'))
  );

  const myMatches = matches.filter((m) =>
    m.userId === currentUserId &&
    (!m.message || !m.message.startsWith('[LIVE_MATCH]'))
  );

  const historyMatches = matches.filter((m) =>
    (m.userId === currentUserId && (m.status === 'CLOSED' || (m.requests && m.requests.length > 0))) ||
    (m.requests && m.requests.some((r) => r.requesterId === currentUserId))
  );

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
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setViewMode(tab.key)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    viewMode === tab.key
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

        <div className="mt-8">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[40vh]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
            </div>
          ) : viewMode === 'ai' ? (
            <AutoMatchView
              aiStep={autoMatch.aiStep}
              aiResults={autoMatch.aiResults}
              pendingRequest={autoMatch.pendingRequest}
              fields={fields}
              isPolling={autoMatch.isPolling}
              isProcessingMatch={autoMatch.isProcessingMatch}
              onCancelSearch={autoMatch.handleCancelSearch}
              onAcceptLiveMatch={autoMatch.handleAcceptLiveMatch}
              onDeclineLiveMatch={autoMatch.handleDeclineLiveMatch}
              onAcceptPending={autoMatch.handleAcceptPending}
              onRejectPending={autoMatch.handleRejectPending}
              onAcceptStaticMatch={autoMatch.handleAcceptStaticSuggestion}
              foundLivePost={autoMatch.foundLivePost}
            />
          ) : viewMode === 'history' ? (
            <div className="space-y-4">
              {historyMatches.length > 0 ? historyMatches.map((match) => (
                <div key={match.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{match.message?.replace('[LIVE_MATCH]', '').trim() || 'Tin tìm đối thủ'}</h3>
                  <p className="text-sm text-slate-500 mb-2">Sân: {fields.find((f) => f.id === match.fieldId)?.name || 'Mọi sân'}</p>
                  <p className="text-sm text-slate-500">Trạng thái: <span className="font-semibold text-slate-700">{match.status}</span></p>
                </div>
              )) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-12 text-center text-slate-500 shadow-sm">
                  <p className="text-lg font-medium">Không có lịch sử ghép trận nào.</p>
                </div>
              )}
            </div>
          ) : viewMode === 'mine' ? (
            <div className="grid gap-6">
              {myMatches.length > 0 ? myMatches.map((match) => (
                <div key={match.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{match.message?.replace('[LIVE_MATCH]', '').trim() || 'Tin tìm đối thủ'}</h3>
                  <p className="text-sm text-slate-500 mb-1">Sân: {fields.find((f) => f.id === match.fieldId)?.name || 'Mọi sân'}</p>
                  <p className="text-sm text-slate-500">Trạng thái: <span className="font-semibold text-slate-700">{match.status}</span></p>
                </div>
              )) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-12 text-center text-slate-500 shadow-sm">
                  <p className="text-lg font-medium">Bạn chưa đăng bài tìm đối thủ nào.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-6">
              {publicMatches.length > 0 ? publicMatches.map((match) => (
                <div key={match.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{match.message?.replace('[LIVE_MATCH]', '').trim() || 'Tin tìm đối thủ'}</h3>
                  <p className="text-sm text-slate-500 mb-1">Sân: {fields.find((f) => f.id === match.fieldId)?.name || 'Mọi sân'}</p>
                  <p className="text-sm text-slate-500">Ngày: {match.date || 'Chưa rõ'}</p>
                </div>
              )) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-12 text-center text-slate-500 shadow-sm">
                  <p className="text-lg font-medium">Hiện chưa có bài đăng tìm đối thủ nào.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <ManualMatch
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreatePostSubmit}
          fields={fields}
        />

        <AutoMatch
          isOpen={isAutoOpen}
          onClose={() => setIsAutoOpen(false)}
          onSubmit={(criteria) => {
            autoMatch.handleAutoMatchSubmit(criteria);
            setIsAutoOpen(false);
          }}
          fields={fields}
        />
      </section>
    </main>
  )
}
