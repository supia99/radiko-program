import { RadikoResponse } from "./type/Radiko";

var to_json = require('xmljson').to_json;

export const exchangeToRadikoJson = (xml: string): RadikoResponse => {
    let json: RadikoResponse
    to_json(xml, (_error: Error, data: Object) => {
        json = data as RadikoResponse
    })
    return json!
}

