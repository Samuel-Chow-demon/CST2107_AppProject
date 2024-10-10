import userModel from '../models/user.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

function areCategoryIdentical(category1, category2) 
{
    // Check if the lengths of the lists are different
    if (category1.length !== category2.length) 
    {
        return false;
    }

    // Sort both lists based on category name
    category1.sort((a, b) => a.name < b.name);
    category2.sort((a, b) => a.name - b.name);

    // Compare each object in the lists
    for (let i = 0; i < category1.length; i++) 
    {
        const obj1 = category1[i];
        const obj2 = category2[i];

        if (obj1.name != obj2.name ||
            obj1.iconId.toString() != obj2.iconId.toString())
        {
            return false;
        }
    }

    // If all objects are identical, return true
    return true;
}

const RegisterUser = async (req, res)=>{

    const userBody = req.body;

    const inputInvalidStr = (!userBody.email) ? "Email" : ((!userBody.password) ?  "Password" : "");

    if (inputInvalidStr) 
    {
        return res.status(400).json({
            message : `Entry ${inputInvalidStr} Missing`
        })
    }

    const userExisted = await userModel.findOne({
        email : userBody.email
    });

    if (userExisted)
    {
        return res.status(403).json({
            message : `User ${userBody.email} already existed. Please use another one`
        });
    }

    const encrytedPW = await bcrypt.hash(userBody.password, 10);

    const newUser = new userModel({
        name : userBody.username,
        email : userBody.email,
        password : encrytedPW,
    })

    try 
    {
        const createdUser = await newUser.save();
        return res.status(201).json({
            message : "New User Registered Successfully",
            data : createdUser
        });
    }
    catch (error)
    {
        return res.status(500).json({
            message : "Error When Save New User",
            error
        });
    }
}

const GetAllUsers = async (req, res)=>{

    try {
        const users = await userModel.find();
        return res.status(200).json({
            message : "All Users",
            data : users
        })
    }
    catch (error) {
        return res.status(500).json({
            message : "Get All Users Fail",
            error
        })
    }
}

const UserLogIn = async (req, res)=>{

    const userBody = req.body;

    const inputInvalidStr = (!userBody.email) ? "Email" : ((!userBody.password) ?  "Password" : "");

    if (inputInvalidStr) 
    {
        return res.status(400).json({
            message : `Entry ${inputInvalidStr} Missing`
        });
    }

    const userExisted = await userModel.findOne({
        email : userBody.email
    });

    if (!userExisted)
    {
        return res.status(401).json({
            message : `User ${userBody.email} NOT existed. Please try another one`
        });
    }

    const isPasswordMatch = await bcrypt.compare(userBody.password, userExisted.password);

    if (!isPasswordMatch)
    {
        return res.status(401).json({
            message : "Incorrect Password"
        });
    }

    const accessToken = jwt.sign({
        name : userExisted.name,
        email : userExisted.email,
        id : userExisted._id
    }, process.env.JWT_SALT_KEY);

    const prevToken = userExisted.token;

    // Here Store the Last Success Log In Token back to the database Account
    const userUpdatedToken = await userModel.findByIdAndUpdate(
        userExisted._id,
        {token : accessToken},
        {new : true}
    );

    // If update fail or error or the token is the same, return fail message
    if (!userUpdatedToken || prevToken === userUpdatedToken.token)
    {
        // 403 Forbidden
        return res.status(403).json({
            message : "Fail to Update Token"
        });
    }

    return res.status(200).json({
        message : "User Logged In",
        data : {
            id : userExisted._id,
            name : userExisted.name,
            email : userExisted.email,
            categoryUse : userExisted.categoryUse,
            createdAt : userExisted.createdAt,
            updatedAt : userExisted.updatedAt,
            token : accessToken
        }
    });
}

const GetUserByID = async (req, res)=>{

    const userID = req.params.id;

    const userExisted = await userModel.findOne({
        _id : userID
    });

    if (!userExisted)
    {
        return res.status(404).json({
            message : `User ${userID} Not Found`
        })
    }
    else
    {
        return res.status(302).json({
            message : "User Found",
            data : userExisted
        })
    }
}

const AuthenticatePassword = async (req, res)=>{

    /*{
        id : Account_Object_id,
        password : accPassword
    }*/
    const userInfo = req.body;
    const userId = userInfo.id;
    const userPassword = userInfo.password;

    const userExisted = await userModel.findOne({
        _id : userId
    });

    if (!userExisted)
    {
        return res.status(401).json({
            message : `User ${userId} NOT existed.`
        });
    }

    const isPasswordMatch = await bcrypt.compare(userPassword, userExisted.password);

    if (!isPasswordMatch)
    {
        return res.status(401).json({
            message : "Incorrect Password"
        });
    }

    return res.status(200).json({
        message : "Authenticated"
    });
}

const UpdateUserCatByID = async (req, res)=>{

    /*{
        id : Account_Object_id,
        iconId : iconIDValue
        catName : categoryName}
    }*/
    const updateInfo = req.body;

    const userId = updateInfo.id;
    const updateCATName = updateInfo.catName;
    const updateCATIconId = updateInfo.iconId;

    const userExisted = await userModel.findOne({
        _id : userId
    });

    if (!userExisted)
    {
        return res.status(401).json({
            message : `User ${userId} NOT existed.`
        });
    }

    // Get the object if already existed in the account category
    const foundExistCAT = userExisted.categoryUse.find(eachCAT => eachCAT.name === updateCATName);
    
    // If exist, modify
    if (foundExistCAT)
    {
        foundExistCAT.iconId = updateCATIconId;
    }
    // else append
    else
    {
        userExisted.categoryUse.push({
            iconId : updateCATIconId,
            name : updateCATName
        });
    }

    try
    {
        // Then Store back the updated categoryUse back to the database Account
        const userUpdated = await userModel.findByIdAndUpdate(
            userExisted._id,
            {categoryUse : userExisted.categoryUse},
            {new : true}
        );

        return res.status(200).json({
            message : "Update Category Success",
            data : {
                id : userUpdated._id,
                categoryUse : userUpdated.categoryUse,
                token : userUpdated.token
            }
        });
    }
    catch (error) {
        return res.status(500).json({
            message : `Update User Category "${updateCATName}" Fail`,
            error
        })
    }

}

const ModifyUserInfoByID = async (req, res)=>{

    /*{
        id : Account_Object_id,
        name : accName,                 // can be set as null for not to update
        email : accEmail,               // can be set as null for not to update
        oldpassword : accOrigPassword
        password : accPassword,         // can be set as null for not to update
        catUse : categoryUse
    }*/
    const updateInfo = req.body;

    const userId = updateInfo.id;
    const updateName = updateInfo.name;
    const updateEmail = updateInfo.email;

    const origPassword = updateInfo.oldpassword;
    const updatePassword = updateInfo.password;

    const updatedCategory = updateInfo.catUse;

    const userExisted = await userModel.findOne({
        _id : userId
    });

    if (!userExisted)
    {
        return res.status(401).json({
            message : `User ${userId} NOT existed.`
        });
    }

    let modifyModelObj = {};
    if (updateName &&
        updateName != userExisted.name)
    {
        modifyModelObj['name'] = updateName;
    }
    if (updateEmail &&
        updateEmail != userExisted.email)
    {
        modifyModelObj['email'] = updateEmail;
    }
    if (updatePassword)
    {
        const isPasswordTheSame = await bcrypt.compare(updatePassword, userExisted.password);
    
        if (!isPasswordTheSame)
        {
            const isOldPasswordMatched = await bcrypt.compare(origPassword, userExisted.password);

            if (isOldPasswordMatched)
            {
                const encrytedNewPW = await bcrypt.hash(updatePassword, 10);

                modifyModelObj['password'] = encrytedNewPW;
            }
            else
            {
                return res.status(401).json({
                    message : "Incorrect Old Password"
                });
            }
        }
    }

    if (updatedCategory && 
        updatedCategory.length &&
        !areCategoryIdentical(updatedCategory, userExisted.categoryUse))
    {
        modifyModelObj['categoryUse'] = updatedCategory;
    }

    try
    {
        // Then Store back the updated categoryUse back to the database Account
        const userUpdated = await userModel.findByIdAndUpdate(
            userExisted._id,
            modifyModelObj,
            {new : true}
        );

        return res.status(200).json({
            message : "Update User Info Success",
            data : {
                id : userUpdated._id,
                newUserInfo : userUpdated
            }
        });
    }
    catch (error) {
        return res.status(500).json({
            message : `Update User Info Fail`,
            name : updateName,
            email :  updateEmail,
            password : updatePassword,
            error
        })
    }

}

const userController  = {
    RegisterUser,
    GetAllUsers,
    UserLogIn,
    GetUserByID,
    UpdateUserCatByID,
    ModifyUserInfoByID,
    AuthenticatePassword
}

export default userController;