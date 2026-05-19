require('dotenv').config();
const express = require('express'); // import library express untuk buat server
const router = require('./src/router'); // import router yang sudah dibuat
const app = express(); // buat objek express yang akan menampung route dan middleware
const port = 3000; // port tempat server akan dijalankan

app.use(express.json())

app.use('/api', router);

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});