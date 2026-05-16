console.log("hello world")
// function / fungsi untuk mengemas semua logika untuk dipakai berulang
function tambah(a, b){
    console.log('ini adalah tambah')
    return a + b;
}
// variable untuk menyimpan nilai
// let untuk variable yang nilainya dapat berubah
let a = tambah(1, 1);
//const untuk variable konstant yang nilainya tidak dapat berubah
const b = tambah(2, 2);
console.log(a)
console.log(tambah(3, 3))