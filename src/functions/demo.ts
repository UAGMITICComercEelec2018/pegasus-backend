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

  const items=[{
    id:"item1",
    info:{
      "name": "Pastel de zanahoria",
      "sku": "item1",
      "price": "300.00",
      "currency": "MXN",
      "quantity": 1
    },
    price:{
      "currency": "MXN",
      "total": "300.00"
    }
  },
  {
    id:"item2",
    info:{
      "name": "Torta rellena",
      "sku": "item2",
      "price": "200.00",
      "currency": "MXN",
      "quantity": 1
    },
    price:{
      "currency": "MXN",
      "total": "200.00"
    }
  },
  {
    id:"item3",
    info:{
      "name": "Cheesecake de fresa",
      "sku": "item3",
      "price": "280.00",
      "currency": "MXN",
      "quantity": 1
    },
    price:{
      "currency": "MXN",
      "total": "280.00"
    }
  },
    {
      id:"item4",
      info:{
        "name": "cheesecake de fresa",
        "sku": "item4",
        "price": "100.00",
        "currency": "MXN",
        "quantity": 1
      },
      price:{
        "currency": "MXN",
        "total": "100.00"
      }
    },
    {
      id:"item5",
      info:{
        "name": "cupcakes de fresa",
        "sku": "item5",
        "price": "30.00",
        "currency": "MXN",
        "quantity": 1
      },
      price:{
        "currency": "MXN",
        "total": "3.00"
      }
    },
    {
      id:"item6",
      info:{
        "name": "Muffin de vainilla",
        "sku": "item6",
        "price": "30.00",
        "currency": "MXN",
        "quantity": 1
      },
      price:{
        "currency": "MXN",
        "total": "30.00"
      }
    },
    {
      id:"item7",
      info:{
        "name": "Cupcakes de vainilla",
        "sku": "item7",
        "price": "25.00",
        "currency": "MXN",
        "quantity": 1
      },
      price:{
        "currency": "MXN",
        "total": "25.00"
      }
    },
    {
      id:"item8",
      info:{
        "name": "Pastel de chocolate",
        "sku": "item8",
        "price": "50.00",
        "currency": "MXN",
        "quantity": 1
      },
      price:{
        "currency": "MXN",
        "total": "50.00"
      }
    },
    {
      id:"item9",
      info:{
        "name": "Pay de guayaba",
        "sku": "item9",
        "price": "60.00",
        "currency": "MXN",
        "quantity": 1
      },
      price:{
        "currency": "MXN",
        "total": "60.00"
      }
    },
    {
      id:"item10",
      info:{
        "name": "Flan napolitano",
        "sku": "item10",
        "price": "20.00",
        "currency": "MXN",
        "quantity": 1
      },
      price:{
        "currency": "MXN",
        "total": "20.00"
      }
    }];

  const {itemID}=event.pathParameters;
  const item=items.find(i=> i.id==itemID);
  if(!item){
    return callback(null,failure({error:"Item no encontrado"}));
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
        "items": [item.info]
      },
      "amount": {
        ...item.price
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
    return callback(null, success(error));
  }
}

export async function onPayPalPurchaseSNS(event,context,callback){
  console.log(event);
  return callback(null, success({event}));
}