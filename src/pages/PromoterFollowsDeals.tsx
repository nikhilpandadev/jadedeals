import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, getPromotersFollowedByShopper, Deal } from '../lib/supabase';
import DealCard from '../components/DealCard';

const PromoterFollowsDeals: React.FC = () => {
  const { user } = useAuth();
  const [promoterDeals, setPromoterDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalDeals, setTotalDeals] = useState(0);

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
        setTotalDeals(0);
        setLoading(false);
        return;
      }
      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data: dealsData, count } = await supabase
        .from('deals')
        .select('*', { count: 'exact' })
        .in('promoter_id', promoterIds)
        .order('created_at', { ascending: false })
        .range(from, to);
      setPromoterDeals(dealsData || []);
      setTotalDeals(count || 0);
      setLoading(false);
    };
    fetchPromotersDeals();
  }, [user, page, pageSize]);

  // No access control needed: this page is for shoppers to see deals from promoters they follow

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">Your Promoters' Deals</h1>
      {/* Paging Controls */}
      {promoterDeals.length > 0 && (
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Page Size:</span>
            <select
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="px-2 py-1 border border-gray-300 rounded"
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm text-gray-600">Page {page} of {Math.ceil(totalDeals / pageSize) || 1}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page * pageSize >= totalDeals}
              className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
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
