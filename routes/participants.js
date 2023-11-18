var express = require("express");
var router = express.Router();

const CyclicDB = require("@cyclic.sh/dynamodb");
const db = CyclicDB(process.env.CYCLIC_DB);
let participants = db.collection("users");

router.get("/", async function (req, res, next) {
  let list = await participants.list();
  if (list == null) {
    res.json({
      status: "fail",
      message: "Participants list is empty, add some participants first"
    });
  } else {
    res.json({
      status: "success",
      result: list,
    });
  }
});

router.get("/details/:email", async function (req, res, next) {
  let email = req.params.email
  let participant = await participants.get(email)
  res.json(participant.props.participant);
});

router.get("/work/:email", async function (req, res, next) {
  let email = req.params.email
  let participant = await participants.get(email)
  res.json(participant.props.work);
});

router.get("/home/:email", async function (req, res, next) {
  let email = req.params.email
  let participant = await participants.get(email)
  res.json(participant.props.home);
});

// NOT DONE
router.get("/details", async function (req, res, next) {
  const email = req.body.email;
  let item = await participants.get(email);
  res.json(item);
});

// NOT DONE
router.get("/details/deleted", async function (req, res, next) {
  let item = await participants.get();
  res.json(item);
});


router.post("/add", async function (req, res, next) {
  const { email, firstName, lastName, dob, active, companyName, salary, currency, country, city } = req.body;
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
  let participant = await participants.get(email)
  console.log(participant.props)
  addedText =  "Participant " + participant.props.participant.firstName + " " + participant.props.participant.secondName+ " added"
  res.json({
    status: "success",
    result: addedText
  });
});

router.put("/add", async function (req, res, next) {
  const { email, firstName, lastName, dob, active, companyName, salary, currency, country, city } = req.body;
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
  let participant = await participants.get(email)
  console.log(participant.props)
  editedText =  "Participant " + participant.props.participant.firstName + " " + participant.props.participant.secondName+ " edited"
  res.json({
    status: "success",
    result: editedText
  });
});

// NOT DONE
router.delete("/:email", async function (req, res, next) {
  try {
    const email = req.params.email;
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
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      error: "Internal Server Error",
    });
  }
});


module.exports = router;
