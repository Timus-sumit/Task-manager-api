const express = require('express')
require('./db/mongoose')
const User = require('./models/users')
const Tasks = require('./models/tasks')
const port = process.env.PORT 
const userRouter = require('./routers/users')
const taskRouter = require('./routers/tasks')

const app = express()

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)




app.listen(port , ()=>{
    console.log('server is runnig on '+port)
})

// const bcrypt = require ('bcryptjs')
// Myfunction = async function(){
//     const pass = await bcrypt.hash('Sumit123#@',8)
//     console.log(pass)
// }

// Myfunction()