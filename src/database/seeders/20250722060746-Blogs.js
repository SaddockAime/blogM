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
    );
    
    await queryInterface.bulkInsert('blogs', [
      {
        id: uuidv4(),
        title: 'Getting Started with Node.js',
        slug: 'getting-started-with-nodejs',
        description: 'A comprehensive guide to getting started with Node.js development',
        content: 'Node.js is a JavaScript runtime built on Chrome\'s V8 JavaScript engine. In this article, we will explore the fundamentals of Node.js and how to build your first application...',
        blog_image_url: 'https://example.com/images/nodejs-guide.jpg',
        author: users[0] ? users[0].id : uuidv4(),
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        title: 'TypeScript Best Practices',
        slug: 'typescript-best-practices',
        description: 'Learn the best practices for writing clean and maintainable TypeScript code',
        content: 'TypeScript has become an essential tool for modern JavaScript development. This article covers the best practices that every TypeScript developer should know...',
        blog_image_url: 'https://example.com/images/typescript-best-practices.jpg',
        author: users[1] ? users[1].id : uuidv4(),
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        title: 'Database Design Principles',
        slug: 'database-design-principles',
        description: 'Essential principles for designing efficient and scalable databases',
        content: 'Good database design is crucial for building scalable applications. In this post, we will discuss the fundamental principles of database design...',
        blog_image_url: 'https://example.com/images/database-design.jpg',
        author: users[2] ? users[2].id : (users[0] ? users[0].id : uuidv4()),
        isPublished: false,
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
    await queryInterface.bulkDelete('blogs', {}, {});
  }
};
