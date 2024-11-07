const xlsx = require("node-xlsx")
const CustomError = require("./CustomError")
const Enum = require("../config/Enum")
const I18n = require("./i18n")
const {EN} = require("../i18n")

class Import {
    static fromExcel(filePath) {
        let workSheet = xlsx.parse(filePath)

        if (!workSheet || workSheet.length == 0) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Invalid excel format", "Invalid excel format")

        let rows = workSheet[0].data

        if (rows?.length == 0) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "File is empty", "Excel file is empty")

        return rows
    }
}

module.exports = Import