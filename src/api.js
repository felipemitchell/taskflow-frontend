const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function request(path = '', options = {}) {
  if (!API_URL) throw new Error('Configure EXPO_PUBLIC_API_URL no arquivo .env');
  let response;
  try {
    response = await fetch(`${API_URL.replace(/\/$/, '')}/api/tasks${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers }
    });
  } catch (_) { throw new Error('Não foi possível conectar à API. Confira o IP, a rede e o servidor.'); }
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Erro HTTP ${response.status}`);
  return data;
}

export const getTasks = () => request();
export const createTask = (task) => request('', { method: 'POST', body: JSON.stringify(task) });
export const updateTask = (id, task) => request(`/${id}`, { method: 'PUT', body: JSON.stringify(task) });
export const deleteTask = (id) => request(`/${id}`, { method: 'DELETE' });
