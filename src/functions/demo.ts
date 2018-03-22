"use strict";
import { success, failure, notAllowed, redirect } from "./../libs/response-lib";
import { resolve } from "url";

var paypal = require("paypal-rest-sdk");
var AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });

export async function demo(event, context, callback) {
  console.log("Hola mundo");
}

export async function createPayPalCharge(event, context, callback) {
  console.log(event);

  paypal.configure({
    mode: "sandbox", //sandbox or live
    client_id: process.env.PAYPAL_CLIENT_ID,
    client_secret: process.env.PAYPAL_CLIENT_SECRET
  });

  const items = [
    {
      id: "item1",
      info: {
        name: "item",
        sku: "item",
        price: "1.00",
        currency: "USD",
        quantity: 1
      },
      price: {
        currency: "USD",
        total: "1.00"
      }
    },
    {
      id: "item2",
      info: {
        name: "item 2",
        sku: "item2",
        price: "4.00",
        currency: "USD",
        quantity: 2
      },
      price: {
        currency: "USD",
        total: "8.00"
      }
    },
    {
      id: "item3",
      info: {
        name: "item 3",
        sku: "item2",
        price: "2.00",
        currency: "USD",
        quantity: 3
      },
      price: {
        currency: "USD",
        total: "6.00"
      }
    }
  ];

  const { itemID } = event.pathParameters;
  const item = items.find(i => i.id == itemID);
  if (!item) {
    return callback(null, failure({ error: "Item no encontrado" }));
  }

  var create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal"
    },
    redirect_urls: {
      return_url: process.env.PAYPAL_SERVICE_RETURN_URL,
      cancel_url: process.env.PAYPAL_SERVICE_ERROR_URL
    },
    transactions: [
      {
        item_list: {
          items: [item.info]
        },
        amount: {
          ...item.price
        },
        description: "This is the payment description."
      }
    ]
  };

  paypal.payment.create(create_payment_json, function(error, payment) {
    if (error) {
      return callback(null, success(error));
    } else {
      return callback(null, success(payment));
    }
  });
}

export async function onPaypalResult(event, context, callback) {
  // console.log(event);
  const { paymentId, PayerID: payer_id } = event.queryStringParameters;
  try {
    const { successOrError } = event.pathParameters;
    if ("success" !== successOrError) {
      throw event;
    }
    const payment = await new Promise((resolve, reject) =>
      paypal.payment.execute(paymentId, { payer_id }, (error, payment) => {
        if (error) {
          reject(error);
        }
        resolve(payment);
      })
    );
    // console.log(payment);
    //return callback(null, success(payment));
    var sns = new AWS.SNS({ apiVersion: "2010-03-31" });
    var params = {
      Message: "PayPal Payment ID XXX",
      Subject: "Subject",
      TopicArn: process.env.PAYPAL_PURCHASE_SNS
    };
    const notification = await new Promise((resolve, reject) =>
      sns.publish(params, function(err, data) {
        if (err)
          reject(err); // an error occurred
        else resolve(data); // successful response
      })
    );
    console.log(notification);
    return callback(null, redirect(process.env.PAYPAL_PURCHASE_SUCCESS_URL));
  } catch (error) {
    // console.log(error);
    //return callback(null, success(error));
    return callback(null, redirect(process.env.PAYPAL_PURCHASE_ERROR_URL));
  }
}

export async function onPayPalPurchaseSNS(event, context, callback) {
  console.log(event);
  var ses = new AWS.SES({ apiVersion: "2010-12-01" });
  try {
    var params = {
      Destination: {
        ToAddresses: ["ing.silvestre.garcia@gmail.com"]
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data:
              'This message body contains HTML formatting. It can, for example, contain links like this one: <a class="ulink" href="http://docs.aws.amazon.com/ses/latest/DeveloperGuide" target="_blank">Amazon SES Developer Guide</a>.'
          },
          Text: {
            Charset: "UTF-8",
            Data: "This is the message body in text format."
          }
        },
        Subject: {
          Charset: "UTF-8",
          Data: "Test email"
        }
      },
      Source: "ing.silvestre.garcia@gmail.com"
    };
    const email = await new Promise((resolve, reject) =>
      ses.sendEmail(params, function(err, data) {
        if (err) {
          console.log(err);
          reject(err); // an error occurred
        } else resolve(data); // successful response
      })
    );
    return callback(null, success({ email }));
  } catch (error) {
    return callback(null, error({ error }));
  }
}
