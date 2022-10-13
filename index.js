import { ApolloServer, UserInputError, gql } from "apollo-server";
import { v1 as uuid } from "uuid";
import axios from "axios";

const persons = [
  {
    id: "df13d1sa3ds-234ds56d-s2ds2d1s",
    name: "Mayk",
    phone: "76565385",
    street: "Cala cala",
    city: "Cochabamba",
    age: "23",
  },
  {
    id: "sdasd-sd54s6dsd4sd-sdsadsda65",
    name: "Linnet",
    phone: "66554452",
    street: "Las cuadras",
    city: "La paz",
  },
  {
    id: "sd163dsdd-6a54d6as5ds-s3d254s",
    name: "Ely",
    phone: "68532328",
    street: "Las lomas",
    city: "Cochabamba",
  },
  {
    id: "sd163dffdgfgf-6a545435as5ds-s3d4s",
    name: "Laura",
    // phone: "68532328",
    street: "Las lomas",
    city: "Cochabamba",
  },
];

// describir los datos
// se describen igual las peticiones con Query
// ! obligatorio

const typeDefinitions = gql`
  enum YesNo {
    YES
    NO
  }

  type Address {
    street: String!
    city: String!
  }

  type Person {
    _id: ID!
    name: String!
    phone: String
    street: String!
    check: String!
    address: Address!
    canDrink: Boolean!
  }

  type Query {
    personCount: Int!
    apiPersonCount: Int!
    allPersons(phone: YesNo): [Person]!
    apiAllPerson: [Person]
    findPerson(name: String!): Person
    apiFindPerson(name: String!): Person
  }

  type Mutation {
    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person
    apiAddPerson(
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person
    editPhoneNumber(name: String!, phone: String!): Person
    apiEditPhoneNumber(name: String!, phone: String!): Person
  }
`;

// aqui le decimos de donde sacar los datos
//como resolver los datos

// args los parametros que le pasamos a nuestar peticion
// root => es lo que sea resuelto antes

const resolvers = {
  Query: {
    personCount: () => persons.length,
    apiPersonCount: async (root, args) => {
      const { data } = await axios.get(
        "http://localhost:3001/api/person-count"
      );
      return data.count;
    },
    allPersons: (root, args) => {
      if (!args.phone) return persons;
      const byPhone = (person) =>
        args.phone === "YES" ? person.phone : !person.phone;

      return persons.filter(byPhone);
    },
    apiAllPerson: async (root, args) => {
      const { data } = await axios.get("http://localhost:3001/api/persons");
      return data.persons;
    },
    findPerson: (root, args) => {
      const { name } = args;
      return persons.find((person) => person.name === name);
    },
    apiFindPerson: async (root, args) => {
      const { name } = args;
      const { data } = await axios.get(
        `http://localhost:3001/api/person/${name}`
      );

      return data.person;
    },
  },
  Mutation: {
    addPerson: (root, args) => {
      if (persons.find((p) => p.name === args.name)) {
        // throw Error("name must be unique");
        throw new UserInputError("Name must be unique", {
          invalidArgs: args.name,
        });
      }
      const person = { ...args, id: uuid() };
      persons.push(person);
      return person;
    },
    apiAddPerson: async (root, args) => {
      const person = { ...args };
      const { data } = await axios.post(
        "http://localhost:3001/api/person",
        person
      );
      return data.person;
    },
    editPhoneNumber: (root, args) => {
      const personIndex = persons.findIndex((p) => p.name === args.name);
      if (personIndex === -1) return null;
      const person = persons[personIndex];
      const updatePerson = { ...person, phone: args.phone };
      persons[personIndex] = updatePerson;
      return updatePerson;
    },
    apiEditPhoneNumber: async (root, args) => {
      const obj = { phone: args.phone };
      const { data } = await axios.put(
        `http://localhost:3001/api/person/${args.name}`,
        obj
      );
      return data.person;
    },
  },
  Person: {
    // name: (root) => root.name,
    // phone: (root) => root.phone,
    canDrink: (root) => root.age > 18,
    address: (root) => `${root.street}, ${root.city}`,
    check: () => "mayk check",
    address: (root) => {
      return {
        street: root.street,
        city: root.city,
      };
    },
  },
};

// crear el servidor

const server = new ApolloServer({
  typeDefs: typeDefinitions,
  resolvers,
});

// iniciamos el servidor

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
