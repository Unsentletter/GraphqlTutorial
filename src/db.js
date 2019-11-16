const users = [
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

const posts = [
  {
    id: '11',
    title: 'One',
    body: 'Heaps of shit',
    published: false,
    author: '1'
  },
  {
    id: '12',
    title: 'Twoa',
    body: 'Not much shit',
    published: true,
    author: '1'
  },
  {
    id: '13',
    title: 'Three',
    body: 'A normal amount of shit',
    published: true,
    author: '2'
  }
];

const comments = [
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

const db = {
  users,
  posts,
  comments
};

export { db as default };
