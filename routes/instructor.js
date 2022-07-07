const express=require('express')
const router=express.Router()
const {requireSignin}=require('../middlewares/index.js')
const {makeInstructor,currentInstructor,getAccountStatus,instructorCourses,instructorBalance,instructorPayoutSettings} =require('../controllers/instructor')
router.post('/make-instructor',requireSignin,makeInstructor)
router.post('/get-account-status',requireSignin,getAccountStatus)
router.get('/current-instructor',requireSignin,currentInstructor)
router.get('/instructor-courses',requireSignin,instructorCourses)
router.get('/instructor/balance',requireSignin,instructorBalance)
router.get('/instructor/payout-settings',requireSignin,instructorPayoutSettings)



module.exports=router
