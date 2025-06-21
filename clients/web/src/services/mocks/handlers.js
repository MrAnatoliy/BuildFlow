import { http, HttpResponse } from 'msw';

// Функция кодирования в base64url
const b64 = (obj) =>
  btoa(JSON.stringify(obj))
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

// Заголовок JWT
const header = { alg: 'HS256', typ: 'JWT' };

// Пользовательские данные
const payload = {
  user_id: 1,
  username: 'mock',
  password: 123,
  first_name: 'John',
  second_name: 'Doe',
  given_name: 'John',
  email: 'john@example.com',
  exp: Math.floor(Date.now() / 1000) + 3600,
};

// Роль пользователя (можно переключать)
const isManager = true;

// Генерация id_token
const createIdToken = () => `${b64(header)}.${b64(payload)}.sig`;

// Токены
const access_token = 'mock-access-token';
const refresh_token = 'mock-refresh-token';

const createTokens = () => ({
  access_token,
  refresh_token,
  id_token: createIdToken(),
});

const jsonHeaders = {
  'Content-Type': 'application/json',
};

export const handlers = [
  // 🔐 Login
  http.post('http://buildflow.api/auth/login', async ({ request }) => {
    const { username, password } = await request.json();

    if (username === 'mock' && password === '123') {
      return HttpResponse.json(createTokens());
    }

    return HttpResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  // 📝 Register
  http.post('http://buildflow.api/auth/register', async () => {
    return HttpResponse.json(
      { message: 'User registered' },
      {
        status: 201,
        headers: jsonHeaders,
      }
    );
  }),

  // 🔁 Refresh Token
  http.post('http://buildflow.api/auth/refresh', async ({ request }) => {
    const { refresh_token: incoming } = await request.json();

    if (incoming === refresh_token) {
      return HttpResponse.json(
        {
          access_token: access_token + '-refreshed',
          refresh_token,
          id_token: createIdToken(),
        },
        {
          status: 200,
          headers: jsonHeaders,
        }
      );
    }

    return HttpResponse.json(
      { message: 'Invalid refresh token' },
      {
        status: 403,
        headers: jsonHeaders,
      }
    );
  }),

  // 🔍 Check auth
  http.get('http://buildflow.api/auth/check', ({ request }) => {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.includes(access_token)) {
      return HttpResponse.json(
        { status: 'ok' },
        { status: 200, headers: jsonHeaders }
      );
    }

    return HttpResponse.json(
      { message: 'Unauthorized' },
      { status: 401, headers: jsonHeaders }
    );
  }),

  // 🧑‍💼 Get Role
  http.get('http://buildflow.api/role/me', () => {
    const role = isManager ? 'project_manager' : 'executor';
    return HttpResponse.json({ name: role }, { status: 200 });
  }),
];
