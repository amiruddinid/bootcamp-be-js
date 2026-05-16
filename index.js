const express = require('express'); // import library express untuk buat server
const app = express(); // buat objek express yang akan menampung route dan middleware
const port = 3000; // port tempat server akan dijalankan

// array kosong untuk menyimpan data todo sementara di memori
const data = []; 
app.use(express.json()) // pakai middleware untuk parse body JSON dari request

// Route GET di endpoint root
// Contoh: http://localhost:3000/?nama=adi
app.get('/', (req, res) => {
    const nama = req.query.nama; // ambil nilai query string ?nama=
    res.send('Hello World aja ' + nama); // kirim jawaban ke browser
})

// Route GET dengan parameter di path
// Contoh: http://localhost:3000/nama/adi
app.get('/nama/:namaorang', (req, res) => {
    const nama = req.params.namaorang; // ambil nilai param dari URL
    res.send('Hello World ' + nama); // kirim jawaban dengan nama yang diterima
})

// CRUD
// READ semua todo
app.get('/todo', (req, res) => {
    res.status(200).send(data) // kirim semua data todo yang ada
})

app.get('/todo/test', (req, res) => {
    res.status(200).send("todo test") // endpoint test sederhana
})

// READ todo berdasarkan id
app.get('/todo/:id', (req, res) => {
    const id = req.params.id // id diambil dari URL
    // cari item di array data yang id-nya sama
    const item = data.find((el) => el.id == id)
    res.status(200).send(item) // kirim item yang ditemukan
})

app.post('/todo', (req, res) => {
    const body = req.body; // ambil data yang dikirim di body request
    
    // jika data yang dikirim berupa array
    if (Array.isArray(body)) {
        data.push(...body); // tambahkan semua item dari array ke data

        return res.status(201).json({
            message: "todos berhasil ditambahkan", // kirim pesan sukses
            data: body // kirim kembali data yang ditambahkan
        });
    }

    // jika data yang dikirim berupa object biasa
    data.push(body); // tambahkan object ke array data

    res.status(201).json({
        message: '1 todo berhasil ditambahkan',
        data: body
    });
});

// DELETE semua todo di endpoint /todo
app.delete("/todo", (req, res) => {
  data.length = 0; // hapus semua isi array

  res.status(200).json({
    message: "All data deleted", // kirim pesan bahwa data habis
  });
});

app.put('/todo/:id', (req, res) => {
    const id = req.params.id; // ambil id dari URL
    const body = req.body; // ambil data baru dari request

    const index = data.findIndex((el) => el.id == id); // cari posisi item di array

    if (index === -1) {
        return res.status(404).send('Todo Not Found'); // jika tidak ketemu, kirim 404
    }

    data[index] = {
        ...data[index], // ambil data lama
        ...body // gabungkan dengan data baru
    };

    res.status(200).send({
        message: 'Todo Updated',
        data: data[index] // kirim kembali data yang sudah diupdate
    });
});

// DELETE todo berdasarkan id
app.delete("/todo/:id", (req, res) => {
  const id = req.params.id; // ambil id yang mau dihapus

  const index = data.findIndex((item) => item.id === id); // cari index item

  if (index === -1) {
    return res.status(404).json({
      message: "Data not found",
    });
  }

  const deletedData = data.splice(index, 1); // hapus 1 item dari array

  res.status(200).json({
    message: "Data deleted",
    data: deletedData // kirim data yang terhapus
  });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`) // jalankan server dan tampilkan pesan di console
}) 