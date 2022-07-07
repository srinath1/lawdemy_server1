const User =require( '../models/user')
const stripe=require('stripe')('sk_test_tw9XBbCVZpONQnU1Ntn82s7G00HnBYOvV5')
const queryString =require( 'query-string')
const Course=require('../models/course')

 const makeInstructor = async (req, res) => {
    try {
      // 1. find user from db
      const user = await User.findById(req.auth._id).exec();
      // 2. if user dont have stripe_account_id yet, then create new
      if (!user.stripe_account_id) {
        const account = await stripe.accounts.create({ type: "express" });
        // console.log('ACCOUNT => ', account.id)
        user.stripe_account_id = account.id;
        user.save();
      }
      // 3. create account link based on account id (for frontend to complete onboarding)
      let accountLink = await stripe.accountLinks.create({
        account: user.stripe_account_id,
        refresh_url: process.env.STRIPE_REDIRECT_URL,
        return_url: process.env.STRIPE_REDIRECT_URL,
        type: "account_onboarding",
      });
      //  console.log(accountLink)
      // 4. pre-fill any info such as email (optional), then send url resposne to frontend
      accountLink = Object.assign(accountLink, {
        "stripe_user[email]": user.email,
      });
      // 5. then send the account link as response to fronend
      res.send(`${accountLink.url}?${queryString.stringify(accountLink)}`);
    } catch (err) {
      console.log("MAKE INSTRUCTOR ERR ", err);
    }
  };
  const getAccountStatus=async(req,res)=>{
    console.log('Req=>',req)
    try{
      const user=await User.findById(req.auth._id).exec()
      console.log('User=>',user)
      const account=await stripe.accounts.retrieve(user.stripe_account_id)
      console.log('Account=>',account)
      if(!account.charges_enabled){
        return res.status(401).send('Unauthorized')
      }else{
        const statusUpdated=await User.findByIdAndUpdate(user._id,{
          stripe_seller:account,
          $addToSet:{role:'Instructor'}
        },
        {
          new:true
        }

        ).exec()
        statusUpdated.password=undefined
        res.json(statusUpdated)

      }

    }catch(err){
      console.log(err)
    }
  }
  const currentInstructor = async (req, res) => {
    try {
      let user = await User.findById(req.auth._id).select("-password").exec();
      // console.log("CURRENT INSTRUCTOR => ", user);
      if (!user.role.includes("Instructor")) {
        return res.sendStatus(403);
      } else {
        res.json({ ok: true });
      }
    } catch (err) {
      console.log(err);
    }
  };
  const instructorCourses=async(req,res)=>{
    try{
      const courses=await Course.find({instructor:req.auth._id}).sort({createdAt:-1}).exec()
    res.json(courses)
    }catch(err){
      console.log(err)
    }

  }
  const instructorBalance=async(req,res)=>{
    try{
      let user=await User.findById(req.auth._id).exec()
      const balance=await stripe.balance.retrieve({
        stripeAccount:user.stripe_account_id
      })
      console.log(balance)
      res.json(balance)

    }catch(err){
      console.log(err)

    }
  }
  const instructorPayoutSettings=async(req,res)=>{
    try{
      const user=await User.findById(req.auth._id).exec()
      const LoginLink=await stripe.accounts.createLoginLink(
        user.stripe_seller.id,
        {redirect_url:process.env.STRIPE_SETTINGS_REDIRECT}
      )
      console.log(LoginLink)
      res.json(LoginLink.url)

    }catch(err){
      console.log(err)
    }
  }

  
module.exports={makeInstructor,getAccountStatus,currentInstructor,instructorCourses,instructorBalance,instructorPayoutSettings}