const Feedback = require('../schemas/feedback.schema');


exports.createFeedback = async (req, res) => {
  try {
    const { title, content, classId } = req.body;
    const studentId = req.user.studentId; // từ token

    if (!title || !content || !classId) {
      return res.status(400).json({ message: 'Thiếu title, content hoặc classId' });
    }

   
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => file.path);
    }

    const feedback = new Feedback({
      studentId,
      title,
      content,
      classId,
      attachments,
      status: 'pending'
    });

    await feedback.save();
    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getFeedbacksByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const feedbacks = await Feedback.find({ classId })
      .populate('studentId', 'username fullName')
      .populate('repliedBy', 'username')
      .sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.replyFeedback = async (req, res) => {
  try {
    const { reply } = req.body;
    const { id } = req.params;
    const repliedBy = req.user.userId;

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      {
        reply,
        repliedBy,
        repliedAt: new Date(),
        status: 'replied'
      },
      { new: true }
    );
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const feedback = await Feedback.findById(id);
    if (!feedback) return res.status(404).json({ message: 'Not found' });
    
    if (req.user.role !== 'admin' && feedback.studentId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    await feedback.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};