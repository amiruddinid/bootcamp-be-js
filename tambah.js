const readline = require('node:readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

function tambah(a, b){
    return a + b;
}

function kurang(a, b){
    return a - b;
}

rl.question('Mau melakukan apa? (+, -)', (calc) => {
    rl.question('Angka 1 = ', (angka1) => {
        rl.question('Angka 2 = ', (angka2) => {
            let hasil;
            if(calc == "+"){
                hasil = tambah(Number(angka1), Number(angka2))
            } else if(calc == "-"){
                hasil = kurang(Number(angka1), Number(angka2))
            } else {
                hasil = "tidak ada operasi tersebut"
            }
            console.log(hasil)
            rl.close();
        })
    })
})

