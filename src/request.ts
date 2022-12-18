class request {
    body = {};
    userId = null;
    constructor(body, userId: string) {
        this.body = body;
        this.userId = userId;
    }
    //cons
    static fromRestRequest(req) {
        return new request(req.body, req.user._id);
    }
}
module.exports = request;
