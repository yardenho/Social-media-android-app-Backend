import { Request } from "express";

class request {
    body = {};
    query = null;
    params = null;
    userId = null;
    constructor(body, userId: string, query, params) {
        this.body = body;
        this.userId = userId;
        this.query = query;
        this.params = params;
    }
    //cons
    static fromRestRequest(req: Request) {
        return new request(req.body, req.body.userId, req.query, req.params); // I have change to this -> req.body.userId, if there is a problem to check
    }
}
export = request;
