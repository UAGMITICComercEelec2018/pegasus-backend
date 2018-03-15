"use strict";
import { success, failure, notAllowed } from "./../libs/response-lib";

export async function demo(event, context, callback) {
  console.log("Hola mundo");
}

export async function createPayPalCharge(event, context, callback) {
  console.log(event);

  var paypal = require('paypal-rest-sdk');
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
      "return_url": "http://return.url",
      "cancel_url": "http://cancel.url"
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