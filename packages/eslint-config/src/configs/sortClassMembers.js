import sortClassMembers from "eslint-plugin-sort-class-members"

export default [
  {
    ...sortClassMembers.configs["flat/recommended"],
    rules: {
      ...sortClassMembers.configs["flat/recommended"].rules,
      "sort-class-members/sort-class-members": [
        "error",
        {
          order: [
            "[static-properties]",
            "[static-methods]",
            "[properties]",
            "[conventional-private-properties]",
            "constructor",
            "[methods]",
            "[conventional-private-methods]",
          ],
          accessorPairPositioning: "together",
        },
      ],
    },
  },
]
