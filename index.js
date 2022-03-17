require("dotenv").config();
const PersonModel = require("./models/PersonModel");
const cassandra = require("./cassandra")();
const express = require("express");
const _ = require("lodash");

const app = express();
cassandra.createModel(PersonModel);
app.use(express.json());

// -----------------------------------------------------------------------------
// Generic Functions

const personDocuments = (
	filterData = "all",
	fieldsArray = "all",
	skipFields = "none"
) => {
	return new Promise((resolve, reject) => {
		let queryObject = filterData != "all" ? filterData : {};
		let projection = fieldsArray != "all" ? fieldsArray : [];
		let omitFields = skipFields != "none" ? skipFields : [];

		cassandra.models.person.find(
			queryObject,
			{
				select: projection,
				raw: true,
			},
			(err, templates) => {
				if (err) {
					return reject(err);
				}
				const data = templates.map((template) => _.omit(template, omitFields));
				return resolve(data);
			}
		);
	});
};

// -----------------------------------------------------------------------------

app.post("/findPerson", async (req, res) => {
	const { find, fields, skip } = req.body;
	console.log(req.body);
	try {
		const data = await personDocuments(find, fields, skip);
		if (data.length > 0) {
			res.status(200).json(data);
		} else {
			res.status(404).json({ message: "No data found" });
		}
	} catch (err) {
		res.status(404).json(err);
	}
});

app.get("/persons", (req, res) => {
	console.log(cassandra.models);
	cassandra.models.person.find({}, { raw: true }, (err, value) => {
		if (err) {
			console.log(err);
			res.status(500).json(err);
		}
		res.status(200).json(value);
	});
});

app.post("/createPerson", (req, res) => {
	console.log("creating ", req.body.name, "...");
	req.body.created = new Date();
	const person = new cassandra.models.person(req.body);
	console.log(person);
	person.save((err) => {
		if (err) {
			console.log(err);
			res.status(500).json(err);
		}
		res.status(201).json({ message: "Person created!" });
	});
});

app.listen(8000, () => {
	console.log("Server is running on port 8000");
});
