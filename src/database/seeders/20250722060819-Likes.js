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
      'SELECT id FROM users'
    )
    
    const [blogs] = await queryInterface.sequelize.query(
      'SELECT id FROM blogs WHERE "isPublished" = true'
    )
    
    await queryInterface.bulkInsert('likes', [
      {
        id: uuidv4(),
        user: users[0] ? users[0].id : uuidv4(),
        blogId: blogs[0] ? blogs[0].id : uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        user: users[1] ? users[1].id : uuidv4(),
        blogId: blogs[0] ? blogs[0].id : uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        user: users[2] ? users[2].id : uuidv4(),
        blogId: blogs[1] ? blogs[1].id : uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        user: users[0] ? users[0].id : uuidv4(),
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
    await queryInterface.bulkDelete('likes', {}, {});
  }
};
