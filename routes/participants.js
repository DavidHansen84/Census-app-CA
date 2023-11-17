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
    let participantsValue = list.props.value
    res.json({
      status: "success",
      result: participantsValue,
    });
  }
  res.send(list);
});

router.get("/:key", async function (req, res, next) {
  let item = await participants.get(req.params.key);
  res.send(item);
});


router.post("/", async function (req, res, next) {
  const { email, firstName, lastName, dob, active, companyname, salary, currency, country, city } = req.body;
  await participants.set(email, {
    firstName: firstName,
    secondName: lastName,
    dob: dob,
    active: active,
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
  res.end();
});

router.put("/", async function (req, res, next) {
  const { email, firstName, lastName, age } = req.body;
  await participants.set(email, {
    firstName: firstName,
    secondName: lastName,
    age: age,
  });
  res.end();
});

router.delete("/:key", async function (req, res, next) {
  await participants.delete(req.params.key);
  res.end();
});

module.exports = router;
