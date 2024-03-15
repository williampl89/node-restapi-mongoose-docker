const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { isValidEmail } = require('../helpers');


const UserSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    firstname: {
        type: String,
        required: true,
        trim: true,
    },
    lastname: {
        type: String,
        required: true,
        trim: true,
    },
    emailVerified:{
        type: Boolean,
        default: false,
    }
});

UserSchema.statics.signup = signup;
UserSchema.statics.sendConfirmationEmail = sendConfirmationEmail;
UserSchema.statics.confirmAccount = confirmAccount;
UserSchema.statics.login = login;
UserSchema.statics.findUserById = findUserById;

mongoose.model('user', UserSchema, 'users');

function signup(userInfo){
    if(!userInfo.email || !isValidEmail(userInfo.email)) throw new Error('Email is invalid'); 
    if(!userInfo.password) throw new Error('Password is required'); 
    if(!userInfo.firstname) throw new Error('Firstname is required'); 
    if(!userInfo.lastname) throw new Error('Lastname is required'); 

    return this.findOne({ email: userInfo.email })
    .then(user =>{
        if(user) throw new Error('User ya existe!!');

        const newUser = {
            email: userInfo.email,
            password: bcrypt.hashSync(userInfo.password, 9),
            firstname: userInfo.firstname,
            lastname: userInfo.lastname,
        };
        
        return this.create(newUser);
    })
    .then(userCreated => this.sendConfirmationEmail(userCreated))
    .then(user=>user);
}

function sendConfirmationEmail(user){
   let transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: false, //add porque no funcional el envio en localhost
        requireTLS: true, //add porque no funcional el envio en localhost
        auth:{
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
        }
    }); 


    var token = jwt.sign({ email: user.email }, process.env.TOKEN_SECRET);

    const urlConfirm = `${process.env.APIGATEWAY_URL}/account/confirm/${token}`;
    console.log(urlConfirm);
    return transporter.sendMail({
        from: process.env.MAIL_ADMIN_ADDRESS,
        to: user.email,
        subject: "Por favor confirma tu correo",
        html: `<p>Confirma tu email <a href="${urlConfirm}">Confirmar</a></p>`, 
    }).then(() => user);
} 

//  datos de https://mailtrap.io/signin


function confirmAccount(token){
    var email = null;

    try {
        const payload = jwt.verify(token, process.env.TOKEN_SECRET);
        email = payload.email;
    } catch (error) {
        throw new Error('Invalid Token');
    }

    return this.findOne({ email })
        .then( user => {
            if (!user) throw new Error('User not found');
            if (user.emailVerified) throw new Error('User already verified');

            user.emailVerified = true;
            return user.save();
        })

}


function login(email, password){
    if(!isValidEmail(email)) throw new Error('Email is invalid'); 

    return this.findOne({ email })
        .then( user => {
            if (!user) throw new Error('Incorrect credentials');
            if (!user.emailVerified) throw new Error('User is not confirmed');

            const isMatch = bcrypt.compareSync(password, user.password);
            if (!isMatch) throw new Error('Incorrect credentials');

            const userObject = {
                _id: user._id,
                email: user.email,
                emailVerified: user.emailVerified,
                firstname: user.firstname,
                lastname: user.lastname,
            }

            const access_token = jwt.sign(Object.assign({}, userObject), process.env.TOKEN_SECRET, {
                expiresIn: 60 * 60 *4,
            });

            return {
                access_token,
            }
        })

}

function findUserById(_id){
    return this.findById(_id)
        .then( user => {
            return {
                _id: user._id,
                email: user.email,
                emailVerified: user.emailVerified,
                firstname: user.firstname,
                lastname: user.lastname,
            };
        })
}