'use strict';
import { success, failure, notAllowed } from './../libs/response-lib';
import * as conekta from 'conekta';
conekta.api_key = process.env.CONEKTA_API_KEY;
conekta.api_version = '2.0.0';




export async function createOxxoCharge(event, context, callback) {
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

  const order = conekta.Order.create({
    "line_items": [{
      "name": item.info.name,
      "unit_price": parseInt(item.price.total),
      "quantity": item.info.quantity
    }],
    "shipping_lines": [{
      "amount": 1500,
      "carrier": "FEDEX"
    }], //shipping_lines - phyiscal goods only
    "currency": "MXN",
    "customer_info": {
      "name": "Fulanito Pérez",
      "email": "jadrianramirezl@gmail.com",
      "phone": "+5218181818181"
    },
    "shipping_contact": {
      "address": {
        "street1": "Calle 123, int 2",
        "postal_code": "06100",
        "country": "MX"
      }
    }, //shipping_contact - required only for physical goods
    "charges": [{
      "payment_method": {
        "type": "oxxo_cash"
      }
    }]
  }, function (err, res) {
    console.log(err);
    return callback(null, success(res.toObject()));
  });
}
