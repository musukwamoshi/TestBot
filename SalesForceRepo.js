const axios = require('axios');

class SalesForceRepo {
    constructor() {
        this.axios = axios;
    }
    async getSession() {
        // set up headers
        console.log(process.env.BASE_URL);
        var headers = {
            'Content-Type': 'application/json',
            'X-LIVEAGENT-API-VERSION': '45',
            'X-LIVEAGENT-AFFINITY': 'null'
        };
        try {
        // make the call to salesforce
            var res = await this.axios.get(process.env.BASE_URL + 'System/SessionId', { headers: headers });
            return res.data;
        } catch (err) {
            console.log(err);
        }
    }

    async requestChat(chasitorInit, token, key) {
        var chatInit = JSON.stringify(chasitorInit);
        // set up headers
        let headers = {
            'Content-Type': 'application/json',
            'X-LIVEAGENT-API-VERSION': '45',
            'X-LIVEAGENT-AFFINITY': token,
            'X-LIVEAGENT-SESSION-KEY': key,
            'X-LIVEAGENT-SEQUENCE': '1'
        };

        // make the call to salesforce
        try {
            var res = await this.axios.post(process.env.BASE_URL + 'Chasitor/ChasitorInit', chatInit, { headers: headers });
            var data = res.data;
            return data;
        } catch (err) {
            console.log(err);
        }
    }

    async getMessages(token, key) {
        // set up header
        let headers = {
            'Content-Type': 'application/json',
            'X-LIVEAGENT-API-VERSION': '45',
            'X-LIVEAGENT-AFFINITY': token,
            'X-LIVEAGENT-SESSION-KEY': key
        };

        // make the call to salesforce
        try {
            let res = await this.axios.get(process.env.BASE_URL + 'System/Messages', { headers: headers });
            var data = res.data;
            return data;
        } catch (err) {
            console.log(err);
        }
    }

    async postChatMessage(chatMessage, token, key) {
        var chatRequestMessage = JSON.stringify(chatMessage);
        // set up headers
        let headers = {
            'X-LIVEAGENT-API-VERSION': '45',
            'X-LIVEAGENT-AFFINITY': token,
            'X-LIVEAGENT-SESSION-KEY': key
        };

        // make the call to salesforce
        let res = await this.axios.post(process.env.BASE_URL + 'Chasitor/ChatMessage', chatRequestMessage, { headers: headers });
        return res;
    }
}

module.exports.SalesForceRepo = SalesForceRepo;
