const Resource = require('../schemas/resource.schema');
const mongoose = require('mongoose');
const Class = require('../schemas/class.schema');
const fs = require('fs');

exports.createResource = async (req, res) => {
  let uploadedFilePath = null;
  try {
    if (!req.file) return res.status(400).json({ message: 'Chưa có file upload' });
    uploadedFilePath = req.file.path;

    const { title, description, classId } = req.body;
    const teacherId = req.user.userId;


    if (!mongoose.Types.ObjectId.isValid(classId)) {
      if (fs.existsSync(uploadedFilePath)) fs.unlinkSync(uploadedFilePath);
      return res.status(400).json({ message: 'classId không hợp lệ' });
    }

    const classItem = await Class.findById(classId);
    if (!classItem) {
      if (fs.existsSync(uploadedFilePath)) fs.unlinkSync(uploadedFilePath);
      return res.status(404).json({ message: 'Lớp không tồn tại' });
    }
    if (classItem.teacherId.toString() !== teacherId) {
      if (fs.existsSync(uploadedFilePath)) fs.unlinkSync(uploadedFilePath);
      return res.status(403).json({ message: 'Bạn không phải giáo viên của lớp này' });
    }

    const resource = new Resource({
      title,
      description,
      classId,
      teacherId,
      fileUrl: uploadedFilePath,
      fileType: req.file.mimetype
    });
    await resource.save();
    res.status(201).json(resource);
  } catch (error) {
    
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      fs.unlinkSync(uploadedFilePath);
    }
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getResourcesByClass = async (req, res) => {
  try {
    const resources = await Resource.find({ classId: req.params.classId }).populate('teacherId', 'username');
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteResource = async (req, res) => {
  try {
    await Resource.findByIdAndDelete(req.params.id);
    res.json({ message: 'Xóa thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};