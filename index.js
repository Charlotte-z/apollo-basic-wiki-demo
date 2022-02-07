const { ApolloServer, gql } = require("apollo-server");

const typeDefs = gql`
  interface Node {
    id: ID!
  }

  type Skill {
    id: ID!
    name: String!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  type SkillEdge {
    cursor: String!
    node: Skill!
  }

  type Skills {
    edges: [SkillEdge!]!
    pageInfo: PageInfo!
  }

  type SkillResponseNode {
    id: ID!
    name: String!
  }

  type SkillResponseEdge {
    node: SkillResponseNode!
  }

  type SkillResponse {
    edge: SkillResponseEdge!
  }

  type ReactTeam implements Node {
    id: ID!
    name: String!
    resolveType: String!
    skillConnection(
      first: Int
      after: String
      before: String
      last: Int
    ): Skills!
  }

  type Query {
    Teams: [ReactTeam]!
    node(id: ID!): Node
  }

  type Mutation {
    removeSkill(memberName: String, skill: String): Skill!
    addSkill(memberName: String, skill: String): SkillResponse!
    updateSkill(memberName: String, skill: String, update: String): Skill!
  }
`;

let skillId = 3;
let cursor = 3;
let currentIndex = 0;

const teams = [
  {
    id: 1,
    name: "keju",
    skillConnection: {
      edges: [
        {
          cursor: "11",
          node: { id: "skill1", name: "React" },
        },
        {
          cursor: "22",
          node: { id: "skill2", name: "React Native" },
        },
      ],
      pageInfo: {
        hasNextPage: true,
        hasPreviousPage: false,
        startCursor: "11",
        endCursor: "22",
      },
    },
  },
  {
    id: 2,
    name: "dexiong",
    skillConnection: {
      edges: [
        {
          cursor: "33",
          node: { id: "skill3", name: "React Native" },
        },
      ],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: "33",
        endCursor: "33",
      },
    },
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
      member.skillConnection.edges.push({
        cursor,
        node: { id: ++skillId, name: skill },
      });
      return {
        edge: {
          node: {
            id: ++skillId,
            name: skill,
          },
        },
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
  ReactTeam: {
    skillConnection: (team, { first, after, before, id }) => {
      return team.skillConnection;
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
