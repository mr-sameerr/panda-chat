const AWS = require('aws-sdk')
require("dotenv").config()

class AwsS3Bucket {
    constructor() {
        this.S3 = new AWS.S3({
            accessKeyId: process.env.ACCESS_KEY,
            secretAccessKey: process.env.SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION
        })
    }
    async presignedUrlUploads(fileName, fileContent = null, fileType) {
        const params = {
            Bucket: process.env.BUCKET_NAME,
            Key: fileName,
            ContentType: fileType
        }

        try {
            const preSignedUrl = await this.S3.getSignedUrlPromise('putObject', params)
            params.Body = fileContent
            const uploadedImage = await this.S3.upload(params).promise()

            return uploadedImage.Location
        } catch( error){
            console.log('Error generating pre-signed URL: ', error)
            throw error
        }
    }
}

module.exports = new AwsS3Bucket()