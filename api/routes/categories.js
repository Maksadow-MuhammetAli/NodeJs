const express = require("express")
const router = express.Router()

const isAuthed = true

router.all("*", (req, res, next) => {
    if (isAuthed) {
        next()
    } else {
        res.json({succes: false, message: "you have to authanticate"})
    }
})

router.get("/", (req, res, next) => {
    res.send(`//////////////////////// You are gay! //////////////////////////`)
})

module.exports = router