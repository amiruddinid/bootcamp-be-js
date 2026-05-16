const express = require('express');
const app = express();
const port = 3000;

const data = []; 

// Router
// API
// GET Request di endpoint
// Pagination, Search, Sorting, Filter
// ?nama=asd
app.get('/', (req, res) => {
    const nama = req.query.nama; //optional
    res.send('Hello World aja ' + nama);
})

// GET Request dengan paramater
// Membuka halaman detail
app.get('/nama/:namaorang', (req, res) => {
    const nama = req.params.namaorang; //mandatory
    res.send('Hello World ' + nama);
})

//CRUD
//Read
app.get('/todo', (req, res) => {
    res.status(200).send(data)
})

//Read by id / untuk membuka detail todo
app.get('/todo/:id', (req, res) => {
    const id = req.params.id
    const item = data.filter((el) => el.id == id)
    res.status(200).send(item)
})

app.post('/todo', (req, res) => {
    const body = req.body;
    data.push(body);
    res.status(201).send('Todo Created');
})


app.listen(port, () => {
    // console.log('Example app listening on port ' + port)
    console.log(`Example app listening on port ${port}`)
}) 