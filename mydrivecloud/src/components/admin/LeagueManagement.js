import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Trophy, Users, Calendar, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const LeagueManagement = () => {
  const { apiCall } = useAuth();
  const [leagues, setLeagues] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const watchTeamCount = watch('teamCount', 2);

  useEffect(() => {
    fetchLeagues();
    fetchPlayers();
  }, []);

  const fetchLeagues = async () => {
    try {
      const response = await apiCall('/leagues');
      setLeagues(response.data);
    } catch (error) {
      console.error('Error fetching leagues:', error);
      toast.error('Failed to fetch leagues');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayers = async () => {
    try {
      const response = await apiCall('/users');
      const playersOnly = response.data.filter(user => user.role === 'player');
      setPlayers(playersOnly);
    } catch (error) {
      console.error('Error fetching players:', error);
      toast.error('Failed to fetch players');
    }
  };

  const onSubmit = async (data) => {
    try {
      // Build teams array from form data
      const teams = [];
      for (let i = 0; i < data.teamCount; i++) {
        teams.push({
          name: data[`team${i}Name`],
          player1: data[`team${i}Player1`],
          player2: data[`team${i}Player2`]
        });
      }

      const leagueData = {
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        teams: teams
      };

      await apiCall('/leagues', {
        method: 'POST',
        body: JSON.stringify(leagueData),
      });

      toast.success('League created successfully!');
      reset();
      setShowCreateForm(false);
      fetchLeagues();
    } catch (error) {
      console.error('Error creating league:', error);
      toast.error('Failed to create league');
    }
  };

  const handleDeleteLeague = async (leagueId) => {
    if (window.confirm('Are you sure you want to delete this league?')) {
      try {
        await apiCall(`/leagues/${leagueId}`, {
          method: 'DELETE',
        });
        toast.success('League deleted successfully!');
        fetchLeagues();
      } catch (error) {
        console.error('Error deleting league:', error);
        toast.error('Failed to delete league');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getLeagueStatus = (league) => {
    const now = new Date();
    const startDate = new Date(league.startDate);
    const endDate = new Date(league.endDate);

    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'completed';
    return 'active';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">League Management</h1>
          <p className="text-gray-600">Create and manage badminton leagues</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center space-x-2 w-full sm:w-auto justify-center"
        >
          <Plus size={20} />
          <span>Create League</span>
        </button>
      </div>

      {/* Create League Form */}
      {showCreateForm && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New League</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  League Name
                </label>
                <input
                  type="text"
                  {...register('name', { required: 'League name is required' })}
                  className="input-field"
                  placeholder="Enter league name"
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Teams
                </label>
                <select
                  {...register('teamCount', { required: 'Number of teams is required' })}
                  className="input-field"
                >
                  <option value={2}>2 Teams</option>
                  <option value={4}>4 Teams</option>
                  <option value={6}>6 Teams</option>
                  <option value={8}>8 Teams</option>
                </select>
                {errors.teamCount && (
                  <p className="text-sm text-red-600 mt-1">{errors.teamCount.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                {...register('description')}
                className="input-field"
                rows={3}
                placeholder="Enter league description (optional)"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  {...register('startDate', { required: 'Start date is required' })}
                  className="input-field"
                />
                {errors.startDate && (
                  <p className="text-sm text-red-600 mt-1">{errors.startDate.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  {...register('endDate', { required: 'End date is required' })}
                  className="input-field"
                />
                {errors.endDate && (
                  <p className="text-sm text-red-600 mt-1">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            {/* Teams */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Teams</h3>
              {Array.from({ length: watchTeamCount }, (_, i) => (
                <div key={i} className="border rounded-lg p-4 space-y-4">
                  <h4 className="font-medium text-gray-900">Team {i + 1}</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Team Name
                      </label>
                      <input
                        type="text"
                        {...register(`team${i}Name`, { required: 'Team name is required' })}
                        className="input-field"
                        placeholder={`Team ${i + 1} Name`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Player 1
                      </label>
                      <select
                        {...register(`team${i}Player1`, { required: 'Player 1 is required' })}
                        className="input-field"
                      >
                        <option value="">Select Player 1</option>
                        {players.map(player => (
                          <option key={player.id} value={player.id}>
                            {player.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Player 2
                      </label>
                      <select
                        {...register(`team${i}Player2`, { required: 'Player 2 is required' })}
                        className="input-field"
                      >
                        <option value="">Select Player 2</option>
                        {players.map(player => (
                          <option key={player.id} value={player.id}>
                            {player.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button type="submit" className="btn-primary w-full sm:w-auto">
                Create League
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowCreateForm(false);
                  reset();
                }} 
                className="btn-secondary w-full sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Leagues List */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">All Leagues</h2>
        {leagues.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No leagues found</p>
            <p className="text-sm text-gray-500">Create your first league to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    League
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teams
                  </th>
                  <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leagues.map((league) => (
                  <tr key={league.id} className="hover:bg-gray-50">
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {league.name}
                        </div>
                        {league.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {league.description}
                          </div>
                        )}
                        <div className="lg:hidden text-xs text-gray-500 mt-1">
                          {formatDate(league.startDate)} - {formatDate(league.endDate)}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {league.teams.length} teams
                        </span>
                      </div>
                    </td>
                    <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {formatDate(league.startDate)} - {formatDate(league.endDate)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(getLeagueStatus(league))}`}>
                        {getLeagueStatus(league)}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setSelectedLeague(league)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteLeague(league.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* League Details Modal */}
      {selectedLeague && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">{selectedLeague.name}</h3>
                <button
                  onClick={() => setSelectedLeague(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Teams</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedLeague.teams.map((team, index) => (
                      <div key={team.id} className="border rounded-lg p-3">
                        <div className="font-medium text-gray-900">{team.name}</div>
                        <div className="text-sm text-gray-600">
                          {team.player1?.name} & {team.player2?.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {team.wins}W - {team.losses}L ({team.winPercentage}%)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => setSelectedLeague(null)}
                    className="btn-secondary"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeagueManagement; 