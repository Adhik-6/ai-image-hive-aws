
## S3 bucket Creation
1. Bucket Type - General purpose
2. Bucket Name - ai-image-hive-bucket
3. Leave the rest as default and create the bucket.

## Creating DynamoDB Table
1. Table Name - ai-image-hive-db
2. Primary Key - imageId (String)
3. Leave the rest as default and create the table.

## TODO
- [ ] create & add seperate IAM Role for Lambdas.
- [x] bucket name in env variable.
- [x] Format response from lambda to the structure in original backend code.
- [ ] remove cors from lambda
- [ ] look into env var for frontend

## IAM
1. getGenImg: AWSLambdaBasicExecutionRole, s3:putObject 
2. postToCom: AWSLambdaBasicExecutionRole, s3:deleteObject, s3:getObject, s3:putObject, dynamodb:putItem
3. getAllImg: AWSLambdaBasicExecutionRole, dynamodb:readOnlyAccess

## ENV (backend)
1. s3 > cors > allowedOrigins
2. api gateway > CORS
3. frontend `.env`