const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resource.controller');
const { verifyToken } = require('../middlewares/auth');
const upload = require('../utils/upload');

router.post('/', verifyToken, upload.single('file'), resourceController.createResource);
router.get('/class/:classId', resourceController.getResourcesByClass);
router.delete('/:id', verifyToken, resourceController.deleteResource);

module.exports = router;