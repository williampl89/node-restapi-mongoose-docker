const mongoose = require('mongoose');

function _connect(){
 
    const URI = `mongodb://${process.env.MONGO_HOST}/${process.env.MONGO_DB}`;
     //mongoose.connect(URI, {useNewUrlParser: true, useUnifiedTopology: true })
     mongoose.connect(URI)
    .then(
        () =>{
            console.log("connection db ready to use"  + URI);
        },
        (err) =>{
            console.log("connection error - ", err);
        }
    )
}

module.exports = _connect;