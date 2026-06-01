require("dotenv").config()

module.exports ={
    "web_name": process.env.WEB_NAME,
    "base_url": process.env.WEB_URL,
    "auth_secret": process.env.AUTH_SECRET
}