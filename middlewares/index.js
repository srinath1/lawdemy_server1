const { expressjwt: jwt } = require("express-jwt");
const User =require( '../models/user')
const Course=require('../models/course')
const requireSignin=jwt({

     getToken:(req,res)=>req.cookies.token,
    secret:process.env.JWT_SECRET,
    algorithms:['HS256']

    
})
const isInstructor = async (req, res, next) => {
  console.log('remove idea')
    try {
      const user = await User.findById(req.auth._id).exec();
      if (!user.role.includes("Instructor")) {
        return res.sendStatus(403);
      } else {
        next();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const isEnrolled=async(req,res,next)=>{
    console.log(' I am here')
    try{
      const user=await User.findById(req.auth._id).exec()
      const course=await Course.findOne({slug:req.params.slug}).exec()
      let ids=[]
      for(let i=0;i<user.courses.length;i++){
        ids.push(user.courses[i].toString())
      }
      console.log(ids)
      if(!ids.includes(course._id.toString())){
        res.sendStatus(403)
      }else{
        next()
      }


    }catch(err){
      console.log(err)
    }
  }

module.exports={requireSignin,isInstructor,isEnrolled}