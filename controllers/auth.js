const User = require("../models/user");
const { hashPassword, comparePassword } = require("../utils/auth");
const jwt =require( 'jsonwebtoken')
const AWS=require('aws-sdk')
const { v4: uuidv4 } = require('uuid');
const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  apiVersion: process.env.AWS_API_VERSION,
};

const SES = new AWS.SES(awsConfig);

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name) {
      return res.status(400).send("Name is required");
    }
    if (!password || password.length < 6) {
      return res.status(400).send("Password should be minimum 6 characters");
    }
    let userExist = await User.findOne({ email });
    if (userExist) return res.status(400).send("Email is taken");
    const hashedPassword = await hashPassword(password);
    const user=await new User({
        name,
        email,
        password:hashedPassword
    })
    user.save()
    console.log('User',user)
    return res.json({ok:true})
  } catch (err) {
    console.log(err);
    return res.status(400).send("Error,try again");
  }
};
const login=async(req,res)=>{
  try {
    // console.log(req.body);
    const { email, password } = req.body;
    // check if our db has user with that email
    const user = await User.findOne({ email }).exec();
    if (!user) return res.status(400).send("No user found");
    // check password
    const match = await comparePassword(password, user.password);
    if(!match)return res.status(400).send('Wrong Password')
    // create signed jwt
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    // return user and token to client, exclude hashed password
    user.password = undefined;
    // send token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      // secure: true, // only works on https
    });
    // send user as json response
    res.json(user);
  }catch(err){
    return res.status(400).send('Error,Please try again')
  }
}
const logout=async(req,res)=>{
  try{
    res.clearCookie('token')
    return res.json({message:'signout success'})
  }
  catch(err){
    console.log(err)

  }
}
const currentUser=async(req,res)=>{
  console.log('I am in ')
  console.log('ReqUser=>',req.user)
  console.log(req.auth._id)
  try {
    const user = await User.findById(req.auth._id).select("-password").exec();
    console.log("CURRENT_USER", user);
    return res.json({ok:true});
  } catch (err) {
    console.log(err);
  }
}
const  sendTestEmail = async (req, res) => {
  // console.log("send email using SES");
  // res.json({ ok: true });
  const params = {
    Source: process.env.EMAIL_FROM,
    Destination: {
      ToAddresses: ["navulpakamsampathsrinath@gmail.com"],
    },
    ReplyToAddresses: [process.env.EMAIL_FROM],
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `
            <html>
              <h1>Reset password link</h1>
              <p>Please use the following link to reset your password</p>
            </html>
          `,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Password reset link",
      },
    },
  };

  const emailSent = SES.sendEmail(params).promise();

  emailSent
    .then((data) => {
      console.log(data);
      res.json({ ok: true });
    })
    .catch((err) => {
      console.log(err);
    });
}
const  forgotPassword = async (req, res) => {
  console.log(' iam forgot password')
  try {
    const { email } = req.body;
    // console.log(email);
    const shortCode = uuidv4();
    const user = await User.findOneAndUpdate(
      { email },
      { passwordResetCode: shortCode }
    );
    if (!user) return res.status(400).send("User not found");

    // prepare for email
    const params = {
      Source: process.env.EMAIL_FROM,
      Destination: {
        ToAddresses: ['navulpakamsampathsrinath@gmail.com'],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `
                <html>
                  <h1>Reset password</h1>
                  <p>User this code to reset your password</p>
                  <h2 style="color:red;">${shortCode}</h2>
                  <i>Lawdemy.com</i>
                </html>
              `,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: "Reset Password",
        },
      },
    };

    const emailSent = SES.sendEmail(params).promise();
    emailSent
      .then((data) => {
        console.log(data);
        res.json({ ok: true });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
  }
};
const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    // console.table({ email, code, newPassword });
    const hashedPassword = await hashPassword(newPassword);

    const user = User.findOneAndUpdate(
      {
        email,
        passwordResetCode: code,
      },
      {
        password: hashedPassword,
        passwordResetCode: "",
      }
    ).exec();
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
    return res.status(400).send("Error! Try again.");
  }
};

module.exports = { register,login ,logout,currentUser,sendTestEmail,forgotPassword,resetPassword};
