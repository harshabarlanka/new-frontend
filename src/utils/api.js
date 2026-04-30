import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Restore token from localStorage on module load
const storedToken = localStorage.getItem('saree_token');
if (storedToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export const productAPI = {
  getAll: (params = {}) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getFeatured: () => api.get('/products/featured'),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getBySlug: (slug) => api.get(`/categories/${slug}`),
};

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const uploadAPI = {
  uploadImages: (formData) =>
    api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (productId, quantity = 1) => api.post('/cart/add', { productId, quantity }),
  updateItem: (productId, quantity) => api.put('/cart/update', { productId, quantity }),
  removeItem: (productId) => api.delete('/cart/remove', { data: { productId } }),
  clearCart: () => api.delete('/cart/clear'),
};

export const orderAPI = {
  createOrder: (shippingAddress) => api.post('/orders/create', { shippingAddress }),
  getMyOrders: () => api.get('/orders/my-orders'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  getAllOrders: () => api.get('/orders'),
};

export const paymentAPI = {
  createRazorpayOrder: (orderId) => api.post('/payment/create-order', { orderId }),
  verifyPayment: (data) => api.post('/payment/verify', data),
};

export const shippingAPI = {
  trackOrder: (orderId) => api.get(`/shipping/track/${orderId}`),
  triggerShipment: (orderId, force = false) =>
    api.post(`/shipping/trigger/${orderId}${force ? '?force=true' : ''}`),
};

export default api;
