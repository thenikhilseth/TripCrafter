const express = require('express');
const authHandler = require('./../routeHandlers/authController');
const userController = require('./../routeHandlers/userController');

//Router
const router = express.Router();

//############AUTHENTICATION AND AUTHORIZATION##########/////////

router.route('/signup').post(authHandler.signup);
router.route('/login').post(authHandler.login);
router.route('/forgotPassword').post(authHandler.forgotPassword);
router.route('/resetPassword/:token').patch(authHandler.resetPassword);
router.route('/logout').get(authHandler.logout);

////################## USER ROUTES#########//////////////////////////
router
  .route('/updatePassword')
  .patch(authHandler.protectedRoute, authHandler.updatePassword);

router
  .route('/')
  .get(authHandler.permission('admin'), userController.getAllUsers)
  .post(authHandler.permission('admin'), userController.createUser);

router
  .route('/updateMe')
  .patch(authHandler.protectedRoute, userController.updateMe);

router
  .route('/deleteMe')
  .delete(authHandler.protectedRoute, userController.deleteMe);

router
  .route('/:id')
  .get(
    authHandler.protectedRoute,
    authHandler.permission('admin'),
    userController.getUser
  )
  .patch(
    authHandler.protectedRoute,
    authHandler.permission('admin'),
    userController.updateUser
  )
  .delete(
    authHandler.protectedRoute,
    authHandler.permission('admin'),
    userController.deleteUser
  );

module.exports = router;

//Future- Add a '/me' endpoint to get the details of current login user.
