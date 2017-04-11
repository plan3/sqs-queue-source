# SQS queue source

The SQS queue library to be used with [queue-consumer-loop](https://github.com/plan3/queue-consumer-loop)

## Usage

To use the SQS queue source you need to configure it with object with following properties:

```
const config = {
   url: <queueUrl>,
   region: <aws_region>,
   accessKeyId: <aws_access_key_id>,
   secretAccessKey: <aws_secret_access_key> 
}
```

you can customize additional properties:
  * `maxWaitTime` - time passed to SQS to wait for messages in long-polling mode (20s by default)
  * `maxNumberOfMessages` - number of messages to retrieve in one shot (10 by default)
  * `logger` - logger (console by default)

## The usage

Even though the library is meant to be used with queue-consumer-loop, you can use it separately if you find it useful:
  * `getNextNonEmptyBatch()` - returns a promise that provides next non empty batch of messages from the queue
  * `deleteMessage(message)` - marks message as processed by deleting it (promisified)
