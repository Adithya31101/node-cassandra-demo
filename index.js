require("dotenv").config();
const PersonModel = require("./models/PersonModel");
const cassandra = require("./cassandra")();
const express = require("express");
const _ = require("lodash");
const { uuidFromString } = require('express-cassandra');

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
	const filterQuery = filterData === 'all'? {} : filterData;
	const projection = fieldsArray === 'all'? [] : fieldsArray;
	const omitFields = skipFields === 'none'? [] : skipFields;
	return new Promise(async (resolve, reject) => {
		try {
			if(filterData["id"]) {
				filterData["id"] = uuidFromString(filterData['id']);
			}
			const personData = await cassandra.models.person.findAsync(filterQuery, {select: projection, raw: true});
			const dataWithOmittedFields = personData.map((template) =>
				_.omit(template, omitFields)
			);
			resolve(dataWithOmittedFields);
		} catch(err) {
			console.log(err);
			reject(err);
		}
	})
};

// -----------------------------------------------------------------------------

app.post("/findPerson", async (req, res) => {
	const { find, fields, skip } = req.body;
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

app.get("/persons", async (req, res) => {
	console.log(cassandra.models);
	try {
		const persons = await cassandra.models.person.findAsync({}, { raw: true })
		res.status(200).json(persons);
	} catch (err) {
		console.log(err);
			res.status(500).json(err);
	}
});

app.post("/createPerson", (req, res) => {
	console.log("creating ", req.body.name, "...");
	if(req.body['id']){
		req.body['id'] = uuidFromString(req.body['id']);
	}
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

app.put("/updatePerson/:_id",async (req, res) => {
	const personId = uuidFromString(req.params._id);
	try {
		const person = await cassandra.models.person.findOneAsync(
			{ id: personId },
		);
		for (let field in req.body){
			person[field] = req.body[field];
		}
		console.log(req.body);
		await person.saveAsync();
		console.log("Updation successful");
		res.status(200).json({message: "Person updated successfully!", data: person});
	} catch (err) {
		console.log(err);
		res.status(500).json({message: "Person updation failed"});
	}
});

app.put("/updateOne/:_id", async (req, res) => {
	const personId = uuidFromString(req.params._id);
	try {
		const res = await cassandra.models.person.updateAsync(
			{ id: personId },
			req.body
		);
		console.log("Updation successful", res);
		res.status(200).json({message: "Person updated successfully!"});
	} catch (err) {
		console.log(err);
		res.status(500).json({message: "Person updation failed"});
	}
});


app.put("/updateGeneral/", async (req, res) => {
	const {findObj, updateObj} = req.body;
	if(findObj['id']){
		findObj['id'] = uuidFromString(findObj['id']);
	}
	try {
		const person = await cassandra.models.person.updateAsync(
			findObj,
			updateObj
		);
		console.log("Updation successful", person);
		res.status(200).json({message: "Person updated successfully!"});
	} catch (err) {
		console.log(err);
		res.status(500).json({message: "Person updation failed"});
	}
});

app.put("/addQualification/", async (req, res) => {
	const {findObj, qualification} = req.body;
	if(findObj['id']){
		findObj['id'] = uuidFromString(findObj['id'])
	}
	try {
		const person = await cassandra.models.person.updateAsync(
			findObj,
			{ qualification: { $prepend: [qualification] } }
		);
		console.log("Updation successful", person);
		res.status(200).json({message: "Person updated successfully!"});
	} catch (err) {
		console.log(err);
		res.status(500).json({message: "Person updation failed"});
	}
});

app.delete("/deletePerson/:_id",async (req, res) => {
	const personId = uuidFromString(req.params._id);
	try {
		const person = await cassandra.models.person.delete(
			{ id: personId },
		);
		console.log(person);
		res.status(200).json({message: "Person deleted successfully!"});
	} catch (err) {
		console.log(err);
		res.status(500).json({message: "Person deletion failed!"});
	}
});

app.listen(8000, () => {
	console.log("Server is running on port 8000");
});
