const { Constants } = require('./Constants');
const { SalesForceRepo } = require('./SalesForceRepo');

class salesForceService {
    constructor() {
        this.salesForceRepo = new SalesForceRepo();
        this.Constants = new Constants();
    }

    initializeSalesForceChatObject(prechatDetailsList, userInfo, id, buttonOverrides) {
        var ChasitorInitObject = {
            organizationId: process.env.ORGANIZATION_ID,
            deploymentId: process.env.DEPLOYMENT_ID,
            buttonId: process.env.BUTTON_ID,
            doFallback: true,
            language: 'en-Us',
            userAgent: 'Lynx/2.8.8',
            sessionId: id,
            visitorName: userInfo.FirstName + ' ' + userInfo.LastName,
            screenResolution: '1900x1080', // TODO: This should be a config setting
            prechatDetails: prechatDetailsList,
            prechatEntities: [], 
            receiveQueueUpdates: true,
            isPost: true,
            buttonOverrides: buttonOverrides
        };

        return ChasitorInitObject;
    }

    createPreChatModel(label, value, entityMap) {
        var PrechatModel = {
            label: label,
            value: value,
            entityMaps: new Array(entityMap),
            transcriptFields: new Array(label),
            displayToAgent: true
        };

        return PrechatModel;
    }

    createEntityMapModel(entityName, fieldName) {
        var EntityMapModel = {
            entityName: entityName,
            fieldName: fieldName,
            isFastFillable: false,
            isAutoQueryable: true,
            isExactMatchable: true
        };

        return EntityMapModel;
    }

    initializePrechatDetails(userInfo, botTranscript) {
        // replicate for other details supplied via form
        var firstNameEntityMap = this.createEntityMapModel(this.Constants.EntityName, this.Constants.FirstName);
        var visitorFirstName = this.createPreChatModel(
            this.Constants.FirstName,
            userInfo.FirstName,
            firstNameEntityMap);

        var lastNameEntityMap = this.createEntityMapModel(this.Constants.EntityName, this.Constants.LastName);
        var visitorLastName = this.createPreChatModel(
            this.Constants.LastName,
            userInfo.LastName,
            lastNameEntityMap);

        var emailEntityMap = this.createEntityMapModel(this.Constants.EntityName, this.Constants.Email);
        var visitorEmail = this.createPreChatModel(
            this.Constants.Email,
            userInfo.Email,
            emailEntityMap);

        var companyEntityMap = this.createEntityMapModel(this.Constants.EntityName, this.Constants.Company);
        var visitorCompany = this.createPreChatModel(
            this.Constants.Company,
            userInfo.Company,
            companyEntityMap);

        var inquiryEntityMap = this.createEntityMapModel(this.Constants.EntityName, this.Constants.inquiry);
        var visitorInquiry = this.createPreChatModel(
            this.Constants.inquiry,
            userInfo.Inquiry,
            inquiryEntityMap);

        var botTranscriptEntityMap = this.createEntityMapModel(this.Constants.BotTranscriptEntityName, this.Constants.BotTranscriptEntityName);
        var visitorBotTranscript = this.createPreChatModel(
            this.Constants.BotTranscriptFieldName,
            botTranscript, // TODO: Add the actual FULL bot transcript
            botTranscriptEntityMap);

        // eslint-disable-next-line no-array-constructor
        var preChatDetails = new Array(
            visitorEmail,
            visitorFirstName,
            visitorLastName,
            visitorCompany,
            visitorInquiry,
            visitorBotTranscript
        );

        return preChatDetails;
    }

    async startSession() {
        return await this.salesForceRepo.getSession();
    }

    // TODO: Pass the Bot transcript to this method for adding to the pre-chat details.
    async initializeChat(conversationData, userInfo, botTranscript) {
        var buttonOverrides = new Array(process.env.BUTTON_ID);
        var preChatDetails = this.initializePrechatDetails(userInfo, botTranscript);
        var chasitorInit = this.initializeSalesForceChatObject(preChatDetails, userInfo, conversationData.sessionId, buttonOverrides);
        return await this.salesForceRepo.requestChat(chasitorInit, conversationData.affinityToken,conversationData.sessionKey);
    }

    async pullMessages(token, key) {
        return await this.salesForceRepo.getMessages(token, key);
    }

    async sendChatMessage(chatMessage, token, key) {
        await this.salesForceRepo.postChatMessage(chatMessage, token, key);
    }
}

module.exports.SalesForceService = salesForceService;
