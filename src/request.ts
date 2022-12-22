import { Request } from "express";

class request {
    body = {};
    userId = null;
    constructor(body, userId: string) {
        this.body = body;
        this.userId = userId;
    }
    //cons
    static fromRestRequest(req: Request) {
        return new request(req.body, req.body.user._id); // I have change to this -> req.body.user._id, if there is a problem to check
    }
}
export = request;
