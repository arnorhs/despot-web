var redis = require('redis'), redisClient;

console.log('Creating the redis client...');
redisClient = redis.createClient();
redisClient.on('error',function(err,res){
    console.log('Redis error: ',err);
});


// route-specific middleware for redis-based requests.. i guess those will
// eventually be every single request...
exports.redisClient = function () {

    return function (req, res, next) {
        req.redisClient = redisClient;
        next();
    };

};





