import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { DollarSign, Upload, Plus, Calendar, MapPin, Receipt, Trash2, Edit, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentsManagement = () => {
  const { apiCall } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    fetchExpenses();
    fetchVenues();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await apiCall('/payments/expenses');
      setExpenses(response.data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const fetchVenues = async () => {
    try {
      const response = await apiCall('/venues');
      setVenues(response.data || []);
    } catch (error) {
      console.error('Error fetching venues:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await apiCall('/upload/image', {
        method: 'POST',
        headers: {}, // Let browser set Content-Type for FormData
        body: formData,
      });
      return response.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  };

  const onSubmit = async (data) => {
    try {
      setUploading(true);
      
      let imageUrl = null;
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
      }

      const expenseData = {
        date: data.date,
        venue: data.venue,
        amount: parseFloat(data.amount),
        description: data.description,
        category: data.category,
        imageUrl: imageUrl,
      };

      if (editingExpense) {
        // Update existing expense
        await apiCall(`/payments/expenses/${editingExpense.id}`, {
          method: 'PUT',
          body: JSON.stringify(expenseData),
        });
        toast.success('Expense updated successfully!');
      } else {
        // Add new expense
        await apiCall('/payments/expenses', {
          method: 'POST',
          body: JSON.stringify(expenseData),
        });
        toast.success('Expense added successfully!');
      }
      
      reset();
      setShowAddForm(false);
      setEditingExpense(null);
      setSelectedFile(null);
      fetchExpenses();
    } catch (error) {
      console.error('Error saving expense:', error);
      toast.error('Failed to save expense');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setShowAddForm(true);
    reset({
      date: expense.date.split('T')[0],
      venue: expense.venue,
      amount: expense.amount,
      description: expense.description,
      category: expense.category,
    });
  };

  const handleDelete = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await apiCall(`/payments/expenses/${expenseId}`, {
          method: 'DELETE',
        });
        toast.success('Expense deleted successfully!');
        fetchExpenses();
      } catch (error) {
        console.error('Error deleting expense:', error);
        toast.error('Failed to delete expense');
      }
    }
  };

  const cancelForm = () => {
    setShowAddForm(false);
    setEditingExpense(null);
    setSelectedFile(null);
    reset();
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'court_booking':
        return <MapPin className="h-4 w-4" />;
      case 'equipment':
        return <Receipt className="h-4 w-4" />;
      case 'other':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'court_booking':
        return 'Court Booking';
      case 'equipment':
        return 'Equipment';
      case 'other':
        return 'Other';
      default:
        return category;
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expenses Management</h1>
          <p className="text-gray-600">Track court bookings and equipment expenses</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingExpense ? 'Edit Expense' : 'Add New Expense'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  {...register('date', { required: 'Date is required' })}
                  className="input-field"
                />
                {errors.date && (
                  <p className="text-sm text-red-600 mt-1">{errors.date.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('amount', { 
                    required: 'Amount is required',
                    min: { value: 0, message: 'Amount must be positive' }
                  })}
                  className="input-field"
                  placeholder="Enter amount"
                />
                {errors.amount && (
                  <p className="text-sm text-red-600 mt-1">{errors.amount.message}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Venue
                </label>
                <select
                  {...register('venue', { required: 'Venue is required' })}
                  className="input-field"
                >
                  <option value="">Select a venue</option>
                  {venues.map((venue) => (
                    <option key={venue._id} value={venue._id}>
                      {venue.name}
                    </option>
                  ))}
                </select>
                {errors.venue && (
                  <p className="text-sm text-red-600 mt-1">{errors.venue.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className="input-field"
                >
                  <option value="">Select category</option>
                  <option value="court_booking">Court Booking</option>
                  <option value="equipment">Equipment</option>
                  <option value="other">Other</option>
                </select>
                {errors.category && (
                  <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                className="input-field"
                rows="3"
                placeholder="Enter expense description"
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="input-field"
              />
              {selectedFile && (
                <p className="text-sm text-green-600 mt-1">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>

            <div className="flex space-x-3">
              <button 
                type="submit" 
                className="btn-primary"
                disabled={uploading}
              >
                {uploading ? 'Saving...' : (editingExpense ? 'Update Expense' : 'Add Expense')}
              </button>
              <button type="button" onClick={cancelForm} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Expenses List */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Expenses List</h2>
        {expenses.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No expenses found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Venue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.map((expense) => (
                  <tr key={expense._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expense.venue?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getCategoryIcon(expense.category)}
                        <span className="ml-1">{getCategoryLabel(expense.category)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{expense.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate" title={expense.description}>
                        {expense.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {expense.imageUrl && (
                          <button
                            onClick={() => window.open(expense.imageUrl, '_blank')}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Image"
                          >
                            <Eye size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(expense)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(expense._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
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

export default PaymentsManagement; 