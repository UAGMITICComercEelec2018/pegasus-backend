"use strict";
import { success, failure, notAllowed } from "./../libs/response-lib";

var paypal = require('paypal-rest-sdk');

export async function demo(event, context, callback) {
  console.log("Hola mundo");
}

export async function createPayPalCharge(event, context, callback) {
  console.log(event);


  paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': process.env.PAYPAL_CLIENT_ID,
    'client_secret': process.env.PAYPAL_CLIENT_SECRET
  });

  const items = [{
    id: "item1",
    info: {
      "name": "item",
      "sku": "item",
      "price": "1.00",
      "currency": "USD",
      "quantity": 1
    },
    price: {
      "currency": "USD",
      "total": "1.00"
    }
  }, {
    id: 'item2',
    info: {
      "name": "item2",
      "sku": "item2",
      "price": "2.00",
      "currency": "USD",
      "quantity": 1
    },
    price: {
      "currency": "USD",
      "total": "2.00"
    }
  }];

  const { itemID } = event.pathParameters;
  const item = items.find(i => i.id == itemID);
  if (!item) {
    return callback(null, failure({ error: "Item no encontrado" }));
  }

  var create_payment_json = {
    "intent": "sale",
    "payer": {
      "payment_method": "paypal"
    },
    "redirect_urls": {
      "return_url": process.env.PAYPAL_SERVICE_RETURN_URL,
      "cancel_url": process.env.PAYPAL_SERVICE_ERROR_URL
    },
    "transactions": [{
      "item_list": {
        "items": [{
          ...item.info
        }]
      },
      "amount": {
        ...item.price
      },
      "description": "This is the payment description."
    }]
  };


  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      return callback(null, success(error));
    } else {
      return callback(null, success(payment));
    }
  });
}

export async function onPaypalResult(event, context, callback) {
  console.log(event);
  const { paymentId, PayerID: payer_id } = event.queryStringParameters;
  try {
    const { successOrError } = event.pathParameters;
    if ('success' !== successOrError) {
      throw event;
    }
    const payment = await new Promise((resolve, reject) => paypal.payment.execute(paymentId, { payer_id }, (error, payment) => {
      console.log();
      if (error) {
        reject(error);
      }
      resolve(payment);
    }));
    console.log(payment);
    return callback(null, success(payment));
  } catch (error) {
    console.log(error);
    return callback(null, success(error));
  }
}