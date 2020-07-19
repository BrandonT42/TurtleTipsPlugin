import * as https from "https";
import * as http from "http";
import * as TurtleCoin from "./turtlecoin";
import * as QueryString from "querystring";
import { KeyPair } from "turtlecoin-utils";
import { StringToHex } from "./utils";

// Handles HTTP API requests
export class Http {
    private Host:string;
    private Port?:number;
    private Https:boolean;

    // Creates a new connection instance
    constructor(Host:string, Port?:number, Https?:boolean) {
        this.Host = Host;
        this.Port = Port;
        this.Https = Https ?? false;
    }

    // Sign an HTTP/S request
    private async SignRequest(Date:string, Payload:string, Path:string, Keys:KeyPair):Promise<string> {
        // Create a seed for us to sign
        let Seed = StringToHex(Date + Payload + Path);

        // Generate signature and convert it to base64
        let Signature = await TurtleCoin.Utils.signMessage(Seed, Keys.privateKey);
        let SignatureBuffer = Buffer.alloc(Signature.length, Signature);
        Signature  = SignatureBuffer.toString("base64");

        // Return authorization header
        return `keyId="${Keys.publicKey}",algorithm="ed25519",signature="${Signature}"`;
    }
    
    // Sends a request using the given method and verb
    private async Request(Method:string, Verb:string, Params:any, Keys?:KeyPair):Promise<any> {
        return new Promise(async (Resolve, Reject) => {
            let Data:string = JSON.stringify(Params);
            let RequestDate = new Date().toUTCString();

            // Create an authorization header if required
            let Authorization = "";
            if (Keys) {
                Authorization = await this.SignRequest(RequestDate, Data,
                    `${this.Host}:${this.Port}${Method}`, Keys);
            }

            // Form path
            let Path = Method;
            Path += Verb === "GET" ? `?${QueryString.encode(Params)}` : "";

            // Assign request options
            let Options = {
                hostname: this.Host,
                port: this.Port,
                path: Path,
                method: Verb,
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": Data.length,
                    "X-Request-Date": RequestDate,
                    "X-Request-Auth": Authorization,
                    "X-Hello-From": "TurtleTips ;)"
                },
                timeout: 15000
            };
    
            // Define how request response is handled
            let Request = (this.Https ? https : http).request(Options, Result => {
                // Assemble response packet
                let Body:any[] = [];
                Result.on("data", Chunk => {
                    Body.push(Chunk);
                });
                Result.on("end", () => {
                    // If status code does not return OK, reject request
                    if (Result.statusCode != 200) {
                        Reject(Error("Status code " + Result.statusCode));
                        return;
                    }

                    // Attempt to parse JSON reply
                    try {
                        Resolve(JSON.parse(Buffer.concat(Body).toString()));
                    }
                    catch (e) {
                        Reject(Error("Invalid JSON response"));
                    }
                });
                Result.on("error", Err => {
                    Reject(Error(Err.message));
                })
            });

            // Connection errored
            Request.on("error", Err => {
                Reject(Error(Err.message));
            });

            // Connection was closed
            Request.on("close", () => {
                Reject(Error("Request connection closed"));
            });

            // Connection timed out
            Request.on("timeout", () => {
                Reject(Error("Request timed out"));
            });
    
            // Write request to host then end connection
            Request.write(Data);
            Request.end();
        });
    }
    
    // Sends a post request to the host
    public async Post(Method:string, Params:any, Keys?:KeyPair):Promise<any> {
        return new Promise(Resolve => {
            this.Request(Method, "POST", Params, Keys)
            .then(
                Success => {
                    Resolve(Success);
                },
                _ => {
                    Resolve(undefined);
                }
            )
        });
    }
    
    // Sends a get request to the host
    public async Get(Method:string, Params?:any, Keys?:KeyPair):Promise<any> {
        return new Promise(Resolve => {
            this.Request(Method, "GET", Params ?? {}, Keys)
            .then(
                Success => {
                    Resolve(Success);
                },
                _ => {
                    Resolve(undefined);
                }
            )
        });
    }
}