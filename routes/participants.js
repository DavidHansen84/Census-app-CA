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

router.get("/details", async function (req, res, next) {
  let item = await participants.get();
  res.json(item);
});


router.post("/add", async function (req, res, next) {
  const { email, firstName, lastName, dob, active, companyname, salary, currency, country, city } = req.body;
  await participants.set(email, {
    participant: { 
      firstName: firstName,
      secondName: lastName,
      dob: dob,
      active: active
    },
    work: { 
      companyname: companyname,
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
  const { email, firstName, lastName, dob, active, companyname, salary, currency, country, city } = req.body;
  await participants.set(email, {
    participant: { 
      firstName: firstName,
      secondName: lastName,
      dob: dob,
      active: active
    },
    work: { 
      companyname: companyname,
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

router.delete("/:key", async function (req, res, next) {
  await participants.delete(req.params.key);
  res.end();
});

module.exports = router;
