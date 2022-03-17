module.exports = {
	schema: {
		fields: {
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
		key: ["name"],
	},
	name: "person",
};
