/** User class for message.ly */
const db = require("../db");
const bcrypt = require('bcrypt');
const ExpressError = require('../expressError');
const {BCRYPT_WORK_FACTOR} = require('../config');

/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) {
      let hashedPw = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
      const result = await db.query(`
      INSERT INTO users (username, password, first_name, last_name, phone)
      VALUES($1, $2, $3, $4, $5) RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPw, first_name, last_name, phone]);
      return result.rows[0];
    }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) { 
    const result = await db.query(
      `SELECT password FROM users WHERE username = $1`,
      [username]);
      let user = result.rows[0];

      return user && await bcrypt.compare(password, user.password)
      
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    try{
    const result = await db.query(
      `UPDATE users
      SET last_login_at = current_timestamp
      WHERE username = $1
      RETURNING username`,
      [username]
    )
    } catch(e){
      if(!result.rows[0]){
        return next(new ExpressError(`No user is found ${username}`, 404))
      }
      return next(e)
    }
    //if there is no username at the current timestamp, return next with the express error

   }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    const result = await db.query(`SELECT * FROM users ORDER BY username`)
    return result.rows;
   }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) { 
    const result = await db.query(`SELECT * FROM users
    WHERE username = $1`, [username]);
    //if there is no result throw an error
    if(!result.rows[0]){
      throw new ExpressError(`No user found at ${username}`, 404);
    }
    else{
      return result.rows[0];
    }
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) { 
    //I use the class from the message.js
    const result = await db.query(`
    SELECT m.id,
                m.to_username,
                u.first_name,
                u.last_name,
                u.phone,
                m.body,
                m.sent_at,
                m.read_at
          FROM messages AS m
            JOIN users AS u ON m.to_username = u.username
          WHERE from_username = $1`,
          [username]);
    return result.rows.map(m => ({
      id: m.id,
      to_user: {
        username: m.to_username,
        first_name: u.first_name,
        last_name: u.last_name,
        phone: u.phone
      },
      body: m.body,
      sent_at: m.sent_at,
      read_at : m.read_at
    }))
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
  const result = await db.query(`
  SELECT m.id,
                m.from_username,
                u.first_name,
                u.last_name,
                u.phone,
                m.body,
                m.sent_at,
                m.read_at
          FROM messages AS m
            JOIN users AS u ON m.to_username = u.username
          WHERE from_username = $1`, [username]);
       return result.rows.map(m => ({
        id: m.id,
        from_user:{
          username: m.from_username,
          first_name: u.first_name,
          last_name: u.last_name,
          phone: u.phone
       },
       body: m.body,
       sent_at: m.sent_at,
       read_at: m.read_at
        }));
}

}
module.exports = User;