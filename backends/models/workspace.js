import mongoose from 'mongoose';

const workspaceSchema = mongoose.Schema({

    // Workspace should have at least one user
    // List of User
    userIDs : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required : true
    }],
    // List of Project
    projectIDs : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    }]
}, {
    timestamps : true
})

const workspaceModel = mongoose.model('Workspace', workspaceSchema);

export default workspaceModel;