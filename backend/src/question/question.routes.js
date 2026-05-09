'use strict';

const router = require('express').Router({ mergeParams: true });
const controller = require('./question.controller');

router.post('/', controller.addQuestion);
router.put('/:index', controller.editQuestion);
router.delete('/:index', controller.removeQuestion);

module.exports = router;
