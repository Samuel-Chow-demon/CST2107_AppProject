import {db} from '../firebaseConfig.js'
import { collection } from 'firebase/firestore';

// Users Database
const USER_DB_NAME = "users";
const userCollectionRef = collection(db, USER_DB_NAME);

// WorkSpaces Database
const WORKSPACE_DB_NAME = "workspaces";
const workSpaceCollectionRef = collection(db, WORKSPACE_DB_NAME);

// Project States Database
const PROJECT_STATE_DB_NAME = "projectstates";
const projectStateCollectionRef = collection(db, PROJECT_STATE_DB_NAME);

// Projects Database
const PROJECT_DB_NAME = "projects";
const projectCollectionRef = collection(db, PROJECT_DB_NAME);

// Tasks Database
const TASK_DB_NAME = "tasks";
const taskCollectionRef = collection(db, TASK_DB_NAME);

// Comments Database
const COMMENT_DB_NAME = "comments"
const commentCollectionRef = collection(db, COMMENT_DB_NAME);

export{
    userCollectionRef,
    workSpaceCollectionRef,
    projectStateCollectionRef,
    projectCollectionRef,
    taskCollectionRef,
    commentCollectionRef,
    USER_DB_NAME,
    WORKSPACE_DB_NAME,
    PROJECT_STATE_DB_NAME,
    PROJECT_DB_NAME,
    TASK_DB_NAME,
    COMMENT_DB_NAME
}