const express=require('express')
const cors=require('cors')
const morgan=require('morgan')
const fs=require('fs')
const mongoose=require('mongoose')
// const csrf=require('csurf')
require('dotenv').config()
const start=async()=>{
  const app=express()

 const csrfProtection=csrf({cookie:true})
const cookieParser=require('cookie-parser')
mongoose
  .connect(process.env.DATABASE, {})
  .then(() => console.log("DB connected"))
  .catch((err) => console.log("DB Error => ", err));

  
app.use(
  cors({
    origin: [process.env.CLIENT_URL,'https://lawdemycourses.herokuapp.com/'],
  })
);
app.use(express.json({limit:'5mb'}))
app.use(cookieParser())
app.use(morgan('dev'))

fs.readdirSync('./routes').map(route=>app.use('/api/',require(`./routes/${route}`)))
  const path = require('path')

if(process.env.NODE_ENV==='production')
{

    app.use('/' , express.static('client/build'))

    app.get('*' , (req , res)=>{

          res.sendFile(path.resolve(__dirname, 'client/build/index.html'));

    })

}
// app.use(csrfProtection);

// app.get("/api/csrf-token", (req, res) => {
//   res.json({ csrfToken: req.csrfToken() });
// });
const PORT=process.env.PORT || 8000
app.listen(PORT,()=>console.log(`Server running  on port ${PORT}`))
}
start()
