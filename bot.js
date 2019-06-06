// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler } = require('botbuilder');
const CONVERSATION_DATA_PROPERTY = 'conversationData';

const { SalesForceService } = require('./SalesForceService');
// set up headers

class MyBot extends ActivityHandler {
    constructor(conversationState) {
        super();
        this.salesForceService = new SalesForceService();
        // Create the state property accessors for the conversation data and user profile.
        this.conversationData = conversationState.createProperty(CONVERSATION_DATA_PROPERTY);
        // this.userProfile = userState.createProperty(USER_PROFILE_PROPERTY);

        // The state management objects for the conversation and user state.
        this.conversationState = conversationState;

        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            const conversationData = await this.conversationData.get(context, { chatInitialized: false, chatRequestSuccessful: false, agentResponded: false });

            // await context.sendActivity(`You said ${ context.activity.text }`);
            console.log(conversationData.chatInitialized);
            var res;

            if (conversationData.chatInitialized === false) {
                res = await this.salesForceService.startSession();

                conversationData.sessionId = res.id;
                conversationData.sessionKey = res.key;
                conversationData.affinityToken = res.affinityToken;
            }

            console.log(conversationData.sessionId);
            console.log(conversationData.sessionKey);
            console.log(conversationData.affinityToken);

            // attempt to initialize chat
            
            var botTranscript = 'Bot Transcript';

            if (conversationData.chatInitialized === false) {
                var userInfo = {
                    FirstName: 'Moshi',
                    LastName: 'Musukwa',
                    Email: 'graft@gmail.com',
                    Company: 'ZADS'
                };
    
                await this.salesForceService.initializeChat(conversationData, userInfo, botTranscript);
                await context.sendActivity('Initializing chat...');
                conversationData.chatInitialized = true;
            }

            console.log('Chat was initilaized');
            console.log(conversationData.chatInitialized);
            console.log(conversationData.chatRequestSuccessful);

            if (conversationData.chatInitialized === true && conversationData.chatRequestSuccessful === false) {
                console.log('inside pull messages block');

                var msgObject = await this.salesForceService.pullMessages(conversationData.affinityToken, conversationData.sessionKey);
                var chatStatus = msgObject.messages[0].type;

                console.log(chatStatus);
                if (chatStatus === 'ChatRequestSuccess') {
                    await context.sendActivity('Chat request was a success, you are now connected to an agent.');
                    conversationData.chatRequestSuccessful = true;
                }

                if (chatStatus === 'ChatRequestFail') {
                    await context.sendActivity('Sorry chat request failed I will try to connect you again');
                }
            }

            if (conversationData.chatInitialized === true && conversationData.chatRequestSuccessful === true) {
                console.log('inside chat');

                if (conversationData.agentResponded === true) {
                    var msg = {
                        text: context.activity.text
                    };
                    this.salesForceService.sendChatMessage(msg, conversationData.affinityToken, conversationData.sessionKey);
                }

                // poll server until you get a response
                var msgObject3;
                do {
                    msgObject3 = await this.salesForceService.pullMessages(conversationData.affinityToken, conversationData.sessionKey);
                } while (msgObject3.messages[0].type !== 'ChatMessage');

                var agentMsg = msgObject3.messages[0].message.text.toString();
                await context.sendActivity(agentMsg);
                conversationData.agentResponded = true;
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity('Hello and welcome!');
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onDialog(async (context, next) => {
            // Save any state changes. The load happened during the execution of the Dialog.
            await this.conversationState.saveChanges(context, false);

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
}

module.exports.MyBot = MyBot;
