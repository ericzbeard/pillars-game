import { PillarsWebConfig } from './pillars-web-config';
const $ = require("jquery");

/**
 * Make an unauthenticated call to the REST API.
 */
export const uapi = (endpoint:string, 
                     verb:string, 
                     data:string, 
                     success:any, 
                     err:any) => {

    const url = PillarsWebConfig.ApiUrl + endpoint;

    $.ajax(url, {
        type: verb,
        crossDomain: true,
        contentType: "application/json; charset=UTF-8",
        data: data,
        success: success,
        error: function (jqXHR:any, textStatus:any, errorThrown:any) {
            if (err) {
                err(jqXHR, textStatus, errorThrown);
            }
        }
    });

};