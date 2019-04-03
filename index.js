// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const admin = require('firebase-admin');

admin.initializeApp({
	credential: admin.credential.applicationDefault(),
  	databaseURL: 'ws://pizza360-8954e.firebaseio.com/'
});
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');

 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
  
 
 
  function welcome(agent) {
    agent.add(`Welcome to agent!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  // // Uncomment and edit to make your own intent handler
  // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function yourFunctionHandler(agent) {
  //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
  //   agent.add(new Card({
  //       title: `Title: this is a card title`,
  //       imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
  //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
  //       buttonText: 'This is a button',
  //       buttonUrl: 'https://assistant.google.com/'
  //     })
  //   );
  //   agent.add(new Suggestion(`Quick Reply`));
  //   agent.add(new Suggestion(`Suggestion`));
  //   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
  // }

  // // Uncomment and edit to make your own Google Assistant intent handler
  // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function googleAssistantHandler(agent) {
  //   let conv = agent.conv(); // Get Actions on Google library conv instance
  //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
  //   agent.add(conv); // Add Actions on Google library responses to your agent's response
  // }
  // // See https://github.com/dialogflow/dialogflow-fulfillment-nodejs/tree/master/samples/actions-on-google
  // // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

   function saveuserToDb (agent) {
  	var name = agent.parameters.name;
    const phno = agent.parameters.phno;
    //agent.add(`Data from db is ${name}`);
    //agent.add(`2 Data from db is ${phno}`);
     //console.log(`Data from db is ${name}`);
     //console.log(`Data from db is ${phno}`);
     var uid = Math.trunc(Math.random()*200000);
     name = name['given-name'] ? name['given-name'] : name;
     //const uid = 24356;
    admin.database().ref('users/' + uid ).set({
        name : name,
        phone_no : phno
    });
      /*return admin.database().ref('users/' + uid).once('value').then((snapshot) => {
    	const value = snapshot.val().name;
      	if(value !== null){
        	agent.add(`Data from db is ${value}`);
         
        }
   


console.log(`Data from db is ${value}`);
      });*/
 
        
    }

     
 
  function pizza_order(agent){
    const type = agent.parameters.type;
  	const pizza_name = agent.parameters.pizza_name;
    const size = agent.parameters.size;
    const crust = agent.parameters.crust;
    const toppings = agent.parameters.toppings;
    const uid = agent.parameters.uid;
    var oid = Math.trunc(Math.random()*200000);
    
     admin.database().ref('orders/'+ oid ).set({
        type : type,
        food : pizza_name,
        size : size,
        crust : crust,
        toppings : toppings,
        uid : uid,
       status: "order placed"
    });
    
           admin.database().ref('users/' + uid).once('value').then((snapshot) => {
     if(snapshot.val()) {
       const value = snapshot.val().uid;
      	if(value !== null){
        	agent.add(`Your order with ${oid} is placed successfully.`);
        }}
     /*else
          agent.add(`User id is invalid`);*/
        });
    
   /* user_details();
    order_Id_generate();*/
  }
  
  /*function user_details(agent)
  {
    var name = agent.parameters.name;
    var phno = agent.parameters.phno;
    agent.add(`Username: ${name} and Phone number: ${phno}`);
    
  }*/

  /*function order_Id_generate(agent){
    var order_id = Math.trunc(Math.random()*200000);
    agent.add('Your Order Id is' + ' ' + orderId);
  }*/
  function checkOrderStatus(agent){
    const oid = agent.parameters.oid;
 
   return admin.database().ref('orders/' + oid).once('value').then((snapshot) => {
     if(snapshot.val()) {
       const value = snapshot.val().status;
      	if(value !== null){
        	agent.add(`Your order status is ${value}`);
        }}
     else
          agent.add(`Order id is invalid`);
        });
        
   }
                                                         
  
  
  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  //intentMap.set('actions.intent.OPTION', getOption);
  intentMap.set('pizza.order', pizza_order);
  //intentMap.set('pizza.order -veg', veg);
  //intentMap.set('pizza.order -nonveg', nonveg);
  intentMap.set('pizza.user.details', saveuserToDb);
  //intentMap.set('pizza.order.id', order_Id_generate);
  intentMap.set('pizza.order.status', checkOrderStatus);
  agent.handleRequest(intentMap);
});
