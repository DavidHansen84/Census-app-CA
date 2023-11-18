var express = require("express");
var router = express.Router();
const validator = require('email-validator');
const moment = require("moment");

const CyclicDB = require("@cyclic.sh/dynamodb");
const db = CyclicDB(process.env.CYCLIC_DB);
let participants = db.collection("participants"); 

// GET list of all participants
router.get("/", async function (req, res, next) {
  try {
    let list = await participants.list();
    if (list == null) {
      res.json({
        status: "fail",
        message: "Participants list is empty, add some participants first"
      });
      return res.end();
    } else {
      res.json({
        status: "success",
        result: list,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: "Internal Server Error",
    });
  }
});

// GET personal details of all active participants
router.get("/details", async function (req, res, next) {
  try {
    let list = await participants.list();
    let emails = []
    let participantsDetails = [];
    if (list == null) {
      return res.json({
        status: "fail",
        message: "Participants list is empty, add some participants first"
      });
      return res.end();
    } else {

      list.results.forEach(item => {
        let key = item.key
        emails.push(key)
      });
      for (const email of emails) {
        let participant = await participants.get(email);
        if (participant.props.participant.active === 1) {
          participantsDetails.push(participant.props.participant);
        }
      }
      res.json({
        status: "success",
        result: participantsDetails,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      error: "Internal Server Error",
    });
  }
});

// GET personal details of all deleted participants
router.get("/details/deleted", async function (req, res, next) {
  try {
    let list = await participants.list();
    let emails = []
    let participantsDetails = [];
    if (list == null) {
      return res.json({
        status: "fail",
        message: "Participants list is empty, add some participants first"
      });
      return res.end();
    } else {

      list.results.forEach(item => {
        let key = item.key
        emails.push(key)
      });
      for (const email of emails) {
        let participant = await participants.get(email);
        if (participant.props.participant.active === 0) {
          participantsDetails.push(participant.props.participant);
        }
      }
      res.json({
        status: "success",
        result: participantsDetails,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      error: "Internal Server Error",
    });
  }
});

// GET personal details of specific active participants
router.get("/details/:email", async function (req, res, next) {
  try {
    let email = req.params.email
    if (!email) {
      res.status(400).json({
        status: "Bad Request",
        error: "email not provided"
      });
      return res.end();
    } else {
      let participant = await participants.get(email)
      if (!participant) {
        res.status(400).json({
          status: "fail",
          message: "Participant not found"
        });
        return res.end();
      }
      if (participant.props.participant.active === 1) 
      { 
        res.status(400).json({
          status: "success",
          result: participant.props.participant,
        });
        return res.end();
      } else {
        res.status(400).json({
          status: "fail",
          message: "Participant is deleted"
      })}
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: "Internal Server Error",
    });
  }
});

// GET work details of specific active participants
router.get("/work/:email", async function (req, res, next) {
  try {
    let email = req.params.email
    if (!email) {
      res.status(400).json({
        status: "Bad Request",
        error: "email not provided"
      });
      return res.end();
    } else {
      let participant = await participants.get(email)
      if (!participant) {
        res.status(400).json({
          status: "fail",
          message: "Participant not found"
        });
        return res.end();
      } 
      if (participant.props.participant.active === 1) 
      { 
        res.status(400).json({
          status: "success",
          result: participant.props.work,
        });
        return res.end();
      } else {
        res.status(400).json({
          status: "fail",
          message: "Participant is deleted"
      })}
    }
    
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: "Internal Server Error",
    });
  }
});

// // GET home details of specific active participants
router.get("/home/:email", async function (req, res, next) {
  try {
    let email = req.params.email
    if (!email) {
      res.status(400).json({
        status: "Bad Request",
        error: "email not provided"
      });
      return res.end();
    } else {
      let participant = await participants.get(email)
      if (!participant) {
        res.status(400).json({
          status: "fail",
          message: "Participant not found"
        });
        return res.end();
      } 
      if (participant.props.participant.active === 1) 
      { 
        res.status(400).json({
          status: "success",
          result: participant.props.home,
        });
        return res.end();
      } else {
        res.status(400).json({
          status: "fail",
          message: "Participant is deleted"
      })}
    }
    
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: "Internal Server Error",
    });
  }
});

// POST a new participant
router.post("/add", async function (req, res, next) {
  try {
    const { email, firstName, lastName, dob, active, companyName, salary, currency, country, city } = req.body;
    if (!email || !firstName || !lastName || !dob || active === null || !companyName || !salary || !currency || !country || !city ) {
      res.status(400).json({
        status: "Bad Request",
        error: "email, firstName, lastName, dob, active, companyName, salary, currency, country and city must be provided"
      });
      return res.end();
    } 
    let existingParticipant = await participants.get(email);

    if (existingParticipant) {
      res.status(400).json({
        status: "Bad Request",
        error: "Participant already exist, try PUT to edit the Participant"
      });
      return res.end();
    }
    if (active != 0 && active != 1) {
      res.status(400).json({
        status: "Bad Request",
        error: "active have to be either 0 or 1"
      });
      return res.end();
    }
    if (isNaN(salary)) {
      res.status(400).json({
        status: "Bad Request",
        error: "salary have to be a number"
      });
      return res.end();
     } 
     if (!isNaN(firstName) || !isNaN(lastName) || !isNaN(companyName) || !isNaN(currency) || !isNaN(country) || !isNaN(city)) {
      res.status(400).json({
        status: "Bad Request",
        error: "firstName, lastName, companyName, currency, country and city must be valid letters"
      });
      return res.end();
     } 
     // got this from https://singh-sandeep.medium.com/email-validation-in-node-js-using-email-validator-module-20b045b0c107
     const isValid = validator.validate(email);

     if (!isValid) {
      res.status(400).json({
        status: "Bad Request",
        error: "email must be in a valid email format (user@mail.com)"
      });
      return res.end();
     }
     // got this from https://momentjs.com/
     let validDate = moment(dob, "YYYY/MM/DD", true).isValid();

     if (!validDate) {
      res.status(400).json({
        status: "Bad Request",
        error: "Date of Birth must be in correct format (YYYY/MM/DD)"
      });
      return res.end();
     } else {
    await participants.set(email, {
      participant: {
        firstName: firstName,
        secondName: lastName,
        dob: dob,
        active: active
      },
      work: {
        companyName: companyName,
        salary: salary,
        currency: currency
      },
      home: {
        country: country,
        city: city,
      },
    });

    let participant = await participants.get(email);

    if (!participant) {
      res.status(400).json({
        status: "fail",
        message: "Participant not found"
      });
      return res.end();
    } else {
      addedText = "Participant " + participant.props.participant.firstName + " " + participant.props.participant.secondName + " added";
      res.status(200).json({
        status: "success",
        result: addedText
      });
    }
  }} catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      error: "Internal Server Error",
    });
  }
});

// PUT to update a participant
router.put("/:email", async function (req, res, next) {
  try {
    const email = req.params.email;
    if (!email) {
      res.status(400).json({
        status: "Bad Request",
        error: "email not provided"
      });
    }
    const {  firstName, lastName, dob, active, companyName, salary, currency, country, city } = req.body;
    if (!email || !firstName || !lastName || !dob || active === null || !companyName || !salary || !currency || !country || !city ) {
      res.status(400).json({
        status: "Bad Request",
        error: "email, firstName, lastName, dob, active, companyName, salary, currency, country and city must be provided"
      });
      return res.end();
    } 
    let existingParticipant = await participants.get(email);

    if (!existingParticipant) {
      res.status(400).json({
        status: "Bad Request",
        error: "Participant does not exist, try POST to add a Participant"
      });
      return res.end();
    }
    if (active != 0 && active != 1) {
      res.status(400).json({
        status: "Bad Request",
        error: "active have to be either 0 or 1"
      });
      return res.end();
    }
    if (isNaN(salary)) {
      res.status(400).json({
        status: "Bad Request",
        error: "salary have to be a number"
      });
      return res.end();
     } 
     if (!isNaN(firstName) || !isNaN(lastName) || !isNaN(companyName) || !isNaN(currency) || !isNaN(country) || !isNaN(city)) {
      res.status(400).json({
        status: "Bad Request",
        error: "firstName, lastName, companyName, currency, country and city must be valid letters"
      });
      return res.end();
     } 
     // got this from https://singh-sandeep.medium.com/email-validation-in-node-js-using-email-validator-module-20b045b0c107
     const isValid = validator.validate(email);

     if (!isValid) {
      res.status(400).json({
        status: "Bad Request",
        error: "email must be in a valid email format (user@mail.com)"
      });
      return res.end();
     }
     // got this from https://momentjs.com/
     let validDate = moment(dob, "YYYY/MM/DD", true).isValid();

     if (!validDate) {
      res.status(400).json({
        status: "Bad Request",
        error: "Date of Birth must be in correct format (YYYY/MM/DD)"
      });
      return res.end();
     } else {
    await participants.set(email, {
      participant: {
        firstName: firstName,
        secondName: lastName,
        dob: dob,
        active: active
      },
      work: {
        companyName: companyName,
        salary: salary,
        currency: currency
      },
      home: {
        country: country,
        city: city,
      },
    });

    let participant = await participants.get(email);

    if (!participant) {
      res.status(400).json({
        status: "fail",
        message: "Participant not found"
      });
      return res.end();
    } else {
      addedText = "Participant " + participant.props.participant.firstName + " " + participant.props.participant.secondName + " edited";
      res.status(200).json({
        status: "success",
        result: addedText
      });
    }
  }} catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      error: "Internal Server Error",
    });
  }
});

// DELETE to 'deletes' a participant
router.delete("/:email", async function (req, res, next) {
  try {
    const email = req.params.email;
    if (!email) {
      res.status(400).json({
        status: "Bad Request",
        error: "email not provided"
      });
    }
    let participant = await participants.get(email);
    if (!participant) {
      return res.status(404).json({
        status: "fail",
        message: "Participant not found.",
      });
    }
    await participants.set(email, {
      participant: {
        ...participant.props.participant,
        active: 0,
      },
      work: participant.props.work,
      home: participant.props.home,
    });
    res.json({
      status: "success",
      result: "Participant " + participant.props.participant.firstName + " " + participant.props.participant.secondName + " deleted",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: "Internal Server Error",
    });
  }
});


module.exports = router;
