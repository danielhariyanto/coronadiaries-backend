import mongoose from 'mongoose';

export default function(callback){
    let db = mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true})
        .then(() => console.log("Connected!"))
        .catch(err => console.log(err));

    callback(db);
};