const express = require("express")
const router = express.Router()
const Response = require("../lib/Response")
const Auditlogs = require("../db/models/AuditLogs")
const Categories = require("../db/models/Categories")
const Users = require("../db/models/Users")
const auth = require("../lib/auth")()

/*
1. Audit logs tablosunda işlem yapan kişilerin hangi tip işlemi kaç kez yaptığını veren bir sorgu.
2. Kategori tablosunda tekil veri sayısı.
3. Sistemde tanımlı kaç kullanıcı var?
*/

router.all("*", auth.authenticate(), (req, res, next) => {
    next()
})

router.get("/auditlogs/:location", async (req, res) => {
    try {

        //= [
        //=     {
        //=         email: "email1",
        //=         whatHappened: [
        //=             {
        //=                 location: "location_proctype1",
        //=                 times: 10
        //=             }, {
        //=                 location: "location_proctype2",
        //=                 times: 30
        //=             }
        //=         ]
        //=     }, {
        //=         email: "email2",
        //=         whatHappened: [
        //=             {
        //=                 location: "location_proctype1",
        //=                 times: 30
        //=             }, {
        //=                 location: "location_proctype2",
        //=                 times: 10
        //=             }
        //=         ]
        //=     }

        //= ]

        let param = req.params.location
        param = param.charAt(0).toUpperCase() + param.slice(1, param.length)

        let auditlogs = await Auditlogs.find({location: param})

        let stats = []

        auditlogs.forEach(data => {
            let email = data.email

            if (stats.map(x => x?.email)?.includes(email)) {

                let obj = stats.find(y => y.email == email)

                if (obj.whatHappened.map(z => z.location).includes(`${data.location}_${data.proc_type}`)) {
                    let detailObj = obj.whatHappened.find(z => z.location == `${data.location}_${data.proc_type}`)
                    detailObj.times += 1
                } else {
                    obj.whatHappened.push({
                        location: `${data.location}_${data.proc_type}`,
                        times: 1
                    })
                }

            } else {
                stats.push({
                    email,
                    whatHappened: [
                        {
                            location: `${data.location}_${data.proc_type}`,
                            times: 1
                        }
                    ]
                })
            }
        });

        // const results = await Auditlogs.aggregate([
        //     {$match: {location: "Categories"}},
        //     {$group: {_id: {email: "$email", proc_type: "$proc_type"}}, $count: {$sum: 1}},
        //     {$sort: {$count: -1}}
        // ])


        res.json(Response.succes(stats, req.user?.token))

    } catch (error) {
        const err = Response.error(error, req.user?.language)
        res.status(err.code).json(err)
    }
})

router.post("/categories/unique", async (req, res) => {
    try {
        let body = req.body
        let filter = {}

        if (typeof body.is_active == "boolean") filter.is_active = body.is_active

        const stats = await Categories.distinct("name", filter) /// {is_active: true}

        res.json(Response.succes({stats, count: stats.length}, req.user.token))
    } catch (error) {
        const err = Response.error(error, req.user?.language)
        res.status(err.code).json(err)
    }
})

router.post("/users/count", async (req, res) => {
    try {
        let body = req.body
        let filter = {}

        if (typeof body.is_active == "boolean") filter.is_active = body.is_active

        const stats = await Users.countDocuments(filter)

        res.json(Response.succes(stats, req.user.token))
    } catch (error) {
        const err = Response.error(error, req.user?.language)
        res.status(err.code).json(err)
    }
})

module.exports = router