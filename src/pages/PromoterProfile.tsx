import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, followPromoter, unfollowPromoter, isFollowingPromoter } from '../lib/supabase';
import DealCard from '../components/DealCard';
import { getUserAvatar } from '../utils/avatars';
import { useAuth } from '../contexts/AuthContext';

const PromoterProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    console.log('Fetching promoter profile for user:', username);
    if (!user) {
      navigate('/', { replace: true });
      return;
    }
    const fetchProfileAndDeals = async () => {
      setLoading(true);
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('first_name, last_name, bio, website, social_links, id, username')
        .eq('username', username)
        .single();
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setLoading(false);
        return;
      }
      setProfile(profileData);

      const { data: dealsData, error: dealsError } = await supabase
        .from('deals')
        .select('*')
        .eq('promoter_username', username)
        .order('created_at', { ascending: false });
      if (dealsError) {
        console.error('Error fetching deals:', dealsError);
        setLoading(false);
        return;
      }
      setDeals(dealsData || []);
      setLoading(false);
    };
    if (username) fetchProfileAndDeals();
  }, [username, user, navigate]);

  // Check if current user is following this promoter
  useEffect(() => {
    const checkFollowing = async () => {
      if (user && profile?.id && user.id !== profile.id) {
        setFollowLoading(true);
        const { isFollowing } = await isFollowingPromoter(user.id, profile.id);
        setIsFollowing(isFollowing);
        setFollowLoading(false);
      }
    };
    checkFollowing();
  }, [user, profile]);

  const handleFollow = async () => {
    if (!user) return;
    setFollowLoading(true);
    if (isFollowing) {
      await unfollowPromoter(user.id, profile.id);
      setIsFollowing(false);
    } else {
      await followPromoter(user.id, profile.id);
      setIsFollowing(true);
    }
    setFollowLoading(false);
  };

  if (loading) return <div className="py-16 text-center">Loading...</div>;
  if (!profile) return <div className="py-16 text-center">Promoter not found.</div>;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="flex flex-col items-center mb-10">
        <img
          src={getUserAvatar(profile)}
          alt="Avatar"
          className="w-24 h-24 rounded-full mb-4 border-4 border-emerald-200 object-cover"
        />
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          {profile.first_name || ''} {profile.last_name || ''}
        </h2>
        {profile.bio && <p className="text-gray-600 mb-2">{profile.bio}</p>}
        {/* Follow/Unfollow button for shoppers */}
        {user && user.id !== profile.id && (
          <button
            onClick={handleFollow}
            disabled={followLoading}
            className={`mt-2 px-6 py-2 rounded-lg font-semibold transition-all duration-200 shadow-sm border-2 ${isFollowing ? 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200' : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-500 hover:from-emerald-600 hover:to-teal-700'}`}
          >
            {followLoading ? '...' : isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        )}
        <div className="flex space-x-4 mt-2">
          {profile.website && (
            <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline">Website</a>
          )}
          {profile.social_links?.twitter && (
            <a href={profile.social_links.twitter} target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline">Twitter</a>
          )}
          {profile.social_links?.instagram && (
            <a href={profile.social_links.instagram} target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline">Instagram</a>
          )}
          {profile.social_links?.youtube && (
            <a href={profile.social_links.youtube} target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline">YouTube</a>
          )}
          {profile.social_links?.tiktok && (
            <a href={profile.social_links.tiktok} target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline">TikTok</a>
          )}
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-4">Deals by {profile.first_name || ''} {profile.last_name || ''}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {deals.length === 0 ? (
          <div className="col-span-2 text-gray-500">No deals posted yet.</div>
        ) : (
          deals.map(deal => <DealCard key={deal.id} deal={deal} showPromoter={false} />)
        )}
      </div>
    </div>
  );
};

export default PromoterProfile;
