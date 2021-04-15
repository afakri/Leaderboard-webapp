require("dotenv").config()
const db = require('./db')
const express = require('express')
const app = express()
app.use("/static", express.static('./static/'));
app.use(express.json());
const port = process.env.PORT || 8080




app.get("/", async(req, res) =>{
	res.sendFile('static/index.html', { root: __dirname })
	
})
app.get("/api/:data", async(req, res) => {
    try {
        const rows = await getData(req.params.data, res)
        res.setHeader('Content-Type', 'application/json')
        res.send(JSON.stringify(rows))
    } catch (e) {
        console.log(`get failed ${e}`)
    }

})

app.get("/api/events/:comp_name", async(req, res) => {
    try {
        const { rows } = await db.query(`SELECT event_name,main_score,main_tie_break,secondary_score,secondary_tie_break FROM events_scoring WHERE competition_name='${req.params.comp_name}'`)
        res.setHeader('Content-Type', 'application/json')
        res.send(JSON.stringify(rows))
    } catch (e) {
        console.log(`get failed ${e}`)
    }

})



app.get("/scores/competition/:comp_name/event/:event_name", async(req, res) => {

    try {
        const { rows } = await db.query(`SELECT athlete_name,event_name,main,tie_break,secondary,tie_break_secondary FROM athletes_scoring
        WHERE event_name= '${req.params.event_name}' 
        AND competition_name='${req.params.comp_name}'`)
        res.setHeader('Content-Type', 'application/json')
        res.send(JSON.stringify(rows))
    } catch (e) {
        console.log(`get failed ${e}`)
    }

});

// inserting on element 
app.post("/insert_one/:table", async(req, res) => {
    const { rows } = await db.query("SELECT token FROM partners");
    const { authorization } = req.headers
    let exists = false
    rows.forEach((object) => {
        if (object.token === authorization) {
            exists = true
            return
        }
    });
    if (authorization && exists) {

        const data = req.body
        let temp1 = ""
        let temp2 = ""
        const keys = Object.keys(data)
        const values = Object.values(data)
        for (var i = 0; i < keys.length; i++) {
            temp1 += keys[i]
            if (typeof values[i] != "number") {
                temp2 += "'" + values[i] + "'"
            } else {
                temp2 += values[i]
            }

            if (i != keys.length - 1) {
                temp1 += ','
                temp2 += ','
            }
        }

        const query = `INSERT INTO ${req.params.table}(${temp1}) VALUES (${temp2})`
        await db.query(query)
        res.status(201).send('Insertion Success!!')
    } else {
        res.status(400).send("bad token buddy")
    }

});

//Inserting an array of data
app.post("/insert_more/:table", async(req, res) => {
    const { rows } = await db.query("SELECT token FROM partners");
    const { authorization } = req.headers
    let exists = false
    rows.forEach((object) => {
        if (object.token === authorization) {
            exists = true
            return
        }
    });
    const data = req.body


    if (authorization && exists && data.length > 0 && req.params.table != "partners") {


        let temp1 = ""
        let temp2 = ""
        const keys = Object.keys(data[0])
        for (var i = 0; i < keys.length; i++) {
            temp1 += keys[i]
            if (i != keys.length - 1) {
                temp1 += ','
            }
        }
        data.forEach(element => {
            temp2 += '('
            const values = Object.values(element)
            for (var i = 0; i < values.length; i++) {
                if (typeof values[i] != "number") {
                    temp2 += "'" + values[i] + "'"
                } else {
                    temp2 += values[i]
                }
                if (i != keys.length - 1) {
                    temp2 += ','
                }
            }
            temp2 += '),'
        })
        temp2 = temp2.slice(0, -1)



        const query = `INSERT INTO ${req.params.table}(${temp1}) VALUES ${temp2}`
        await db.query(query)
        res.status(201).send('Insertion Success!!')
    } else {
        res.status(400).send("bad token buddy or bad routing")
    }

});


app.listen(port, () => console.log(`Server listening on ${port} `))






async function getData(data, res) {
    let rows;
    switch (data) {
        case "competitions":
            rows = await db.query("SELECT * FROM competitions ");
            return rows.rows
        case "athletes":
            rows = await db.query("SELECT * FROM athletes ");
            return rows.rows
        case "partners":
            rows = await db.query("SELECT company_name,company_adress FROM partners ");
            return rows.rows
        case "events":
            rows = await db.query("SELECT * FROM events ");
            return rows.rows
        case "competes_in":
            rows = await db.query("SELECT * FROM competes_in ");
            return rows.rows
        case "organizes":
            rows = await db.query("SELECT * FROM organizes ");
            return rows.rows
        case "scoring_methods":
            rows = await db.query("SELECT * FROM scoring_methods ");
            return rows.rows
        default:
            res.status(404).send("The given route is invalid!");
            break;

    }

}
