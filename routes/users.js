const Router = require('express').Router;
const router = new Router();
const jwt = require('jsonwebtoken');
const ExpressError = require('../expressError');
const {SECRET_KEY} = require('../config');
//lastly expressError
const ExpressError = require('../expressError');
const User = require('../models/user');
const {ensureLoggedIn, ensureCorrectUser} = require('../middleware/auth');
/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
//they first have to be logged in
router.get('/', ensureLoggedIn, async (req, res, next) => {
    try{let users = await User.all();
    return res.json({users});
    } catch(e){
        return next(e)
    }
})

/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get('/:username', ensureCorrectUser, async (req, res, next) => {
    try{    
        let user = await User.get(req.params.id);
        if (!user){
            throw new ExpressError(`No user found`, 401);
        }
        return res.json({user});
        //if no user just throw an error
        
    } catch (e){
        return next(e)
    }
})

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/to', ensureCorrectUser, async (req, res, next) =>{
    try{
        let messages = await User.messagesTo(req.params.username);
        return res.json({messages});
    } catch(e){
        return next(e)
    }
})


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
 router.get('/:username/from', ensureCorrectUser, async (req, res, next) =>{
    try{
        let messages = await User.messagesFrom(req.params.username);
        return res.json({messages});
    } catch(e){
        return next(e)
    }
})

module.exports = router;
