const express = require('express');
// const User = require("../database/models/User");
const { User, UssdMenu } = require("../database/models")
const { validatePhoneNumber, checkAccountBalance, uba2ubaTransfer } = require('../services/ubaServices');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const crypto = require('crypto');
const { check } = require('express-validator');



/**
 * @function moovReceiver
 * @param {object} req - The request object
 * @param {object} res - The response object
 * @param {function} next - The next function
 * @returns {object} - The response object to be sent to the user
 */
exports.moovReceiver = async (req, res, next) => {

    console.log("this is what we got from Moov -->", req.query);

    const walletId = req.query.msisdn;
    const userInput = req.query.user_input;
    const sessionId = req.query.session_id;
    const lang = req.query.lang;
    const sc = req.query.sc;

    //check if userInput is empty
    if(userInput == ""){
        //check if the user is enrolled for UBA USSD
        const userExist = await checkUser(walletId, wallet="moov");
        console.log("this is the userExist -->", userExist);

        if(userExist == false){
            //return the enrollment screen for the user
            const welcomeScreenResp = await welcomeUser(walletId, lang, wallet="moov");
            step = "0";
            const insertUssdResp = await insertUssdAction(lang, wallet="moov", sessionId, walletId, closeState="0", welcomeScreenResp.questionType, step, welcomeScreenResp.text);
            if(insertUssdResp == true){
                res.header('Content-Type', 'application/xml');
                res.status(200).send(welcomeScreenResp.text);
            }
        } else {
            if(userInput == ""){
                //display the index menu
                const indexMenuResp = await indexMenu(walletId, lang, wallet="moov");
                step = "1";
                const insertUssdResp = await insertUssdAction(lang, wallet="moov", sessionId, walletId, closeState="0", indexMenuResp.questionType, step, indexMenuResp.text);
                if(insertUssdResp == true){
                    res.header('Content-Type', 'application/xml');
                    res.status(200).send(indexMenuResp.text);
                }
            } else if(userInput == "1"){
                // check if the user session is still active
                const checkSession = await checkSessionId(walletId, sessionId);
                //display the index menu
                const indexMenuResp = await rechargeAirtime(walletId, lang, wallet="moov");
                step = "1";
                const insertUssdResp = await updateUssdAction(lang, wallet="moov", sessionId, walletId, closeState="0", indexMenuResp.questionType, step, indexMenuResp.text);
                if(insertUssdResp == true){
                    res.header('Content-Type', 'application/xml');
                    res.status(200).send(indexMenuResp.text);
                }
            }
        }
    } else {
        // check if the user session is still active
        const checkSession = await checkSessionId(walletId, sessionId);
        if(checkSession){
            if(checkSession.questionType == "welcomeScreen"){
                if(userInput == "1"){

                    const enrollNewUserRep = await enrollNewUserScreen(walletId, lang, wallet="moov");
                    step = "1";
                    const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState="0", enrollNewUserRep.questionType, step, enrollNewUserRep.text); 
                    
                    res.header('Content-Type', 'application/xml');
                    res.status(200).send(enrollNewUserRep.text);
                }
                else if(userInput == "2"){
                    resp = await cancelRequest(walletId, lang, wallet="moov");

                    res.header('Content-Type', 'application/xml');
                    res.status(200).send(resp.text);

                } else {
                    let info = "Invalid Request";
                    resp = await error_messages(walletId, info, wallet="moov");
                }
            } else if(checkSession.questionType == "enrollUser"){
                if(userInput == "1"){
                    // if subscriber input is account we display a screen for account
                    const enrollAccountNoResp = await enrollNewUserType(walletId, lang, wallet="moov", country="BJ", type="account");
                    step = "1";
                    const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState="0", enrollAccountNoResp.questionType, step, enrollAccountNoResp.text); 
                    
                    res.header('Content-Type', 'application/xml');
                    res.status(200).send(enrollAccountNoResp.text);
                } else if(userInput == "2"){
                    // if subscriber input is prepaid account we display screen for prepaid

                    const enrollPrepaidNoResp = await enrollNewUserType(walletId, lang, wallet="moov", country="BJ", type="prepaid");
                    step = "1";
                    const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState="0", enrollPrepaidNoResp.questionType, step, enrollPrepaidNoResp.text); 
                    
                    res.header('Content-Type', 'application/xml');
                    res.status(200).send(enrollPrepaidNoResp.text);

                } else if(userInput =="3") {
                    const termsConditionResp = await TermsCondition(walletId, lang);
                    step = "1";
                    const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState="0", indexMenuResp.questionType, step, indexMenuResp.text);
                    if(insertUssdResp == true){
                        res.header('Content-Type', 'application/xml');
                        res.status(200).send(indexMenuResp.text);
                    }
                } else if(userInput =="4") {
                    resp = await cancelRequest(walletId, lang, wallet="moov");

                    res.header('Content-Type', 'application/xml');
                    res.status(200).send(resp.text);
                }
            } else if(checkSession.questionType == "enrollUserAccount"){
                if(checkSession.steps == "1"){
                    // console.log("this is the account number --> ", subscriberInput)
                    const enrollAccountNoResp = await enrollNewUserAccount(walletId, lang, wallet="moov", country="BJ", userInput);
                    step = "2";
                    const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState="0", enrollAccountNoResp.questionType, step, enrollAccountNoResp.text); 
                    
                    res.header('Content-Type', 'application/xml');
                    res.status(200).send(enrollAccountNoResp.text);
                } else if (checkSession.steps == "2"){
                    const confirmDetailsResp = await confirmEnrollDetails(walletId, lang, wallet="moov");
                    if(confirmDetailsResp){
                        step = "3";
                        const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState="0", confirmDetailsResp.questionType, step, confirmDetailsResp.text);
                        
                        res.header('Content-Type', 'application/xml');
                        res.status(200).send(confirmDetailsResp.text);

                    }
                } else if(checkSession.steps == "3"){
                    const createPinResp = await createNewPin(walletId, lang, wallet="moov", userInput);
                    if(createPinResp){
                        step = "1";
                        const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState="0", createPinResp.questionType, step, createPinResp.text);
                        
                        res.header('Content-Type', 'application/xml');
                        res.status(200).send(createPinResp.text);

                    }   
                }
            } else if(checkSession.questionType == "enrollUserPrepaid"){
                if(checkSession.steps == "1"){
                    const enrollPrepaidNoResp = await enrollNewUserPrepaid(walletId, lang, wallet="moov", country="BJ");
                    step = "2";
                    const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState="0", enrollPrepaidNoResp.questionType, step, enrollPrepaidNoResp.text); 
                    
                    res.header('Content-Type', 'application/xml');
                    res.status(200).send(enrollNewUserRep.text);

                } else if (checkSession.steps == "2"){

                }
                
            } else if(checkSession.questionType == "userCreated"){
                if(userInput == "1"){
                    //display the index menu
                    const indexMenuResp = await indexMenu(walletId, lang, wallet="moov");
                    step = "1";
                    const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState="0", indexMenuResp.questionType, step, indexMenuResp.text); 
                    
                    console.log("indexMenuResp -->", indexMenuResp);
                    console.log("this is the insertUssdResp -->", insertUssdResp);
                    
                    if(insertUssdResp == true){
                        res.header('Content-Type', 'application/xml');
                        res.status(200).send(indexMenuResp.text);
                    }
                } else {

                }
            } else if(checkSession.questionType == "indexScreen"){
                if(userInput == "1"){
                    // check if the user session is still active
                    const checkSession = await checkSessionId(walletId, sessionId);
                    //display the index menu
                    const indexMenuResp = await rechargeAirtime(walletId, lang, wallet="moov");
                    step = "1";
                    const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState="0", indexMenuResp.questionType, step, indexMenuResp.text);
                    if(insertUssdResp == true){
                        res.header('Content-Type', 'application/xml');
                        res.status(200).send(indexMenuResp.text);
                    }
                } else if(userInput == "2"){
                    // check if the user session is still active
                    const checkSession = await checkSessionId(walletId, sessionId);
                    //display the index menu
                    const indexMenuResp = await ubaToUbaTransfer(walletId, lang, wallet="moov", checkSession.steps, userInput);
                    step = "1";
                    const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState="0", indexMenuResp.questionType, indexMenuResp.step, indexMenuResp.text);
                    if(insertUssdResp == true){
                        res.header('Content-Type', 'application/xml');
                        res.status(200).send(indexMenuResp.text);
                    }
                } else if(userInput == "3"){
                    //display the index menu
                    const indexMenuResp = await prepaidCardLoading(walletId, lang, wallet="moov", checkSession.steps, userInput);
                    //update USSD action
                    const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState="0", indexMenuResp.questionType, indexMenuResp.step, indexMenuResp.text);
                    if(insertUssdResp == true){
                        res.header('Content-Type', 'application/xml');
                        res.status(200).send(indexMenuResp.text);
                    }
                } else if(userInput == "4"){
                    
                    //display the index menu
                    const indexMenuResp = await achTransfer(walletId, lang, wallet="moov", checkSession.steps, userInput);
                    //update USSD action
                    const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState="0", indexMenuResp.questionType, indexMenuResp.step, indexMenuResp.text);
                    if(insertUssdResp == true){
                        res.header('Content-Type', 'application/xml');
                        res.status(200).send(indexMenuResp.text);
                    }
                } else if(userInput == "5"){
                    //display the index menu
                    const indexMenuResp = await miniStatement(walletId, lang, wallet="mtn", checkSession.steps, userInput);
                    //update USSD action
                    const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState, indexMenuResp.questionType, indexMenuResp.step, indexMenuResp.text);
                    if(insertUssdResp == true){
                        res.header('Content-Type', 'application/xml');
                        res.status(200).send(indexMenuResp.text);
                    }
                    //const insertUssdResp = await
                } else if(userInput == "6"){

                    //display the index menu
                    const indexMenuResp = await checkBalance(walletId, lang, wallet="moov", checkSession.steps, userInput);

                    const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState="0", indexMenuResp.questionType, indexMenuResp.step, indexMenuResp.text);
                    if(insertUssdResp == true){
                        res.header('Content-Type', 'application/xml');
                        res.status(200).send(indexMenuResp.text);
                    }
                    //const insertUssdResp = await
                } else if(userInput == "7"){
                    //display the index menu
                    const indexMenuResp = await pushPullAutoLinkage(walletId, lang, wallet="moov");
                    //update USSD action
                    const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState="0", indexMenuResp.questionType, indexMenuResp.step, indexMenuResp.text);
                    if(insertUssdResp == true){
                        res.header('Content-Type', 'application/xml');
                        res.status(200).send(indexMenuResp.text);
                    }
                    //const insertUssdResp = await
                }
            } else if(checkSession.questionType =="checkBalance"){
                const checkBalanceResp = await checkBalance(walletId, lang, wallet="moov", checkSession.steps, userInput);

                const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState="1", checkBalanceResp.questionType, checkBalanceResp.step, checkBalanceResp.text);
                if(insertUssdResp == true){
                    res.header('Content-Type', 'application/xml');
                    res.status(200).send(checkBalanceResp.text);
                }
            } else if(checkSession.questionType=="prepaidCardLoading"){
                const prepaidCardLoadingResp = await prepaidCardLoading(walletId, lang, wallet="moov", checkSession.steps, userInput);

                const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState="1", prepaidCardLoadingResp.questionType, prepaidCardLoadingResp.step, prepaidCardLoadingResp.text);
                if(insertUssdResp == true){
                    res.header('Content-Type', 'application/xml');
                    res.status(200).send(prepaidCardLoadingResp.text);
                }

            } else if(checkSession.questionType=="achTransfer"){    
                const achTransferResp = await achTransfer(walletId, lang, wallet="moov", checkSession.steps, userInput);

                const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState="1", achTransferResp.questionType, achTransferResp.step, achTransferResp.text);   
                if(insertUssdResp == true){
                    res.header('Content-Type', 'application/xml');
                    res.status(200).send(achTransferResp.text);
                }

            } else if(checkSession.questionType="pushPullAutoLinkage"){
                const pushPullAutoLinkageResp = await pushPullAutoLinkage(walletId, lang, wallet="moov", checkSession.steps, userInput);
                
                const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState="1", pushPullAutoLinkageResp.questionType, pushPullAutoLinkageResp.step, pushPullAutoLinkageResp.text);
                if(insertUssdResp == true){
                    res.header('Content-Type', 'application/xml');
                    res.status(200).send(pushPullAutoLinkageResp.text);
                }

            } else if(checkSession.questionType="miniStatement"){

                const miniStatementResp = await miniStatement(walletId, lang, wallet="moov", checkSession.steps, userInput);

                const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState="1", miniStatementResp.questionType, miniStatementResp.step, miniStatementResp.text); 
                if(insertUssdResp == true){
                    res.header('Content-Type', 'application/xml');
                    res.status(200).send(miniStatementResp.text);
                }

            } else if(checkSession.questionType="ubaToUbaTransfer"){
                const ubaToUbaTransferResp = await ubaToUbaTransfer(walletId, lang, wallet="moov", checkSession.steps, userInput);

                const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState="1", ubaToUbaTransferResp.questionType, ubaToUbaTransferResp.step, ubaToUbaTransferResp.text);
                if(insertUssdResp == true){
                    res.header('Content-Type', 'application/xml');
                    res.status(200).send(ubaToUbaTransferResp.text);
                }

            } else if(checkSession.questionType="rechargeAirtime"){
                const rechargeAirtimeResp = await rechargeAirtime(walletId, lang, wallet="moov", checkSession.steps, userInput);

                const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState="1", rechargeAirtimeResp.questionType, rechargeAirtimeResp.step, rechargeAirtimeResp.text);
                if(insertUssdResp == true){
                    res.header('Content-Type', 'application/xml');
                    res.status(200).send(rechargeAirtimeResp.text);
                }

            }
        } else {
            let info = "Invalid Request, Try again";
            resp = await error_messages(walletId, info, wallet="moov");

            res.header('Content-Type', 'application/xml');
            res.status(200).send(resp.text);
        
        }
    }
};


/**
 * @function mtnReceiver
 * @param {object} req - The request object
 * @param {object} res - The response object
 * @param {function} next - The next function
 * @returns {object} - The response object to be sent to the user
 */


exports.mtnReceiver = async (req, res, next) => {

    let step;

    console.log("this is the raw body data sent for MTN -->", req.rawBody);
    console.log("Parsed XML -->", JSON.stringify(req.body));

    const jsonData = JSON.stringify(req.body);

    // Parse the JSON data
    const parsedData = JSON.parse(jsonData);

    const req_array = req.body.request;    

    const walletId = req_array.msisdn;

    const language = req_array.language;

    const subscriberInput = parsedData.request.subscriberinput[0];

    const transactionId = parsedData.request.transactionid[0];

    // Extract the value of sessionId
    const sessionId = parsedData.request.sessionid[0];

    const msisdn = parsedData.request.msisdn[0];

    const lang = parsedData.request.language[0];

    const closeState = parsedData.request.newrequest[0];
    
    //check if the user is enrolled for UBA USSD
    const userExist = await checkUser(walletId, moov="mtn");

    if(closeState == "1"){
        if(userExist == false){
            //return the enrollment screen for the user
            const welcomeScreenResp = await welcomeUser(walletId, language, wallet="mtn");
            step = "0";
            const insertUssdResp = await insertUssdAction(lang, wallet="mtn", sessionId, msisdn, closeState, welcomeScreenResp.questionType, step, welcomeScreenResp.text);
            if(insertUssdResp == true){
                res.header('Content-Type', 'application/xml');
                res.status(200).send(welcomeScreenResp.text);
            }
        } else {
            //display the index menu
            const indexMenuResp = await indexMenu(walletId, lang, wallet="mtn");
            step = "1";
            const insertUssdResp = await insertUssdAction(lang, wallet="mtn", sessionId, msisdn, closeState, indexMenuResp.questionType, step, indexMenuResp.text);
            if(insertUssdResp == true){
                res.header('Content-Type', 'application/xml');
                res.status(200).send(indexMenuResp.text);
            }
        }

    } else if(closeState == "0"){
        // check if the user session is still active
        const checkSession = await checkSessionId(walletId, sessionId);
        console.log("this is the checkSession -->", checkSession.questionType)
        if(checkSession){
            if(checkSession.questionType == "welcomeScreen"){
                if(subscriberInput == "1"){

                    const enrollNewUserRep = await enrollNewUserScreen(walletId, language, wallet="mtn");
                    step = "1";
                    const insertUssdResp = await updateUssdAction(sessionId, msisdn, closeState, enrollNewUserRep.questionType, step, enrollNewUserRep.text); 
                    
                    res.header('Content-Type', 'application/xml');
                    res.status(200).send(enrollNewUserRep.text);
                }
                else if(subscriberInput == "2"){
                    resp = await cancelRequest(walletId, language, wallet="mtn");

                    res.header('Content-Type', 'application/xml');
                    res.status(200).send(resp.text);

                } else {
                    let info = "Invalid Request";
                    resp = await error_messages(walletId, info, wallet="mtn");
                
                    console.log("this is the response text -->", resp);
                    console.log("this is the response text -->", resp.text);

                    res.header('Content-Type', 'application/xml');
                    res.status(200).send(resp.text);
                }
            }
            else if (checkSession.questionType == "enrollUser"){
                if(subscriberInput == "1"){
                    // if subscriber input is account we display a screen for account
                    const enrollAccountNoResp = await enrollNewUserType(walletId, lang, wallet="mtn", country="BJ", type="account");
                    step = "1";
                    const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState, enrollAccountNoResp.questionType, step, enrollAccountNoResp.text); 
                    
                    res.header('Content-Type', 'application/xml');
                    res.status(200).send(enrollAccountNoResp.text);
                }
                else if(subscriberInput == "2"){
                    // if subscriber input is prepaid account we display screen for prepaid

                    const enrollPrepaidNoResp = await enrollNewUserType(walletId, lang, wallet="mtn", country="BJ", type="prepaid");
                    step = "1";
                    const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState, enrollPrepaidNoResp.questionType, step, enrollPrepaidNoResp.text); 
                    
                    res.header('Content-Type', 'application/xml');
                    res.status(200).send(enrollPrepaidNoResp.text);

                } else if(subscriberInput =="3") {
                    const termsConditionResp = await TermsCondition(walletId, lang);
                    step = "1";
                    const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState, indexMenuResp.questionType, step, indexMenuResp.text);
                    if(insertUssdResp == true){
                        res.header('Content-Type', 'application/xml');
                        res.status(200).send(indexMenuResp.text);
                    }
                } else if(subscriberInput =="4") {
                    resp = await cancelRequest(walletId, lang, wallet="mtn");

                    res.header('Content-Type', 'application/xml');
                    res.status(200).send(resp.text);
                } else {
                    let info = "Invalid Request";
                    resp = error_messages(walletId, info, wallet="mtn");

                    res.header('Content-Type', 'application/xml');
                    res.status(200).send(resp.text);
                }
            }
            else if(checkSession.questionType == "enrollUserAccount"){
                if(checkSession.steps == "1"){
                    // console.log("this is the account number --> ", subscriberInput)
                    const enrollAccountNoResp = await enrollNewUserAccount(walletId, lang, wallet="mtn", country="BJ", userInput);
                    step = "2";
                    const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState="0", enrollAccountNoResp.questionType, step, enrollAccountNoResp.text); 
                    
                    res.header('Content-Type', 'application/xml');
                    res.status(200).send(enrollAccountNoResp.text);
                } else if (checkSession.steps == "2"){
                    const confirmDetailsResp = await confirmEnrollDetails(walletId, lang, wallet="mtn");
                    if(confirmDetailsResp){
                        step = "3";
                        const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState="0", confirmDetailsResp.questionType, step, confirmDetailsResp.text);
                        
                        res.header('Content-Type', 'application/xml');
                        res.status(200).send(confirmDetailsResp.text);

                    }
                } else if(checkSession.steps == "3"){
                    const createPinResp = await createNewPin(walletId, lang, wallet="mtn", userInput);
                    if(createPinResp){
                        step = "1";
                        const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState="0", createPinResp.questionType, step, createPinResp.text);
                        
                        res.header('Content-Type', 'application/xml');
                        res.status(200).send(createPinResp.text);

                    }   
                }
            }
            else if(checkSession.questionType == "enrollUserPrepaid"){
                if(checkSession.steps == "1"){
                    const enrollPrepaidNoResp = await enrollNewUserPrepaid(walletId, lang, wallet="mtn", country="BJ");
                    step = "2";
                    const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState, enrollPrepaidNoResp.questionType, step, enrollPrepaidNoResp.text); 
                    
                    res.header('Content-Type', 'application/xml');
                    res.status(200).send(enrollNewUserRep.text);

                } else if (checkSession.steps == "2"){

                }
                
            }
            else if(checkSession.questionType == "userCreated"){
                if(userInput == "1"){
                    //display the index menu
                    const indexMenuResp = await indexMenu(walletId, lang, wallet="moov");
                    step = "1";
                    const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState="0", indexMenuResp.questionType, step, indexMenuResp.text); 
                    
                    console.log("indexMenuResp -->", indexMenuResp);
                    console.log("this is the insertUssdResp -->", insertUssdResp);
                    
                    if(insertUssdResp == true){
                        res.header('Content-Type', 'application/xml');
                        res.status(200).send(indexMenuResp.text);
                    }
                } else {

                }
            } 
            else if(checkSession.questionType == "indexScreen"){
                if(subscriberInput == "1"){
                    // check if the user session is still active
                    const checkSession = await checkSessionId(walletId, sessionId);
                    //display the index menu
                    const indexMenuResp = await rechargeAirtime(walletId, lang, wallet="mtn");
                    step = "1";
                    const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState="0", indexMenuResp.questionType, step, indexMenuResp.text);
                    if(insertUssdResp == true){
                        res.header('Content-Type', 'application/xml');
                        res.status(200).send(indexMenuResp.text);
                    }
                } else if(subscriberInput == "2"){
                    // check if the user session is still active
                    const checkSession = await checkSessionId(walletId, sessionId);
                    //display the index menu
                    const indexMenuResp = await ubaToUbaTransfer(walletId, lang, wallet="mtn", checkSession.steps, subscriberInput);
                    step = "1";
                    const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState, indexMenuResp.questionType, indexMenuResp.step, indexMenuResp.text);
                    if(insertUssdResp == true){
                        res.header('Content-Type', 'application/xml');
                        res.status(200).send(indexMenuResp.text);
                    }
                } else if(subscriberInput == "3"){
                    //display the index menu
                    const indexMenuResp = await prepaidCardLoading(walletId, lang, wallet="mtn", checkSession.steps, subscriberInput);
                    //update USSD action
                    const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState="0", indexMenuResp.questionType, indexMenuResp.step, indexMenuResp.text);
                    if(insertUssdResp == true){
                        res.header('Content-Type', 'application/xml');
                        res.status(200).send(indexMenuResp.text);
                    }
                } else if(subscriberInput == "4"){
                    
                    //display the index menu
                    const indexMenuResp = await achTransfer(walletId, lang, wallet="mtn", checkSession.steps, subscriberInput);
                    //update USSD action
                    const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState="0", indexMenuResp.questionType, indexMenuResp.step, indexMenuResp.text);
                    if(insertUssdResp == true){
                        res.header('Content-Type', 'application/xml');
                        res.status(200).send(indexMenuResp.text);
                    }
                } else if(subscriberInput == "5"){
                    //display the index menu
                    const indexMenuResp = await miniStatement(walletId, lang, wallet="mtn", checkSession.steps, subscriberInput);
                    //update USSD action
                    const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState, indexMenuResp.questionType, indexMenuResp.step, indexMenuResp.text);
                    if(insertUssdResp == true){
                        res.header('Content-Type', 'application/xml');
                        res.status(200).send(indexMenuResp.text);
                    }
                    //const insertUssdResp = await
                } else if(subscriberInput == "6"){

                    //display the index menu
                    const indexMenuResp = await checkBalance(walletId, lang, wallet="mtn", checkSession.steps, subscriberInput);

                    const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState, indexMenuResp.questionType, indexMenuResp.step, indexMenuResp.text);
                    if(insertUssdResp == true){
                        res.header('Content-Type', 'application/xml');
                        res.status(200).send(indexMenuResp.text);
                    }
                    //const insertUssdResp = await
                } else if(subscriberInput == "7"){
                    //display the index menu
                    const indexMenuResp = await pushPullAutoLinkage(walletId, lang, wallet="mtn");
                    //update USSD action
                    const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState, indexMenuResp.questionType, indexMenuResp.step, indexMenuResp.text);
                    if(insertUssdResp == true){
                        res.header('Content-Type', 'application/xml');
                        res.status(200).send(indexMenuResp.text);
                    }
                    //const insertUssdResp = await
                }
            } 
            else if(checkSession.questionType =="checkBalance"){
                const checkBalanceResp = await checkBalance(walletId, lang, wallet="mtn", checkSession.steps, subscriberInput);

                const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState, checkBalanceResp.questionType, checkBalanceResp.step, checkBalanceResp.text);
                if(insertUssdResp == true){
                    res.header('Content-Type', 'application/xml');
                    res.status(200).send(checkBalanceResp.text);
                }
            } 
            else if(checkSession.questionType=="prepaidCardLoading"){
                const prepaidCardLoadingResp = await prepaidCardLoading(walletId, lang, wallet="mtn", checkSession.steps, subscriberInput);

                const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState, prepaidCardLoadingResp.questionType, prepaidCardLoadingResp.step, prepaidCardLoadingResp.text);
                if(insertUssdResp == true){
                    res.header('Content-Type', 'application/xml');
                    res.status(200).send(prepaidCardLoadingResp.text);
                }

            } 
            else if(checkSession.questionType=="achTransfer"){    
                const achTransferResp = await achTransfer(walletId, lang, wallet="mtn", checkSession.steps, subscriberInput);

                const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState, achTransferResp.questionType, achTransferResp.step, achTransferResp.text);   
                if(insertUssdResp == true){
                    res.header('Content-Type', 'application/xml');
                    res.status(200).send(achTransferResp.text);
                }

            }
            else if(checkSession.questionType=="pushPullAutoLinkage"){
                const pushPullAutoLinkageResp = await pushPullAutoLinkage(walletId, lang, wallet="mtn", checkSession.steps, subscriberInput);
                
                const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState, pushPullAutoLinkageResp.questionType, pushPullAutoLinkageResp.step, pushPullAutoLinkageResp.text);
                if(insertUssdResp == true){
                    res.header('Content-Type', 'application/xml');
                    res.status(200).send(pushPullAutoLinkageResp.text);
                }

            }
            else if(checkSession.questionType=="miniStatement"){

                const miniStatementResp = await miniStatement(walletId, lang, wallet="mtn", checkSession.steps, subscriberInput);

                const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState, miniStatementResp.questionType, miniStatementResp.step, miniStatementResp.text); 
                if(insertUssdResp == true){
                    res.header('Content-Type', 'application/xml');
                    res.status(200).send(miniStatementResp.text);
                }

            }
            else if(checkSession.questionType=="ubaToUbaTransfer"){
                const ubaToUbaTransferResp = await ubaToUbaTransfer(walletId, lang, wallet="mtn", checkSession.steps, subscriberInput);

                const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState, ubaToUbaTransferResp.questionType, ubaToUbaTransferResp.step, ubaToUbaTransferResp.text);
                if(insertUssdResp == true){
                    res.header('Content-Type', 'application/xml');
                    res.status(200).send(ubaToUbaTransferResp.text);
                }

            }
            else if(checkSession.questionType=="rechargeAirtime"){
                const rechargeAirtimeResp = await rechargeAirtime(walletId, lang, wallet="mtn", checkSession.steps, subscriberInput);

                const insertUssdResp = await updateUssdAction(sessionId, walletId, closeState, rechargeAirtimeResp.questionType, rechargeAirtimeResp.step, rechargeAirtimeResp.text);
                if(insertUssdResp == true){
                    res.header('Content-Type', 'application/xml');
                    res.status(200).send(rechargeAirtimeResp.text);
                }

            }
        }
    }
};



/**
 * @function checkUser
 * @param {string} walletId - The walletId of the user
 * @returns {boolean} - The response object to be sent to the user
 */
const checkUser = async (walletId, wallet) => {

    const findUser = await User.findOne({ where: { walletId: walletId, wallet: wallet } });

    if(findUser){
        return true;
    } else {
        return false;
    }
}; 


/**
 * @function checkSessionId
 * @param {string} sessionId - The sessionId of the user
 * @param {string} walletId - The walletId of the user
 * @returns {boolean} - The response object to be sent to the user
 */
const checkSessionId = async (walletId, sessionId) => {
    
        const findSession = await UssdMenu.findOne({ where: { sessionId: sessionId, walletId: walletId } });

        if(findSession){
            return findSession.dataValues;
        } else {
            return false;
        }

};


// using JSDoc generate a documentation for the function
/**
 * @function enrollNewUserScreen
 * @param {string} walletId - The walletId of the user
 * @param {string} lang - The language of the user
 * @returns {object} - The response object to be sent to the user
 * @description - This function returns the enrollment screen for the user
 * @example
 * enrollNewUserScreen(walletId, lang);
 * @returns {object} - The response object to be sent to the user
 * @example
 * enrollNewUserScreen(walletId, lang);
 * @returns {object} - The response object to be sent to the user
 */
const enrollNewUserScreen = async (walletId, lang, wallet) => {

    let info = "";
    if(lang == "en"){
        info = "\n1. Enroll with Account Number \n2. Enroll with Prepaid Card \n3. Terms & Conditions \n4. Cancel\n"
    } else {
        info = "\n1. Inscrivez-vous avec le numéro de compte \n2. Inscrivez-vous avec une carte prépayée \n3. Conditions générales \n4. Annuler\n"
    }

    const text = await buildResponseText(walletId, info, wallet);
    const questionType = 'enrollUser';
    const res = { text, questionType }
    return res;
};



/**
 * @function welcomeUser
 * @param {string} walletId - The walletId of the user
 * @param {string} lang - The language of the user
 * @returns {object} - The response object to be sent to the user
 */
const welcomeUser = async (walletId, lang, wallet) => {
    let info = "";
    if(lang == "en"){
        info = "\nWelcome to UBA USSD Banking.\nPlease note a network charge will be applied to your account for banking services on this channel. \n1. Accept \n2. Cancel\n"
    } else {
        info = "\nBienvenue sur UBA USSD Banking.\nVeuillez noter que des frais de réseau de seront appliqués à votre compte pour les services bancaires sur ce canal. \n1. Acceptez \n2. Annuler\n"
    }

    const text = await buildResponseText(walletId, info, wallet);
    const questionType = 'welcomeScreen';
    const res = { text, questionType }
    return res;

};


/**
 * @function cancelRequest
 * @param {string} walletId - The walletId of the user
 * @param {string} lang - The language of the user
 * @param {string} wallet - The wallet of the user
 * @returns {object} - The response object to be sent to the user
 * @description - This function returns the cancel screen for the user
 * @example
 * cancelRequest(walletId, lang, wallet);
 * @returns {object} - The response object to be sent to the user
 */
const cancelRequest = async(walletId, lang, wallet) => {
    let info = "";
    if(lang == "en"){
        info = "\nBye.\n"
    } else {
        info = "\nAu Revoir.\n"
    }

    const text = await buildResponseTextClose(walletId, info, wallet);
    const questionType = 'cancelScreen';
    const res = { text, questionType }
    return res;
};

// generate a documentation for the function error_messages
/**
 * @function error_messages
 * @param {string} walletId - The walletId of the user
 * @param {string} info - The info to be displayed to the user
 * @param {string} wallet - The wallet of the user
 * @returns {object} - The response object to be sent to the user
 * @description - This function returns the error screen for the user
 * @example
 * error_messages(walletId, info, wallet);
 * @returns {object} - The response object to be sent to the user
 * @example
 * 
 */ 
const error_messages = async(walletId, info, wallet) => {
    const text = await buildResponseTextClose(walletId, info, wallet);
    const questionType = "errorMessage";
    const res = {   text, questionType  };

    return res;
};

/**
 * @function buildResponseTextClose
 * @param {string} walletId - The walletId of the user
 * @param {string} info - The info to be displayed to the user
 * @param {string} wallet - The wallet of the user
 * @returns {string} - The response text to be sent to the user
 * @description - This function returns the response text to be sent to the user
 * @example
 * buildResponseTextClose(walletId, info, wallet);
 * @returns {string} - The response text to be sent to the user
 */
const buildResponseTextClose = async(walletId, info, wallet) => {
    if(wallet == "mtn"){
        return text = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <response>
            <msisdn>${walletId}</msisdn>
            <applicationResponse>${info}</applicationResponse>
            <freeflow>
                <freeflowState>FB</freeflowState>
                <freeflowCharging>N</freeflowCharging>
                <freeflowChargingAmount>0</freeflowChargingAmount>
            </freeflow>
        </response>`;
    } else if(wallet == "moov"){
        return text = `<?xml version="1.0" encoding="UTF-8"?>
        <response>
            <screen_type>form</screen_type>
                <text>
                    ${info}
                </text>
            <back_link>1</back_link>
            <session_op>end</session_op>
            <screen_id>4</screen_id>
        </response>`;
    } else {

    }
}

/**
 * @function indexMenu
 * @param {string} walletId - The walletId of the user
 * @param {string} lang - The language of the user
 * @returns {object} - The response object to be sent to the user
 */
const indexMenu = async (walletId, lang, wallet) => {
    let info = "";
    if(lang == "en"){
        info = "\n1. Airtime Topup.\n2. UBA to UBA Transfer \n3. Prepaid Card Loading \n4. ACH Transfer\n5. Mini Statement \n6. Check Balance \n7. Push & Pull Auto Linkage MTN, Moov and B-Mo \n"
    } else if(lang == "fr") {
        info = "\n1. Recharge de temps d'antenne.\n2. Transfert UBA vers UBA \n3. Chargement de la carte prépayée \n4. Transfert ACH\n5. Mini-déclaration \n6. Vérifier le solde \n7. Liaison automatique Push & Pull MTN, Moov et B-Mo \n"
    }

    const text = await buildResponseText(walletId, info, wallet);
    console.log("this is the text -->", text);
    const questionType = 'indexScreen';
    const res = { text, questionType }
    return res;

};
 
/**
 * @function insertUssdAction
 * @param {string} language - The language of the user
 * @param {string} wallet - The wallet of the user
 * @param {string} sessionId - The sessionId of the user
 * @param {string} msisdn - The msisdn of the user
 * @param {string} closeState - The closeState of the user
 * @param {string} questionType - The questionType of the user
 * @param {string} response - The response of the user
 * @returns {boolean} - The response object to be sent to the user
 */

const insertUssdAction = async(language, wallet, sessionId, msisdn, closeState, questionType, step, response) => {

    // Join the array elements with an empty string as separator
    //let walletId = msisdn.join('');

    const insertRecord = await UssdMenu.create({
        walletId : msisdn,
        sessionId: sessionId,
        wallet: wallet,
        questionType: questionType,
        closeState: closeState,
        items: JSON.stringify(response),
        steps: step,
        language: language
    })

    if(insertRecord){
        return true;
    } else {
        return false;
    }

};




// generate a documentation for the function updateUssdAction 
/**
 * @function updateUssdAction
 * @param {string} sessionId - The sessionId of the user
 * @param {string} msisdn - The msisdn of the user
 * @param {string} closeState - The closeState of the user
 * @param {string} questionType - The questionType of the user
 * @param {string} step - The step of the user
 * @param {string} response - The response of the user
 * @returns {boolean} - The response object to be sent to the user
 * @description - This function returns the response text to be sent to the user
 * @example
 * updateUssdAction(sessionId, msisdn, closeState, questionType, step, response);
 * @returns {boolean} - The response text to be sent to the user
 */

const updateUssdAction = async(sessionId, msisdn, closeState, questionType, step, response) => {

    // Join the array elements with an empty string as separator
    //let walletId = msisdn.join('');

    const updateRecord = await UssdMenu.update({
        questionType: questionType,
        closeState: closeState,
        items: JSON.stringify(response),
        steps: step,
    }, {
        where: {
            sessionId: sessionId,
            walletId: msisdn
        }
    })

    if(updateRecord){
        return true;
    } else {
        return false;
    }

};


/**
 * @function buildResponseText
 * @param {string} walletId - The walletId of the user
 * @param {string} info - The info to be displayed to the user
 * @returns {string} - The response text to be sent to the user
 */
const buildResponseText = async(walletId, info, wallet) => {

    if(wallet == "mtn"){
        return text = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <response>
            <msisdn>${walletId}</msisdn>
            <applicationResponse>${info}</applicationResponse>
            <freeflow>
                <freeflowState>FC</freeflowState>
                <freeflowCharging>N</freeflowCharging>
                <freeflowChargingAmount>0</freeflowChargingAmount>
            </freeflow>
        </response>`;
    } else if(wallet == "moov"){
        return text2 = `<?xml version="1.0" encoding="UTF-8"?>
        <response>
        <screen_type>form</screen_type>
        <text>${info}</text>
        <back_link>1</back_link>
        <session_op>continue</session_op>
        <screen_id>4</screen_id>
        </response>`;
    }
};


/**
 * @function TermsCondition
 * @param {string} walletId - The walletId of the user
 * @param {string} lang - The language of the user
 * @returns {object} - The response object to be sent to the user
 * @description - This function returns the terms and condition screen for the user
 * @example
 * TermsCondition(walletId, lang);
 * @returns {object} - The response object to be sent to the user
 */
const enrollNewUserAccount = async(walletId, lang, wallet, country, account) => {

    //const validate = await validatePhoneNumber(walletId, country, account);
    let mockResponse = {
        "status": "success",
        "fullname": "John Doe",
        "phonenumber": walletId
    };
    if(mockResponse.status == "success"){
        let info = "";
        if(lang == "en"){
            info = `\n ${mockResponse.fullname} \n1. Confirm Details\n 2. Cancel\n`
        } else {
            info = `\n ${mockResponse.fullname} \n1. Veuillez entrer votre numéro de compte\n 2. Annuler\n`
        }

        const insertAccount = await insertNewUser(walletId, wallet, country, type="account", mockResponse.fullname, account);
        if(insertAccount == true){
            const text = await buildResponseText(walletId, info, wallet);
            const questionType = 'enrollUserAccount';
            const res = { text, questionType }
            return res;
        } else {
        }
    } else {
        let info = "";
        if(lang == "en"){
            info = "\nInvalid Account Number\n"
        } else {
            info = "\nNuméro de compte invalide\n"
        }

        const text = await buildResponseTextClose(walletId, info, wallet);
        const questionType = 'enrollUserAccount';
        const res = { text, questionType }
        return res;
    }

};


/**
 * @function enrollNewUserPrepaid
 * @param {string} walletId - The walletId of the user
 * @param {string} lang - The language of the user
 * @param {string} wallet - The wallet of the user
 * @param {string} country - The country of the user
 * @returns {object} - The response object to be sent to the user
 * @description - This function returns the enrollment screen for the user
 * @example
 * enrollNewUserPrepaid(walletId, lang, wallet, country);
 * @returns {object} - The response object to be sent to the user
 */
const enrollNewUserType = async(walletId, lang, wallet, country, type) => {

    if(type == "account"){
        let info = "";
        if(lang == "en"){
            info = "\nPlease enter your Account Number\n 0 to Cancel\n"
        } else {
            info = "\nVeuillez entrer votre numéro de compte\n 0 pour annuler\n"
        }

        const text = await buildResponseText(walletId, info, wallet);
        const questionType = 'enrollUserAccount';
        const res = { text, questionType }
        return res;

    } else if(type == "prepaid"){
        let info = "";
        if(lang == "en"){
            info = "\nPlease enter your Prepaid Card Number\n 0 to Cancel\n"
        } else {
            info = "\nVeuillez entrer votre numéro de carte prépayée\n 0 pour annuler\n"
        }

        const text = await buildResponseText(walletId, info, wallet);
        const questionType = 'enrollUserPrepaid';
        const res = { text, questionType }
        return res;
    }

}


// generate a JSDoc for the function insertNewUser 
/**
 * @function insertNewUser
 * @param {string} walletId - The walletId of the user
 * @param {string} wallet - The wallet of the user
 * @param {string} country - The country of the user
 * @param {string} type - The type of the user
 * @param {string} fullName - The fullName of the user
 * @param {string} accountNumber - The accountNumber of the user
 * @returns {boolean} - The response object to be sent to the user
 * @description - This function returns the response text to be sent to the user
 * @example
 * insertNewUser(walletId, wallet, country, type, fullName, accountNumber);
 * @returns {boolean} - The response text to be sent to the user
 */
const insertNewUser = async(walletId, wallet, country, type, fullName, accountNumber) => {
    // generate a sequelize insert query using findOrCreate
    const insertUser = await User.findOrCreate({
        where: {
            walletId: walletId
        },
        defaults: {
            walletId: walletId,
            wallet: wallet,
            country: country,
            type: type,
            fullName: fullName,
            accountNumber: accountNumber, 
            pin: ''
        }
    });

    if(insertUser){
        return true;
    } else {
        return false;
    }


};

/**
 * @function confirmEnrollDetails
 * @param {string} walletId - The walletId of the user
 * @param {string} lang - The language of the user
 * @param {string} wallet - The wallet of the user
 * @returns {object} - The response object to be sent to the user
 * @description - This function returns the response text to be sent to the user
 * @example
 * confirmEnrollDetails(walletId, lang, wallet);
 * @returns {object} - The response object to be sent to the user
 */
const confirmEnrollDetails  = async(walletId, lang, wallet) => {

        
        // update the user record with account status as approved using walletId and sessionId as condition
        const updateUser = await User.update({
            accountStatus: "approved",
        }, {
            where: {
                walletId: walletId
            }
        })

        if(updateUser){
            let info = "";
            if(lang == "en"){
                info = "\nCreate a New 4-digit Pin for your USSD Menu\n"
            } else {
                info = "\nCréez un nouveau code PIN à 4 chiffres pour votre menu USSD\n"
            }

            const text = await buildResponseText(walletId, info, wallet);
            const questionType = 'enrollUserAccount';
            const res = { text, questionType }
            return res;
        } else {

        }

        const text = await buildResponseTextClose(walletId, info, wallet);
        const questionType = 'enrollUser';
        const res = { text, questionType }
        return res;
};

/**
 * @function createNewPin
 * @param {string} walletId - The walletId of the user
 * @param {string} lang - The language of the user
 * @param {string} wallet - The wallet of the user
 * @param {string} userInput - The userInput of the user
 * @returns {object} - The response object to be sent to the user
 * @description - This function returns the response text to be sent to the user
 * @example
 * createNewPin(walletId, lang, wallet, userInput);
 * @returns {object} - The response object to be sent to the user
 */
const createNewPin = async(walletId, lang, wallet, userInput) => {


    let info = "";
    const userPin = await encryptPin(userInput)

    const updateUser = await User.update({
        pin: userPin,
    }, {
        where: {
            walletId: walletId
        }
    });

    if(updateUser){
        if(lang == "en"){
            info = "\nYour Pin has been successfully created\n 1. Go to Main Menu\n 2. Cancel\n"
        } else {
            info = "\nVotre épingle a été créée avec succès\n 1. Aller au menu principal\n 2. Annuler\n"
        }

        const text = await buildResponseText(walletId, info, wallet);
        const questionType = 'userCreated';
        const res = { text, questionType }
        return res;
    }

}

// generate a function to encrypt the pin using sha256 algorithm
const encryptPin = async(pin) => {

    const hash = crypto.createHash('sha256');
    hash.update(pin);
    const hashedPin = hash.digest('hex');

    return hashedPin;
};



// generate a function to decrypt the pin using sha256 algorithm
const decryptPin = async(pin) => {

    const hash = crypto.createHash('sha256');
    hash.update(pin);
    const hashedPin = hash.digest('hex');

    return hashedPin;
};

// generate a function to verify the pin on the users table from the database
const verifyPin = async(walletId, pin) => {

    //encrypt the pin using the encryptPin function
    const userPin = await encryptPin(pin);

    const findPin = await User.findOne({ where: { walletId: walletId, pin: userPin } });

    if(findPin){
        return true;
    } else {
        return false;
    }

    
}

const ubaToUbaTransfer = async(walletId, lang, wallet, step, subscriberInput) => {

    if(step == "1"){

        let info = "";
        if(lang == "en"){
            info = "\nPlease enter PIN \n 0 to Cancel\n"
        } else {
            info = "\nVeuillez saisir le code PIN \n 0 pour annuler\n"
        }

        let step = "2";

        const text = await buildResponseText(walletId, info, wallet);
        const questionType = 'ubaToUbaTransfer';
        const res = { text, questionType, step }
        return res;

    } else if(step == "2"){

        // step 2 is to validate the pin

        const pinCheck = await verifyPin(walletId, subscriberInput);

        if(pinCheck == true){

            let info = "";
            if(lang == "en"){
                info = "\nPlease enter the recipient's account number \n 0. to Cancel\n"
            } else {
                info = "\nVeuillez saisir le numéro de compte du destinataire \n 0. pour annuler\n"
            }

            let step = "3";

            const text = await buildResponseText(walletId, info, wallet);
            const questionType = 'ubaToUbaTransfer';
            const res = { text, questionType, step }
            return res;

        } else {
            let info = "";
            step = "2";
            if(lang == "en"){
                info = "\nInvalid Pin\n"
            } else {
                info = "\nCode PIN invalide\n"
            }

            const text = await buildResponseTextClose(walletId, info, wallet);
            const questionType = 'ubaToUbaTransfer';
            const res = { text, questionType, step }
            return res;
        }

    } else if(step == "3"){
        
        let info = "";
        if(lang == "en"){
            info = "\nPlease enter the amount to transfer \n 0. to Cancel\n"
        } else {
            info = "\nVeuillez saisir le montant à transférer \n 0. pour annuler\n"
        }

        let step = "4";

        const text = await buildResponseText(walletId, info, wallet);
        const questionType = 'ubaToUbaTransfer';
        const res = { text, questionType, step }
        return res;

    } else if(step == "4"){

        const transferResp = await uba2ubaTransfer(amount, sender, receiver, walletId, country="BENIN");

        if(transferResp.status == true){
            let info = "";
            if(lang == "en"){
                info = `\nTransfer of ${amount} to ${receiver} was successful \n 0. to Cancel\n`
            } else {
                info = `\nLe transfert de ${amount} à ${receiver} a été un succès \n 0. pour annuler\n`
            }

            const text = await buildResponseText(walletId, info, wallet);
            const questionType = 'ubaToUbaTransfer';
            const res = { text, questionType }
            return res;
        } else {
            let info = "";
            if(lang == "en"){
                info = `\nTransfer of ${amount} to ${receiver} was not successful, Try Again. \n`
            } else {
                info = `\nLe transfert de ${amount} à ${receiver} n'a pas été un succès, Essayer à nouveau  \n`
            }
            
            const text = await buildResponseTextClose(walletId, info, wallet);
            const questionType = 'ubaToUbaTransfer';
            const res = { text, questionType }
            return res;
        }
    
    } else if(step == "5"){

    } else if(step == "6"){

    }
}

const checkBalance = async(walletId, lang, wallet, step, subscriberInput) => {
    if(step == 1){
        let info = "";
        if(lang == "en"){
            info = "\nPlease enter PIN \n 0. to Cancel\n"
        } else {
            info = "\nVeuillez saisir le code PIN \n 0. pour annuler\n"
        }

        let step = "2";

        const text = await buildResponseText(walletId, info, wallet);
        const questionType = 'checkBalance';
        const res = { text, questionType, step }
        return res; 
    } else if(step == 2){

        // step 2 is to validate the pin

        const pinCheck = await verifyPin(walletId, subscriberInput);


        if(pinCheck == true){

            // get account number from the user table
            //const getWallet = await getWalletDetails(walletId);

            /*
                if(getWallet != false){

                    let account = getWallet.accountNumber;

                    // get customer account balance 

                    const checkBal = await checkAccountBalance(account);

                    if(checkBal.status == "success"){
                        let amount = checkBal.amount;

                        let step = "3"

                        let info = "";
                        if(lang == "en"){
                            info = `\nYour Account Balance is ${amount} XOF \n 0. to Cancel\n`
                        } else {
                            info = `\nLe solde de notre compte est ${amount} XOF \n 0. pour annuler\n`
                        }

                        const text = await buildResponseText(walletId, info, wallet);
                        const questionType = 'checkBalance';
                        const res = { text, questionType, step }
                        return res;
                    } else {
                        let info = "";
                        if(lang == "en"){
                            info = "\nInvalid Account Number\n"
                        } else {
                            info = "\nNuméro de compte invalide\n"
                        }

                        const text = await buildResponseTextClose(walletId, info, wallet);
                        const questionType = 'checkBalance';
                        const res = { text, questionType, step }
                        return res;
                    }
                } 
            */

            let amount = "50000";

            let step = "3"

            let info = "";
            if(lang == "en"){
                info = `\nYour Account Balance is ${amount} XOF \n 0. to Cancel\n`
            } else {
                info = `\nLe solde de notre compte est ${amount} XOF \n 0. pour annuler\n`
            }

            const text = await buildResponseText(walletId, info, wallet);
            const questionType = 'checkBalance';
            const res = { text, questionType, step }
            return res;

        } else {
            let info = "";
            step = "2";
            if(lang == "en"){
                info = "\nInvalid Pin\n"
            } else {
                info = "\nCode PIN invalide\n"
            }

            const text = await buildResponseTextClose(walletId, info, wallet);
            const questionType = 'checkBalance';
            const res = { text, questionType, step }
            return res;
        }
    }
}

const prepaidCardLoading = async(walletId, lang, wallet) => {

}

const achTransfer = async(walletId, lang, wallet) => {

}

const miniStatement = async(walletId, lang, wallet) => {
    
}

const pushPullAutoLinkage = async(walletId, lang, wallet) => {

}

const rechargeAirtime = async(walletId, lang, wallet) => {

}

const TermsCondition = async(walletId, lang) => {

}

const getWalletDetails = async(walletId) => {

    const getWallet = await User.findOne({ where: { walletId: walletId } });

    if(getWallet){
        return getWallet.dataValues;
    } else {
        return false;
    }
}


//