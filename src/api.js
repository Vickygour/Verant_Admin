const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const getToken = () => localStorage.getItem('admin_token');

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(getToken() && { Authorization: `Bearer ${getToken()}` }) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (res.status === 401 && getToken()) {
    localStorage.removeItem('admin_token');
    window.location.href = '/login';
  }
  if (!res.ok) throw new Error(json.message || 'Something went wrong');
  return json.data;
}

export const api = {
  login: (b) => request('/auth/login', { method: 'POST', body: b }),
  me: () => request('/auth/me'),
  products: (q = '') => request('/products?limit=100' + q),
  createProduct: (b) => request('/products', { method: 'POST', body: b }),
  updateProduct: (id, b) => request(`/products/${id}`, { method: 'PATCH', body: b }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  orders: () => request('/orders/all'),
  updateOrder: (orderId, b) => request(`/orders/${orderId}/status`, { method: 'PATCH', body: b }),
  users: () => request('/users'),
  reviews: (productNumId) => request(`/products/${productNumId}/reviews`),
  deleteReview: (id) => request(`/reviews/${id}`, { method: 'DELETE' }),

  // 🔥 NAYA FUNCTION: Image Upload (FormData handle karta hai)
  uploadImage: async (file) => {
    const formData = new FormData();
    // Make sure 'image' matches the field name in your multer config: upload.single('image')
    formData.append('image', file);

    const res = await fetch(BASE + '/upload', {
      method: 'POST',
      headers: {
        // ⚠️ 'Content-Type': 'multipart/form-data' mat lagana, browser khud set karega with boundary
        ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
      },
      body: formData,
    });

    const json = await res.json().catch(() => ({}));

    if (res.status === 401 && getToken()) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }

    if (!res.ok) throw new Error(json.message || 'Image upload failed');

    // Aapke ApiResponse format ke hisaab se, data.data me url aayega
    return json.data;
  },
};