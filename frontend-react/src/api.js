
let session = { accessToken: "", user: null };

export const getSession = () => session;

export function clearSession() {
  session = { accessToken: "", user: null };
}

function authorizationHeaders() {
  if (!session.accessToken) {
    return {};
  }

  return {
    Authorization: `Bearer ${session.accessToken}`,
  };
}

export async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authorizationHeaders(),
      ...options.headers,
    },
  });

  const data = response.status === 204
    ? null
    : await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      clearSession();
    }

    const error = new Error(
      data?.message || data?.code || `HTTP ${response.status}`
    );

    error.status = response.status;
    error.code = data?.code;
    throw error;
  }

  return data;
}

export async function login(email, password) {
  const result = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  session = {
    accessToken: result.accessToken,
    user: result.user,
  };

  return result.user;
}

export function canEdit(post) {
  const user = session.user;

  if (!user || !post) {
    return false;
  }

  return user.id === post.authorId;
}

export const api = {
  list: () => request("/posts"),
  detail: (id) => request(`/posts/${id}`),
  create: (input) =>
    request("/posts", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  update: (id, input) =>
    request(`/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  remove: (id) =>
    request(`/posts/${id}`, {
      method: "DELETE",
    }),
  me: () => request("/me"),
};
  