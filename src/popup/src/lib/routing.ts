import { History } from "history";

// Controls page route history stack
let Router:History;

// Sets our router object
export function SetRouter(History:History) {
    Router = History;
}

// Replaces current page stack starting at the given page
export function Route(Destination:string) {
    Router.replace(Destination);
}