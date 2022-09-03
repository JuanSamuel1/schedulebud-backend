const Joi = require('@hapi/joi')
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')
const pool = require("../db.js");
const bcrypt = require("bcryptjs");

const registerValidation = (data)=>{
    const schema = Joi.object({
        email: Joi.string().min(6).required().email(), //valid email
        password: Joi.string().min(6).required() //password min length is 6 char
    })

    return schema.validate(data)
}

const loginValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string().required().email(),
        password: Joi.string().required()
    })
        
    return schema.validate(data)
}

const EMAIL_USER = process.env.EMAIL_USER
const EMAIL_PASS = process.env.EMAIL_PASS

const transport = nodemailer.createTransport({
    service : "Gmail",
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
})

const sendConfirmationEmail = (email, confirmationCode) => {
    console.log("Check")
    transport.sendMail({
        from: EMAIL_USER,
        to: email,
        subject: "Please confirm your account",
        html: `<h1>Email Confirmation</h1>
        <h2>Hello</h2>
        <p>Thank you for registering. Please confirm your email by clicking on the following link</p>
        <a href=http://localhost:3000/user/verify/${confirmationCode}> Click here</a>
        </div>`
    }).catch(err => console.log(err));
}

const Register = async (req, res) => {
    try{
        //validate email and password
        const { error } = registerValidation(req.body);
    
        if (error) {
            throw Error(error.details[0].message);
        }
    
        const email = req.body.email; 
    
        //must be ntu email
        if (email.slice(email.length-12, email.length) != "e.ntu.edu.sg") {
            throw Error("Error: email must be NTU email")
        }
        
        //check if email is registered
        const result = await pool.query(
            "SELECT * FROM Accounts WHERE email = ($1)",
            [email]
        );

        if (result.rows[0]) throw Error("Email has been used");
        
        //hashing password
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        //create jwt token
        const token = jwt.sign(
            { email: email},
            process.env.TOKEN_SECRET
        );
        

        const status = "PENDING";
        const confirmationCode = token;
        
        //save new user in db
        const newUser = await pool.query(
            "INSERT INTO Accounts(email,password,status,confirmation_code) VALUES($1,$2,$3,$4) RETURNING *",
            [email,hashedPassword,status,confirmationCode]
        );
        
        //send confirmation email
        sendConfirmationEmail(email, token);
        
        return res.status(200).json({
            message: "successfully register",
            data: {email: newUser.rows[0].email},
            error: false,
        });
    } catch(error){
        return res.status(400).json({
            message: error.message,
            data: [],
            error: true,
        });
    }
}

const VerifyRegistration = async (req,res) => {
    try{
        const confirmationCode = req.params.confirmationCode;
        if(!confirmationCode) throw Error("Confirmation code is empty")

        const result = await pool.query(
            "SELECT * FROM Accounts WHERE confirmation_code = ($1)",
            [confirmationCode]
        );
        
        if (!result.rows[0]) throw Error("User does not exist");
        const user = result.rows[0];

        if(result.rows[0].status == "ACTIVE") throw Error("User is verified already");

        const updatedUser = await pool.query(
            "UPDATE Accounts SET status = ($1) WHERE email = ($2) AND confirmation_code = ($3)", 
            ["ACTIVE", user.email, confirmationCode]
        );

        return res.status(200).json({
            message: "successfully verified",
            data: {email: user.email},
            error: false,
        });

    } catch(error){
        return res.status(400).json({
            message: error.message,
            data: [],
            error: true,
        });
    }
}

const Login = async (req,res) => {
    try{
        const { error } = loginValidation(req.body);
        if (error) {
            throw Error(error.details[0].message);
        }
        
        const email = req.body.email;
        const result = await pool.query(
            "SELECT * FROM Accounts WHERE email = ($1)",
            [email]
        );
        if (!result.rows[0]) throw Error("User doesn't exist");
    
        const user = result.rows[0];

        if (user.status != "ACTIVE") throw Error("Account not verified!");
        const validPass = await bcrypt.compare(req.body.password, user.password);
        if (!validPass) throw Error("invalid password");
    
        const token = jwt.sign(
            { id: user.user_id, email: user.email },
            process.env.TOKEN_SECRET
        );
    
        res.header("auth-token", token);
        return res.status(200).json({
            message: "successfully login",
            data: { token: token },
            error: false,
        });
    } catch (error) {
        return res.status(400).json({
            message: error.message,
            data: [],
            error: true,
        });
    }
}

const Logout = async (req, res) => {
    try {
      req.header("auth-token", " ");
      return res
        .status(200)
        .json({ message: "sucessfully logout", data: [], error: false });
    } catch (err) {
      return res
        .status(400)
        .json({ message: err.message, data: [], error: true });
    }
};

const userService = {
    Register,
    VerifyRegistration,
    Login,
    Logout
};

module.exports = userService;