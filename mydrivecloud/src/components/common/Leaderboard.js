import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Trophy, Medal, TrendingUp, Users, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const Leaderboard = () => {
  const { apiCall } = useAuth();
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeagues();
  }, []);

  useEffect(() => {
    if (selectedLeague) {
      fetchLeaderboard(selectedLeague.id);
    }
  }, [selectedLeague]);

  const fetchLeagues = async () => {
    try {
      const response = await apiCall('/leagues');
      setLeagues(response.data);
      if (response.data.length > 0) {
        setSelectedLeague(response.data[0]); // Select first league by default
      }
    } catch (error) {
      console.error('Error fetching leagues:', error);
      toast.error('Failed to fetch leagues');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async (leagueId) => {
    try {
      const response = await apiCall(`/leagues/${leagueId}/leaderboard`);
      setLeaderboard(response.data.leaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Failed to fetch leaderboard');
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Medal className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Medal className="h-5 w-5 text-orange-500" />;
      default: return <span className="text-gray-500 font-medium">{rank}</span>;
    }
  };

  const getStreakIcon = (streak) => {
    if (streak >= 3) return <TrendingUp className="h-4 w-4 text-green-500" />;
    return null;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Trophy className="h-12 w-12 text-yellow-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">🏅 Leaderboard</h1>
        </div>
        <p className="text-gray-600">Track team performance and rankings</p>
      </div>

      {/* League Selector */}
      {leagues.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Select League</h2>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">
                {leagues.length} league{leagues.length !== 1 ? 's' : ''} available
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {leagues.map((league) => (
              <button
                key={league.id}
                onClick={() => setSelectedLeague(league)}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  selectedLeague?.id === league.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-gray-900">{league.name}</div>
                <div className="text-sm text-gray-600">
                  {league.teams.length} teams
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatDate(league.startDate)} - {formatDate(league.endDate)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      {selectedLeague && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedLeague.name} Leaderboard
              </h2>
              <p className="text-gray-600">
                {leaderboard.length} teams • Updated in real-time
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                {selectedLeague.teams.length} teams
              </span>
            </div>
          </div>

          {leaderboard.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No teams found</p>
              <p className="text-sm text-gray-500">Teams will appear here once matches are played</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      W
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      L
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Win %
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Streak
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaderboard.map((team, index) => (
                    <tr key={team.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getRankIcon(index + 1)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {team.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {team.player1?.name} & {team.player2?.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-medium text-green-600">
                          {team.wins}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-medium text-red-600">
                          {team.losses}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-medium text-gray-900">
                          {team.winPercentage}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-1">
                          {getStreakIcon(team.currentStreak)}
                          <span className={`text-sm font-medium ${
                            team.currentStreak >= 3 ? 'text-green-600' : 'text-gray-900'
                          }`}>
                            {team.currentStreak > 0 ? `${team.currentStreak}W` : '-'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* No Leagues Message */}
      {leagues.length === 0 && (
        <div className="card text-center">
          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Leagues Available</h3>
          <p className="text-gray-600">
            No leagues have been created yet. Check back later for updates!
          </p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard; 