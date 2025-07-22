'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    
    const [users] = await queryInterface.sequelize.query(
      'SELECT id FROM users LIMIT 3'
    )
    
    const [blogs] = await queryInterface.sequelize.query(
      'SELECT id FROM blogs LIMIT 3'
    )
    
    await queryInterface.bulkInsert('comments', [
      {
        id: uuidv4(),
        content: 'Great article! This really helped me understand the basics of Node.js.',
        author: users[0] ? users[0].id : uuidv4(),
        blogId: blogs[0] ? blogs[0].id : uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        content: 'Thank you for sharing these TypeScript best practices. Very useful!',
        author: users[1] ? users[1].id : uuidv4(),
        blogId: blogs[1] ? blogs[1].id : uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        content: 'Looking forward to more articles like this one.',
        author: users[2] ? users[2].id : uuidv4(),
        blogId: blogs[0] ? blogs[0].id : uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        content: 'Could you provide more examples in the next part?',
        author: users[0] ? users[0].id : uuidv4(),
        blogId: blogs[1] ? blogs[1].id : uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('comments', {}, {});
  }
};
