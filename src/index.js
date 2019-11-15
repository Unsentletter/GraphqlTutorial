import { GraphQLServer } from 'graphql-yoga';
import uuidv4 from 'uuid/v4';

// Demo user data
let users = [
  {
    id: '1',
    name: 'tbag',
    email: 'email@email.com',
    age: 69
  },
  {
    id: '2',
    name: 'not tbag',
    email: '1@email.com'
  },
  {
    id: '3',
    name: 'another someone',
    email: '2@email.com',
    age: 70
  }
];

let posts = [
  {
    id: '11',
    title: 'One',
    body: 'Heaps of shit',
    published: true,
    author: '1'
  },
  {
    id: '12',
    title: 'Twoa',
    body: 'Not much shit',
    published: 'Yesterday',
    author: '1'
  },
  {
    id: '13',
    title: 'Three',
    body: 'A normal amount of shit',
    published: 'Tomorrow',
    author: '2'
  }
];

let comments = [
  {
    id: '21',
    text: 'This sucks',
    author: '1',
    post: '12'
  },
  {
    id: '22',
    text: 'This is great',
    author: '2',
    post: '13'
  },
  {
    id: '23',
    text: 'I am neutral',
    author: '1',
    post: '13'
  }
];

// Type definitions (schema)
const typeDefs = `
    type Query {
        users(query: String): [User!]!
        posts(query: String): [Post!]!
        comments(query: String): [Comment!]!
    }

    type Mutation {
        createUser(data: CreateUserInput): User!
        deleteUser(id: ID!): User!
        createPost(data: CreatePostInput): Post!
        deletePost(id: ID!): Post!
        createComment(data: CreateCommentInput): Comment!
        deleteComment(id: ID!): Comment!
    }

    input CreateUserInput {
        name: String!
        email: String
        age: Int
    }

    input CreatePostInput {
        title: String!
        body: String!
        published: Boolean!
        author: ID!
    }

    input CreateCommentInput {
        text: String!
        author: ID!
        post: ID!
    }

    type User {
        id: ID!
        name: String!
        email: String!
        age: Int
        posts: [Post!]!
        comments: [Comment!]!
    }

    type Post {
        id: ID!
        title: String!
        body: String!
        published: String!
        author: User!
        comments: [Comment!]!
    }

    type Comment {
        id : ID!
        text: String!
        author: User!
        post: Post!
    }
`;

// Resolvers
const resolvers = {
  Query: {
    users(parent, args, ctx, info) {
      if (!args.query) {
        return users;
      }

      return users.filter(user => {
        return user.name.toLowerCase().includes(args.query.toLowerCase());
      });
    },
    posts(parent, args, ctx, info) {
      if (!args.query) {
        return posts;
      }

      return posts.filter(post => {
        const isTitleMatch = post.title
          .toLowerCase()
          .includes(args.query.toLowerCase());
        const isBodyMatch = post.body
          .toLowerCase()
          .includes(args.query.toLowerCase());
        return isTitleMatch || isBodyMatch;
      });
    },
    comments(parent, args, ctx, info) {
      if (!args.query) {
        return comments;
      }
      comments.filter(comment => {
        return comment.author.includes(args.query);
      });
    }
  },
  Mutation: {
    createUser(parent, args, ctx, info) {
      const emailTaken = users.some(user => {
        return user.email === args.data.email;
      });
      if (emailTaken) {
        throw new Error('Email taken');
      }
      const user = {
        id: uuidv4(),
        ...args.data
      };

      users.push(user);

      return user;
    },
    deleteUser(parent, args, ctx, info) {
      const userIndex = users.findIndex(user => {
        return user.id === args.id;
      });

      if (userIndex === -1) {
        throw new Error('User not found');
      }

      const deletedUsers = users.splice(userIndex, 1);

      posts = posts.filter(post => {
        const match = post.author === args.id;
        if (match) {
          comments = comments.filter(comment => {
            return comment.post !== post.id;
          });
        }
        return !match;
      });
      comments = comments.filter(comment => {
        return comment.author !== args.id;
      });

      return deletedUsers[0];
    },
    createPost(parent, args, ctx, info) {
      const userExists = users.some(user => {
        return user.id === args.data.author;
      });
      if (!userExists) {
        throw new Error('User not found');
      }
      const post = {
        id: uuidv4(),
        ...args.data
      };
      posts.push(post);

      return post;
    },
    deletePost(parent, args, ctx, info) {
      const postIndex = posts.findIndex(post => {
        return post.id === args.id;
      });

      if (postIndex === -1) {
        throw new error('Post not found');
      }

      const deletedPosts = posts.splice(postIndex, 1);

      comments = comments.filter(comment => {
        return comment.post !== args.id;
      });

      return deletedPosts[0];
    },
    createComment(parent, args, ctx, info) {
      const userExists = users.some(user => {
        return user.id === args.data.author;
      });
      const postExists = posts.some(post => {
        return post.id === args.data.post && post.published;
      });
      if (!userExists) {
        throw new Error('User not found');
      }
      if (!postExists) {
        throw new Error('Post not found');
      }
      const comment = {
        id: uuidv4(),
        ...args.data
      };
      comments.push(comment);

      return comment;
    },
    deleteComment(parent, args, ctx, info) {
      const commentIndex = comments.findIndex(comment => {
        return comment.id === args.id;
      });
      if (commentIndex === -1) {
        throw new Error('Comment not found');
      }

      const deletedComments = comments.splice(commentIndex, 1);

      return deletedComments[0];
    }
  },
  Post: {
    author(parent, args, ctx, info) {
      return users.find(user => {
        return user.id === parent.author;
      });
    },
    comments(parent, args, ctx, info) {
      return comments.filter(comment => {
        return comment.post === parent.id;
      });
    }
  },
  User: {
    posts(parent, args, ctx, info) {
      return posts.filter(post => {
        return post.author === parent.id;
      });
    },
    comments(parent, args, ctx, info) {
      return comments.filter(comment => {
        return comment.author === parent.id;
      });
    }
  },
  Comment: {
    author(parent, args, ctx, info) {
      return users.find(user => {
        return user.id === parent.author;
      });
    },
    post(parent, args, ctx, info) {
      return posts.find(post => {
        return post.id === parent.post;
      });
    }
  }
};

const server = new GraphQLServer({
  typeDefs,
  resolvers
});

server.start(() => {
  console.log('SERVER RUNNING');
});

// 5b31de20-9467-4801-b044-0a375f297e42
