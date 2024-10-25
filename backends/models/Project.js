import mongoose from 'mongoose';

const projectSchema = mongoose.Schema({

    projectName : {
        type: String,
        required : true
    },
    // List of User
    userIDs : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    }],
    // List of State
    stateIDs : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProjectState'
    }]
}, {
    timestamps : true
})

const projectModel = mongoose.model('Project', projectSchema);

export default projectModel;