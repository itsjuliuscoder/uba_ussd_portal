const express = require("express");
// const User = require("../database/models/User");
const {
  User,
  UssdMenu,
  Transaction,
  CardlessTrans,
} = require("../database/models");
const {
  validateAccountNumber,
  checkAccountBalance,
  uba2ubaTransfer,
  getMiniStatement,
} = require("../services/ubaServices");
const {
  iniTransaction,
  listPaycode,
  generatePaycode,
  cancelPaycode,
} = require("../services/cardlessWithdrawalService");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const crypto = require("crypto");
const { check } = require("express-validator");

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

  let isNumberSet = await checkPhoneNumber(walletId);

  if (isNumberSet == true) {
    //check if userInput is empty
    if (userInput == "") {
      //check if the user is enrolled for UBA USSD
      const userExist = await checkUser(walletId, (wallet = "moov"));
      console.log("this is the userExist -->", userExist);

      if (userExist == false) {
        //return the enrollment screen for the user
        const welcomeScreenResp = await welcomeUser(
          walletId,
          lang,
          (wallet = "moov")
        );
        step = "0";
        const insertUssdResp = await insertUssdAction(
          lang,
          (wallet = "moov"),
          sessionId,
          walletId,
          (closeState = "0"),
          welcomeScreenResp.questionType,
          step,
          welcomeScreenResp.text
        );
        if (insertUssdResp == true) {
          res.header("Content-Type", "application/xml");
          res.status(200).send(welcomeScreenResp.text);
        }
      } else {
        if (userInput == "") {
          //display the index menu
          const indexMenuResp = await indexMenu(
            walletId,
            lang,
            (wallet = "moov")
          );
          step = "1";
          const insertUssdResp = await insertUssdAction(
            lang,
            (wallet = "moov"),
            sessionId,
            walletId,
            (closeState = "0"),
            indexMenuResp.questionType,
            step,
            indexMenuResp.text
          );

          if (insertUssdResp == true) {
            res.header("Content-Type", "application/xml");
            res.status(200).send(indexMenuResp.text);
          }
        } else if (userInput == "1") {
          // check if the user session is still active
          const checkSession = await checkSessionId(walletId, sessionId);

          console.log("I got here sir!!!");
          //display the index menu
          const indexMenuResp = await rechargeAirtime(
            sessionId,
            walletId,
            lang,
            (wallet = "moov"),
            checkSession.steps,
            userInput
          );
          // step = "1";
          const insertUssdResp = await updateUssdAction(
            lang,
            (wallet = "moov"),
            sessionId,
            walletId,
            (closeState = "0"),
            indexMenuResp.questionType,
            indexMenuResp.step,
            indexMenuResp.text
          );
          if (insertUssdResp == true) {
            res.header("Content-Type", "application/xml");
            res.status(200).send(indexMenuResp.text);
          }
        }
      }
    } else {
      // check if the user session is still active
      const checkSession = await checkSessionId(walletId, sessionId);
      // console.log("Here is the result from Session Check -->", checkSession);
      if (checkSession) {
        if (checkSession.questionType == "welcomeScreen") {
          if (userInput == "1") {
            const enrollNewUserRep = await enrollNewUserScreen(
              walletId,
              lang,
              (wallet = "moov")
            );
            step = "1";
            const insertUssdResp = await updateUssdAction(
              sessionId,
              walletId,
              (closeState = "0"),
              enrollNewUserRep.questionType,
              step,
              enrollNewUserRep.text
            );

            res.header("Content-Type", "application/xml");
            res.status(200).send(enrollNewUserRep.text);
          } else if (userInput == "2") {
            resp = await cancelRequest(walletId, lang, (wallet = "moov"));

            res.header("Content-Type", "application/xml");
            res.status(200).send(resp.text);
          } else {
            let info = "Invalid Request";
            resp = await error_messages(walletId, info, (wallet = "moov"));
          }
        } else if (checkSession.questionType == "enrollUser") {
          if (userInput == "1") {
            // if subscriber input is account we display a screen for account
            const enrollAccountNoResp = await enrollNewUserType(
              walletId,
              lang,
              (wallet = "moov"),
              (country = "BJ"),
              (type = "account")
            );
            step = "1";
            const insertUssdResp = await updateUssdAction(
              sessionId,
              walletId,
              (closeState = "0"),
              enrollAccountNoResp.questionType,
              step,
              enrollAccountNoResp.text
            );

            res.header("Content-Type", "application/xml");
            res.status(200).send(enrollAccountNoResp.text);
          } else if (userInput == "2") {
            // if subscriber input is prepaid account we display screen for prepaid

            const enrollPrepaidNoResp = await enrollNewUserType(
              walletId,
              lang,
              (wallet = "moov"),
              (country = "BJ"),
              (type = "prepaid")
            );
            step = "1";
            const insertUssdResp = await updateUssdAction(
              sessionId,
              walletId,
              (closeState = "0"),
              enrollPrepaidNoResp.questionType,
              step,
              enrollPrepaidNoResp.text
            );

            res.header("Content-Type", "application/xml");
            res.status(200).send(enrollPrepaidNoResp.text);
          } else if (userInput == "3") {
            const termsConditionResp = await TermsCondition(walletId, lang);
            step = "1";
            const insertUssdResp = await updateUssdAction(
              sessionId,
              walletId,
              (closeState = "0"),
              indexMenuResp.questionType,
              step,
              indexMenuResp.text
            );
            if (insertUssdResp == true) {
              res.header("Content-Type", "application/xml");
              res.status(200).send(indexMenuResp.text);
            }
          } else if (userInput == "4") {
            resp = await cancelRequest(walletId, lang, (wallet = "moov"));

            res.header("Content-Type", "application/xml");
            res.status(200).send(resp.text);
          }
        } else if (checkSession.questionType == "enrollUserAccount") {
          if (checkSession.steps == "1") {
            // console.log("this is the account number --> ", subscriberInput)
            const enrollAccountNoResp = await enrollNewUserAccount(
              walletId,
              lang,
              (wallet = "moov"),
              (country = "BJ"),
              userInput
            );
            step = "2";
            const insertUssdResp = await updateUssdAction(
              sessionId,
              walletId,
              (closeState = "0"),
              enrollAccountNoResp.questionType,
              step,
              enrollAccountNoResp.text
            );

            res.header("Content-Type", "application/xml");
            res.status(200).send(enrollAccountNoResp.text);
          } else if (checkSession.steps == "2") {
            const confirmDetailsResp = await confirmEnrollDetails(
              walletId,
              lang,
              (wallet = "moov")
            );
            if (confirmDetailsResp) {
              step = "3";
              const insertUssdResp = await updateUssdAction(
                sessionId,
                walletId,
                (closeState = "0"),
                confirmDetailsResp.questionType,
                step,
                confirmDetailsResp.text
              );

              res.header("Content-Type", "application/xml");
              res.status(200).send(confirmDetailsResp.text);
            }
          } else if (checkSession.steps == "3") {
            const createPinResp = await createNewPin(
              walletId,
              lang,
              (wallet = "moov"),
              userInput
            );
            if (createPinResp) {
              step = "1";
              const insertUssdResp = await updateUssdAction(
                sessionId,
                walletId,
                (closeState = "0"),
                createPinResp.questionType,
                step,
                createPinResp.text
              );

              res.header("Content-Type", "application/xml");
              res.status(200).send(createPinResp.text);
            }
          }
        } else if (checkSession.questionType == "enrollUserPrepaid") {
          if (checkSession.steps == "1") {
            const enrollPrepaidNoResp = await enrollNewUserPrepaid(
              walletId,
              lang,
              (wallet = "moov"),
              (country = "BJ")
            );
            step = "2";
            const insertUssdResp = await updateUssdAction(
              sessionId,
              walletId,
              (closeState = "0"),
              enrollPrepaidNoResp.questionType,
              step,
              enrollPrepaidNoResp.text
            );

            res.header("Content-Type", "application/xml");
            res.status(200).send(enrollNewUserRep.text);
          } else if (checkSession.steps == "2") {
          }
        } else if (checkSession.questionType == "userCreated") {
          if (userInput == "1") {
            //display the index menu
            const indexMenuResp = await indexMenu(
              walletId,
              lang,
              (wallet = "moov")
            );
            step = "1";
            const insertUssdResp = await updateUssdAction(
              sessionId,
              walletId,
              (closeState = "0"),
              indexMenuResp.questionType,
              step,
              indexMenuResp.text
            );

            console.log("indexMenuResp -->", indexMenuResp);
            console.log("this is the insertUssdResp -->", insertUssdResp);

            if (insertUssdResp == true) {
              res.header("Content-Type", "application/xml");
              res.status(200).send(indexMenuResp.text);
            }
          } else {
          }
        } else if (checkSession.questionType == "indexScreen") {
          if (userInput == "1") {
            // check if the user session is still active
            const checkSession = await checkSessionId(walletId, sessionId);
            //display the index menu
            const indexMenuResp = await rechargeAirtime(
              sessionId,
              walletId,
              lang,
              (wallet = "moov"),
              checkSession.steps,
              userInput
            );
            //step = "1";
            const insertUssdResp = await updateUssdAction(
              sessionId,
              walletId,
              (closeState = "0"),
              indexMenuResp.questionType,
              indexMenuResp.step,
              indexMenuResp.text
            );
            if (insertUssdResp == true) {
              res.header("Content-Type", "application/xml");
              res.status(200).send(indexMenuResp.text);
            }
          } else if (userInput == "2") {
            // check if the user session is still active
            const checkSession = await checkSessionId(walletId, sessionId);
            //display the uba2ubaTransfer
            const indexMenuResp = await ubaToUbaTransfer(
              sessionId,
              walletId,
              lang,
              (wallet = "moov"),
              checkSession.steps,
              userInput
            );
            step = "1";
            const insertUssdResp = await updateUssdAction(
              sessionId,
              walletId,
              (closeState = "0"),
              indexMenuResp.questionType,
              indexMenuResp.step,
              indexMenuResp.text
            );
            if (insertUssdResp == true) {
              res.header("Content-Type", "application/xml");
              res.status(200).send(indexMenuResp.text);
            }
          } else if (userInput == "3") {
            //display the index menu
            const indexMenuResp = await prepaidCardLoading(
              walletId,
              lang,
              (wallet = "moov"),
              checkSession.steps,
              userInput
            );
            //update USSD action
            const insertUssdResp = await updateUssdAction(
              sessionId,
              walletId,
              (closeState = "0"),
              indexMenuResp.questionType,
              indexMenuResp.step,
              indexMenuResp.text
            );
            if (insertUssdResp == true) {
              res.header("Content-Type", "application/xml");
              res.status(200).send(indexMenuResp.text);
            }
          } else if (userInput == "4") {
            //display the index menu
            const indexMenuResp = await achTransfer(
              walletId,
              lang,
              (wallet = "moov"),
              checkSession.steps,
              userInput
            );
            //update USSD action
            const insertUssdResp = await updateUssdAction(
              sessionId,
              walletId,
              (closeState = "0"),
              indexMenuResp.questionType,
              indexMenuResp.step,
              indexMenuResp.text
            );
            if (insertUssdResp == true) {
              res.header("Content-Type", "application/xml");
              res.status(200).send(indexMenuResp.text);
            }
          } else if (userInput == "5") {
            //display the index menu
            let indexMenuResp = await miniStatement(
              walletId,
              lang,
              (wallet = "moov"),
              checkSession.steps,
              userInput
            );
            //step = "1";
            //update USSD action
            let insertUssdResp = await updateUssdAction(
              sessionId,
              walletId,
              (closeState = "0"),
              indexMenuResp.questionType,
              indexMenuResp.step,
              indexMenuResp.text
            );
            if (insertUssdResp == true) {
              res.header("Content-Type", "application/xml");
              res.status(200).send(indexMenuResp.text);
            }
            //const insertUssdResp = await
          } else if (userInput == "6") {
            //display the index menu
            const indexMenuResp = await checkBalance(
              walletId,
              lang,
              (wallet = "moov"),
              checkSession.steps,
              userInput
            );

            const insertUssdResp = await updateUssdAction(
              sessionId,
              walletId,
              (closeState = "0"),
              indexMenuResp.questionType,
              indexMenuResp.step,
              indexMenuResp.text
            );
            if (insertUssdResp == true) {
              res.header("Content-Type", "application/xml");
              res.status(200).send(indexMenuResp.text);
            }
            //const insertUssdResp = await
          } else if (userInput == "7") {
            //display the index menu
            const indexMenuResp = await pushPullAutoLinkage(
              walletId,
              lang,
              (wallet = "moov")
            );
            //update USSD action
            const insertUssdResp = await updateUssdAction(
              sessionId,
              walletId,
              (closeState = "0"),
              indexMenuResp.questionType,
              indexMenuResp.step,
              indexMenuResp.text
            );
            if (insertUssdResp == true) {
              res.header("Content-Type", "application/xml");
              res.status(200).send(indexMenuResp.text);
            }
            //const insertUssdResp = await
          } else if (userInput == "8") {
            //display the index menu
            const indexMenuResp = await fundWallet(
              walletId,
              lang,
              (wallet = "moov"),
              checkSession.steps,
              userInput
            );
            //update USSD action
            const insertUssdResp = await updateUssdAction(
              sessionId,
              walletId,
              (closeState = "0"),
              indexMenuResp.questionType,
              indexMenuResp.step,
              indexMenuResp.text
            );
            if (insertUssdResp == true) {
              res.header("Content-Type", "application/xml");
              res.status(200).send(indexMenuResp.text);
            }
            //const insertUssdResp = await
          } else if (userInput == "9") {
            // check if the user session is still active
            const checkSession = await checkSessionId(walletId, sessionId);
            //display the ATM Cardless Withdrawal
            const cardlessResp = await atmCardlessWithdrawal(
              sessionId,
              walletId,
              lang,
              (wallet = "moov"),
              checkSession.steps,
              userInput
            );

            // console.log("this is the atm withdrawal response --->", cardlessResp);
            //update USSD action
            const insertUssdResp = await updateUssdAction(
              sessionId,
              walletId,
              (closeState = "0"),
              cardlessResp.questionType,
              cardlessResp.step,
              cardlessResp.text
            );
            if (insertUssdResp == true) {
              res.header("Content-Type", "application/xml");
              res.status(200).send(cardlessResp.text);
            }
            //const insertUssdResp = await
          }
        } else if (checkSession.questionType == "checkBalance") {
          const checkBalanceResp = await checkBalance(
            walletId,
            lang,
            (wallet = "moov"),
            checkSession.steps,
            userInput
          );

          const insertUssdResp = await updateUssdAction(
            sessionId,
            walletId,
            (closeState = "1"),
            checkBalanceResp.questionType,
            checkBalanceResp.step,
            checkBalanceResp.text
          );
          if (insertUssdResp == true) {
            res.header("Content-Type", "application/xml");
            res.status(200).send(checkBalanceResp.text);
          }
        } else if (checkSession.questionType == "prepaidCardLoading") {
          const prepaidCardLoadingResp = await prepaidCardLoading(
            walletId,
            lang,
            (wallet = "moov"),
            checkSession.steps,
            userInput
          );

          const insertUssdResp = await updateUssdAction(
            sessionId,
            walletId,
            (closeState = "1"),
            prepaidCardLoadingResp.questionType,
            prepaidCardLoadingResp.step,
            prepaidCardLoadingResp.text
          );
          if (insertUssdResp == true) {
            res.header("Content-Type", "application/xml");
            res.status(200).send(prepaidCardLoadingResp.text);
          }
        } else if (checkSession.questionType == "pushPullAutoLinkage") {
          const pushPullAutoLinkageResp = await pushPullAutoLinkage(
            walletId,
            lang,
            (wallet = "moov"),
            checkSession.steps,
            userInput
          );

          const insertUssdResp = await updateUssdAction(
            sessionId,
            walletId,
            (closeState = "1"),
            pushPullAutoLinkageResp.questionType,
            pushPullAutoLinkageResp.step,
            pushPullAutoLinkageResp.text
          );
          if (insertUssdResp == true) {
            res.header("Content-Type", "application/xml");
            res.status(200).send(pushPullAutoLinkageResp.text);
          }
        } else if (checkSession.questionType == "miniStatementType") {
          const miniStatementResp = await miniStatement(
            walletId,
            lang,
            (wallet = "moov"),
            checkSession.steps,
            userInput
          );

          const insertUssdResp = await updateUssdAction(
            sessionId,
            walletId,
            (closeState = "1"),
            miniStatementResp.questionType,
            miniStatementResp.step,
            miniStatementResp.text
          );
          if (insertUssdResp == true) {
            res.header("Content-Type", "application/xml");
            res.status(200).send(miniStatementResp.text);
          }
        } else if (checkSession.questionType == "atmCardlessWithdraw") {
          const cardlessWithdrawResp = await atmCardlessWithdrawal(
            sessionId,
            walletId,
            lang,
            (wallet = "moov"),
            checkSession.steps,
            userInput
          );

          const insertUssdResp = await updateUssdAction(
            sessionId,
            walletId,
            (closeState = "1"),
            cardlessWithdrawResp.questionType,
            cardlessWithdrawResp.step,
            cardlessWithdrawResp.text
          );
          if (insertUssdResp == true) {
            res.header("Content-Type", "application/xml");
            res.status(200).send(cardlessWithdrawResp.text);
          }
        } else if (checkSession.questionType == "ubaToUbaTransfer") {
          const ubaToUbaTransferResp = await ubaToUbaTransfer(
            sessionId,
            walletId,
            lang,
            (wallet = "moov"),
            checkSession.steps,
            userInput
          );

          const insertUssdResp = await updateUssdAction(
            sessionId,
            walletId,
            (closeState = "1"),
            ubaToUbaTransferResp.questionType,
            ubaToUbaTransferResp.step,
            ubaToUbaTransferResp.text
          );
          if (insertUssdResp == true) {
            res.header("Content-Type", "application/xml");
            res.status(200).send(ubaToUbaTransferResp.text);
          }
        } else if (checkSession.questionType == "fundMoMoWallet") {
          //display the index menu
          const indexMenuResp = await fundWallet(
            walletId,
            lang,
            (wallet = "moov"),
            checkSession.steps,
            userInput
          );
          //update USSD action
          const insertUssdResp = await updateUssdAction(
            sessionId,
            walletId,
            (closeState = "0"),
            indexMenuResp.questionType,
            indexMenuResp.step,
            indexMenuResp.text
          );
          if (insertUssdResp == true) {
            res.header("Content-Type", "application/xml");
            res.status(200).send(indexMenuResp.text);
          }
        } else if (checkSession.questionType == "rechargeAirtime") {
          const rechargeAirtimeResp = await rechargeAirtime(
            sessionId,
            walletId,
            lang,
            (wallet = "moov"),
            checkSession.steps,
            userInput
          );
          //console.log("this is the airtime response --> ", rechargeAirtimeResp);
          const insertUssdResp = await updateUssdAction(
            sessionId,
            walletId,
            (closeState = "1"),
            rechargeAirtimeResp.questionType,
            rechargeAirtimeResp.step,
            rechargeAirtimeResp.text
          );
          if (insertUssdResp == true) {
            res.header("Content-Type", "application/xml");
            res.status(200).send(rechargeAirtimeResp.text);
          }
        }
      } else {
        let info = "Invalid Request, Try again";
        resp = await error_messages(walletId, info, (wallet = "moov"));

        res.header("Content-Type", "application/xml");
        res.status(200).send(resp.text);
      }
    }
  } else {
    let info = "Travaux en cours, revenez plus tard.";
    resp = await error_messages(walletId, info, (wallet = "moov"));

    res.header("Content-Type", "application/xml");
    res.status(200).send(resp.text);
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
  const userExist = await checkUser(walletId, (moov = "mtn"));

  if (closeState == "1") {
    if (userExist == false) {
      //return the enrollment screen for the user
      const welcomeScreenResp = await welcomeUser(
        walletId,
        language,
        (wallet = "mtn")
      );
      step = "0";
      const insertUssdResp = await insertUssdAction(
        lang,
        (wallet = "mtn"),
        sessionId,
        msisdn,
        closeState,
        welcomeScreenResp.questionType,
        step,
        welcomeScreenResp.text
      );
      if (insertUssdResp == true) {
        res.header("Content-Type", "application/xml");
        res.status(200).send(welcomeScreenResp.text);
      }
    } else {
      //display the index menu
      const indexMenuResp = await indexMenu(walletId, lang, (wallet = "mtn"));
      step = "1";
      const insertUssdResp = await insertUssdAction(
        lang,
        (wallet = "mtn"),
        sessionId,
        msisdn,
        closeState,
        indexMenuResp.questionType,
        step,
        indexMenuResp.text
      );
      if (insertUssdResp == true) {
        res.header("Content-Type", "application/xml");
        res.status(200).send(indexMenuResp.text);
      }
    }
  } else if (closeState == "0") {
    // check if the user session is still active
    const checkSession = await checkSessionId(walletId, sessionId);
    console.log("this is the checkSession -->", checkSession.questionType);
    if (checkSession) {
      if (checkSession.questionType == "welcomeScreen") {
        if (subscriberInput == "1") {
          const enrollNewUserRep = await enrollNewUserScreen(
            walletId,
            language,
            (wallet = "mtn")
          );
          step = "1";
          const insertUssdResp = await updateUssdAction(
            sessionId,
            msisdn,
            closeState,
            enrollNewUserRep.questionType,
            step,
            enrollNewUserRep.text
          );

          res.header("Content-Type", "application/xml");
          res.status(200).send(enrollNewUserRep.text);
        } else if (subscriberInput == "2") {
          resp = await cancelRequest(walletId, language, (wallet = "mtn"));

          res.header("Content-Type", "application/xml");
          res.status(200).send(resp.text);
        } else {
          let info = "Invalid Request";
          resp = await error_messages(walletId, info, (wallet = "mtn"));

          console.log("this is the response text -->", resp);
          console.log("this is the response text -->", resp.text);

          res.header("Content-Type", "application/xml");
          res.status(200).send(resp.text);
        }
      } else if (checkSession.questionType == "enrollUser") {
        if (subscriberInput == "1") {
          // if subscriber input is account we display a screen for account
          const enrollAccountNoResp = await enrollNewUserType(
            walletId,
            lang,
            (wallet = "mtn"),
            (country = "BJ"),
            (type = "account")
          );
          step = "1";
          const insertUssdResp = await updateUssdAction(
            sessionId,
            walletId,
            closeState,
            enrollAccountNoResp.questionType,
            step,
            enrollAccountNoResp.text
          );

          res.header("Content-Type", "application/xml");
          res.status(200).send(enrollAccountNoResp.text);
        } else if (subscriberInput == "2") {
          // if subscriber input is prepaid account we display screen for prepaid

          const enrollPrepaidNoResp = await enrollNewUserType(
            walletId,
            lang,
            (wallet = "mtn"),
            (country = "BJ"),
            (type = "prepaid")
          );
          step = "1";
          const insertUssdResp = await updateUssdAction(
            sessionId,
            walletId,
            closeState,
            enrollPrepaidNoResp.questionType,
            step,
            enrollPrepaidNoResp.text
          );

          res.header("Content-Type", "application/xml");
          res.status(200).send(enrollPrepaidNoResp.text);
        } else if (subscriberInput == "3") {
          const termsConditionResp = await TermsCondition(walletId, lang);
          step = "1";
          const insertUssdResp = await updateUssdAction(
            sessionId,
            walletId,
            closeState,
            indexMenuResp.questionType,
            step,
            indexMenuResp.text
          );
          if (insertUssdResp == true) {
            res.header("Content-Type", "application/xml");
            res.status(200).send(indexMenuResp.text);
          }
        } else if (subscriberInput == "4") {
          resp = await cancelRequest(walletId, lang, (wallet = "mtn"));

          res.header("Content-Type", "application/xml");
          res.status(200).send(resp.text);
        } else {
          let info = "Invalid Request";
          resp = error_messages(walletId, info, (wallet = "mtn"));

          res.header("Content-Type", "application/xml");
          res.status(200).send(resp.text);
        }
      } else if (checkSession.questionType == "enrollUserAccount") {
        if (checkSession.steps == "1") {
          // console.log("this is the account number --> ", subscriberInput)
          const enrollAccountNoResp = await enrollNewUserAccount(
            walletId,
            lang,
            (wallet = "mtn"),
            (country = "BJ"),
            userInput
          );
          step = "2";
          const insertUssdResp = await updateUssdAction(
            sessionId,
            walletId,
            (closeState = "0"),
            enrollAccountNoResp.questionType,
            step,
            enrollAccountNoResp.text
          );

          res.header("Content-Type", "application/xml");
          res.status(200).send(enrollAccountNoResp.text);
        } else if (checkSession.steps == "2") {
          const confirmDetailsResp = await confirmEnrollDetails(
            walletId,
            lang,
            (wallet = "mtn")
          );
          if (confirmDetailsResp) {
            step = "3";
            const insertUssdResp = await updateUssdAction(
              sessionId,
              walletId,
              (closeState = "0"),
              confirmDetailsResp.questionType,
              step,
              confirmDetailsResp.text
            );

            res.header("Content-Type", "application/xml");
            res.status(200).send(confirmDetailsResp.text);
          }
        } else if (checkSession.steps == "3") {
          const createPinResp = await createNewPin(
            walletId,
            lang,
            (wallet = "mtn"),
            userInput
          );
          if (createPinResp) {
            step = "1";
            const insertUssdResp = await updateUssdAction(
              sessionId,
              walletId,
              (closeState = "0"),
              createPinResp.questionType,
              step,
              createPinResp.text
            );

            res.header("Content-Type", "application/xml");
            res.status(200).send(createPinResp.text);
          }
        }
      } else if (checkSession.questionType == "enrollUserPrepaid") {
        if (checkSession.steps == "1") {
          const enrollPrepaidNoResp = await enrollNewUserPrepaid(
            walletId,
            lang,
            (wallet = "mtn"),
            (country = "BJ")
          );
          step = "2";
          const insertUssdResp = await updateUssdAction(
            sessionId,
            walletId,
            closeState,
            enrollPrepaidNoResp.questionType,
            step,
            enrollPrepaidNoResp.text
          );

          res.header("Content-Type", "application/xml");
          res.status(200).send(enrollNewUserRep.text);
        } else if (checkSession.steps == "2") {
        }
      } else if (checkSession.questionType == "userCreated") {
        if (userInput == "1") {
          //display the index menu
          const indexMenuResp = await indexMenu(
            walletId,
            lang,
            (wallet = "moov")
          );
          step = "1";
          const insertUssdResp = await updateUssdAction(
            sessionId,
            walletId,
            (closeState = "0"),
            indexMenuResp.questionType,
            step,
            indexMenuResp.text
          );

          console.log("indexMenuResp -->", indexMenuResp);
          console.log("this is the insertUssdResp -->", insertUssdResp);

          if (insertUssdResp == true) {
            res.header("Content-Type", "application/xml");
            res.status(200).send(indexMenuResp.text);
          }
        } else {
        }
      } else if (checkSession.questionType == "indexScreen") {
        if (subscriberInput == "1") {
          // check if the user session is still active
          const checkSession = await checkSessionId(walletId, sessionId);
          //display the index menu
          const indexMenuResp = await rechargeAirtime(
            walletId,
            lang,
            (wallet = "mtn")
          );
          step = "1";
          const insertUssdResp = await updateUssdAction(
            sessionId,
            walletId,
            (closeState = "0"),
            indexMenuResp.questionType,
            step,
            indexMenuResp.text
          );
          if (insertUssdResp == true) {
            res.header("Content-Type", "application/xml");
            res.status(200).send(indexMenuResp.text);
          }
        } else if (subscriberInput == "2") {
          // check if the user session is still active
          const checkSession = await checkSessionId(walletId, sessionId);
          //display the index menu
          const indexMenuResp = await ubaToUbaTransfer(
            sessionId,
            walletId,
            lang,
            (wallet = "mtn"),
            checkSession.steps,
            subscriberInput
          );
          step = "1";
          const insertUssdResp = await updateUssdAction(
            sessionId,
            walletId,
            closeState,
            indexMenuResp.questionType,
            indexMenuResp.step,
            indexMenuResp.text
          );
          if (insertUssdResp == true) {
            res.header("Content-Type", "application/xml");
            res.status(200).send(indexMenuResp.text);
          }
        } else if (subscriberInput == "3") {
          //display the index menu
          const indexMenuResp = await prepaidCardLoading(
            walletId,
            lang,
            (wallet = "mtn"),
            checkSession.steps,
            subscriberInput
          );
          //update USSD action
          const insertUssdResp = await updateUssdAction(
            sessionId,
            walletId,
            (closeState = "0"),
            indexMenuResp.questionType,
            indexMenuResp.step,
            indexMenuResp.text
          );
          if (insertUssdResp == true) {
            res.header("Content-Type", "application/xml");
            res.status(200).send(indexMenuResp.text);
          }
        } else if (subscriberInput == "4") {
          //display the index menu
          const indexMenuResp = await achTransfer(
            walletId,
            lang,
            (wallet = "mtn"),
            checkSession.steps,
            subscriberInput
          );
          //update USSD action
          const insertUssdResp = await updateUssdAction(
            sessionId,
            walletId,
            (closeState = "0"),
            indexMenuResp.questionType,
            indexMenuResp.step,
            indexMenuResp.text
          );
          if (insertUssdResp == true) {
            res.header("Content-Type", "application/xml");
            res.status(200).send(indexMenuResp.text);
          }
        } else if (subscriberInput == "5") {
          //display the index menu
          const indexMenuResp = await miniStatement(
            walletId,
            lang,
            (wallet = "mtn"),
            checkSession.steps,
            subscriberInput
          );
          //update USSD action
          const insertUssdResp = await updateUssdAction(
            sessionId,
            walletId,
            closeState,
            indexMenuResp.questionType,
            indexMenuResp.step,
            indexMenuResp.text
          );
          if (insertUssdResp == true) {
            res.header("Content-Type", "application/xml");
            res.status(200).send(indexMenuResp.text);
          }
          //const insertUssdResp = await
        } else if (subscriberInput == "6") {
          //display the index menu
          const indexMenuResp = await checkBalance(
            walletId,
            lang,
            (wallet = "mtn"),
            checkSession.steps,
            subscriberInput
          );

          const insertUssdResp = await updateUssdAction(
            sessionId,
            walletId,
            closeState,
            indexMenuResp.questionType,
            indexMenuResp.step,
            indexMenuResp.text
          );
          if (insertUssdResp == true) {
            res.header("Content-Type", "application/xml");
            res.status(200).send(indexMenuResp.text);
          }
          //const insertUssdResp = await
        } else if (subscriberInput == "7") {
          //display the index menu
          const indexMenuResp = await pushPullAutoLinkage(
            walletId,
            lang,
            (wallet = "mtn")
          );
          //update USSD action
          const insertUssdResp = await updateUssdAction(
            sessionId,
            walletId,
            closeState,
            indexMenuResp.questionType,
            indexMenuResp.step,
            indexMenuResp.text
          );
          if (insertUssdResp == true) {
            res.header("Content-Type", "application/xml");
            res.status(200).send(indexMenuResp.text);
          }
          //const insertUssdResp = await
        }
      } else if (checkSession.questionType == "checkBalance") {
        const checkBalanceResp = await checkBalance(
          walletId,
          lang,
          (wallet = "mtn"),
          checkSession.steps,
          subscriberInput
        );

        const insertUssdResp = await updateUssdAction(
          sessionId,
          walletId,
          closeState,
          checkBalanceResp.questionType,
          checkBalanceResp.step,
          checkBalanceResp.text
        );
        if (insertUssdResp == true) {
          res.header("Content-Type", "application/xml");
          res.status(200).send(checkBalanceResp.text);
        }
      } else if (checkSession.questionType == "prepaidCardLoading") {
        const prepaidCardLoadingResp = await prepaidCardLoading(
          walletId,
          lang,
          (wallet = "mtn"),
          checkSession.steps,
          subscriberInput
        );

        const insertUssdResp = await updateUssdAction(
          sessionId,
          walletId,
          closeState,
          prepaidCardLoadingResp.questionType,
          prepaidCardLoadingResp.step,
          prepaidCardLoadingResp.text
        );
        if (insertUssdResp == true) {
          res.header("Content-Type", "application/xml");
          res.status(200).send(prepaidCardLoadingResp.text);
        }
      } else if (checkSession.questionType == "achTransfer") {
        const achTransferResp = await achTransfer(
          walletId,
          lang,
          (wallet = "mtn"),
          checkSession.steps,
          subscriberInput
        );

        const insertUssdResp = await updateUssdAction(
          sessionId,
          walletId,
          closeState,
          achTransferResp.questionType,
          achTransferResp.step,
          achTransferResp.text
        );
        if (insertUssdResp == true) {
          res.header("Content-Type", "application/xml");
          res.status(200).send(achTransferResp.text);
        }
      } else if (checkSession.questionType == "pushPullAutoLinkage") {
        const pushPullAutoLinkageResp = await pushPullAutoLinkage(
          walletId,
          lang,
          (wallet = "mtn"),
          checkSession.steps,
          subscriberInput
        );

        const insertUssdResp = await updateUssdAction(
          sessionId,
          walletId,
          closeState,
          pushPullAutoLinkageResp.questionType,
          pushPullAutoLinkageResp.step,
          pushPullAutoLinkageResp.text
        );
        if (insertUssdResp == true) {
          res.header("Content-Type", "application/xml");
          res.status(200).send(pushPullAutoLinkageResp.text);
        }
      } else if (checkSession.questionType == "miniStatement") {
        const miniStatementResp = await miniStatement(
          walletId,
          lang,
          (wallet = "mtn"),
          checkSession.steps,
          subscriberInput
        );

        const insertUssdResp = await updateUssdAction(
          sessionId,
          walletId,
          closeState,
          miniStatementResp.questionType,
          miniStatementResp.step,
          miniStatementResp.text
        );
        if (insertUssdResp == true) {
          res.header("Content-Type", "application/xml");
          res.status(200).send(miniStatementResp.text);
        }
      } else if (checkSession.questionType == "ubaToUbaTransfer") {
        const ubaToUbaTransferResp = await ubaToUbaTransfer(
          sessionId,
          walletId,
          lang,
          (wallet = "mtn"),
          checkSession.steps,
          subscriberInput
        );

        const insertUssdResp = await updateUssdAction(
          sessionId,
          walletId,
          closeState,
          ubaToUbaTransferResp.questionType,
          ubaToUbaTransferResp.step,
          ubaToUbaTransferResp.text
        );
        if (insertUssdResp == true) {
          res.header("Content-Type", "application/xml");
          res.status(200).send(ubaToUbaTransferResp.text);
        }
      } else if (checkSession.questionType == "rechargeAirtime") {
        const rechargeAirtimeResp = await rechargeAirtime(
          walletId,
          lang,
          (wallet = "mtn"),
          checkSession.steps,
          subscriberInput
        );

        const insertUssdResp = await updateUssdAction(
          sessionId,
          walletId,
          closeState,
          rechargeAirtimeResp.questionType,
          rechargeAirtimeResp.step,
          rechargeAirtimeResp.text
        );
        if (insertUssdResp == true) {
          res.header("Content-Type", "application/xml");
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
  const findUser = await User.findOne({
    where: { walletId: walletId, wallet: wallet },
  });

  if (findUser) {
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
  const findSession = await UssdMenu.findOne({
    where: { sessionId: sessionId, walletId: walletId },
  });

  if (findSession) {
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
  if (lang == "en") {
    info =
      "\n1. Enroll with Account Number \n2. Enroll with Prepaid Card \n3. Terms & Conditions \n4. Cancel\n";
  } else {
    info =
      "\n1. Inscrivez-vous avec le numéro de compte \n2. Inscrivez-vous avec une carte prépayée \n3. Conditions générales \n4. Annuler\n";
  }

  const text = await buildResponseText(walletId, info, wallet);
  const questionType = "enrollUser";
  const res = { text, questionType };
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
  if (lang == "en") {
    info =
      "\nWelcome to UBA USSD Banking.\nPlease note a network charge will be applied to your account for banking services on this channel. \n1. Accept \n2. Cancel\n";
  } else {
    info =
      "\nBienvenue sur UBA USSD Banking.\nVeuillez noter que des frais de réseau de seront appliqués à votre compte pour les services bancaires sur ce canal. \n1. Acceptez \n2. Annuler\n";
  }

  const text = await buildResponseText(walletId, info, wallet);
  const questionType = "welcomeScreen";
  const res = { text, questionType };
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
const cancelRequest = async (walletId, lang, wallet) => {
  let info = "";
  if (lang == "en") {
    info = "\nBye.\n";
  } else {
    info = "\nAu Revoir.\n";
  }

  const text = await buildResponseTextClose(walletId, info, wallet);
  const questionType = "cancelScreen";
  const res = { text, questionType };
  return res;
};

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
const error_messages = async (walletId, info, wallet) => {
  const text = await buildResponseTextClose(walletId, info, wallet);
  const questionType = "errorMessage";
  const res = { text, questionType };

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
const buildResponseTextClose = async (walletId, info, wallet) => {
  if (wallet == "mtn") {
    return (text = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <response>
            <msisdn>${walletId}</msisdn>
            <applicationResponse>${info}</applicationResponse>
            <freeflow>
                <freeflowState>FB</freeflowState>
                <freeflowCharging>N</freeflowCharging>
                <freeflowChargingAmount>0</freeflowChargingAmount>
            </freeflow>
        </response>`);
  } else if (wallet == "moov") {
    return (text = `<?xml version="1.0" encoding="UTF-8"?>
        <response>
            <screen_type>form</screen_type>
                <text>
                    ${info}
                </text>
            <back_link>1</back_link>
            <session_op>end</session_op>
            <screen_id>4</screen_id>
        </response>`);
  } else {
  }
};

/**
 * @function indexMenu
 * @param {string} walletId - The walletId of the user
 * @param {string} lang - The language of the user
 * @returns {object} - The response object to be sent to the user
 */
const indexMenu = async (walletId, lang, wallet) => {
  let info = "";
  if (lang == "en") {
    info =
      "\n1. Airtime/Data Topup.\n2. UBA to UBA Transfer \n3. Prepaid Card Loading \n4. ACH Transfer\n5. Mini Statement \n6. Check Balance \n7.Push & Pull Auto Linkage MTN, Moov and B-Mo \n8. Fund Mobile Wallet \n9.Cardless Withdrawal \n10.  Next \n";
    //info = "\nWelcome to UBA USSD Banking.\nPlease note a network charge will be applied to your account for banking services on this channel. \n1. Accept \n2. Cancel\n"
  } else {
    info =
      "\n1. Recharge de temps de antenne.\n2. Transfert UBA vers UBA \n3. Chargement de la carte prépayée \n4. Transfert ACH\n5. Mini-déclaration \n6. Vérifier le solde \n7.Liaison automatique Push & Pull MTN, Moov et B-Mo \n8. Fonds de portefeuille mobile \n9. Retrait GAB \n";
    //info = "\nBienvenue sur UBA USSD Banking.\nVeuillez noter que des frais de réseau de seront appliqués à votre compte pour les services bancaires sur ce canal. \n1. Acceptez \n2. Annuler\n"
  }

  const text = await buildResponseText(walletId, info, wallet);
  const questionType = "indexScreen";
  const res = { text, questionType };
  return res;
};

// const indexMenu = async (walletId, lang, wallet) => {
//     let info = "";
//     if(lang == "en"){
//         info ="\nWelcome to UBA USSD Banking, You have Successfully Enrolled \n"
//         //info = "\n1. Airtime/Data Topup.\n2. UBA to UBA Transfer \n3. Prepaid Card Loading \n4. ACH Transfer\n5. Mini Statement \n6. Check Balance \n7. Next \n"
//     } else if(lang == "fr") {
//         info ="\nBienvenue chez UBA USSD Banking, vous vous êtes inscrit avec succès \n"
//         //info = "\n1. Recharge de temps de antenne.\n2. Transfert UBA vers UBA \n3. Chargement de la carte prépayée \n4. Transfert ACH\n5. Mini-déclaration \n6. Vérifier le solde \n7. Suivant \n"
//     }

//     const text = await buildResponseText(walletId, info, wallet);
//     // console.log("this is the text -->", text);
//     const questionType = 'indexScreen';
//     const res = { text, questionType }
//     return res;

// };

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

const insertUssdAction = async (
  language,
  wallet,
  sessionId,
  msisdn,
  closeState,
  questionType,
  step,
  response
) => {
  // Join the array elements with an empty string as separator
  //let walletId = msisdn.join('');

  const insertRecord = await UssdMenu.create({
    walletId: msisdn,
    sessionId: sessionId,
    wallet: wallet,
    questionType: questionType,
    closeState: closeState,
    items: JSON.stringify(response),
    steps: step,
    language: language,
  });

  if (insertRecord) {
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

const updateUssdAction = async (
  sessionId,
  msisdn,
  closeState,
  questionType,
  step,
  response
) => {
  // Join the array elements with an empty string as separator
  //let walletId = msisdn.join('');

  const updateRecord = await UssdMenu.update(
    {
      questionType: questionType,
      closeState: closeState,
      items: JSON.stringify(response),
      steps: step,
    },
    {
      where: {
        sessionId: sessionId,
        walletId: msisdn,
      },
    }
  );

  if (updateRecord) {
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
const buildResponseText = async (walletId, info, wallet) => {
  if (wallet == "mtn") {
    return (text = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <response>
            <msisdn>${walletId}</msisdn>
            <applicationResponse>${info}</applicationResponse>
            <freeflow>
                <freeflowState>FC</freeflowState>
                <freeflowCharging>N</freeflowCharging>
                <freeflowChargingAmount>0</freeflowChargingAmount>
            </freeflow>
        </response>`);
  } else if (wallet == "moov") {
    return (text2 = `<?xml version="1.0" encoding="UTF-8"?>
        <response>
        <screen_type>form</screen_type>
        <text>${info}</text>
        <back_link>1</back_link>
        <session_op>continue</session_op>
        <screen_id>4</screen_id>
        </response>`);
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
const enrollNewUserAccount = async (
  walletId,
  lang,
  wallet,
  country,
  account
) => {
  const validate = await validateAccountNumber(
    walletId,
    (country = "BENIN-REPUBLIC"),
    account
  );

  console.log("this is the response from UBA ESB --->", validate);

  let fullName = validate.data.accountInfo.accountName;

  if (validate.status == true) {
    let info = "";
    if (lang == "en") {
      info = `\n ${fullName} \n1. Confirm Details\n 2. Cancel\n`;
    } else {
      info = `\n ${fullName} \n1. Veuillez entrer votre numéro de compte\n 2. Annuler\n`;
    }

    const insertAccount = await insertNewUser(
      walletId,
      wallet,
      country,
      (type = "account"),
      fullName,
      account
    );
    if (insertAccount == true) {
      const text = await buildResponseText(walletId, info, wallet);
      const questionType = "enrollUserAccount";
      const res = { text, questionType };
      return res;
    } else {
    }
  } else {
    let info = "";
    if (lang == "en") {
      info = "\nInvalid Account Number\n";
    } else {
      info = "\nNuméro de compte invalide\n";
    }

    const text = await buildResponseTextClose(walletId, info, wallet);
    const questionType = "enrollUserAccount";
    const res = { text, questionType };
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
const enrollNewUserType = async (walletId, lang, wallet, country, type) => {
  if (type == "account") {
    let info = "";
    if (lang == "en") {
      info = "\nPlease enter your Account Number\n 0 to Cancel\n";
    } else {
      info = "\nVeuillez entrer votre numéro de compte\n 0 pour annuler\n";
    }

    const text = await buildResponseText(walletId, info, wallet);
    const questionType = "enrollUserAccount";
    const res = { text, questionType };
    return res;
  } else if (type == "prepaid") {
    let info = "";
    if (lang == "en") {
      info = "\nPlease enter your Prepaid Card Number\n 0 to Cancel\n";
    } else {
      info =
        "\nVeuillez entrer votre numéro de carte prépayée\n 0 pour annuler\n";
    }

    const text = await buildResponseText(walletId, info, wallet);
    const questionType = "enrollUserPrepaid";
    const res = { text, questionType };
    return res;
  }
};

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
const insertNewUser = async (
  walletId,
  wallet,
  country,
  type,
  fullName,
  accountNumber
) => {
  // generate a sequelize insert query using findOrCreate
  const insertUser = await User.findOrCreate({
    where: {
      walletId: walletId,
    },
    defaults: {
      walletId: walletId,
      wallet: wallet,
      country: country,
      type: type,
      fullName: fullName,
      accountNumber: accountNumber,
      pin: "",
    },
  });

  if (insertUser) {
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
const confirmEnrollDetails = async (walletId, lang, wallet) => {
  // update the user record with account status as approved using walletId and sessionId as condition
  const updateUser = await User.update(
    {
      accountStatus: "approved",
    },
    {
      where: {
        walletId: walletId,
      },
    }
  );

  if (updateUser) {
    let info = "";
    if (lang == "en") {
      info = "\nCreate a New 4-digit Pin for your USSD Menu\n";
    } else {
      info = "\nCréez un nouveau code PIN à 4 chiffres pour votre menu USSD\n";
    }

    const text = await buildResponseText(walletId, info, wallet);
    const questionType = "enrollUserAccount";
    const res = { text, questionType };
    return res;
  } else {
  }

  const text = await buildResponseTextClose(walletId, info, wallet);
  const questionType = "enrollUser";
  const res = { text, questionType };
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
const createNewPin = async (walletId, lang, wallet, userInput) => {
  let info = "";
  const userPin = await encryptPin(userInput);

  const updateUser = await User.update(
    {
      pin: userPin,
    },
    {
      where: {
        walletId: walletId,
      },
    }
  );

  if (updateUser) {
    if (lang == "en") {
      info =
        "\nAccount Enrollment Success!!! \nYour Pin has been successfully created\n 1. Go to Main Menu\n 2. Cancel\n";
    } else {
      info =
        "\nInscription du compte réussie !!! \nVotre épingle a été créée avec succès\n 1. Aller au menu principal\n 2. Annuler\n";
    }

    const text = await buildResponseText(walletId, info, wallet);
    const questionType = "userCreated";
    const res = { text, questionType };
    return res;
  }
};

// generate a function to encrypt the pin using sha256 algorithm
const encryptPin = async (pin) => {
  const hash = crypto.createHash("sha256");
  hash.update(pin);
  const hashedPin = hash.digest("hex");

  return hashedPin;
};

// generate a function to decrypt the pin using sha256 algorithm
const decryptPin = async (pin) => {
  const hash = crypto.createHash("sha256");
  hash.update(pin);
  const hashedPin = hash.digest("hex");

  return hashedPin;
};

// generate a function to verify the pin on the users table from the database
const verifyPin = async (walletId, pin) => {
  //encrypt the pin using the encryptPin function
  const userPin = await encryptPin(pin);

  const findPin = await User.findOne({
    where: { walletId: walletId, pin: userPin },
  });

  if (findPin) {
    return true;
  } else {
    return false;
  }
};

const ubaToUbaTransfer = async (
  sessionId,
  walletId,
  lang,
  wallet,
  step,
  subscriberInput
) => {
  if (step == "1") {
    let info = "";
    if (lang == "en") {
      info = "\nPlease enter PIN \n 0 to Cancel\n";
    } else {
      info = "\nVeuillez saisir le code PIN \n 0 pour annuler\n";
    }

    let step = "2";

    console.log("I am requesting to check the PIN");
    const text = await buildResponseText(walletId, info, wallet);
    const questionType = "ubaToUbaTransfer";
    const res = { text, questionType, step };
    return res;
  } else if (step == "2") {
    // step 2 is to validate the pin

    const pinCheck = await verifyPin(walletId, subscriberInput);

    console.log(
      "I am verifying the PIN. This is the PIN status --->",
      pinCheck
    );

    if (pinCheck == true) {
      let info = "";
      if (lang == "en") {
        info =
          "\nPlease enter the recipient's account number \n 0. to Cancel\n";
      } else {
        info =
          "\nVeuillez saisir le numéro de compte du destinataire \n 0. pour annuler\n";
      }

      console.log("I am requesting for the account number --->");

      let step = "3";

      const text = await buildResponseText(walletId, info, wallet);
      const questionType = "ubaToUbaTransfer";
      const res = { text, questionType, step };
      return res;
    } else {
      let info = "";
      step = "2";
      if (lang == "en") {
        info = "\nInvalid Pin\n";
      } else {
        info = "\nCode PIN invalide\n";
      }

      const text = await buildResponseTextClose(walletId, info, wallet);
      const questionType = "ubaToUbaTransfer";
      const res = { text, questionType, step };
      return res;
    }
  } else if (step == "3") {
    console.log("I got the customer account number here -->", subscriberInput);

    const validate = await validateAccountNumber(
      walletId,
      (country = "BENIN-REPUBLIC"),
      subscriberInput
    );

    console.log(
      "this is the response from UBA ESB for validate account --->",
      validate
    );

    let fullName = validate.data.accountInfo.accountName;

    if (validate.data.status == true) {
      const getWallet = await getWalletDetails(walletId);

      let sender = getWallet.accountNumber;

      initiateTransaction(
        sender,
        subscriberInput,
        walletId,
        (currency = "XOF"),
        (transStatus = "processing"),
        (type = "bank"),
        sessionId,
        (serviceType = "uba2ubaTransfer")
      );

      let info = "";
      if (lang == "en") {
        info = `\n${fullName} \nPlease enter the amount to transfer \n 0. to Cancel\n`;
      } else {
        info = `\n${fullName} \nVeuillez saisir le montant à transférer \n 0. pour annuler\n`;
      }

      let step = "4";

      console.log("I am entering the amount to transfer");

      const text = await buildResponseText(walletId, info, wallet);
      const questionType = "ubaToUbaTransfer";
      const res = { text, questionType, step };
      return res;
    } else {
      let info = "";
      if (lang == "en") {
        info = "\nAccount Number Validation Failed \n 0. to Cancel\n";
      } else {
        info =
          "\nÉchec de la validation du numéro de compte \n 0. pour annuler\n";
      }

      let step = "4";

      console.log("Could not validate account");

      const text = await buildResponseTextClose(walletId, info, wallet);
      const questionType = "ubaToUbaTransfer";
      const res = { text, questionType, step };
      return res;
    }
  } else if (step == "4") {
    const getTransDetails = await getTransactionDetails(sessionId);

    console.log("transaction details here -->", getTransDetails);

    let narration = `UBA to UBA transfer from ${getTransDetails.sender} to ${getTransDetails.receiver}`;

    const transferResp = await uba2ubaTransfer(
      subscriberInput,
      getTransDetails.sender,
      getTransDetails.receiver,
      walletId,
      (country = "BENIN-REPUBLIC"),
      getTransDetails.transactionId,
      narration
    );

    if (transferResp.data.status == true) {
      await completeTransaction(
        sessionId,
        walletId,
        getTransDetails.transactionId,
        subscriberInput,
        (transStatus = "success"),
        (statusCode = "000"),
        (statusMessage = "Transaction Successful")
      );

      let info = "";
      if (lang == "en") {
        info = `\nTransfer of ${subscriberInput} XOF to ${getTransDetails.receiver} was successful \n 0. to Cancel\n`;
      } else {
        info = `\nLe transfert de ${subscriberInput} XOF à ${getTransDetails.receiver} a été un succès \n 0. pour annuler\n`;
      }

      console.log("Money sent successfully");

      const text = await buildResponseText(walletId, info, wallet);
      const questionType = "ubaToUbaTransfer";
      const res = { text, questionType };
      return res;
    } else {
      let info = "";
      if (lang == "en") {
        info = `\nTransfer of ${subscriberInput} to ${getTransDetails.receiver} was not successful, Try Again. \n`;
      } else {
        info = `\nLe transfert de ${subscriberInput} à ${getTransDetails.receiver} n'a pas été un succès, Essayer à nouveau  \n`;
      }

      console.log("Could not send Money");

      const text = await buildResponseTextClose(walletId, info, wallet);
      const questionType = "ubaToUbaTransfer";
      const res = { text, questionType };
      return res;
    }
  } else if (step == "5") {
  } else if (step == "6") {
  }
};

const atmCardlessWithdrawal = async (
  sessionId,
  walletId,
  lang,
  wallet,
  step,
  subscriberInput
) => {
  if (step == "1") {
    let info = "";
    if (lang == "en") {
      info = "\nPlease enter PIN \n 0 to Cancel\n";
    } else {
      info = "\nVeuillez saisir le code PIN \n 0 pour annuler\n";
    }

    let step = "2";

    console.log("I am requesting to check the PIN");
    const text = await buildResponseText(walletId, info, wallet);
    const questionType = "atmCardlessWithdraw";
    const res = { text, questionType, step };
    return res;
  } else if (step == "2") {
    // step 2 is to validate the pin

    const pinCheck = await verifyPin(walletId, subscriberInput);

    console.log(
      "I am verifying the PIN. This is the PIN status --->",
      pinCheck
    );

    if (pinCheck == true) {
      let info = "";
      if (lang == "en") {
        info =
          "\n1. Generate Paycode \n2. List All Available Paycodes \n 0. to Cancel\n";
      } else {
        info =
          "\n1. Générer un code de paiement \n2. Liste de tous les codes de paiement disponibles  \n 0. pour annuler\n";
      }

      let step = "3";

      const text = await buildResponseText(walletId, info, wallet);
      const questionType = "atmCardlessWithdraw";
      const res = { text, questionType, step };
      return res;
    } else {
      let info = "";
      step = "2";
      if (lang == "en") {
        info = "\nInvalid Pin\n";
      } else {
        info = "\nCode PIN invalide\n";
      }

      const text = await buildResponseTextClose(walletId, info, wallet);
      const questionType = "atmCardlessWithdraw";
      const res = { text, questionType, step };
      return res;
    }
  } else if (step == "3") {
    console.log("This is the option selected ", subscriberInput);

    if (subscriberInput == "1") {
      let info = "";
      if (lang == "en") {
        info = "\nPlease enter the amount to withdraw \n 0. to Cancel\n";
      } else {
        info = "\nVeuillez saisir le montant du retrait \n 0. pour annuler\n";
      }

      let step = "4";

      console.log("I am entering the amount to transfer");

      const text = await buildResponseText(walletId, info, wallet);
      const questionType = "atmCardlessWithdraw";
      const res = { text, questionType, step };
      return res;
    } else if (subscriberInput == "2") {
      console.log(
        "The customer selected list of paycodes -->",
        subscriberInput
      );

      let checkListPaycode = await listPaycode(walletId);

      console.log("these are the available paycode -->", checkListPaycode);

      if (checkListPaycode.length >= 1) {
        let info = "";
        let sn = 1;
        if (lang == "en") {
          info = `\nList of Available Paycodes: - \n`;
          checkListPaycode.forEach((listPaycode) => {
            const { payCode, status } = listPaycode.dataValues;
            info += `${sn++}`;
            info += `: ${payCode} \n`;
          });
          info += `0. to Cancel\n`;
        } else if (lang == "fr") {
          info = `\nListe des codes de paiement disponibles: - \n`;
          checkListPaycode.forEach((listPaycode) => {
            const { payCode, status } = listPaycode.dataValues;
            info += `${sn++}`;
            info += `: ${payCode} \n`;
          });
          info += `0. to Cancel\n`;
        }

        let step = "4";

        console.log("I am entering the amount to transfer");

        const text = await buildResponseText(walletId, info, wallet);
        const questionType = "atmCardlessWithdraw";
        const res = { text, questionType, step };
        return res;
      } else {
        let info = "";
        if (lang == "en") {
          info = "No Available Paycode \n 0. to Cancel\n";
        } else {
          info = "Aucun code de paiement disponible \n 0. pour annuler\n";
        }

        let step = "4";

        const text = await buildResponseTextClose(walletId, info, wallet);
        const questionType = "atmCardlessWithdraw";
        const res = { text, questionType, step };
        return res;
      }
    }
  } else if (step == "4") {
    const getWallet = await getWalletDetails(walletId);

    if (getWallet != false) {
      let account = getWallet.accountNumber;

      console.log("this is the amount -->", account);

      // get customer account balance

      const checkBal = await checkAccountBalance(
        account,
        (country = "BENIN-REPUBLIC")
      );

      if (checkBal.data.status == true) {
        let amount = parseInt(checkBal.data.availableBalance);

        console.log("this is the available balance", amount);

        const letInitiateTrans = await initiateTransaction(
          account,
          subscriberInput,
          walletId,
          (currency = "XOF"),
          (transStatus = "initiate"),
          (type = "bank"),
          sessionId,
          (serviceType = "cardlessWithdrawal")
        );

        if (subscriberInput <= amount) {
          let step = "5";

          let info = "";

          if (lang == "en") {
            info = `\nEnter Temporary Withdrawal PIN \n 0. to Cancel\n`;
          } else {
            info = `\nEntrez le code PIN de retrait temporaire \n 0. pour annuler\n`;
          }

          const text = await buildResponseText(walletId, info, wallet);
          const questionType = "atmCardlessWithdraw";
          const res = { text, questionType, step };
          return res;
        } else {
          let info = "";
          step = "2";
          if (lang == "en") {
            info = "\nInsufficient Fund\n";
          } else {
            info = "\nFonds Insuffisants\n";
          }

          const text = await buildResponseTextClose(walletId, info, wallet);
          const questionType = "atmCardlessWithdraw";
          const res = { text, questionType, step };
          return res;
        }
      } else {
        let info = "";
        if (lang == "en") {
          info = "\nBalance Enquiry Failed, Try Again Later\n";
        } else {
          info = "\nÉchec de la demande de solde, réessayez plus tard.\n";
        }

        const text = await buildResponseTextClose(walletId, info, wallet);
        const questionType = "atmCardlessWithdraw";
        const res = { text, questionType, step };
        return res;
      }
    }
  } else if (step == "5") {
    //hash customer pin
    let hashedPin = hashPin(subscriberInput);

    console.log("this is the hashed pin -->", hashedPin);

    // get the transaction details
    const getTransDetails = await getCardlessTransactionDetails(sessionId);

    console.log("transaction details here -->", getTransDetails);

    // We proceed to debit the customer's account
    let uba_account = process.env.UBA_CARDLESS_ACCOUNT;

    const transferResp = await uba2ubaTransfer(
      getTransDetails.amount,
      getTransDetails.accountNo,
      uba_account,
      getTransDetails.walletId,
      (country = "BENIN-REPUBLIC"),
      getTransDetails.transactionId,
      (narration = "atmcardless withdrawal transaction")
    );

    if (transferResp.data.status == true) {
      // We proceed to generate the paycode

      const getPaycode = await generatePaycode(
        getTransDetails.transactionId,
        getTransDetails.wallet,
        getTransDetails.walletId,
        getTransDetails.amount,
        hashedPin
      );

      console.log("Generated Paycode -->", getPaycode);

      let paycode = getPaycode.payCode;

      await completeCardlessTransaction(
        sessionId,
        walletId,
        paycode,
        getTransDetails.transactionId,
        (transStatus = "processing"),
        getPaycode.statusCode,
        getPaycode.statusMessage
      );

      let info = "";
      step = "6";
      if (lang == "en") {
        info = `\nPaycode ${paycode} was generated successfully valid till 23:59\n`;
      } else {
        info = `\nLe code de paiement ${paycode} a été généré avec succès valable jusqu'à 23h59\n`;
      }

      const text = await buildResponseText(walletId, info, wallet);
      const questionType = "atmCardlessWithdraw";
      const res = { text, questionType, step };
      return res;
    } else {
      let info = "";
      step = "2";
      if (lang == "en") {
        info = "\nUnable to Generate Paycode - Transaction Failed\n";
      } else {
        info =
          "\nImpossible de générer un code de paiement - Échec de la transaction\n";
      }

      const text = await buildResponseTextClose(walletId, info, wallet);
      const questionType = "atmCardlessWithdraw";
      const res = { text, questionType, step };
      return res;
    }
  } else if (step == "6") {
  }
};

const fundWallet = async (walletId, lang, wallet, step, subscriberInput) => {
  console.log(
    "this is the subscriber input and step here",
    subscriberInput,
    step
  );
  if (step == "1") {
    let info = "";
    if (lang == "en") {
      info = "\nPlease enter PIN \n 0. to Cancel\n";
    } else {
      info = "\nVeuillez saisir le code PIN \n 0. pour annuler\n";
    }

    let step = "2";

    const text = await buildResponseText(walletId, info, wallet);
    const questionType = "fundMoMoWallet";
    const res = { text, questionType, step };
    return res;
  } else if (step == "2") {
    console.log("pin check -->", step);

    // step 2 is to validate the pin

    const pinCheck = await verifyPin(walletId, subscriberInput);

    if (pinCheck == true) {
      console.log("pin check -->", pinCheck);

      let info = "";
      if (lang == "en") {
        info = "\nPlease enter Mobile Money Wallet \n 0. to Cancel\n";
      } else {
        info = "\nVeuillez saisir le code PIN \n 0. pour annuler\n";
      }

      let step = "3";

      const text = await buildResponseText(walletId, info, wallet);
      const questionType = "fundMoMoWallet";
      const res = { text, questionType, step };
      return res;
    } else {
      let info = "";
      step = "3";
      if (lang == "en") {
        info = "\nInvalid Pin\n";
      } else {
        info = "\nCode PIN invalide\n";
      }

      const text = await buildResponseTextClose(walletId, info, wallet);
      const questionType = "fundMoMoWallet";
      const res = { text, questionType, step };
      return res;
    }
  } else if (step == "3") {
    let info = "";
    if (lang == "en") {
      info =
        "\nSelect Mobile Money Operator: \n1. Moov \n2. MTN \n 0. to Cancel\n";
    } else {
      info =
        "\nSélectionnez l'opérateur Mobile Money: \n1. Moov \n2. MTN \n \n 0. pour annuler\n";
    }

    let step = "4";

    const text = await buildResponseText(walletId, info, wallet);
    const questionType = "fundMoMoWallet";
    const res = { text, questionType, step };
    return res;
  } else if (step == "4") {
    let info = "";
    if (lang == "en") {
      info = "\nEnter Amount: \n 0. to Cancel\n";
    } else {
      info = "\nEntrer le Montant: \n 0. pour annuler\n";
    }

    let step = "5";

    const text = await buildResponseText(walletId, info, wallet);
    const questionType = "fundMoMoWallet";
    const res = { text, questionType, step };
    return res;
  } else if (step == "4") {
    // get account number from the user table
    const getWallet = await getWalletDetails(walletId);

    if (getWallet != false) {
      let account = getWallet.accountNumber;

      console.log("this is the account number -->", account);

      // get customer account balance

      const checkBal = await checkAccountBalance(
        account,
        (country = "BENIN-REPUBLIC")
      );

      if (checkBal.data.status == true) {
        let amount = parseInt(checkBal.data.availableBalance);

        console.log("this is the available balance", amount);

        let step = "3";

        let info = "";
        if (lang == "en") {
          info = `\nEnter Mobile Money Wallet  \n 0. to Cancel\n`;
        } else {
          info = `\nLe solde de notre compte est ${amount} XOF \n 0. pour annuler\n`;
        }

        const text = await buildResponseText(walletId, info, wallet);
        const questionType = "checkBalance";
        const res = { text, questionType, step };
        return res;
      } else {
        let info = "";
        if (lang == "en") {
          info = "\nBalance Enquiry Failed, Try Again Later\n";
        } else {
          info = "\nÉchec de la demande de solde, réessayez plus tard.\n";
        }

        const text = await buildResponseTextClose(walletId, info, wallet);
        const questionType = "checkBalance";
        const res = { text, questionType, step };
        return res;
      }
    }
  }
};

const checkBalance = async (walletId, lang, wallet, step, subscriberInput) => {
  if (step == 1) {
    let info = "";
    if (lang == "en") {
      info = "\nPlease enter PIN \n 0. to Cancel\n";
    } else {
      info = "\nVeuillez saisir le code PIN \n 0. pour annuler\n";
    }

    let step = "2";

    const text = await buildResponseText(walletId, info, wallet);
    const questionType = "checkBalance";
    const res = { text, questionType, step };
    return res;
  } else if (step == 2) {
    // step 2 is to validate the pin

    const pinCheck = await verifyPin(walletId, subscriberInput);

    if (pinCheck == true) {
      // get account number from the user table
      const getWallet = await getWalletDetails(walletId);

      if (getWallet != false) {
        let account = getWallet.accountNumber;

        console.log("this is the account number -->", account);

        // get customer account balance

        const checkBal = await checkAccountBalance(
          account,
          (country = "BENIN-REPUBLIC")
        );

        if (checkBal.data.status == true) {
          let amount = parseInt(checkBal.data.availableBalance);

          console.log("this is the available balance", amount);

          let step = "3";

          let info = "";
          if (lang == "en") {
            info = `\nYour Account Balance is ${amount} XOF \n 0. to Cancel\n`;
          } else {
            info = `\nLe solde de notre compte est ${amount} XOF \n 0. pour annuler\n`;
          }

          const text = await buildResponseText(walletId, info, wallet);
          const questionType = "checkBalance";
          const res = { text, questionType, step };
          return res;
        } else {
          let info = "";
          if (lang == "en") {
            info = "\nBalance Enquiry Failed, Try Again Later\n";
          } else {
            info = "\nÉchec de la demande de solde, réessayez plus tard.\n";
          }

          const text = await buildResponseTextClose(walletId, info, wallet);
          const questionType = "checkBalance";
          const res = { text, questionType, step };
          return res;
        }
      }

      // let amount = "50000";

      // let step = "3"

      // let info = "";
      // if(lang == "en"){
      //     info = `\nYour Account Balance is ${amount} XOF \n 0. to Cancel\n`
      // } else {
      //     info = `\nLe solde de notre compte est ${amount} XOF \n 0. pour annuler\n`
      // }

      // const text = await buildResponseText(walletId, info, wallet);
      // const questionType = 'checkBalance';
      // const res = { text, questionType, step }
      // return res;
    } else {
      let info = "";
      step = "2";
      if (lang == "en") {
        info = "\nInvalid Pin\n";
      } else {
        info = "\nCode PIN invalide\n";
      }

      const text = await buildResponseTextClose(walletId, info, wallet);
      const questionType = "checkBalance";
      const res = { text, questionType, step };
      return res;
    }
  }
};

const prepaidCardLoading = async (walletId, lang, wallet) => {};

const achTransfer = async (walletId, lang, wallet) => {};

const miniStatement = async (walletId, lang, wallet, step, subscriberInput) => {
  console.log("this is the step ---> ", step);
  console.log("this is the subscriberInput ---> ", subscriberInput);

  if (step == "1") {
    let info = "";
    if (lang == "en") {
      info = "\nPlease enter PIN \n 0. to Cancel\n";
    } else {
      info = "\nVeuillez saisir le code PIN \n 0. pour annuler\n";
    }

    let step = "2";

    const text = await buildResponseText(walletId, info, wallet);
    const questionType = "miniStatementType";
    const res = { text, questionType, step };
    return res;
  } else if (step == "2") {
    // step 2 is to validate the pin

    const pinCheck = await verifyPin(walletId, subscriberInput);

    if (pinCheck == true) {
      // get account number from the user table
      const getWallet = await getWalletDetails(walletId);

      if (getWallet != false) {
        let account = getWallet.accountNumber;

        console.log("this is the account number -->", account);

        // get customer account balance

        const statementDetails = await getMiniStatement(
          account,
          (country = "BENIN-REPUBLIC")
        );

        console.log("this is the statement details -->", statementDetails);

        if (statementDetails != null) {
          console.log("this is the account statement", statementDetails);
          let statementTrans = JSON.stringify(statementDetails);
          console.log(
            "this is the account statement encoded in JSON",
            statementTrans
          );
          let step = "3";

          let info = "";
          if (lang == "en") {
            info = `\nYour Mini-statment details: \n`;
            statementDetails.forEach((transaction) => {
              info += `S/N: ${transaction.id}\n`;
              info += `Transaction Date: ${transaction.transactionDate}\n`;
              info += `Transaction Amount: ${transaction.transactionAmount}\n`;
              info += `Transaction Type: ${transaction.transactionType}\n`;
              info += `Narration: ${transaction.narration}\n`;
            });
            info += `0. to Cancel\n`;
          } else {
            info = `\nDétails de votre mini-relevé: \n`;
            statementDetails.forEach((transaction) => {
              info += `S/N: ${transaction.id}\n`;
              info += `Date de la transaction: ${transaction.transactionDate}\n`;
              info += `Montant de la transaction: ${transaction.transactionAmount}\n`;
              info += `Type de transaction: ${transaction.transactionType}\n`;
              info += `Narration: ${transaction.narration}\n`;
            });

            info += `0. to Cancel\n`;

            // info = `\nDétails de votre mini-relevé ${statementDetails}  \n 0. pour annuler\n`
          }
          const text = await buildResponseText(walletId, info, wallet);
          const questionType = "miniStatementType";
          const res = { text, questionType, step };
          return res;
        } else {
          let info = "";
          if (lang == "en") {
            info = "\nBalance Enquiry Failed, Try Again Later\n";
          } else {
            info = "\nÉchec de la demande de solde, réessayez plus tard.\n";
          }

          const text = await buildResponseTextClose(walletId, info, wallet);
          const questionType = "miniStatementType";
          const res = { text, questionType, step };
          return res;
        }
      }
    } else {
      let info = "";
      step = "2";
      if (lang == "en") {
        info = "\nInvalid Pin\n";
      } else {
        info = "\nCode PIN invalide\n";
      }

      const text = await buildResponseTextClose(walletId, info, wallet);
      const questionType = "miniStatementType";
      const res = { text, questionType, step };
      return res;
    }
  }
};

const pushPullAutoLinkage = async (walletId, lang, wallet) => {};

const rechargeAirtime = async (
  sessionId,
  walletId,
  lang,
  wallet,
  step,
  subscriberInput
) => {
  console.log("this is the step ---> ", step);
  console.log("this is the subscriberInput ---> ", subscriberInput);

  if (step == "1") {
    let info = "";
    if (lang == "en") {
      info = "\nPlease enter PIN \n 0 to Cancel\n";
    } else {
      info = "\nVeuillez saisir le code PIN \n 0 pour annuler\n";
    }

    let step = "2";

    console.log("I am requesting to check the PIN");
    const text = await buildResponseText(walletId, info, wallet);
    const questionType = "rechargeAirtime";
    const res = { text, questionType, step };
    return res;
  } else if (step == "2") {
    // step 2 is to validate the pin

    const pinCheck = await verifyPin(walletId, subscriberInput);

    if (pinCheck == true) {
      let info = "";
      if (lang == "en") {
        info =
          "\n1. Airtime Self\n2. Airtime Others\n3. Data Self\n4. Data Others \n 0 to Cancel\n";
      } else {
        info =
          "\n1. Temps d'antenne personnel\n2. Temps d'antenne Autres\n3. Données personnelles\n4. Données Autres\n 0 pour annuler\n";
      }

      let step = "3";

      const text = await buildResponseText(walletId, info, wallet);
      const questionType = "rechargeAirtime";
      const res = { text, questionType, step };
      return res;
    } else {
      let info = "";
      step = "2";
      if (lang == "en") {
        info = "\nInvalid Pin\n";
      } else {
        info = "\nCode PIN invalide\n";
      }

      const text = await buildResponseTextClose(walletId, info, wallet);
      const questionType = "rechargeAirtime";
      const res = { text, questionType, step };
      return res;
    }
  } else if (step == "3") {
    if (subscriberInput == "1") {
      let info = "";
      if (lang == "en") {
        info = "\n Enter Amount \n0 to Cancel\n";
      } else {
        info = "\n Entrez le montant\n 0 pour annuler\n";
      }

      let step = "4";

      const text = await buildResponseText(walletId, info, wallet);
      const questionType = "rechargeAirtime";
      const res = { text, questionType, step };
      return res;
    } else if (subscriberInput == "2") {
      let info = "";
      if (lang == "en") {
        info = "\n Enter Phone Number \n 0 to Cancel\n";
      } else {
        info = "\n Entrez le numéro de téléphone \n 0 pour annuler\n";
      }

      let step = "5";

      const text = await buildResponseText(walletId, info, wallet);
      const questionType = "rechargeAirtime";
      const res = { text, questionType, step };
      return res;
    } else if (subscriberInput == "3") {
      let info = "";
      if (lang == "en") {
        info =
          "\n1. Airtime Self\n2. Airtime Others\n3. Data Self\n4. Data Others \n 0 to Cancel\n";
      } else {
        info =
          "\n1. Temps d'antenne personnel\n2. Temps d'antenne Autres\n3. Données personnelles\n4. Données Autres\n 0 pour annuler\n";
      }

      let step = "6";

      const text = await buildResponseText(walletId, info, wallet);
      const questionType = "rechargeAirtime";
      const res = { text, questionType, step };
      return res;
    } else if (subscriberInput == "4") {
      let info = "";
      if (lang == "en") {
        info = "\n Enter Phone Number \n 0 to Cancel\n";
      } else {
        info = "\n Entrez le numéro de téléphone \n 0 pour annuler\n";
      }

      let step = "7";

      const text = await buildResponseText(walletId, info, wallet);
      const questionType = "rechargeAirtime";
      const res = { text, questionType, step };
      return res;
    }
  } else if (step == "4") {
    //check the account balance before initiate the Airtime/Data Topup.
  } else if (step == "5") {
    //check the account
  } else if (step == "6") {
    //check the account
  } else if (step == "7") {
    //check the account
  }
};

const TermsCondition = async (walletId, lang) => {};

const getWalletDetails = async (walletId) => {
  const getWallet = await User.findOne({ where: { walletId: walletId } });

  if (getWallet) {
    return getWallet.dataValues;
  } else {
    return false;
  }
};

const getTransactionDetails = async (sessionId) => {
  const getTransaction = await Transaction.findOne({
    where: { sessionId: sessionId },
  });

  if (getTransaction) {
    return getTransaction.dataValues;
  } else {
    return false;
  }
};

const getCardlessTransactionDetails = async (sessionId) => {
  const getTransaction = await CardlessTrans.findOne({
    where: { sessionId: sessionId },
  });

  if (getTransaction) {
    return getTransaction.dataValues;
  } else {
    return false;
  }
};

const checkPhoneNumber = async (walletId) => {
  const arrayNumber = [
    "2294792712",
    "22995521010",
    "2294792799",
    "22995228720",
    "22965869814",
  ];

  // generate a function that checks if a numebr is in the arrayNumber
  const checkNumber = arrayNumber.includes(walletId);
  if (checkNumber) {
    return true;
  } else {
    return false;
  }
};

//create Transaction

const initiateTransaction = async (
  sender,
  subscriberInput,
  walletId,
  currency,
  transStatus,
  type,
  sessionId,
  serviceType
) => {
  const transactionId = generateRandomString(16);

  if (serviceType == "uba2ubaTransfer") {
    let insertRecord = await Transaction.create({
      walletId: walletId,
      sender: sender,
      receiver: subscriberInput,
      sessionId: sessionId,
      transactionId: transactionId,
      wallet: wallet,
      currency: currency,
      transStatus: transStatus,
      type: type,
    });

    console.log(
      "inserting transaction record into the Database -->",
      insertRecord.dataValues
    );

    if (insertRecord.dataValues) {
      return true;
    } else {
      return false;
    }
  } else if (serviceType == "cardlessWithdrawal") {
    console.log("This is for cardless withdrawal");

    let insertRecord = await CardlessTrans.create({
      walletId: walletId,
      accountNo: sender,
      amount: subscriberInput,
      sessionId: sessionId,
      transactionId: transactionId,
      wallet: wallet,
      currency: currency,
      transStatus: transStatus,
      type: type,
    });

    console.log(
      "inserting transaction record into the Database for cardless withdrawal -->",
      insertRecord.dataValues
    );

    if (insertRecord.dataValues) {
      return true;
    } else {
      return false;
    }
  }
};

const completeTransaction = async (
  sessionId,
  msisdn,
  transactionId,
  amount,
  transStatus,
  statusCode,
  statusMessage
) => {
  if (serviceType == "UBA2UBATransfer") {
    let bodyR = {
      sessionId: sessionId,
      walletId: msisdn,
      transactionId: transactionId,
      amount: amount,
      transStatus: transStatus,
      statusCode: statusCode,
      statusMessage: statusMessage,
    };

    console.log("update transaction record --->", bodyR);

    const updateRecord = await Transaction.update(
      {
        amount: amount,
        status: transStatus,
        statusCode: statusCode,
        statusMessage: statusMessage,
      },
      {
        where: {
          sessionId: sessionId,
          transactionId: transactionId,
          walletId: msisdn,
        },
      }
    );

    console.log("updateRecord", updateRecord);

    if (updateRecord) {
      return true;
    } else {
      return false;
    }
  } else if (serviceType == "cardlessWithdrawal") {
    let bodyR = {
      sessionId: sessionId,
      walletId: msisdn,
      transactionId: transactionId,
      amount: amount,
      transStatus: transStatus,
      statusCode: statusCode,
      statusMessage: statusMessage,
    };

    console.log("update transaction record --->", bodyR);

    const updateRecord = await CardlessTrans.update(
      {
        country: "BEN",
        payCode: pay,
        statusCode: statusCode,
        statusMessage: statusMessage,
      },
      {
        where: {
          sessionId: sessionId,
          transactionId: transactionId,
          walletId: msisdn,
        },
      }
    );

    console.log("updateRecord", updateRecord);

    if (updateRecord) {
      return true;
    } else {
      return false;
    }
  }
};

const completeCardlessTransaction = async (
  sessionId,
  msisdn,
  paycode,
  transactionId,
  transStatus,
  statusCode,
  statusMessage
) => {
  // let bodyR = {
  //     "sessionId": sessionId,
  //     "walletId": msisdn,
  //     "transactionId": transactionId,
  //     "amount": amount,
  //     "transStatus": transStatus,
  //     "statusCode": statusCode,
  //     "statusMessage": statusMessage
  // }

  // console.log("update transaction record --->", bodyR);

  const updateRecord = await CardlessTrans.update(
    {
      country: "BEN",
      payCode: paycode,
      status: transStatus,
      statusCode: statusCode,
      statusMessage: statusMessage,
    },
    {
      where: {
        sessionId: sessionId,
        transactionId: transactionId,
        walletId: msisdn,
      },
    }
  );

  console.log("updateRecord", updateRecord);

  if (updateRecord) {
    return true;
  } else {
    return false;
  }
};

function generateRandomString(length) {
  let result = "";
  while (result.length < length) {
    result += crypto.randomInt(0, 10).toString();
  }
  return result;
}

function hashPin(pin) {
  if (!/^\d{4}$/.test(pin)) {
    throw new Error("PIN must be a 4-digit number");
  }
  const hash = crypto.createHash("sha256");
  hash.update(pin);
  return hash.digest("hex");
}

exports.callbackUrl = async (req, res, next) => {
  //get the callbackUrl data
  //perform necessary actions
};
