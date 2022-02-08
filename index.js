const { ApolloServer, gql } = require("apollo-server");

const typeDefs = gql`
  interface Node {
    id: ID!
  }

  type Skill implements Node {
    id: ID!
    name: String!
  }

  type ReactTeam implements Node {
    id: ID!
    name: String!
    resolveType: String!
    skills(pageSize: Int, limit: Int): [Skill!]!
  }

  type Query {
    Teams: [ReactTeam]!
    node(id: ID!): Node!
  }

  type Mutation {
    removeSkill(memberName: String, skill: String): Skill!
    addSkill(memberName: String, skill: String): Skill!
    updateSkill(memberName: String, skill: String, update: String): Skill!
  }
`;

let skillId = 3;
let cursor = 3;

const teams = [
  {
    id: 1,
    name: "keju",
    skills: [
      { id: "skill1", name: "React" },
      { id: "skill2", name: "React2" },
      { id: "skill3", name: "React3" },
      { id: "skill4", name: "React4" },
    ],
  },
  {
    id: 2,
    name: "dexiong",
    skills: [{ id: "skill5", name: "React" }],
  },
];

const resolvers = {
  Query: {
    Teams: () => {
      current = 1;
      return teams;
    },
    node(_, { id }) {
      const ts = teams.find((team) => team.id === parseInt(id));
      return ts;
    },
  },
  Mutation: {
    removeSkill: (_, { memberName, skill }) => {
      // just a simple validation and remove operation
      const member = teams.find((team) => team.name === memberName);
      const skillIndex = member.skills.findIndex((s) => s.name === skill);

      if (skillIndex === -1) throw new Error("Skill not found");

      const id = member.skills[skillIndex].id;
      member.skills.splice(skillIndex, 1);

      return {
        id,
        name: skill,
      };
    },

    addSkill: (_, { memberName, skill }) => {
      const member = teams.find((team) => team.name === memberName);
      cursor = `${++cursor}`;
      member.skills.push({ id: ++skillId, name: skill });
      return {
        id: ++skillId,
        name: skill,
      };
    },
    updateSkill: (_, { memberName, skill, update }) => {
      const member = teams.find((team) => team.name === memberName);
      const skillName = member.skills.filter(
        (skillName) => skillName.name === skill
      )[0];
      if (!skillName) throw new Error("Skill not found");

      skillName.name = update;

      return { id: skillName.id, name: update };
    },
  },
  Node: {
    __resolveType(obj, context, info) {
      return "ReactTeam";
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
