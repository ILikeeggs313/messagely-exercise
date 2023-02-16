
const Router = require('express').Router;
const router = new Router();
const jwt = require('jsonwebtoken');
const ExpressError = require('../expressError');
const {SECRET_KEY} = require('../config');
//lastly expressError
const ExpressError = require('../expressError');
const Message = require('../models/message');
const { ensureLoggedIn } = require('../../express-messagely-solution/middleware/auth');

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get('/:id', ensureLoggedIn,async(req, res, next) => {
    try{
        let username = req.body;
        //we get the message by the message id
        let msg = await Message.get(req.params.id);

        if(msg.to_user.username !== username && msg.from_user.username !== username){
            //we throw an error here if no msg is found
            throw new ExpressError(`No message found/cannot be read`, 401);
        }
    } catch(e){
        return next(e)
    }
})

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
 router.post('/:id', ensureLoggedIn, async (req, res, next) => {
    try{
        //we call on the create method since we are posting the message
        let msg = await Message.create({
            from_username: req.user.username,
            to_username: req.body.to_username,
            body: req.body.body
        })
        return res.json({message: msg}); 
    } catch(e){
        return next(e)
    }
})

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post('/:id/read', ensureLoggedIn, async (req, res, next) => {
    try{
        //we are calling on get message by ID, then markRead(id) methods
        //let's get the message by id first
        let username = req.body;
        let msg = await Message.get(req.params.id);
        //if there is no message, throw error 401 bad request
        if(msg.to_user.username !== username){
            throw new ExpressError(`No message found`, 401);
        }
        //if found a message, continue
        let markMessage = await Message.markRead(req.params.id);
        return res.json({markMessage});


    } catch(e){
        return next(e)
    }
})

module.exports = router;