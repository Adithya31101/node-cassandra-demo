module.exports = {
	schema: {
		fields: {
			id: {
				type: "uuid",
				default: {"$db_function": "uuid()"},
			},
			name: {
				type: "varchar",
				rule: {
					required: true,
				},
			},
			surname: {
				type: "varchar",
				rule: {
					required: true,
				},
			},
			age: {
				type: "int",
				rule: {
					required: true,
				},
			},
			created: {
				type: "timestamp",
				rule: {
					required: true,
				},
			},
			qualification: {
				type: "list",
				typeDef: "<frozen<qualification>>",
			},
		},
		key: ['id'],
	},
	name: "person",
};
