const AWS = require('aws-sdk');
AWS.config.update({
    region: 'us-east-1'
})

const util = require('../utils/util');
const bcrypt = require('bcryptjs');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const userTable= 'iam-fyp';

async function update(userInfo){
    const username = userInfo.username;
    const password = userInfo.password;
    const email = userInfo.email;
    const group = userInfo.group;
    const name = userInfo.name;
    const accessKeyId = userInfo.accessKeyId;
    const secretAccessKey = userInfo.secretAccessKey;

    if(!username || !password || !email||!group||!name){
        return util.buildResponse(401,{
            message:'All fields are required'
        })
    }
    
    const encryptedPW =bcrypt.hashSync(password.trim(),10);
    
    const user={
        username: username.toLowerCase().trim(),
        password: encryptedPW,
        email: email,
        group:group,
        name:name,
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey
    }

    const saveUserResponse= await saveUser(user);
    if(!saveUserResponse){
        return util.buildResponse(503,{message: 'Server error. Please try again later.'});
    }
    return util.buildResponse(200, {message: 'Successfully update user!'});

}

async function saveUser(user){
    const params = {
        TableName:userTable,
        Item: user
    }
    return await dynamodb.put(params).promise().then(() => {
        return true;
    }, error =>{console.error('There is an error saving user:', error);
    })
}
module.exports.update=update;
