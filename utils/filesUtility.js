const fs = require('fs')

class FilesUtility {
    async convertBase64toImage(base64String, path, filename) {
        try {
            const avatarBuffer = Buffer.from(base64String.split(',')[1], "base64")
            fs.writeFileSync(path + filename, avatarBuffer)
            return { success: true, message: "Converted." }
        } catch (error) {
            return { success: false, message: error.message }
        }
    }
}

module.exports = new FilesUtility()