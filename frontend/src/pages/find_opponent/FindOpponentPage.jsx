import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaPlus, FaGlobe, FaListAlt, FaHistory, FaRobot } from 'react-icons/fa';
import ManualMatch from './components/ManualMatch'
import AutoMatch from './components/AutoMatch'
import AutoMatchView from './components/AutoMatchView';
import MatchCard from './components/common/MatchCard';
import { useAutoMatch } from './components/hooks/useAutoMatch';
import ConfirmApply from './components/ConfirmApply';
import api from '../../services/api';
import fairplayService from '../../services/fairplayService'
import FairplayReviewModal from '../player/components/FairplayReviewModal'
import useModalStore from '../../store/useModalStore';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const str = String(dateStr);
  const clean = str.includes('T') ? str.split('T')[0] : str.includes(' ') ? str.split(' ')[0] : str;
  const parts = clean.split('-');
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : clean;
};

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const str = String(timeStr);
  if (str.includes('T')) return str.split('T')[1].substring(0, 5);
  if (str.includes(' ')) return str.split(' ')[1].substring(0, 5);
  return str.substring(0, 5);
};

const translateSkillLevel = (level) => {
  switch (level) {
    case 'BEGINNER': return 'Tân binh / Vui vẻ';
    case 'INTERMEDIATE': return 'Nghiệp dư / Khá';
    case 'ADVANCED': return 'Chuyên nghiệp / Tốt';
    default: return level || 'Mọi trình độ';
  }
};

const tabs = [
  {
    key: 'all',
    label: (<> <FaGlobe className="inline-block mr-2" />Bảng chung </>)
  },
  {
    key: 'mine',
    label: (<> <FaListAlt className="inline-block mr-2" />Bài của tôi </>)
  },
  {
    key: 'history',
    label: (<> <FaHistory className="inline-block mr-2" />Lịch sử </>)
  }
]

export default function FindOpponentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [fields, setFields] = useState([]);
  const [matches, setMatches] = useState([]);
  const params = new URLSearchParams(location.search);
  const viewMode = params.get('tab') || 'all';

  const { showConfirm, showAlert } = useModalStore();

  const setViewMode = (newMode) => {
    navigate(`/matchmaking?tab=${newMode}`);
  };

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAutoOpen, setIsAutoOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState('');
  const [submittedReviews, setSubmittedReviews] = useState([]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);

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
          api.get('/match-posts?size=100'),
          api.get('/fields')
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

  // Load user's submitted fairplay reviews when we know currentUserId
  useEffect(() => {
    if (!currentUserId) return;
    let cancelled = false;
    const loadReviews = async () => {
      try {
        const list = await fairplayService.getMySubmitted();
        if (!cancelled) setSubmittedReviews(list || []);
      } catch (e) {
        console.warn('Lỗi tải fairplay reviews', e);
      }
    }
    loadReviews();
    return () => { cancelled = true }
  }, [currentUserId]);

  const refreshMatches = async () => {
    try {
      const postsRes = await api.get('/match-posts?size=100');
      setMatches(postsRes.data.content || postsRes.data || []);
    } catch (error) {
      console.error('Lỗi khi refresh match posts', error);
    }
  };

  const openConfirmApply = (match) => {
    setSelectedMatch(match);
    setIsConfirmOpen(true);
  };

  const closeConfirmApply = () => {
    setSelectedMatch(null);
    setIsConfirmOpen(false);
  };

  const handleConfirmApply = async () => {
    closeConfirmApply();
    await refreshMatches();
  };

  const handleAcceptMatchRequest = async (requestId) => {
    showConfirm(
      'Chốt kèo',
      'Bạn chắc chắn muốn chốt kèo với người này?',
      async () => {
        try {
          await api.put(`/match-requests/${requestId}/status`, { status: 'ACCEPTED' });
          await refreshMatches();
          showAlert('Thành công', 'Đã chốt kèo! Chuyển sang tab Lịch sử để xem trạng thái mới.', () => {
            setViewMode('history');
          });
        } catch (error) {
          console.error(error);
          showAlert('Lỗi', error.response?.data?.message || 'Không thể chốt kèo. Vui lòng thử lại.');
        }
      }
    );
  };

  const handleRejectMatchRequest = async (requestId) => {
    showConfirm(
      'Từ chối kèo',
      'Bạn muốn từ chối yêu cầu này?',
      async () => {
        try {
          await api.put(`/match-requests/${requestId}/status`, { status: 'REJECTED' });
          showAlert('Từ chối thành công', 'Đã từ chối yêu cầu.');
          await refreshMatches();
        } catch (error) {
          console.error(error);
          showAlert('Lỗi', error.response?.data?.message || 'Không thể từ chối yêu cầu. Vui lòng thử lại.');
        }
      }
    );
  };

  const handleCreatePostSubmit = async (post) => {
    try {
      await api.post('/match-posts', post);
      await refreshMatches();
      setIsCreateOpen(false);
    } catch (error) {
      console.error(error);
      showAlert('Lỗi', 'Không thể tạo bài đăng. Vui lòng thử lại!');
    }
  };

  const handleDeleteMatchPost = async (postId) => {
    showConfirm(
      'Hủy bài đăng',
      'Bạn có chắc chắn muốn hủy bài đăng này?',
      async () => {
        try {
          await api.delete(`/match-posts/${postId}`);
          showAlert('Thành công', 'Đã hủy bài đăng thành công.');
          await refreshMatches();
        } catch (error) {
          console.error(error);
          showAlert('Lỗi', error.response?.data?.message || 'Không thể hủy bài đăng. Vui lòng thử lại.');
        }
      }
    );
  };

  const publicMatches = matches.filter((m) =>
    (m.status === 'OPEN' || m.status === 'OPENING') &&
    (!m.message || !m.message.startsWith('[LIVE_MATCH]'))
  );

  const myMatches = matches.filter((m) => {
    const isMyPost = m.userId === currentUserId && (!m.message || !m.message.startsWith('[LIVE_MATCH]'));
    const hasPendingRequests = m.requests && m.requests.some((r) => r.status === 'PENDING');
    return isMyPost && (m.status !== 'CLOSED' || hasPendingRequests);
  });

  const historyMatches = matches.filter((m) => {
    const isMyClosedPost = m.userId === currentUserId && m.status === 'CLOSED' && (!m.message || !m.message.startsWith('[LIVE_MATCH]'));
    const isMyCompletedRequest = m.requests && m.requests.some((r) => 
      r.requesterId === currentUserId && (r.status === 'ACCEPTED' || r.status === 'REJECTED')
    );
    return isMyClosedPost || isMyCompletedRequest;
  });

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
              {historyMatches.length > 0 ? historyMatches.map((match) => {
                const isMyPost = match.userId === currentUserId;
                const myRequest = match.requests?.find((r) => r.requesterId === currentUserId);

                // compute review eligibility
                const isClosed = match.status === 'CLOSED';
                let opponentId = null;
                if (match.userId === currentUserId && match.requests && match.requests.length > 0) {
                  const acceptedReq = match.requests.find(r => r.status === 'ACCEPTED');
                  if (acceptedReq) opponentId = acceptedReq.requesterId;
                } else if (match.requests && match.requests.some(r => r.requesterId === currentUserId && r.status === 'ACCEPTED')) {
                  opponentId = match.userId;
                }
                const canReview = isClosed && opponentId && !submittedReviews.includes(match.id);

                return (
                  <div key={match.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">{match.message?.replace('[LIVE_MATCH]', '').trim() || 'Tin tìm đối thủ'}</h3>
                      <p className="text-sm text-slate-500 mb-2">Sân: {fields.find((f) => f.id === match.fieldId)?.name || 'Mọi sân'}</p>
                      <p className="text-sm text-slate-500">Ngày: <span className="font-semibold text-slate-700">{formatDate(match.date)}</span></p>
                      <p className="text-sm text-slate-500">Khung giờ: <span className="font-semibold text-slate-700">{formatTime(match.timeStart)} - {formatTime(match.timeEnd)}</span></p>
                      <p className="text-sm text-slate-500">Trình độ: <span className="font-semibold text-slate-700">{translateSkillLevel(match.skillLevel)}</span></p>
                      <p className="text-sm text-slate-500">Tỉ lệ chia tiền: <span className="font-semibold text-slate-700">{match.costSharing || 'Chia đều'}</span></p>
                    </div>
                    <div className="flex flex-col gap-3 w-full sm:w-auto">
                      {isMyPost ? (
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                          <p className="font-semibold">Người nhận: {match.requests?.[0]?.requesterId || 'Chưa xác định'}</p>
                          <p className="mt-2">Trạng thái: <span className="font-semibold">{match.requests?.[0]?.status || 'COMPLETED'}</span></p>
                          <p className="mt-2">Lời nhắn: {match.requests?.[0]?.message || 'Không có'}</p>
                        </div>
                      ) : myRequest ? (
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                          <p className="font-semibold">Bạn đã gửi yêu cầu nhận kèo này.</p>
                          <p className="mt-2">Trạng thái: <span className="font-semibold">{myRequest.status || 'COMPLETED'}</span></p>
                          <p className="mt-2">Lời nhắn: {myRequest.message || 'Không có'}</p>
                        </div>
                      ) : null}

                      {canReview && (
                        <button
                          onClick={() => {
                            setReviewTarget({ matchId: match.id, revieweeId: opponentId });
                            setReviewModalOpen(true);
                          }}
                          className="self-end w-40 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-600 hover:bg-emerald-100"
                        >
                          Đánh giá đối thủ
                        </button>
                      )}
                    </div>
                  </div>
                );
              }) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-12 text-center text-slate-500 shadow-sm">
                  <p className="text-lg font-medium">Không có lịch sử ghép trận nào.</p>
                </div>
              )}
            </div>
          ) : viewMode === 'mine' ? (
            <div className="grid gap-6">
              {myMatches.length > 0 ? myMatches.map((match) => (
                <div key={match.id} className="grid gap-4">
                  <MatchCard
                    match={match}
                    fieldName={fields.find((f) => f.id === match.fieldId)?.name}
                    className="rounded-3xl shadow-sm border border-gray-100"
                    onDelete={() => handleDeleteMatchPost(match.id)}
                  />
                  {match.requests && match.requests.filter(req => req.status !== 'REJECTED').length > 0 ? (
                    <div className="space-y-3">
                      {match.requests.filter(req => req.status !== 'REJECTED').map((req) => (
                        <div key={req.id || req.requesterId} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                          <p className="text-sm text-slate-700 font-semibold">Người nhận: {req.requesterId}</p>
                          <p className="text-sm text-slate-600 mt-2">Lời nhắn: {req.message || 'Không có'}</p>
                          <p className="text-sm text-slate-600 mt-1">Trạng thái: <span className="font-semibold">{req.status || 'PENDING'}</span></p>
                          {match.status !== 'CLOSED' && req.status !== 'ACCEPTED' && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => handleAcceptMatchRequest(req.id)}
                                className="rounded-full bg-[#60D86E] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#45c45a]"
                              >
                                Chốt kèo
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectMatchRequest(req.id)}
                                className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                              >
                                Từ chối
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                      Chưa có ai gửi yêu cầu nhận kèo này.
                    </div>
                  )}
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
                <MatchCard
                  key={match.id}
                  match={match}
                  fieldName={fields.find((f) => f.id === match.fieldId)?.name}
                  onApply={() => openConfirmApply(match)}
                  className="rounded-3xl shadow-sm border border-gray-100"
                />
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

        <ConfirmApply
          isOpen={isConfirmOpen}
          match={selectedMatch}
          onClose={closeConfirmApply}
          onConfirm={handleConfirmApply}
        />
        <FairplayReviewModal 
          isOpen={reviewModalOpen}
          onClose={(submitted) => {
             setReviewModalOpen(false);
             if (submitted && reviewTarget?.matchId) {
               setSubmittedReviews([...submittedReviews, reviewTarget.matchId]);
             }
             setReviewTarget(null);
          }}
          matchId={reviewTarget?.matchId}
          revieweeId={reviewTarget?.revieweeId}
        />
      </section>
    </main>
  )
}
