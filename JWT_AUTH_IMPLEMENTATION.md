# JWT Authentication Implementation Guide

Dokumen ini menjelaskan cara menambahkan autentikasi JWT ke aplikasi Express yang ada di repo.

## Tujuan

- Menambahkan endpoint login yang menghasilkan token JWT
- Menambahkan middleware verifikasi token JWT
- Menggunakan pola error handling dan middleware yang sudah ada di repo

## Dependencies yang dibutuhkan

Install paket berikut:

```bash
npm install jsonwebtoken dotenv
```

Jika ingin menyimpan password terenkripsi, tambahkan:

```bash
npm install bcrypt
```
```

## Environment variables

Tambahkan variabel berikut di file `.env`:

```env
JWT_SECRET=your-very-strong-secret
JWT_EXPIRES_IN=1d
```

- `JWT_SECRET`: kunci rahasia untuk menandatangani token
- `JWT_EXPIRES_IN`: waktu berlaku token, misalnya `1d`, `12h`, `30m`

## Rekomendasi struktur file

```
src/
  api/
    auth/
      auth.js
      auth.schema.js
  middlewares/
    auth.js
    errorHandler.js
    validate.js
  utils/
    AppError.js
src/router.js
index.js
```

## 1. Flow otentikasi JWT

1. Klien mengirim `POST /api/auth/login` dengan email/username dan password.
2. Server memvalidasi input dan mencari pengguna di database.
3. Jika kredensial benar, server membuat JWT dengan payload pengguna dan mengirimkannya kembali.
4. Klien menyimpan token di client-side (misalnya `localStorage` atau `httpOnly cookie`).
5. Untuk route yang dilindungi, klien mengirim header `Authorization: Bearer <token>`.
6. Middleware `authMiddleware` memverifikasi token dan meneruskan request dengan `req.user`.

## 2. Contoh implementasi endpoint login

Buat file `src/api/auth/auth.js` dengan struktur berikut:

```js
const express = require('express');
const jwt = require('jsonwebtoken');
const validateInput = require('../../middlewares/validate');
const AppError = require('../../utils/AppError');
const { loginSchema } = require('./auth.schema');

const router = express.Router();

const signToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

const mockVerifyUser = async (email, password) => {
  // Ganti dengan logika database asli atau stored procedure yang ada.
  if (email === 'admin@example.com' && password === 'secret') {
    return { id: 1, email, role: 'admin' };
  }
  return null;
};

router.post('/login', validateInput(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await mockVerifyUser(email, password);

    if (!user) {
      return next(new AppError('Email atau password tidak valid', 401));
    }

    const token = signToken(user);

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
```

## 3. Validasi input login

Buat file `src/api/auth/auth.schema.js`:

```js
const { z } = require('zod');

const loginSchema = z.object({
  body: z.object({
    email: z.string().email({ message: 'Email tidak valid' }),
    password: z.string().min(6, { message: 'Password minimal 6 karakter' }),
  }),
  query: z.object({}),
  params: z.object({}),
});

module.exports = {
  loginSchema,
};
```

> Catatan: repo saat ini belum memiliki `zod` sebagai dependency. Jika menggunakan validasi lain, sesuaikan schema dengan library yang tersedia.

## 4. Middleware verifikasi JWT

Buat file `src/middlewares/auth.js`:

```js
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Token tidak ditemukan', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return next(new AppError('Token tidak valid atau sudah kadaluarsa', 401));
  }
};

module.exports = authMiddleware;
```

## 5. Integrasi dengan router

Perbarui `src/router.js` untuk menambah route auth:

```js
const express = require('express');
const router = express.Router();
const authRouter = require('./api/auth/auth');
const materialRouter = require('./api/master/material/material');
const errorTestRouter = require('./api/master/error-test/test');

router.use('/auth', authRouter);
router.use('/material', materialRouter);
router.use('/error-test', errorTestRouter);

module.exports = router;
```

## 6. Menggunakan middleware pada route terlindungi

Contoh menggunakan `authMiddleware` pada route yang sudah ada:

```js
const authMiddleware = require('../../../middlewares/auth');

router.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'Akses diterima', user: req.user });
});
```

## 7. Integrasi error handling

Aplikasi sudah memiliki `src/middlewares/errorHandler.js` dan `src/utils/AppError.js`.
Pastikan `index.js` memanggil middleware error handler setelah router:

```js
app.use('/api', router);
app.use(require('./src/middlewares/errorHandler'));
```

## 8. Rekomendasi implementasi nyata

Untuk produksi, ganti bagian `mockVerifyUser` dengan logika yang memanggil database atau stored procedure:

- Ambil data pengguna dari tabel pengguna atau stored procedure
- Bandingkan password hash menggunakan `bcrypt.compare`
- Gunakan `email`, `id`, dan `role` sebagai payload JWT
- Batasi isi payload untuk hanya data yang diperlukan

## 9. Contoh permintaan dan respons

### Request

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "secret"
}
```

### Response

```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "data": {
    "user": {
      "id": 1,
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}
```

## 10. Catatan tambahan

- Pastikan `JWT_SECRET` tidak disimpan di repository.
- Gunakan token refresh jika ingin dukungan refresh token.
- Jika menggunakan cookies, pertimbangkan opsi `httpOnly` dan `secure`.
- Sesuaikan response format dengan pola API di aplikasi.
