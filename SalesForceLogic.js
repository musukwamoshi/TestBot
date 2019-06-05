SalesForceLogic(){
var Question = {
    firstName:"FirstName",
    lastName:"FirstName",
    email:"Email",
    company:"Company",
    inquiry:"Inquiry",
    done:"Done",
    none:"None"
}

if(session.userData.Captured==false){

    captureUserInfo(userInfo,session);

}

if(session.userData.Captured == true && session.conversationData.sessionInitialized == false){

    var initSession = this.salesForceService.startSession();

    conversationData.affinityToken = initSession.affinityToken;
    conversationData.sessionId = initSession.id;
    conversationData.sessionKey = initSession.key;


    session.send("Session was initialized.");
    session.conversationData.sessionInitialized = true;

}


if(session.conversationData.sessionInitialized==true && session.conversationData.chatInitialized == false){

    this.salesForceService.initializeChat(session.conversationData,userInfo);
    session.send("Chat was successfully initialized,waiting for agent to accept the chat...");
    session.conversationData.chatInitialized = true;

}

//Check chat request status
if(session.conversationData.chatInitialized==true && session.conversationData.chatRequestSuccessfull==false){
    //give agent chance to respond to chat

   
    var msgObject = this.salesForceService.pullMessages(session.conversationData.affinityToken, session.conversationData.sessionKey);
    var chatStatus = msgObject.messages[0].type;

    if(chatStatus == "ChatRequestSuccess")
    {
        session.send("Chat request was a success, you are now connected to an agent.");
        session.conversationData.chatRequestSuccessfull = true;
    }

    if(chatStatus == "ChatRequestFail")
    {
        session.send("Sorry chat request failed I will try to connect you again");
        

    }

}

//Send Chat Message
if (session.userData.captured==true && session.conversationData.sessionInitialized==true && session.conversationData.chatInitialized==true && session.conversationData.chatRequestSuccessfull==true)
{
    if (session.message.text != session.message.text.ToString())
    {
        var  msg = {
            text: session.message.text
        };

        this.salesForceService.sendChatMessage(msg, session.conversationData.affinityToken, session.conversationData.sessionKey);
    }

    //poll server until you get a response
    do
    {
       var msgObject3 = this.salesForceService.pullMessages(session.conversationData.affinityToken, session.conversationData.sessionKey);

    } while (msgObject3.messages[0].type.ToString() != "ChatMessage");

    
     var agentMsg = msgObject3.messages[0].message.text.ToString();
     session.send(agentMsg);
    
}

}

captureUserInfo(session){

    var input = session.message.text.trim();
    var message;

    switch (session.conversationData.lastQuestionAsked)
    {
        case Question.None:
            session.send("What is your first name?");
            session.conversationData.lastQuestionAsked = Question.firstName;
            break;
        case Question.firstName:
            if (ValidateInput(input))
            {
                session.userData.firstName = input;
                session.send(`Hi ${session.userData.firstName}.`);
                session.send("Please enter your last name..");
                session.conversationData.lastQuestionAsked = Question.lastName;
                break;
            }
            else
            {
                session.send("Please ensure your input contains at least one character.");
                break;
            }
        case Question.lastName:
            if (ValidateInput(input))
            {
                session.userData.lastName = input;
                session.send(`I have your last name as  ${session.userData.lastName}.`);
                session.send("What is your email address?");
                session.conversationData.lastQuestionAsked = Question.email;
                break;
            }
            else
            {
                session.send("Please ensure your input contains at least one character.");
                break;
            }

        case Question.email:
            if (ValidateInput(input))
            {
                session.userData.email = input;
                session.send(`Your email is ${session.userData.email}.`);
                session.send("What is the name of your company?");
                session.conversationData.lastQuestionAsked = Question.company;     
                break;
            }
            else
            {
                session.send("Please ensure your input contains at least one character.");
                break;
            }

        case Question.company:
            if (ValidateInput(input))
            {
                session.userData.company = company;
                session.send(`Your company is ${session.userData.company}.`);
                session.send("Please give a brief description of your enquiry.");
                session.conversationData.lastQuestionAsked = Question.inquiry;
                        
                break;
            }
            else
            {
                session.send("Please ensure your input contains at least one character.");
                break;
            }

        case Question.inquiry:
            if (ValidateInput(input) != null)
            {
                session.userData.inquiry = input;
                session.send(`Your enquiry is ${session.userData.inquiry}.`);
                session.send("Thank you for providing your information we will now connect you to a live agent.");
                session.lastQuestionAsked = Question.Done;
                session.userData.captured = true;
                break;
            }
            else
            {
                session.send("Please ensure your input contains at least one character.");
                break;
                    
            }
    }

    ValidateInput(input)
    {
        var info;

        if (input==="")
        {
            return null;
        }else
        {
            return input.Trim();
        }
    }