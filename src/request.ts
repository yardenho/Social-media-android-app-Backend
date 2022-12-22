import { Request } from "express";

class request {
    body = {};
    query = null;
    userId = null;
    constructor(body, userId: string, query) {
        this.body = body;
        this.userId = userId;
        this.query = query;
    }
    //cons
    static fromRestRequest(req: Request) {
        return new request(req.body, req.body.userId, req.query); // I have change to this -> req.body.userId, if there is a problem to check
    }
}
export = request;
