module.exports = {
    "PORT": process.env.PORT || "3000",
    "LOG_LEVEL": process.env.LOG_LEVEL || "debug",
    "CONNECTION_STRING": process.env.CONNECTION_STRING || "mongodb://localhost:27017/nodejs",
    "JWT": {
        "SECRET": process.env.JWT_SECRET || "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eJmYTEyZDIzYjc0ZDA5NSIsImV4cCI6MTczMzEyMzMzMH0.s7z7OpfQZZW40ygeOGMcerzh7IFHi3v1tI5ICwhm-zkyJpZCI6IjY3MjRjNDdlOWzYjc0ZDA5NSIsImV4cCI6MTczMzEyMzMzMH0.s7z7OI5ICwhm-zk",
        "EXPIRE_TIME": !isNaN(parseInt(process.env.TOKEN_EXPIRE_TIME)) ? parseInt(process.env.TOKEN_EXPIRE_TIME) : 24 * 60 * 60 // 86400
    },
    "DEFAULT_LANG": process.env.DEFAULT_LANG || "EN",
    "FILE_UPLOAD_PATH": process.env.FILE_UPLOAD_PATH,
    "URL": process.env.URL_ADDRESS || "localhost:3000"
}