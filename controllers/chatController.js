const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// @POST /api/chat/conversations - Start or get conversation
exports.getOrCreateConversation = async (req, res) => {
  const { receiverId, listingId } = req.body;
  const senderId = req.user.id;

  // Check if conversation already exists
  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
    listing: listingId
  }).populate('participants', 'name email role')
    .populate('listing', 'title images');

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, receiverId],
      listing: listingId,
    });
    conversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name email role')
      .populate('listing', 'title images');
  }

  res.status(200).json({ success: true, conversation });
};

// @GET /api/chat/conversations - Get my conversations
exports.getMyConversations = async (req, res) => {
  const conversations = await Conversation.find({
    participants: { $in: [req.user.id] }
  })
    .populate('participants', 'name email role')
    .populate('listing', 'title images location')
    .sort('-lastMessageAt');

  res.status(200).json({ success: true, conversations });
};

// @GET /api/chat/conversations/:id/messages - Get messages
exports.getMessages = async (req, res) => {
  const messages = await Message.find({
    conversation: req.params.id
  })
    .populate('sender', 'name role')
    .sort('createdAt');

  // Mark messages as read
  await Message.updateMany(
    { conversation: req.params.id, sender: { $ne: req.user.id }, read: false },
    { read: true }
  );

  res.status(200).json({ success: true, messages });
};

// @POST /api/chat/conversations/:id/messages - Send message
exports.sendMessage = async (req, res) => {
  const { text } = req.body;

  const conversation = await Conversation.findById(req.params.id);
  if (!conversation)
    return res.status(404).json({ success: false, message: 'Conversation not found' });

  // Check if user is participant
  if (!conversation.participants.includes(req.user.id))
    return res.status(403).json({ success: false, message: 'Not authorized' });

  const message = await Message.create({
    conversation: req.params.id,
    sender: req.user.id,
    text,
  });

  // Update conversation last message
  await Conversation.findByIdAndUpdate(req.params.id, {
    lastMessage: text,
    lastMessageAt: new Date(),
  });

  const populatedMessage = await Message.findById(message._id)
    .populate('sender', 'name role');

  res.status(201).json({ success: true, message: populatedMessage });
};

// @GET /api/chat/unread - Get unread count
exports.getUnreadCount = async (req, res) => {
  const conversations = await Conversation.find({
    participants: { $in: [req.user.id] }
  });

  const conversationIds = conversations.map(c => c._id);

  const unreadCount = await Message.countDocuments({
    conversation: { $in: conversationIds },
    sender: { $ne: req.user.id },
    read: false
  });

  res.status(200).json({ success: true, unreadCount });
};