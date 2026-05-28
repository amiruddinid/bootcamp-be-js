# Step by step membuat endpoint master baru (CRUD) dari endpoint yang sudah ada 

1. Duplicate / copy salah satu folder master yang sudah ada
2. Rename menjadi endpoint baru (ex: material.controller.js -> role.controller.js)
3. Ubah semua yang berkaitan dengan endpoint yang di copy ke endpoint baru di file controller, model, service dan repository
4. Pastikan perubahan sesuai struktur table
5. Daftarkan endpoint baru di router.js
6. Untuk testing Duplicate postman dari endpoint yang sudah ada dan ubah sesuai dengan endpoint baru (nama, url, body)
7. Tambahkan data di TB_M_ROLE_PERMISSIONS untuk memberikan akses kepada user ke endpoint yang baru