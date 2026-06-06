import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const useAutoMatch = (currentUserId, onMatchesFetched, onChangeViewMode) => {
  const navigate = useNavigate();
  
  const [aiStep, setAiStep] = useState('SEARCHING');
  const [aiResults, setAiResults] = useState([]);
  const [isPolling, setIsPolling] = useState(false);
  const [isProcessingMatch, setIsProcessingMatch] = useState(false);
  
  const [searchCriteria, setSearchCriteria] = useState(null);
  const [silentPostId, setSilentPostId] = useState(null);
  const [skippedMatchIds, setSkippedMatchIds] = useState([]);
  
  const [pendingRequest, setPendingRequest] = useState(null);
  const [foundLivePost, setFoundLivePost] = useState(null);
  const [waitingForPostId, setWaitingForPostId] = useState(null);

  const searchCriteriaRef = useRef(null);
  const silentPostIdRef = useRef(null);
  const skippedMatchIdsRef = useRef([]);
  const currentUserIdRef = useRef('');
  const aiStepRef = useRef('SEARCHING');
  const waitingForPostIdRef = useRef(null);

  useEffect(() => { searchCriteriaRef.current = searchCriteria; }, [searchCriteria]);
  useEffect(() => { silentPostIdRef.current = silentPostId; }, [silentPostId]);
  useEffect(() => { skippedMatchIdsRef.current = skippedMatchIds; }, [skippedMatchIds]);
  useEffect(() => { currentUserIdRef.current = currentUserId; }, [currentUserId]);
  useEffect(() => { aiStepRef.current = aiStep; }, [aiStep]);
  useEffect(() => { waitingForPostIdRef.current = waitingForPostId; }, [waitingForPostId]);

  useEffect(() => {
    const savedPostId = localStorage.getItem('autoMatch_silentPostId');
    const savedCriteria = localStorage.getItem('autoMatch_criteria');
    const savedWaitId = localStorage.getItem('autoMatch_waitingForPostId');
    
    if (savedPostId && savedCriteria) {
        setSilentPostId(savedPostId);
        setSearchCriteria(JSON.parse(savedCriteria));
        if (savedWaitId) {
            setWaitingForPostId(savedWaitId);
            setAiStep('WAITING_OPPONENT');
        } else {
            setAiStep('SEARCHING');
        }
        setIsPolling(true);
        onChangeViewMode('ai');
    }
  }, []);

  const handleCancelSearch = async () => {
    setIsPolling(false);
    setSearchCriteria(null);
    setSkippedMatchIds([]);
    setPendingRequest(null);
    setFoundLivePost(null);
    setWaitingForPostId(null);
    
    const currentSilentId = silentPostIdRef.current ? String(silentPostIdRef.current) : null;
    silentPostIdRef.current = null;
    setSilentPostId(null);
    localStorage.removeItem('autoMatch_silentPostId');
    localStorage.removeItem('autoMatch_criteria');
    localStorage.removeItem('autoMatch_waitingForPostId');

    if (currentSilentId) {
        try {
            const token = localStorage.getItem('accessToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`${API_URL}/match-posts/${currentSilentId}`, config);
        } catch (e) {}
    }
    onChangeViewMode('all');
  };

  useEffect(() => {
    let timeoutId;
    let isMounted = true;
    let isActiveRequest = false;

    const pollForMatches = async () => {
      if (!isPolling || !searchCriteriaRef.current || isProcessingMatch || isActiveRequest) return;
      isActiveRequest = true;

      try {
        const token = localStorage.getItem('accessToken');
        if (!token) { setIsPolling(false); return; }
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const postsRes = await axios.get(`${API_URL}/match-posts?size=100`, config);
        const currentMatches = postsRes.data.content || postsRes.data || [];
        if (isMounted) onMatchesFetched(currentMatches);

        if (aiStepRef.current === 'SEARCHING' && !silentPostIdRef.current && searchCriteriaRef.current) {
             let finalTimeStart = null;
             let finalTimeEnd = null;
             if (searchCriteriaRef.current.date && searchCriteriaRef.current.timeStartStr) {
                 finalTimeStart = `${searchCriteriaRef.current.date}T${searchCriteriaRef.current.timeStartStr}:00`;
                 finalTimeEnd = `${searchCriteriaRef.current.date}T${searchCriteriaRef.current.timeEndStr}:00`;
             }
             const postData = {
               message: "[LIVE_MATCH] " + searchCriteriaRef.current.message,
               date: searchCriteriaRef.current.date || new Date().toISOString().split('T')[0],
               timeStart: finalTimeStart,
               timeEnd: finalTimeEnd,
               skillLevel: searchCriteriaRef.current.skillLevel || 'BEGINNER',
               costSharing: '50-50',
               postType: 'FIND_OPPONENT',
               fieldId: searchCriteriaRef.current.fieldId || null
             };
             try {
                 const resPost = await axios.post(`${API_URL}/match-posts`, postData, config);
                 const newId = resPost.data.id || resPost.data.matchPostId || resPost.data;
                 const stringId = String(typeof newId === 'object' ? newId.id : newId);
                 if (isMounted) {
                     setSilentPostId(stringId);
                     silentPostIdRef.current = stringId;
                     localStorage.setItem('autoMatch_silentPostId', stringId);
                 }
             } catch (e) {}
        }

        const currentSilentId = silentPostIdRef.current;
        if (currentSilentId) {
             const cleanSilentId = String(typeof currentSilentId === 'object' ? currentSilentId.id : currentSilentId);
             const mySilentPost = currentMatches.find((p) => String(p.id) === cleanSilentId);
             
             if (mySilentPost && mySilentPost.status === 'CLOSED') {
                 handleCancelSearch();
                 return;
             }
             
             if (mySilentPost && mySilentPost.requests && mySilentPost.requests.length > 0) {
                 const pending = mySilentPost.requests.find((r) => r.status === 'PENDING');
                 if (pending && aiStepRef.current !== 'RECEIVE_REQUEST') {
                     if (isMounted) {
                         setPendingRequest(pending);
                         setFoundLivePost(null);
                         setAiStep('RECEIVE_REQUEST');
                         onChangeViewMode('ai');
                     }
                     return;
                 }
             }
        }

        if ((aiStepRef.current === 'WAITING_OPPONENT' || aiStepRef.current === 'RECEIVE_REQUEST') && waitingForPostIdRef.current) {
             const targetPost = currentMatches.find((p) => p.id === waitingForPostIdRef.current);
             if (targetPost) {
                 const myReq = targetPost.requests?.find((r) => r.requesterId === currentUserIdRef.current);
                 if (myReq) {
                     if (myReq.status === 'ACCEPTED') {
                         if (isMounted) {
                             setIsPolling(false);
                             setIsProcessingMatch(true); 
                             alert('Đối phương đã chốt! Chuyển đến phòng chat...');
                             
                             if (silentPostIdRef.current) {
                                 try { await axios.delete(`${API_URL}/match-posts/${silentPostIdRef.current}`, config); } catch (e) {}
                             }
                             setSilentPostId(null);
                             setWaitingForPostId(null);
                             localStorage.removeItem('autoMatch_silentPostId');
                             localStorage.removeItem('autoMatch_criteria');
                             localStorage.removeItem('autoMatch_waitingForPostId');
                             
                             setIsProcessingMatch(false);
                             navigate('/messages');
                         }
                         return;
                     } else if (myReq.status === 'REJECTED') {
                         if (isMounted) {
                             setSkippedMatchIds(prev => [...prev, waitingForPostIdRef.current]);
                             setWaitingForPostId(null);
                             localStorage.removeItem('autoMatch_waitingForPostId');
                             setAiStep('SEARCHING');
                         }
                     }
                 }
             } else {
                 if (isMounted) {
                     setSkippedMatchIds(prev => [...prev, waitingForPostIdRef.current]);
                     setWaitingForPostId(null);
                     localStorage.removeItem('autoMatch_waitingForPostId');
                     setAiStep('SEARCHING');
                 }
             }
        }

        if (aiStepRef.current === 'SEARCHING') {
            const otherLivePost = currentMatches.find((p) =>
                p.userId !== currentUserIdRef.current &&
                p.message && p.message.startsWith("[LIVE_MATCH]") &&
                (p.status === 'OPEN' || p.status === 'OPENING') &&
                (!searchCriteriaRef.current.date || p.date.startsWith(searchCriteriaRef.current.date)) &&
                (!searchCriteriaRef.current.fieldId || p.fieldId === searchCriteriaRef.current.fieldId) &&
                !skippedMatchIdsRef.current.includes(p.id)
            );

            if (otherLivePost) {
                if (isMounted) {
                    setFoundLivePost(otherLivePost);
                    setPendingRequest(null);
                    setAiStep('MATCH_FOUND');
                    onChangeViewMode('ai');
                    setIsPolling(false);
                }
                return;
            }

            let staticMatches = [];
            try {
                const resAi = await axios.get(`${API_URL}/match-posts/recommendations?playstyle=${encodeURIComponent(searchCriteriaRef.current.message)}`, config);
                staticMatches = resAi.data.map((rec) => {
                  const fullMatch = currentMatches.find((m) => 
                      m.id === rec.matchId && 
                      m.userId !== currentUserIdRef.current && 
                      (m.status === 'OPEN' || m.status === 'OPENING') && 
                      (!m.message || !m.message.startsWith("[LIVE_MATCH]"))
                  );
                  return { ...rec, fullMatch };
                }).filter((r) => r.fullMatch);
            } catch (error) {}

            if (staticMatches.length === 0) {
                const fallbackMatches = currentMatches.filter((m) => 
                    m.userId !== currentUserIdRef.current && 
                    (m.status === 'OPEN' || m.status === 'OPENING') && 
                    (!m.message || !m.message.startsWith("[LIVE_MATCH]"))
                );
                staticMatches = fallbackMatches.map((m) => ({
                    fullMatch: m,
                    aiExplanation: "Hệ thống gợi ý bổ sung dựa trên dữ liệu sân và ngày giờ phù hợp với bạn."
                }));
            }

            if (searchCriteriaRef.current.date) {
                staticMatches = staticMatches.filter((r) => r.fullMatch.date.startsWith(searchCriteriaRef.current.date));
            }
            if (searchCriteriaRef.current.fieldId) {
                staticMatches = staticMatches.filter((r) => r.fullMatch.fieldId === searchCriteriaRef.current.fieldId);
            }
            staticMatches = staticMatches.filter((r) => !skippedMatchIdsRef.current.includes(r.fullMatch.id));

            if (isMounted) {
                setAiResults(staticMatches);
                setAiStep('RESULTS');
                setIsPolling(false);
            }
        }
      } catch (error) {
          if (error.response && (error.response.status === 401 || error.response.status === 403)) {
              if (isMounted) { setIsPolling(false); handleCancelSearch(); }
          }
      } finalId: {
        isActiveRequest = false;
        if (isMounted && isPolling && !isProcessingMatch && (aiStepRef.current === 'SEARCHING' || aiStepRef.current === 'WAITING_OPPONENT')) {
            timeoutId = setTimeout(pollForMatches, 3000);
        }
      }
    };

    if (isPolling && !isProcessingMatch) {
       pollForMatches();
    }

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isPolling, isProcessingMatch, API_URL, navigate]);

  const handleAutoMatchSubmit = async (criteria) => {
    setSearchCriteria(criteria);
    setSkippedMatchIds([]);
    setPendingRequest(null);
    setFoundLivePost(null);
    setWaitingForPostId(null);
    localStorage.removeItem('autoMatch_waitingForPostId');
    setAiStep('SEARCHING');
    setIsPolling(false);
    
    try {
        const token = localStorage.getItem('accessToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        let finalTimeStart = null;
        let finalTimeEnd = null;
        if (criteria.date && criteria.timeStartStr) {
            finalTimeStart = `${criteria.date}T${criteria.timeStartStr}:00`;
            finalTimeEnd = `${criteria.date}T${criteria.timeEndStr}:00`;
        }
        const postData = {
          message: "[LIVE_MATCH] " + criteria.message,
          date: criteria.date || new Date().toISOString().split('T')[0],
          timeStart: finalTimeStart,
          timeEnd: finalTimeEnd,
          skillLevel: criteria.skillLevel || 'BEGINNER',
          costSharing: '50-50',
          postType: 'FIND_OPPONENT',
          fieldId: criteria.fieldId || null
        };
        const resPost = await axios.post(`${API_URL}/match-posts`, postData, config);
        const newId = resPost.data.id || resPost.data.matchPostId || resPost.data;
        const stringId = String(typeof newId === 'object' ? newId.id : newId);
        
        setSilentPostId(stringId);
        localStorage.setItem('autoMatch_silentPostId', stringId);
        localStorage.setItem('autoMatch_criteria', JSON.stringify(criteria));
    } catch (error) {}
    onChangeViewMode('ai');
    setIsPolling(true);
  };

  const handleAcceptLiveMatch = async () => {
    setIsProcessingMatch(true);
    const token = localStorage.getItem('accessToken');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    if (foundLivePost) {
        try {
            await axios.post(`${API_URL}/match-requests`, {
                postId: foundLivePost.id,
                requesterId: currentUserIdRef.current,
                message: "Auto Match Live: Chốt kèo!"
            }, config);
            
            setWaitingForPostId(foundLivePost.id);
            localStorage.setItem('autoMatch_waitingForPostId', foundLivePost.id);
            setFoundLivePost(null);
            setAiStep('WAITING_OPPONENT');
            setIsPolling(true);
        } catch (e) {
            alert('Đối phương đã rời đi hoặc từ chối, Tiếp tục quét...');
            setSkippedMatchIds(prev => [...prev, foundLivePost.id]);
            setFoundLivePost(null);
            setAiStep('SEARCHING');
            setIsPolling(true);
        }
    }
    setIsProcessingMatch(false);
  };

  const handleDeclineLiveMatch = async () => {
    setIsProcessingMatch(true);
    if (foundLivePost) {
        setSkippedMatchIds(prev => [...prev, foundLivePost.id]);
        setFoundLivePost(null);
    }
    setAiStep('SEARCHING');
    setIsPolling(true);
    setIsProcessingMatch(false);
  };

  const handleAcceptStaticSuggestion = async (matchId) => {
    setIsProcessingMatch(true);
    setIsPolling(false);
    try {
        const token = localStorage.getItem('accessToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.post(`${API_URL}/match-requests`, {
            postId: matchId,
            requesterId: currentUserIdRef.current,
            message: "Gợi ý AI: Mình thấy rất phù hợp! Chốt kèo nhé."
        }, config);
        
        if (silentPostIdRef.current) {
            try { await axios.delete(`${API_URL}/match-posts/${silentPostIdRef.current}`, config); } catch (e) {}
            setSilentPostId(null);
            localStorage.removeItem('autoMatch_silentPostId');
            localStorage.removeItem('autoMatch_criteria');
            localStorage.removeItem('autoMatch_waitingForPostId');
        }

        alert('Đã gửi yêu cầu ghép trận! Đang chờ đối phương xác nhận. Bạn có thể xem ở tab Lịch Sử.');
        setSearchCriteria(null);
        onChangeViewMode('history');
    } catch (error) {
        alert('Trận này đã bị đóng hoặc bạn đã gửi yêu cầu rồi!');
        setSkippedMatchIds(prev => [...prev, matchId]);
        setIsPolling(true);
    } finally {
        setIsProcessingMatch(false);
    }
  };

  const handleRejectPending = async () => {
    setIsProcessingMatch(true);
    try {
        const token = localStorage.getItem('accessToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        if (pendingRequest) {
            await axios.put(`${API_URL}/match-requests/${pendingRequest.id}/status`, { status: 'REJECTED' }, config);
            const postsRes = await axios.get(`${API_URL}/match-posts?size=100`, config);
            const currentMatches = postsRes.data.content || postsRes.data || [];
            const theirPost = currentMatches.find((p) => p.userId === pendingRequest.requesterId && p.message?.startsWith("[LIVE_MATCH]"));
            if (theirPost) setSkippedMatchIds(prev => [...prev, theirPost.id]);
        }
    } catch (e) {}
    
    setPendingRequest(null);
    setAiStep('SEARCHING');
    setIsPolling(true);
    setIsProcessingMatch(false);
  };
  
  const handleAcceptPending = async () => {
    setIsProcessingMatch(true);
    setIsPolling(false);
    try {
        const token = localStorage.getItem('accessToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        await axios.put(`${API_URL}/match-requests/${pendingRequest.id}/status`, { status: 'ACCEPTED' }, config);
        
        if (silentPostIdRef.current) {
            try { await axios.delete(`${API_URL}/match-posts/${silentPostIdRef.current}`, config); } catch (e) {}
            setSilentPostId(null);
            localStorage.removeItem('autoMatch_silentPostId');
            localStorage.removeItem('autoMatch_criteria');
            localStorage.removeItem('autoMatch_waitingForPostId');
        }

        alert('Đã chốt thành công! Chuyển tới phòng chat...');
        setSearchCriteria(null);
        navigate('/messages');
    } catch (e) {
        alert('Rất tiếc, có lỗi xảy ra hoặc đối phương đã hủy.');
        handleRejectPending(); 
    } finally {
        setIsProcessingMatch(false);
    }
  };

  return {
      aiStep, aiResults, isPolling, isProcessingMatch, pendingRequest,
      handleAutoMatchSubmit, handleCancelSearch, handleAcceptLiveMatch, handleDeclineLiveMatch,
      handleAcceptStaticSuggestion, handleAcceptPending, handleRejectPending,
      foundLivePost
  };
};