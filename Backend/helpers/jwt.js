const expressJwt = require('express-jwt');

//Algorithm used by jsonwebtoken also is HS256.
function authJwt(){
    const secret = process.env.secret;
    const api=process.env.API_URL;
    return expressJwt({
        secret,
        algorithms:['HS256'],
        isRevoked:isRevoked
    }).unless({
        path:[
            {path:'/\/api\/v1\/products(.*)',methods:['GET','OPTIONS']},
            {path:'/\/api\/v1\/categories(.*)',methods:['GET','OPTIONS']},
            `/${api}/v1/users/login`,
            `/${api}/v1/users/register`
        ]
    })
}

async function isRevoked(req,payload,done){
    if(!payload.isAdmin){
        done(null,true)
    }
    done();
}
module.exports=authJwt;