const bcrypt = require("bcrypt");
const conn = require("./dbConfig");


//hash password
const hashPassword = async (password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return hashedPassword;
};

//compare password
const comparePassword = async (enteredPassword)=> {
  conn.createQuery('SELECT')
  return await bcrypt.compare(enteredPassword, this.password);
};

const getUserById = (userId)=>{
  let sql ="SELECT * FROM users WHERE id=?";
   conn.query(sql,[userId], (err, result)=>{
    if(err) throw err;
    console.log(result);
    return JSON.stringify(result);
    });
}

//function get user by email which returns data in json 
const getUserByEmail = (email)=>{
  let sql ="SELECT * FROM users WHERE email=?";
  conn.query(sql,[email], (err, result)=>{
    if(err) throw err;
    //console.log(JSON.parse(JSON.stringify(result)));
    return JSON.stringify(result);
    });
    
  //fire query and return resulted data in json
  // conn.query(sql,[email], (err, result)=>{
  //   if(err) throw err;
  //   console.log(result);
  // });
  
  // const [err, result] = conn.query(sql,[email]);
  // if(err) throw err;
  // console.log(result);
  // return JSON.stringify(result);


}

const createUser = ({username, email, password, isVerified})=>{
     conn.query("INSERT INTO users SET ?", {
      username,
      email,
      password,
      isVerified,
    },
    (err, results)=>{
      if (!err) {
        console.log(results);
        const user = getUserById(results.OkPacket.insertId);
        return user;
  
      } else {
        console.log(err);
      }
    }
    );
}

const updateUser=(username, email, password, isVerified)=>{
  conn.query(
    "UPDATE users SET ? WHERE email=?",
    [{
      username,
      password,
      isVerified
    }, email],
    (err, results) => {
      if (!err) {
        console.log(results);
        return JSON.stringify(results);
      } else {
        console.log(err);
      }
    }
  );
}
const userQueries = {hashPassword, comparePassword, getUserById, getUserByEmail, updateUser, createUser};
module.exports = userQueries

