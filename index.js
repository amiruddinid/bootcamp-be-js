require('dotenv').config();
const express = require('express'); // import library express untuk buat server
const router = require('./src/router'); // import router yang sudah dibuat
const app = express(); // buat objek express yang akan menampung route dan middleware
const cors = require('cors'); // import library cors untuk mengizinkan akses dari domain lain
const port = 1337; // port tempat server akan dijalankan
const { autoOrderJob, autoOrderJob2 } = 
    require('./src/jobs/orderMaterial/autoOrderJob'); // import job untuk auto order material

app.use(cors());
app.use(express.json())

app.use('/api', router);

app.listen(port, () => {
    try {
        autoOrderJob.start();
        autoOrderJob2.start();
    } catch (error) {
        console.error('Error saat menjalankan server:', 
            error);
    }
    console.log(`Server berjalan di http://localhost:${port}`);
});