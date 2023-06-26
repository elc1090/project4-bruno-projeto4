const axiosApi = axios.create({
    baseURL: 'api/',
    timeout: 30000,
    withCredentials: true,
});

axiosApi.defaults.headers.post['Content-Type'] = 'application/json';
axiosApi.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('access_token');

axiosApi.interceptors.request.use(
    config => {
        return config;
    },
    error => {
        Promise.reject(error)
    }
);

axiosApi.interceptors.response.use(
    (response) => {
        return response
    },
    async function (error) {
        const originalRequest = error.config;
        if ((error.response?.status === 403 || error.response?.status === 401) && !originalRequest._retry) {
            originalRequest._retry = true;
            if (originalRequest.url != '/login') {
                alert('Sessão expirada, faça login novamente');
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);