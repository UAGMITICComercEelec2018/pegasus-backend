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
    'client_id': 'AV_N9CfkSrDZfg7nmWdYIFy0KQBDgt_DJQKobbZwZsnxhmcrQakYzRbEAb0Cix3LqoNiWjgEozadrD8W',
    'client_secret': 'EO4h9vVvMhhu71pXRAifH1MhvMIH4EJ_F78K8X4WI_-4Fbt9Qlfqu5HxeLmhRwXvD10b49B6xen690cz'
  });
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
          "name": "item",
          "sku": "item",
          "price": "1.00",
          "currency": "USD",
          "quantity": 1
        }]
      },
      "amount": {
        "currency": "USD",
        "total": "1.00"
      },
      "description": "This is the payment description."
    }]
  };


  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      return callback(null,success(error));
    } else {
      return callback(null, success(payment));
    }
  });
}

export async function onPaypalResult(event, context, callback) {
  console.log(event);
  const {paymentId,PayerID:payer_id}=event.queryStringParameters;
  try{
    const {successOrError}=event.pathParameters;
    if('success'!== successOrError){
      throw event;
    }
    const payment= await new Promise((resolve,reject)=> paypal.payment.execute(paymentId,{payer_id},(error,payment)=>{
      console.log();
      if(error){
        reject(error);
      }
      resolve(payment);
    }));
    console.log(payment);
    return callback(null, success(payment));
  }catch(error){
    console.log(error);
  }


  return callback(null, success(paymentId));
}