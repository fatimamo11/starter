import { useState, useEffect } from 'react';
import { Post, Opportunity, Stack, Queue, HashTable, HashSet } from './utils';

export function useHub() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingOpps, setLoadingOpps] = useState(true);
  const [errorPosts, setErrorPosts] = useState<string | null>(null);
  const [errorOpps, setErrorOpps] = useState<string | null>(null);

  // Community Filters
  const [postCategory, setPostCategory] = useState<string>('all');
  const [postSearch, setPostSearch] = useState<string>('');
  const [likedOnly, setLikedOnly] = useState<boolean>(false);

  // Opportunities Filters
  const [oppType, setOppType] = useState<string>('all');
  const [oppWorkMode, setOppWorkMode] = useState<string>('all');
  const [oppSearch, setOppSearch] = useState<string>('');
  const [savedOnly, setSavedOnly] = useState<boolean>(false);

  // Data Structures
  const [oppsHashTable, setOppsHashTable] = useState<HashTable<Opportunity>>(new HashTable());
  const [savedSet, setSavedSet] = useState<HashSet>(new HashSet());
  const [historyStack] = useState(() => new Stack<string>());
  const [activeOppId, setActiveOppId] = useState<string | null>(null);

  // Notification Queue
  const [notificationQueue] = useState(() => new Queue<string>());
  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  const triggerNotification = (message: string) => {
    notificationQueue.enqueue(message);
    if (!activeNotification) {
      setActiveNotification(notificationQueue.peek() || null);
    }
  };

  const dismissNotification = () => {
    notificationQueue.dequeue();
    setActiveNotification(notificationQueue.peek() || null);
  };

  const fetchPosts = async () => {
    setLoadingPosts(true);
    setErrorPosts(null);
    try {
      const res = await fetch('/api/posts');
      if (!res.ok) throw new Error('Failed to load community feed');
      const data = await res.json();
      setPosts(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not load community feed';
      setErrorPosts(message);
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchOpportunities = async () => {
    setLoadingOpps(true);
    setErrorOpps(null);
    try {
      const res = await fetch('/api/opportunities');
      if (!res.ok) throw new Error('Failed to load opportunities');
      const data: Opportunity[] = await res.json();
      setOpportunities(data);
      const table = new HashTable<Opportunity>(data);
      setOppsHashTable(table);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not load opportunities';
      setErrorOpps(message);
    } finally {
      setLoadingOpps(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchOpportunities();
  }, []);

  const createPost = async (content: string, category: Post['category']) => {
    const trimmed = content.trim();
    if (!trimmed) {
      triggerNotification('Post content cannot be empty');
      return false;
    }
    if (trimmed.length < 3) {
      triggerNotification('Post must be at least 3 characters');
      return false;
    }

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmed, category }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to create post');
      }
      const newPost = await res.json();
      setPosts(prev => [newPost, ...prev]);
      triggerNotification('Your post was published.');
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error creating post';
      triggerNotification(message);
      return false;
    }
  };

  const toggleLikePost = async (id: string) => {
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to update like');
      const updatedPost = await res.json();
      setPosts(prev => prev.map(p => p.id === id ? updatedPost : p));
    } catch (err: unknown) {
      triggerNotification('Could not update like. Please try again.');
    }
  };

  const applyOpportunity = async (id: string) => {
    const opp = opportunities.find(o => o.id === id);
    if (opp?.applied) return;

    try {
      const res = await fetch(`/api/opportunities/${id}`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to submit application');
      const updatedOpp = await res.json();
      setOpportunities(prev => prev.map(o => o.id === id ? updatedOpp : o));
      
      oppsHashTable.put(id, updatedOpp);
      
      triggerNotification('Application submitted successfully!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Application error';
      triggerNotification(message);
    }
  };

  const toggleSaveOpportunity = (id: string) => {
    if (savedSet.has(id)) {
      savedSet.remove(id);
    } else {
      savedSet.add(id);
    }
    setSavedSet(new HashSet(savedSet.toArray()));
  };

  const viewOpportunityDetails = (id: string) => {
    if (activeOppId && activeOppId !== id) {
      historyStack.push(activeOppId);
    }
    setActiveOppId(id);
  };

  const handleBackOpportunity = () => {
    if (!historyStack.isEmpty()) {
      const previousId = historyStack.pop();
      setActiveOppId(previousId || null);
    } else {
      setActiveOppId(null);
    }
  };

  // Community Filtered Results
  const filteredPosts = posts.filter(p => {
    const matchesCategory = postCategory === 'all' || p.category === postCategory;
    const matchesSearch = p.author.toLowerCase().includes(postSearch.toLowerCase()) ||
                          p.content.toLowerCase().includes(postSearch.toLowerCase());
    const isPostLiked = p.liked || p.isLiked;
    const matchesLiked = !likedOnly || isPostLiked;
    return matchesCategory && matchesSearch && matchesLiked;
  });

  // Opportunities Filtered Results
  const filteredOpps = opportunities.filter(o => {
    const matchesType = oppType === 'all' || o.type.toLowerCase() === oppType.toLowerCase();
    const matchesWorkMode = oppWorkMode === 'all' || (o.workMode && o.workMode.toLowerCase().replace(/-/g, '') === oppWorkMode.toLowerCase().replace(/-/g, ''));
    const matchesSearch = o.title.toLowerCase().includes(oppSearch.toLowerCase()) ||
                          o.company.toLowerCase().includes(oppSearch.toLowerCase()) ||
                          (o.skills && o.skills.some(s => s.toLowerCase().includes(oppSearch.toLowerCase())));
    const matchesSaved = !savedOnly || savedSet.has(o.id);
    return matchesType && matchesWorkMode && matchesSearch && matchesSaved;
  });

  return {
    posts: filteredPosts,
    totalPostsCount: posts.length,
    opportunities: filteredOpps,
    totalOppsCount: opportunities.length,
    loadingPosts,
    loadingOpps,
    errorPosts,
    errorOpps,
    
    // Post Filters State
    postCategory,
    setPostCategory,
    postSearch,
    setPostSearch,
    likedOnly,
    setLikedOnly,

    // Opportunity Filters State
    oppType,
    setOppType,
    oppWorkMode,
    setOppWorkMode,
    oppSearch,
    setOppSearch,
    savedOnly,
    setSavedOnly,

    // Actions
    createPost,
    toggleLikePost,
    applyOpportunity,
    toggleSaveOpportunity,
    isSaved: (id: string) => savedSet.has(id),

    // Details & Stack
    activeOpportunity: activeOppId ? oppsHashTable.get(activeOppId) : null,
    viewOpportunityDetails,
    handleBackOpportunity,
    hasHistory: !historyStack.isEmpty(),

    // Notifications Queue
    activeNotification,
    dismissNotification,

    // Retries
    retryPosts: fetchPosts,
    retryOpps: fetchOpportunities
  };
}