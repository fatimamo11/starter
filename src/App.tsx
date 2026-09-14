import React, { useState, useEffect } from 'react';

interface Post {
  id: string;
  author: string;
  avatar: string;
  type: 'announcement' | 'event' | 'community' | 'resource';
  content: string;
  likes: number;
}

interface Opportunity {
  id: string;
  title: string;
  company: string;
  type: 'job' | 'internship' | 'scholarship' | 'volunteer';
  mode: 'remote' | 'hybrid' | 'on-site';
}

const initialPosts: Post[] = [
  { id: '1', author: 'Mona Al-Sayed', avatar: 'M', type: 'announcement', content: "Cohort 8's Demo Day is confirmed for the last Thursday of this month! Alumni, trainers, and hiring partners are all invited.", likes: 24 },
  { id: '2', author: 'Youssef Nabil', avatar: 'Y', type: 'event', content: 'Hosting a free weekend workshop on Git branching strategies for anyone who wants a refresher before their team project.', likes: 15 },
  { id: '3', author: 'Farida Hossam', avatar: 'F', type: 'community', content: "Huge thanks to everyone who showed up to yesterday's mock interview night. Got three separate pieces of feedback!", likes: 41 },
  { id: '4', author: 'Karim El-Sherif', avatar: 'K', type: 'resource', content: 'Sharing my personal notes on React state vs. derived data — the exact distinction that took me three sessions to internalize.', likes: 33 },
  { id: '5', author: 'Nourhan Adel', avatar: 'N', type: 'community', content: "Anyone else's brain completely melt during the Stack vs Queue lecture and then suddenly click two days later?", likes: 52 },
];

const initialOpps: Opportunity[] = [
  { id: '1', title: 'Junior Frontend Developer', company: 'NovaWorks', type: 'job', mode: 'hybrid' },
  { id: '2', title: 'Frontend Engineering Internship', company: 'BrightPath Analytics', type: 'internship', mode: 'remote' },
  { id: '3', title: 'Full-Stack Developer', company: 'Cedar Robotics', type: 'job', mode: 'on-site' },
  { id: '4', title: 'Data Analyst Scholarship — 2026 Cohort', company: 'Delta Health Solutions', type: 'scholarship', mode: 'hybrid' },
  { id: '5', title: 'Community Tech Volunteer', company: 'Nile Youth Foundation', type: 'volunteer', mode: 'on-site' },
  { id: '6', title: 'React Native Developer', company: 'Appify Tech', type: 'job', mode: 'remote' },
  { id: '7', title: 'UI/UX Design Intern', company: 'Creative Studio', type: 'internship', mode: 'hybrid' },
];

export function App() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(initialOpps);
  const [loading, setLoading] = useState<boolean>(false);

  const [postFilter, setPostFilter] = useState<string>('all');
  const [oppTypeFilter, setOppTypeFilter] = useState<string>('all');
  const [oppModeFilter, setOppModeFilter] = useState<string>('all');

  const [actionStack, setActionStack] = useState<string[]>([]);
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [savedOppIds, setSavedOppIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [postsRes, oppsRes] = await Promise.all([
          fetch('https://raw.githubusercontent.com/zko-b4f/api-demo/refs/heads/main/posts.json'),
          fetch('https://raw.githubusercontent.com/zko-b4f/api-demo/refs/heads/main/opps.json')
        ]);

        if (postsRes.ok && oppsRes.ok) {
          const postsData = await postsRes.json();
          const oppsData = await oppsRes.json();
          if (postsData && postsData.length > 0) setPosts(postsData);
          if (oppsData && oppsData.length > 0) setOpportunities(oppsData);
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const pushAction = (action: string) => {
    setActionStack((prev) => [action, ...prev.slice(0, 9)]);
  };

  const handleToggleLike = (postId: string) => {
    const isLiked = likedPostIds.has(postId);
    setLikedPostIds((prev) => {
      const next = new Set(prev);
      if (isLiked) next.delete(postId);
      else next.add(postId);
      return next;
    });

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, likes: isLiked ? p.likes - 1 : p.likes + 1 } : p
      )
    );

    pushAction(`${isLiked ? 'Unliked' : 'Liked'} post #${postId}`);
  };

  const handleToggleSaveOpp = (oppId: string) => {
    const isSaved = savedOppIds.has(oppId);
    setSavedOppIds((prev) => {
      const next = new Set(prev);
      if (isSaved) next.delete(oppId);
      else next.add(oppId);
      return next;
    });

    pushAction(`${isSaved ? 'Unsaved' : 'Saved'} opportunity #${oppId}`);
  };

  const filteredPosts = posts.filter(
    (p) => postFilter === 'all' || p.type === postFilter
  );

  const filteredOpps = opportunities.filter((o) => {
    const matchesType = oppTypeFilter === 'all' || o.type === oppTypeFilter;
    const matchesMode = oppModeFilter === 'all' || o.mode === oppModeFilter;
    return matchesType && matchesMode;
  });

  return (
    <div className="app-container flex flex-col min-h-screen bg-gray-50 text-gray-900">
      
      <header className="app-header bg-white border-b border-gray-200 py-4 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2 rounded-lg font-bold">⚡</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">B4F Hub</h1>
              <p className="text-xs text-gray-500">Community & Opportunities</p>
            </div>
          </div>
          
          {actionStack.length > 0 && (
            <div className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full border border-indigo-100 flex items-center gap-2">
              <span className="font-semibold">Recent Action (Stack):</span>
              <span>{actionStack[0]}</span>
            </div>
          )}
        </div>
      </header>

      <main className="app-layout-main flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        
        <div className="scroll-column bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
          <div className="sticky top-0 bg-white pt-1 pb-4 border-b border-gray-100 z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">💬</span>
                <h2 className="text-lg font-bold text-gray-800">
                  Community Feed <span className="text-xs text-gray-400 font-normal">({filteredPosts.length})</span>
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {['all', 'announcement', 'event', 'community', 'resource'].map((type) => (
                <button
                  key={type}
                  onClick={() => setPostFilter(type)}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                    postFilter === type ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 mt-4">
            {filteredPosts.map((post) => {
              const isLiked = likedPostIds.has(post.id);
              return (
                <div key={post.id} className="post-card p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-all bg-white">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                        {post.avatar || post.author.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">{post.author}</h4>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium uppercase bg-indigo-50 text-indigo-600">
                          {post.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="post-content text-sm text-gray-600 mb-3">{post.content}</p>

                  <div className="post-footer flex items-center justify-between border-t border-gray-50 pt-2.5">
                    <button
                      onClick={() => handleToggleLike(post.id)}
                      className={`like-button flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                        isLiked ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span>{isLiked ? '❤️' : '🤍'}</span>
                      <span>{post.likes} {isLiked ? 'Liked' : 'Like'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="scroll-column bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
          <div className="sticky top-0 bg-white pt-1 pb-4 border-b border-gray-100 z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎯</span>
                <h2 className="text-lg font-bold text-gray-800">
                  Opportunities <span className="text-xs text-gray-400 font-normal">({filteredOpps.length})</span>
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select
                value={oppTypeFilter}
                onChange={(e) => setOppTypeFilter(e.target.value)}
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-700 outline-none"
              >
                <option value="all">All Types</option>
                <option value="job">Job</option>
                <option value="internship">Internship</option>
                <option value="scholarship">Scholarship</option>
                <option value="volunteer">Volunteer</option>
              </select>

              <select
                value={oppModeFilter}
                onChange={(e) => setOppModeFilter(e.target.value)}
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-700 outline-none"
              >
                <option value="all">All Modes</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="on-site">On-site</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            {filteredOpps.map((opp) => {
              const isSaved = savedOppIds.has(opp.id);
              return (
                <div key={opp.id} className="p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-all bg-white flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-gray-900">{opp.title}</h4>
                    <p className="text-xs text-gray-500">{opp.company}</p>
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-600 capitalize">
                        {opp.type}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-600 capitalize">
                        {opp.mode}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleSaveOpp(opp.id)}
                    className={`p-2 rounded-lg border text-xs font-medium transition-colors ${
                      isSaved ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {isSaved ? '★ Saved' : '☆ Save'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </main>

      <footer className="footer bg-gray-900 text-gray-400 text-xs text-center py-3 border-t border-gray-800">
        <p>B4F Hub &copy; {new Date().getFullYear()} — Built with React & TypeScript</p>
      </footer>
    </div>
  );
}

export default App;