'use strict';

const Promise = require('bluebird');
const AWS = require('aws-sdk');
const logger = console;

class SQSQueue {
    constructor(config) {
        this.queueUrl = config.url;
        this.sqs = new AWS.SQS({
            region: config.region,
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretKey
        });
        Promise.promisifyAll(Object.getPrototypeOf(this.sqs));
        this.messageBuffer = [];
        this.maxWaitTime = config.maxWaitTime || 20;
        this.maxNumberOfMessages = config.maxNumberOfMessages || 10;
        this.logger = config.logger || logger.log;
    }

    pollQueue() {
        return this.sqs.receiveMessageAsync({
            QueueUrl: this.queueUrl,
            AttributeNames: ['All'],
            WaitTimeSeconds: this.maxWaitTime,
            MaxNumberOfMessages: this.maxNumberOfMessages
        });
    }

    getNextNonEmptyBatch() {
        return this.pollQueue()
            .then(response => {
                if (response.Messages && response.Messages.length > 0) {
                    const ids = response.Messages.map(m => m.MessageId);
                    this.logger('Got non empty batch of messages ' + ids);
                    return response.Messages;
                }

                this.logger(
                    'Didn\'t get any new messages while long polling for ' + this.maxWaitTime + '. Continuing...'
                );
                return this.getNextNonEmptyBatch();
            });
    }

    deleteMessage(message) {
        return this.sqs.deleteMessageAsync({
            QueueUrl: this.queueUrl,
            ReceiptHandle: message.ReceiptHandle
        })
        .then(() => {
            this.logger('Message with id ' + message.MessageId + ' deleted');
        });
    }

    nextMessage() {
        if (this.messageBuffer.length > 0) {
            return Promise.resolve(this.messageBuffer.shift());
        }

        return this.getNextNonEmptyBatch()
            .then(messages => {
                this.logger('Just got ' + messages.length + ' messages ');
                let m = messages.pop();
                this.messageBuffer = messages;
                return m;
            });
    }
}

module.exports = SQSQueue;
