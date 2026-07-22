// Centralized API Service for ResearchAI Web Application
const BASE_URL = window.location.origin.includes(':5173') ? 'http://localhost:5000' : '';

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${path}`, config);
    const text = await response.text();
    
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      data = null;
    }

    if (response.ok) {
      return data;
    } else {
      const errorMsg = data && data.error ? data.error : `Request failed with status ${response.statusCode || response.status}`;
      throw new Error(errorMsg);
    }
  } catch (error) {
    console.error(`API Error on path: ${path}`, error);
    throw error;
  }
}

export const api = {
  // ---- Auth ----
  async signup(name, email, password, interests = []) {
    const res = await request('/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, interests }),
    });
    return res.user;
  },

  async login(email, password) {
    const res = await request('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return res.user;
  },

  async currentUser() {
    try {
      return await request('/get_current_user');
    } catch (error) {
      return null;
    }
  },

  async logout(email) {
    return await request('/logout', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(email, newPassword) {
    return await request('/reset_password', {
      method: 'POST',
      body: JSON.stringify({ email, new_password: newPassword }),
    });
  },

  // ---- Profile ----
  async getProfile(userId) {
    return await request(`/profile/${userId}`);
  },

  async updateProfile(userId, data) {
    return await request(`/profile/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async changePassword(userId, currentPassword, newPassword) {
    return await request(`/change_password/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
  },

  // ---- Papers ----
  async getPapers(userId, filters = {}) {
    const qp = [];
    if (filters.status) qp.push(`status=${filters.status}`);
    if (filters.favorite) qp.push(`favorite=true`);
    const query = qp.length > 0 ? `?${qp.join('&')}` : '';
    return await request(`/papers/${userId}${query}`);
  },

  async getPaperDetail(paperId) {
    return await request(`/papers/detail/${paperId}`);
  },

  async analyzePaper(userId, fileName, content) {
    return await request('/papers/analyze', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, file_name: fileName, content }),
    });
  },

  async getCitations(paperId) {
    const res = await request(`/papers/${paperId}/citations`);
    return res.citations;
  },

  async citePaper(paperId, style) {
    const res = await request(`/papers/${paperId}/cite`, {
      method: 'POST',
      body: JSON.stringify({ style }),
    });
    return res.citation;
  },

  async toggleFavorite(paperId) {
    const res = await request(`/papers/${paperId}/favorite`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    return res.is_favorite;
  },

  async setStatus(paperId, status) {
    return await request(`/papers/${paperId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  async deletePaper(paperId) {
    return await request(`/papers/${paperId}`, {
      method: 'DELETE',
    });
  },

  // ---- Chat ----
  async getChat(paperId) {
    return await request(`/papers/${paperId}/chat`);
  },

  async askPaper(paperId, userId, question) {
    const res = await request(`/papers/${paperId}/chat`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, question }),
    });
    return res.answer;
  },

  // ---- Notes ----
  async getNotes(userId) {
    return await request(`/notes/${userId}`);
  },

  async addNote(userId, content, paperId = null, paperTitle = '', color = '#F59E0B') {
    return await request('/notes', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        content,
        paper_id: paperId,
        paper_title: paperTitle,
        color,
      }),
    });
  },

  async deleteNote(noteId) {
    return await request(`/notes/${noteId}`, {
      method: 'DELETE',
    });
  },

  // ---- Dashboard ----
  async getDashboard(userId) {
    return await request(`/dashboard/${userId}`);
  }
};
