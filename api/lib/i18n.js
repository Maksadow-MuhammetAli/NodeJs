const i18n = require("../i18n")
const {DEFAULT_LANG} = require("../config")

class I18n {

    static translate(text, lang = DEFAULT_LANG, params = []) {
        let textArr = text.split(".") // "COMMON.VALIDATION_ERROR_TITLE" => ["COMMON", "VALIDATION_ERROR_TITLE"]

        let val = i18n[lang][textArr[0]]

        for (let i = 1; i < textArr.length; i++) {
            val = val[textArr[i]]
        }

        val = val + ""

        params.forEach((param) => {
            val = val.replace("{}", param)
        })

        return val
    }
}

module.exports = I18n