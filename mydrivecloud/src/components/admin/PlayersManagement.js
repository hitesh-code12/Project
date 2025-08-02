import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Edit, Trash2, User, Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

const PlayersManagement = () => {
  const { apiCall } = useAuth();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await apiCall('/users');
      // Filter to only show players (exclude admins)
      const playersOnly = response.data.filter(user => user.role === 'player');
      setPlayers(playersOnly);
    } catch (error) {
      console.error('Error fetching players:', error);
      toast.error('Failed to fetch players');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editingPlayer) {
        // Update existing player
        await apiCall(`/users/${editingPlayer.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            phone: data.phone,
          }),
        });
        toast.success('Player updated successfully!');
      } else {
        // Add new player
        await apiCall('/users', {
          method: 'POST',
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            phone: data.phone,
            role: 'player',
            password: 'defaultPassword123', // You might want to generate a random password
          }),
        });
        toast.success('Player added successfully!');
      }
      
      reset();
      setShowAddForm(false);
      setEditingPlayer(null);
      fetchPlayers();
    } catch (error) {
      console.error('Error saving player:', error);
      toast.error('Failed to save player');
    }
  };

  const handleEdit = (player) => {
    setEditingPlayer(player);
    setShowAddForm(true);
    reset({
      name: player.name,
      email: player.email,
      phone: player.phone || '',
    });
  };

  const handleDelete = async (playerId) => {
    if (!playerId) {
      toast.error('Invalid player ID');
      return;
    }

    if (window.confirm('Are you sure you want to delete this player?')) {
      try {
        console.log('Deleting player with ID:', playerId);
        await apiCall(`/users/${playerId}`, {
          method: 'DELETE',
        });
        toast.success('Player deleted successfully!');
        fetchPlayers();
      } catch (error) {
        console.error('Error deleting player:', error);
        toast.error(error.message || 'Failed to delete player');
      }
    }
  };

  const cancelForm = () => {
    setShowAddForm(false);
    setEditingPlayer(null);
    reset();
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Players Management</h1>
          <p className="text-gray-600">Manage all registered players</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Player</span>
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingPlayer ? 'Edit Player' : 'Add New Player'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  className="input-field"
                  placeholder="Enter full name"
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  className="input-field"
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                {...register('phone')}
                className="input-field"
                placeholder="Enter phone number (optional)"
              />
            </div>
            <div className="flex space-x-3">
              <button type="submit" className="btn-primary">
                {editingPlayer ? 'Update Player' : 'Add Player'}
              </button>
              <button type="button" onClick={cancelForm} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Players List */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">All Players</h2>
        {players.length === 0 ? (
          <div className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No players found</p>
            <p className="text-sm text-gray-500">Add your first player to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {players.map((player) => (
                  <tr key={player.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <User className="h-6 w-6 text-primary-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {player.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Player
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{player.email}</div>
                      {player.phone && (
                        <div className="text-sm text-gray-500">{player.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(player.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(player)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(player._id || player.id)}
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
    </div>
  );
};

export default PlayersManagement; 