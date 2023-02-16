const Router = require('express').Router;
const router = new Router();
const jwt = require('jsonwebtoken');
const ExpressError = require('../expressError');
const {SECRET_KEY} = require('../config');
//lastly expressError
const ExpressError = require('../expressError');
const User = require('../models/user');
/** POST /login - login: {username, password} > {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post('/login', async(req, res, next) => {
    try{
        let {username, password} = req.body;
        if( await !User.authenticate(username, password)){
            throw new ExpressError(`Invalid username/password`, 400);
        
        } else{
            let token = jwt.sign({username}, SECRET_KEY);
            User.updateLoginTimestamp(username);
            return res.json({token});

        }
    } catch(e){
        return next(e)
    }
})

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post('/register', async (req, res, next) => {
    try{
        //for username we call on the register method from User
        let {username} = await User.register(req.body);
        let token = jwt.sign({username}, SECRET_KEY);
        User.updateLoginTimestamp(username);
        return res.json({token});

    } catch(e){
        return next (e)
    }
})

module.exports = router;

