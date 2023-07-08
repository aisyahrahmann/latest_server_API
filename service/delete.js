const AWS = require('aws-sdk');
AWS.config.update({
    region: 'us-east-1'
})

const util = require('../utils/util');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const userTable= 'iam-fyp';


async function deleteUser(user){
    const username=user.username;

    if(!user ||!username){
        return util.buildResponse(401, {
            message: 'Username is required'
        });
    }

    const dynamoUser = await getUser(username.toLowerCase().trim());
    if(!dynamoUser|| !dynamoUser.username){
        return util.buildResponse(403, {message:'User does not exist'});
    }

    const deleteUserFunc= await deleteUserRes(dynamoUser);
    if(!deleteUserFunc){
        return util.buildResponse(503,{message: 'Server error. Please try again later.'});
    }
    return util.buildResponse(200, {message:'Successfully delete ${dynamoUser} user!'});
}

async function getUser(username){
    const params = {
        TableName: userTable,
        Key:{
            username:username
        }
    }
    return await dynamodb.get(params).promise().then(response => {
        return response.Item;
    }, error => {console.error('There is an error getting user: ',error);
    })
}

async function deleteUserRes(user){
    const params = {
        TableName:userTable,
        Key:{
            username:user.username// Use user.username instead of user
        }
    }
    return await dynamodb.delete(params).promise().then(() => {
        return true;
    }, error =>{console.error('There is an error deleting user:', error);
    })
}

module.exports.deleteUser=deleteUser;