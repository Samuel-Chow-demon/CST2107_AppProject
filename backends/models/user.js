import mongoose   from 'mongoose';

const userSchema = mongoose.Schema({

    name : {
        type: String,
        required : true
    },
    email : {
        type: String,
        required : true,
        unique: true
    },
    password : {
        type: String,
        required : true
    },
    // categoryUse : [{
    //     iconId : {type: mongoose.Schema.Types.ObjectId, ref: 'categoryIcon'},
    //     name : {type: String, required : true, unique: true}
    // }],
    token : {
        type : String
    }

}, {
    timestamps : true
})

const userModel = mongoose.model('Account', userSchema);

export default userModel;