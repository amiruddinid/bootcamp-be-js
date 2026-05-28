# Clean Architecture in Auth Module

Dokumen ini menjelaskan penerapan **Clean Architecture** pada module **Auth** (Autentikasi & Registrasi) di aplikasi ini. Penjelasan ini dirancang khusus agar mudah dipahami, bahkan bagi Anda yang masih baru (awam) dengan konsep **MVC** dan **Clean Architecture**.

---

## 🔐 Analogi Sederhana: Sistem Gerbang Keamanan Gedung

Bayangkan proses autentikasi (Register & Login) seperti sistem gerbang keamanan masuk ke sebuah **Gedung Perusahaan**:

1.  **Tamu (Client/User)**: Pengguna yang ingin mendaftar (Register), masuk (Login), atau meminta profil mereka (Profile).
2.  **Resepsionis di Lobi (Controller)**: Orang pertama yang ditemui tamu. Resepsionis memeriksa apakah tamu membawa formulir dengan format yang benar (validasi input), menyerahkan formulir tersebut ke bagian verifikasi dalam (Service), dan memberikan kartu akses (Token JWT) jika disetujui.
3.  **Formulir & Kertas Persyaratan (Model)**: Aturan tertulis pengisian formulir. Misal: *"Password harus minimal 6 karakter, memiliki huruf kapital, angka, dan karakter unik"* (Validasi Schema Zod).
4.  **Petugas Verifikasi Internal (Service)**: Orang yang melakukan pengecekan logika. Dia yang memastikan apakah Username sudah terdaftar sebelumnya, mengubah password menjadi kode rahasia (Hashing Password dengan Bcrypt), mencocokkan password saat login, dan membuat kartu pass digital (Token JWT).
5.  **Petugas Buku Arsip Tamu (Repository)**: Orang yang bertugas mencari atau mencatat nama tamu langsung di lemari arsip (Database). Dia hanya bertugas menulis *"Tamu Baru"* ke lemari arsip atau membaca data *"Tamu Lama"*.

---

## 📂 Pembagian Tugas File (Layers)

Dalam folder `src/api/auth/`, terdapat 4 file utama yang mewakili lapisan Clean Architecture:

### 1. `auth.controller.js` (Resepsionis)
*   **Fungsi**: Menerima request HTTP dari client dan mengembalikan response HTTP.
*   **Tugas**:
    *   Menerima request registrasi (`POST /register`), login (`POST /login`), dan profil (`GET /profile`).
    *   Menggunakan middleware `validateInput` untuk menyaring input kotor / tidak valid sebelum diproses.
    *   Memanggil fungsi service seperti `registerUser` atau `loginUser`.
    *   Mengembalikan response HTTP dengan status code yang sesuai (misal: 201 untuk berhasil register, 400 jika input salah, 500 jika error).

### 2. `auth.model.js` (Formulir Validasi)
*   **Fungsi**: Menentukan aturan ketat untuk data input.
*   **Tugas**:
    *   Mendefinisikan skema validasi menggunakan library `zod`.
    *   Menentukan kriteria keamanan password yang kuat (harus mengandung kombinasi huruf besar/kecil, angka, dan karakter khusus).
    *   Memastikan format email yang masuk benar-benar valid.

### 3. `auth.service.js` (Petugas Verifikasi / Logika Bisnis)
*   **Fungsi**: Tempat berkumpulnya seluruh aturan dan logika bisnis autentikasi.
*   **Tugas**:
    *   **Saat Register**: Mengecek apakah username sudah terdaftar. Jika belum, menyandikan password asli menggunakan `bcrypt` (`hashPassword`) demi keamanan sebelum disimpan ke database.
    *   **Saat Login**: Memvalidasi kecocokan username, mencocokkan password terenkripsi (`comparePassword`), dan menerbitkan token akses JWT (`generateToken`).
    *   **Saat Get Profile**: Mengambil detail profil user beserta daftar hak akses menu (`features` dan `functions`) miliknya.

### 4. `auth.repository.js` (Petugas Buku Arsip / Database Access)
*   **Fungsi**: Berinteraksi langsung dengan database SQL Server.
*   **Tugas**:
    *   Jalankan query SQL SELECT untuk mencari user berdasarkan username (`findUserByUsername`).
    *   Jalankan query SQL INSERT untuk menyimpan user baru (`createUser`).
    *   Mengambil hak akses menu user dari tabel `TB_M_ROLE_PERMISSIONS` (`findUserFeatureByUsername` dan `findUserFunctionByUsername`).

---

## 🗺️ Bagan Alur Data (Flow Diagram)

Berikut adalah bagan alur proses **Register** dan **Login**:

```mermaid
sequenceDiagram
    autonumber
    actor Client as Client (Postman/FE)
    participant Controller as Controller (auth.controller.js)
    participant Model as Model Schema (auth.model.js)
    participant Service as Service (auth.service.js)
    participant Repository as Repository (auth.repository.js)
    participant DB as Database (SQL Server)

    rect rgb(240, 248, 255)
        Note over Client, DB: PROSES REGISTRASI (REGISTER)
        Client->>Controller: HTTP POST /api/auth/register (Data User & Password)
        Controller->>Model: Validasi format (Zod)
        alt Data Tidak Valid (Cth: Password terlalu pendek)
            Model-->>Controller: Error format
            Controller-->>Client: Respon 400 Bad Request
        else Data Valid
            Controller->>Service: registerUser(data)
            Service->>Repository: findUserByUsername(USERNAME)
            Repository->>DB: SELECT u.* FROM TB_M_USER u ...
            DB-->>Repository: Hasil pencarian
            Repository-->>Service: Return User (jika sudah ada)
            
            alt Username Sudah Ada
                Service-->>Controller: Return status 400 (Username Exists)
                Controller-->>Client: Respon 400 Bad Request
            else Username Belum Ada (Aman)
                Note over Service: Hash password dengan Bcrypt
                Service->>Repository: createUser(data dengan hashed password)
                Repository->>DB: INSERT INTO TB_M_USER
                DB-->>Repository: Data berhasil dimasukkan
                Repository-->>Service: Return detail user baru
                Service-->>Controller: Return status 201 (Created) + data
                Controller-->>Client: Respon 201 Created (JSON)
            end
        end
    end

    rect rgb(245, 245, 220)
        Note over Client, DB: PROSES MASUK (LOGIN)
        Client->>Controller: HTTP POST /api/auth/login (Username & Password)
        Controller->>Service: loginUser(username, password)
        Service->>Repository: findUserByUsername(username)
        Repository->>DB: SELECT u.* FROM TB_M_USER u ...
        DB-->>Repository: Hasil pencarian
        Repository-->>Service: Return User
        
        alt User Tidak Ditemukan
            Service-->>Controller: Return status 400 (Check Username & Password)
            Controller-->>Client: Respon 400 Bad Request
        else User Ditemukan
            Note over Service: Bandingkan password input dengan hash di DB (Bcrypt)
            alt Password Salah
                Service-->>Controller: Return status 400 (Check Username & Password)
                Controller-->>Client: Respon 400 Bad Request
            else Password Cocok
                Note over Service: Generate Token JWT
                Service-->>Controller: Return status 200 (Success) + Token JWT
                Controller-->>Client: Respon 200 OK + Token (JSON)
            end
        end
    end
```

---

## 💡 Mengapa Pembagian Ini Sangat Penting di Module Auth?

1.  **Keamanan Berlapis (Security)**:
    Logika enkripsi password (`bcrypt`) dan pembuatan token (`jwt`) sepenuhnya terisolasi di dalam `Service`. Bagian Controller tidak memiliki akses langsung untuk mengubah password tanpa di-hash terlebih dahulu.
2.  **Skalabilitas Login**:
    Jika suatu saat kita ingin mengganti metode enkripsi password (misal dari Bcrypt ke Argon2) atau mengubah sistem token (misal menggunakan OAuth / Firebase Auth), kita **hanya perlu mengubah di tingkat `Service`**, tanpa merusak routing di `Controller` atau query di `Repository`.
3.  **Kemudahan Unit Test**:
    Kita dapat membuat pengujian otomatis (Unit Testing) untuk memastikan proses hashing password dan pembuatan token berjalan dengan benar tanpa perlu melakukan koneksi ke database SQL Server sungguhan.