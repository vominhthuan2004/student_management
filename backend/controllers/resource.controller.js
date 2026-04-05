const Resource = require('../schemas/resource.schema');

exports.createResource = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Chưa có file upload' });
    const resource = new Resource({
      title: req.body.title,
      description: req.body.description,
      classId: req.body.classId,
      teacherId: req.user.userId,
      fileUrl: req.file.path,
      fileType: req.file.mimetype
    });
    await resource.save();
    res.status(201).json(resource);
  } catch (error) {
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