
module.exports = (req, res, next) => {
    
    console.log("this is the raw body data sent for MTN -->", req.rawBody);
    console.log("Parsed XML -->", JSON.stringify(req.body));

    const req_query = req.body.request;
    const typeValue = req_query.$.type;
    //console.log("this is the authheader -->", authHeader);
    //console.log("this is the access token -->", access_token);
    
    // const requestBody = req.body;
    if(typeValue =='cleanup'){
        const respXml = '<?xml version="1.0" encoding="UTF-8"?><response><type>cleanup</type></response>';
        console.log("this is my xml response for cleanup", respXml);
        res.header('Content-Type','application/xml')
        res.status(200).send(respXml);
    } else {
        next();
    }
};