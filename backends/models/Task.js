import mongoose   from 'mongoose';

const taskSchema = mongoose.Schema({

    title : {
        type: String,
        required : true
    },
    description : {
        type: String,
    },
     // List of User
     userIDs : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    }],
    // List of Comment
    commentIDs : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }]

}, {
    timestamps : true
})

const taskModel = mongoose.model('Task', taskSchema);

export default taskModel;