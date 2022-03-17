// const models = require('express-cassandra');

// models.setDirectory(__dirname + '/models').bind({
//   clientOptions: {
//     contactPoints: [''],

const ExpressCassandra = require("express-cassandra");
const DB = function () {
	const models = ExpressCassandra.createClient({
		clientOptions: {
			contactPoints: [process.env.CASSANDRA_HOST],
			localDataCenter: process.env.CASSANDRA_DATACENTER,
			protocolOptions: { port: process.env.CASSANDRA_PORT },
			keyspace: process.env.CASSANDRA_DB,
			queryOptions: { consistency: ExpressCassandra.consistencies.one },
		},
		ormOptions: {
			defaultReplicationStrategy: {
				class: "SimpleStrategy",
				replication_factor: 1,
			},
			migration: "safe",
			udts: require("./udt"),
		},
	});
	const createModel = function (opts) {
		const MyModel = models.loadSchema(opts.name, opts.schema);
		MyModel.syncDB(function (err, result) {
			if (err) throw err;
			console.log("Connected to cassandra database!");
		});
		return models.instance;
	};
	return {
		models: models.instance,
		createModel: createModel,
	};
};

module.exports = DB;
