import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getFollowersOfPromoter, removeFollower } from '../lib/supabase';
import { X, Users } from 'lucide-react';

const FollowersManagement: React.FC = () => {
  const { user } = useAuth();
  const [followers, setFollowers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFollowers = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await getFollowersOfPromoter(user.id);
    setFollowers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchFollowers();
    // eslint-disable-next-line
  }, [user]);

  const handleRemove = async (shopperId: string) => {
    if (!user) return;
    await removeFollower(user.id, shopperId);
    fetchFollowers();
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-extrabold mb-8 text-gray-900 flex items-center">
        <Users className="h-8 w-8 mr-3 text-emerald-500" /> Manage Followers
      </h1>
      {loading ? (
        <div className="py-16 text-center">
          <div className="flex justify-center">
            <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></span>
          </div>
          <div className="mt-4 text-gray-500">Loading followers...</div>
        </div>
      ) : followers.length === 0 ? (
        <div className="py-16 text-gray-500 text-center">
          <Users className="h-10 w-10 mx-auto mb-2 text-gray-300" />
          No followers yet.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
          <ul className="divide-y divide-gray-100">
            {followers.map(f => (
              <li key={f.shopper_id} className="flex items-center justify-between py-4 group hover:bg-emerald-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-lg">
                    {f.shopper?.first_name?.[0] || '?'}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-lg">{f.shopper?.first_name} {f.shopper?.last_name}</div>
                    <div className="text-gray-500 text-sm">@{f.shopper?.username}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 opacity-70 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleRemove(f.shopper_id)}
                    className="p-2 rounded-full hover:bg-red-100 transition-colors"
                    title="Remove Follower"
                  >
                    <X className="h-5 w-5 text-red-500 group-hover:text-red-700" />
                  </button>
                  {/* Future icons for more actions can be added here */}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FollowersManagement;
