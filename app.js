const express = require('express')
const app = express()
const port = 3000

// mencoba koneksi ke database serta menyambungkan model ke db
const db = require('./models')
const itemRoutes = require('./routes/item.routes')
const loanRoutes = require('./routes/loan.routes')
const returnRoutes = require('./routes/return.routes')
const loginRoutes = require('./routes/login.routes')
const { verifyToken } = require('./middlewares/auth')

db.sequelize.authenticate()
    .then(() => console.log("Database berhasil tersambung"))
    .catch(err => console.error(err))

const methodOverride = require('method-override');

// kelompok app.use disimpan diatas dari app.get atau listen
// app.use : memasang middleware atau menghubungkan route ke aplikasi
// express.json() : middleware umum, untuk mengakses json body pada payload (postman/input)
app.use(express.json())
app.use(methodOverride('_method'))
// membuat file yg tersimpan di folder uploads, bisa dimunculkan di browser nantinya
app.use('/uploads', express.static('uploads'))
// route path /items penangannnaya di itemroutes
app.use('/items', verifyToken, itemRoutes)
app.use('/loans', verifyToken, loanRoutes)
app.use('/returns', verifyToken, returnRoutes)
app.use('/login', loginRoutes)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
