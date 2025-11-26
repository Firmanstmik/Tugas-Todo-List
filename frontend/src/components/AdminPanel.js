import React, { useState, useEffect } from 'react';
import api from '../api';
import { useToast } from '../hooks/useToast';
import './AdminPanel.css';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('stats');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingTodo, setEditingTodo] = useState(null);
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [todoFormData, setTodoFormData] = useState({
    title: '',
    completed: false
  });
  const { showToast } = useToast();

  useEffect(() => {
    // Load data based on active tab
    if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'stats') {
      loadStats();
      loadTodos(); // Also load todos for stats calculation
    } else if (activeTab === 'todos') {
      loadTodos();
    }
  }, [activeTab]);

  // Load initial data when component mounts
  useEffect(() => {
    // Always load stats and todos on mount to ensure data is available
    loadStats();
    loadTodos();
  }, []); // Empty dependency array means this runs once on mount

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      console.log('Users response:', response.data);
      
      // Ensure response.data is an array
      if (Array.isArray(response.data)) {
        setUsers(response.data);
        console.log(`✅ Loaded ${response.data.length} users`);
      } else if (response.data && typeof response.data === 'object') {
        // If it's an object, try to extract array from it
        const usersArray = response.data.users || response.data.data || [];
        setUsers(Array.isArray(usersArray) ? usersArray : []);
        console.log(`✅ Loaded ${usersArray.length} users from object`);
      } else {
        setUsers([]);
        console.log('⚠️ No users found or invalid response format');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      console.error('Error response:', error.response?.data);
      showToast(error.response?.data?.error || '❌ Gagal memuat daftar users', 'error');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/stats');
      console.log('Stats response:', response.data);
      
      if (response.data && response.data.users && response.data.todos) {
        // Ensure all values are numbers
        const processedStats = {
          users: {
            total: Number(response.data.users.total || 0),
            byRole: Array.isArray(response.data.users.byRole) 
              ? response.data.users.byRole.map(item => ({
                  role: item.role,
                  count: Number(item.count || 0)
                }))
              : []
          },
          todos: {
            total: Number(response.data.todos.total || 0),
            completed: Number(response.data.todos.completed || 0),
            pending: Number(response.data.todos.pending || 0)
          }
        };
        
        setStats(processedStats);
        console.log('✅ Stats loaded successfully:', processedStats);
      } else {
        console.error('Invalid stats response format:', response.data);
        showToast('❌ Format data statistik tidak valid', 'error');
        setStats({
          users: { total: 0, byRole: [] },
          todos: { total: 0, completed: 0, pending: 0 }
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      console.error('Error response:', error.response?.data);
      showToast(error.response?.data?.error || '❌ Gagal memuat statistik', 'error');
      // Set default stats to prevent errors
      setStats({
        users: { total: 0, byRole: [] },
        todos: { total: 0, completed: 0, pending: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTodos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/todos');
      console.log('Todos response:', response.data);
      
      // Ensure response.data is an array
      if (Array.isArray(response.data)) {
        setTodos(response.data);
        console.log(`✅ Loaded ${response.data.length} todos`);
      } else if (response.data && typeof response.data === 'object') {
        // If it's an object, try to extract array from it
        const todosArray = response.data.todos || response.data.data || [];
        setTodos(Array.isArray(todosArray) ? todosArray : []);
        console.log(`✅ Loaded ${todosArray.length} todos from object`);
      } else {
        setTodos([]);
        console.log('⚠️ No todos found or invalid response format');
      }
    } catch (error) {
      console.error('Error loading todos:', error);
      console.error('Error response:', error.response?.data);
      showToast(error.response?.data?.error || '❌ Gagal memuat todos', 'error');
      setTodos([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'user'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'user'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        const updateData = {
          username: formData.username,
          email: formData.email,
          role: formData.role
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await api.put(`/admin/users/${editingUser.id}`, updateData);
        const changes = [];
        if (updateData.username !== editingUser.username) changes.push('username');
        if (updateData.email !== editingUser.email) changes.push('email');
        if (updateData.role !== editingUser.role) changes.push('role');
        if (updateData.password) changes.push('password');
        
        const changesText = changes.length > 0 ? ` (${changes.join(', ')})` : '';
        showToast(`✨ User "${formData.username}" berhasil diupdate${changesText}!`, 'success');
      } else {
        await api.post('/admin/users', formData);
        showToast(`🎉 User baru "${formData.username}" dengan role ${formData.role.toUpperCase()} berhasil dibuat!`, 'success');
      }
      closeModal();
      loadUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      showToast(error.response?.data?.error || '❌ Gagal menyimpan user', 'error');
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const user = users.find(u => u.id === userId);
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      const roleEmoji = newRole === 'admin' ? '👑' : '👤';
      showToast(`${roleEmoji} Role user "${user?.username || 'User'}" berhasil diubah dari ${user?.role?.toUpperCase() || 'USER'} menjadi ${newRole.toUpperCase()}!`, 'success');
      loadUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      showToast(error.response?.data?.error || '❌ Gagal mengupdate role. Silakan coba lagi!', 'error');
    }
  };

  const deleteUser = async (userId, username) => {
    if (!window.confirm(`Yakin ingin menghapus user "${username}"?`)) {
      return;
    }

    try {
      await api.delete(`/admin/users/${userId}`);
      showToast(`🗑️ User "${username}" berhasil dihapus dari sistem dan database!`, 'success');
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast(error.response?.data?.error || '❌ Gagal menghapus user. Silakan coba lagi!', 'error');
    }
  };

  const toggleTodoComplete = async (todoId, currentStatus) => {
    try {
      const todo = todos.find(t => t.id === todoId);
      await api.put(`/todos/${todoId}`, { completed: !currentStatus });
      
      if (!currentStatus) {
        showToast(`🎉 Yeay! Todo "${todo?.title || 'Unknown'}" berhasil diselesaikan! Status: Completed ✅`, 'success');
      } else {
        showToast(`📝 Todo "${todo?.title || 'Unknown'}" dikembalikan ke pending. Status: Pending ⏳`, 'info');
      }
      
      loadTodos();
      if (activeTab === 'stats') {
        loadStats();
      }
    } catch (error) {
      console.error('Error updating todo:', error);
      showToast(error.response?.data?.error || '❌ Gagal mengupdate status todo. Silakan coba lagi!', 'error');
    }
  };

  const openEditTodoModal = (todo) => {
    setEditingTodo(todo);
    setTodoFormData({
      title: todo.title,
      completed: todo.completed
    });
    setIsTodoModalOpen(true);
  };

  const closeTodoModal = () => {
    setIsTodoModalOpen(false);
    setEditingTodo(null);
    setTodoFormData({
      title: '',
      completed: false
    });
  };

  const handleSaveTodo = async (e) => {
    e.preventDefault();
    
    try {
      await api.put(`/todos/${editingTodo.id}`, {
        title: todoFormData.title,
        completed: todoFormData.completed
      });
      
      const oldTitle = editingTodo.title;
      const titleChanged = oldTitle !== todoFormData.title;
      const statusChanged = editingTodo.completed !== todoFormData.completed;
      
      let message = `✨ Todo berhasil diupdate!`;
      if (titleChanged && statusChanged) {
        message = `✨ Todo "${oldTitle}" → "${todoFormData.title}" berhasil diupdate dan ${todoFormData.completed ? 'diselesaikan' : 'dikembalikan ke pending'}!`;
      } else if (titleChanged) {
        message = `✨ Todo "${oldTitle}" → "${todoFormData.title}" berhasil diupdate!`;
      } else if (statusChanged) {
        message = `✨ Todo "${todoFormData.title}" berhasil ${todoFormData.completed ? 'diselesaikan' : 'dikembalikan ke pending'}!`;
      } else {
        message = `✨ Todo "${todoFormData.title}" berhasil diupdate!`;
      }
      
      showToast(message, 'success');
      
      closeTodoModal();
      loadTodos();
      if (activeTab === 'stats') {
        loadStats();
      }
    } catch (error) {
      console.error('Error updating todo:', error);
      showToast(error.response?.data?.error || '❌ Gagal mengupdate todo. Silakan coba lagi!', 'error');
    }
  };

  const deleteTodo = async (todoId, title) => {
    if (!window.confirm(`Yakin ingin menghapus todo "${title}"?`)) {
      return;
    }

    try {
      await api.delete(`/todos/${todoId}`);
      showToast(`🗑️ Todo "${title}" berhasil dihapus dari database secara permanen!`, 'success');
      loadTodos();
      if (activeTab === 'stats') {
        loadStats();
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
      showToast(error.response?.data?.error || '❌ Gagal menghapus todo. Silakan coba lagi!', 'error');
    }
  };

  return (
    <div className="admin-panel-wrapper">
      <div className="admin-panel">
        <div className="admin-header-section">
          <div className="admin-header">
            <div className="admin-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
              <h2>Admin Panel</h2>
            </div>
          </div>

          <div className="admin-tabs">
            <button
              className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
              <span>Statistics</span>
            </button>
            <button
              className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span>Users Management</span>
            </button>
            <button
              className={`tab-button ${activeTab === 'todos' ? 'active' : ''}`}
              onClick={() => setActiveTab('todos')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 11 12 14 22 4"></polyline>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
              <span>All Todos</span>
            </button>
          </div>
        </div>

        <div className="admin-content-wrapper">
          {loading ? (
            <div className="admin-loading">
              <div className="loading-spinner"></div>
              <p>Loading...</p>
            </div>
          ) : activeTab === 'stats' ? (
            stats && stats.users && stats.todos ? (
              <div className="stats-section">
                <div className="stats-grid">
                  <div className="stat-card primary">
                    <div className="stat-icon-wrapper">
                      <div className="stat-icon users">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                      </div>
                    </div>
                    <div className="stat-content">
                      <h3>Total Users</h3>
                      <p className="stat-value">{Number(stats.users.total || 0)}</p>
                      <p className="stat-label">Registered users</p>
                    </div>
                  </div>

                  <div className="stat-card success">
                    <div className="stat-icon-wrapper">
                      <div className="stat-icon todos">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 11 12 14 22 4"></polyline>
                          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                        </svg>
                      </div>
                    </div>
                    <div className="stat-content">
                      <h3>Total Todos</h3>
                      <p className="stat-value">{Number(stats.todos.total || 0)}</p>
                      <p className="stat-label">All todos</p>
                    </div>
                  </div>

                  <div className="stat-card completed">
                    <div className="stat-icon-wrapper">
                      <div className="stat-icon completed">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                    </div>
                    <div className="stat-content">
                      <h3>Completed</h3>
                      <p className="stat-value">{Number(stats.todos.completed || 0)}</p>
                      <p className="stat-label">
                        {Number(stats.todos.total || 0) > 0 
                          ? Math.round((Number(stats.todos.completed || 0) / Number(stats.todos.total || 1)) * 100) 
                          : 0}% completion rate
                      </p>
                    </div>
                  </div>

                  <div className="stat-card warning">
                    <div className="stat-icon-wrapper">
                      <div className="stat-icon pending">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                      </div>
                    </div>
                    <div className="stat-content">
                      <h3>Pending</h3>
                      <p className="stat-value">{Number(stats.todos.pending || 0)}</p>
                      <p className="stat-label">
                        {Number(stats.todos.total || 0) > 0 
                          ? Math.round((Number(stats.todos.pending || 0) / Number(stats.todos.total || 1)) * 100) 
                          : 0}% pending
                      </p>
                    </div>
                  </div>
                </div>

                <div className="role-stats-section">
                  <div className="role-stats-card">
                    <div className="role-stats-header">
                      <h3>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                        </svg>
                        Users by Role
                      </h3>
                    </div>
                    <div className="role-stats-grid">
                      {stats.users.byRole && Array.isArray(stats.users.byRole) && stats.users.byRole.length > 0 ? (
                        stats.users.byRole.map((item, index) => (
                          <div key={index} className="role-stat-item">
                            <div className={`role-badge-large ${item.role || 'user'}`}>
                              <span className="role-name">{(item.role || 'user').toUpperCase()}</span>
                            </div>
                            <div className="role-count-large">
                              <span className="count-number">{Number(item.count || 0)}</span>
                              <span className="count-label">users</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p style={{ color: '#64748b', padding: '20px', textAlign: 'center' }}>
                          {stats.users.total === 0 ? 'No users found' : 'No role data available'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="admin-loading">
                <p>Loading statistics...</p>
              </div>
            )
          ) : activeTab === 'users' ? (
            <div className="users-section">
              <div className="users-header">
                <div className="users-title">
                  <h3>Users Management</h3>
                  <p>Manage all registered users in the system</p>
                </div>
                <button className="add-user-btn" onClick={openCreateModal}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  <span>Add New User</span>
                </button>
              </div>
              
              <div className="users-table-container">
                {!Array.isArray(users) || users.length === 0 ? (
                  <div className="empty-users">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                    </svg>
                    <p>No users found</p>
                    <button className="add-user-btn-small" onClick={openCreateModal}>
                      Add First User
                    </button>
                  </div>
                ) : (
                  <div className="users-table-wrapper">
                    <table className="users-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Username</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Created</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(users) && users.length > 0 ? (
                          users.map((user) => (
                            <tr key={user.id}>
                              <td className="user-id">{user.id}</td>
                              <td className="user-username">
                                <strong>{user.username}</strong>
                              </td>
                              <td className="user-email">{user.email}</td>
                              <td className="user-role">
                                <select
                                  value={user.role}
                                  onChange={(e) => updateUserRole(user.id, e.target.value)}
                                  className={`role-select ${user.role}`}
                                >
                                  <option value="user">User</option>
                                  <option value="admin">Admin</option>
                                </select>
                              </td>
                              <td className="user-created">
                                {new Date(user.created_at).toLocaleDateString('id-ID', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })}
                              </td>
                              <td className="user-actions">
                                <div className="action-buttons">
                                  <button
                                    className="action-btn edit-btn"
                                    onClick={() => openEditModal(user)}
                                    title="Edit user"
                                  >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                  </button>
                                  <button
                                    className="action-btn delete-btn"
                                    onClick={() => deleteUser(user.id, user.username)}
                                    title="Delete user"
                                  >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <polyline points="3 6 5 6 21 6"></polyline>
                                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                              No users found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="todos-section">
              <div className="todos-header">
                <div className="todos-title">
                  <h3>All Todos</h3>
                  <p>View and manage all todos from all users</p>
                </div>
                <div className="todos-count">
                  <span className="count-badge">{todos.length} todos</span>
                </div>
              </div>
              
              <div className="todos-table-container">
                {todos.length === 0 ? (
                  <div className="empty-todos">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 11 12 14 22 4"></polyline>
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                    </svg>
                    <p>No todos found</p>
                  </div>
                ) : (
                  <div className="todos-table-wrapper">
                    <table className="todos-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Title</th>
                          <th>Owner</th>
                          <th>Status</th>
                          <th>Created</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {todos.map((todo) => (
                          <tr key={todo.id} className={todo.completed ? 'completed-row' : ''}>
                            <td className="todo-id-cell">{todo.id}</td>
                            <td className="todo-title-cell">
                              <div className="todo-title-wrapper">
                                <span className={todo.completed ? 'completed-text' : ''}>{todo.title}</span>
                              </div>
                            </td>
                            <td className="todo-owner-cell">
                              {todo.owner_username ? (
                                <div className="owner-badge">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                  </svg>
                                  <span>{todo.owner_username}</span>
                                </div>
                              ) : (
                                <span className="no-owner">-</span>
                              )}
                            </td>
                            <td className="todo-status-cell">
                              <div className={`status-badge ${todo.completed ? 'completed' : 'pending'}`}>
                                {todo.completed ? (
                                  <>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    Completed
                                  </>
                                ) : (
                                  <>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <circle cx="12" cy="12" r="10"></circle>
                                      <polyline points="12 6 12 12 16 14"></polyline>
                                    </svg>
                                    Pending
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="todo-created-cell">
                              {new Date(todo.created_at || todo.id).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })}
                            </td>
                            <td className="todo-actions-cell">
                              <div className="todo-action-buttons">
                                <button
                                  className="todo-action-btn done-btn"
                                  onClick={() => toggleTodoComplete(todo.id, todo.completed)}
                                  title={todo.completed ? 'Mark as pending' : 'Mark as done'}
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    {todo.completed ? (
                                      <path d="M18 6L6 18M6 6l12 12"></path>
                                    ) : (
                                      <polyline points="20 6 9 17 4 12"></polyline>
                                    )}
                                  </svg>
                                </button>
                                <button
                                  className="todo-action-btn edit-btn"
                                  onClick={() => openEditTodoModal(todo)}
                                  title="Edit todo"
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                  </svg>
                                </button>
                                <button
                                  className="todo-action-btn delete-btn"
                                  onClick={() => deleteTodo(todo.id, todo.title)}
                                  title="Delete todo"
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                  </svg>
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
          )}
        </div>
      </div>

      {/* User Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                </svg>
                <h3>{editingUser ? 'Edit User' : 'Create New User'}</h3>
              </div>
              <button className="modal-close" onClick={closeModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="user-form">
              <div className="form-group">
                <label>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  minLength={3}
                  placeholder="Enter username"
                />
              </div>
              <div className="form-group">
                <label>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="Enter email address"
                />
              </div>
              <div className="form-group">
                <label>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  Password {editingUser && <span className="optional">(leave empty to keep current)</span>}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                  minLength={6}
                  placeholder="Enter password"
                />
              </div>
              <div className="form-group">
                <label>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    <path d="M2 17l10 5 10-5"></path>
                    <path d="M2 12l10 5 10-5"></path>
                  </svg>
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Todo Edit Modal */}
      {isTodoModalOpen && editingTodo && (
        <div className="modal-overlay" onClick={closeTodoModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 11 12 14 22 4"></polyline>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
                <h3>Edit Todo</h3>
              </div>
              <button className="modal-close" onClick={closeTodoModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <form onSubmit={handleSaveTodo} className="user-form">
              <div className="form-group">
                <label>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 11 12 14 22 4"></polyline>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                  </svg>
                  Title
                </label>
                <input
                  type="text"
                  value={todoFormData.title}
                  onChange={(e) => setTodoFormData({ ...todoFormData, title: e.target.value })}
                  required
                  placeholder="Enter todo title"
                />
              </div>
              <div className="form-group">
                <label>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Status
                </label>
                <select
                  value={todoFormData.completed ? 'completed' : 'pending'}
                  onChange={(e) => setTodoFormData({ ...todoFormData, completed: e.target.value === 'completed' })}
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={closeTodoModal}>
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  Update Todo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
