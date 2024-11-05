const xlsx = require("node-xlsx")

class Export {

    /**
     * 
     * @param {Array} titles // Excel tablosunun basliklari ["ID", "CATEGORY NAME", "IS ACTIVE", "CREATED BY"]
     * @param {Array} columns // Excel tablosuna yazilacak verilerin isimleri ["_id", "category_name", "is_active", "created_by"]
     * @param {Array} datas // Excel tablosuna yazilacak veriler
     */
    static toExcel(titles, columns, datas = []) {
        let rows = []

        //= [
        //=    ["ID", "CATEGORY NAME", "IS ACTIVE", "CREATED BY"],
        //=    ["asd", "asd", "asd", "asd"],
        //=    .
        //=    .
        //= ]

        rows.push(titles)

        datas.forEach(data => {
            let cols = []

            columns.forEach(column => {
                cols.push(data[column].toString())
            })

            rows.push(cols)
        })

        return xlsx.build([{name: "sheet1", data: rows}])
    }
}

module.exports = Export