import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, getPromotersFollowedByShopper, Deal } from '../lib/supabase';
import DealCard from '../components/DealCard';

const PromoterFollowsDeals: React.FC = () => {
  const { user } = useAuth();
  const [promoterDeals, setPromoterDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromotersDeals = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await getPromotersFollowedByShopper(user.id);
      if (error) {
        setLoading(false);
        return;
      }
      const promoterIds = data?.map((f: any) => f.promoter_id) || [];
      if (promoterIds.length === 0) {
        setPromoterDeals([]);
        setLoading(false);
        return;
      }
      const { data: dealsData } = await supabase
        .from('deals')
        .select('*')
        .in('promoter_id', promoterIds)
        .order('created_at', { ascending: false });
      setPromoterDeals(dealsData || []);
      setLoading(false);
    };
    fetchPromotersDeals();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Please sign in to view your followed promoters' deals.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">Your Promoters' Deals</h1>
      {loading ? (
        <div className="text-center py-16">Loading...</div>
      ) : promoterDeals.length === 0 ? (
        <div className="text-center py-16 text-gray-500">No deals from your followed promoters yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {promoterDeals.map(deal => <DealCard key={deal.id} deal={deal} showPromoter={true} />)}
        </div>
      )}
    </div>
  );
};

export default PromoterFollowsDeals;
