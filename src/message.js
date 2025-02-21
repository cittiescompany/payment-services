import { Op } from 'sequelize';
import { Chat, ChatParticipant, Message, SockeIdS } from './models/message.js';
import User from './models/user.js';
import { uploadImage } from './helpers/upload_media.js';
import { verify_jwt } from './helpers/auth.js';
import sequelize from 'sequelize';

const sockectsList = {};

export const MessageController = {
  async UploadMedia(req, res, next) {
    try {
      const _data = await uploadImage(req.file, 'message_media');
      res.status(200).json({ url: _data.media, status: true });
    } catch (ex) {
      console.log(ex.message);
      res.status(500).json({
        message: 'Something went wrong',
        status: false,
      });
    }
  },
};

export default function socketForController(socket, Io) {
  socket.on('join', async ({ token }) => {
    try {
      await Getconnected(token, socket.id);
      socket.emit('join', { message: 'success', status: true });
    } catch (error) {
      console.log(error.message);
      socket.emit('join', { message: 'Failed to connect user', status: false });
    }
  });

  socket.on('getAllChats', async (data) => {
    try {
      const user = await Getconnected(data.token, socket.id);

      const allChats = await Chat.findAll({
        where: sequelize.where(
          sequelize.fn(
            'JSON_CONTAINS',
            sequelize.col('users'),
            JSON.stringify(user.unique_id)
          ),
          1
        ),
        attributes: { exclude: ['users'] },
        include: [
          {
            model: User,
            as: 'chatusers',
            attributes: [
              'unique_id',
              'first_name',
              'last_name',
              'profile_pic',
              'business_name',
            ],
            through: { attributes: [] },
            where: { unique_id: { [Op.ne]: user.unique_id } },
          },
          {
            model: Message,
            order: [['updatedAt', 'DESC']],
            limit: 1,
          },
        ],
        order: [['updatedAt', 'ASC']],
      });
      socket.emit('getAllChats', {
        message: 'success',
        chats: allChats,
        status: true,
      });
    } catch (error) {
      console.log(error.message);
      socket.emit('getAllChats', {
        message: 'failed to get all chats',
        status: false,
      });
    }
  });

  socket.on('getMessages', async ({ token, chatId, friendId }) => {
    try {
      const user = await Getconnected(token, socket.id);
      const messages = await Message.findAll({
        where: { chat_id: chatId },
        include: [
          {
            model: User,
            attributes: [
              'unique_id',
              'first_name',
              'last_name',
              'profile_pic',
              'business_name',
              'unique_id',
            ],
            as: 'Sender',
          },
          {
            model: User,
            attributes: [
              'unique_id',
              'first_name',
              'last_name',
              'profile_pic',
              'business_name',
              'unique_id',
            ],
            as: 'Recipient',
          },
        ],
      });
      socket.emit('getMessages', {
        message: 'success',
        messages,
        status: true,
      });
    } catch (error) {
      console.log(error.message);
      socket.emit('getMessages', {
        message: 'failed to get all chats',
        status: false,
      });
    }
  });

  socket.on(
    'sendMessage',
    async ({ token, chatId, friendId, content, image }) => {
      try {
        const user = await Getconnected(token, socket.id);
        const chat = await Chat.findOne({
          where: { unique_id: chatId },
          include: [
            {
              model: User,
              attributes: [
                'unique_id',
                'first_name',
                'last_name',
                'profile_pic',
                'business_name',
              ],
              as: 'chatusers',
              where: { unique_id: { [Op.ne]: user.unique_id } },
            },
          ],
        });
        let friend = chat?.dataValues?.chatusers[0];

        const data = {
          content,
          messageType: image ? 'image' : 'text',
          sender_id: user.unique_id,
          attachmentUrl: image,
          recipient_id: friend.unique_id,
          isRead: false,
          chat_id: chatId,
        };

        const val = Object.entries(sockectsList).find(
          ([key, val]) => val.unique_id == friend.unique_id
        );
        const message = await Message.create(data);
        if (val) {
          Io.to(val[1].socketId).emit('recieveMessage', {
            message: 'success',
            data: message,
            status: true,
          });
        }

        socket.emit('sendMessage', {
          message: 'success',
          data: message,
          status: true,
        });
      } catch (error) {
        console.log(error.message);
        socket.emit('sendMessage', {
          message: 'failed to get all chats',
          status: false,
        });
      }
    }
  );

  socket.on('disconnect', async () => {
    try {
      console.log('User disconnected:', socket.id);
      const token = Object.entries(sockectsList).find(([key, value]) => {
        if (value.socketId == socket.id) {
          delete sockectsList[key];
        }
      });
      console.log('hello \n A user has disconnect');
      console.log(sockectsList);
    } catch (err) {
      console.log(err.message);
    }
  });
}

const auth_middle_ware = async (token, socketId) => {
  try {
    if (!token) return new Error('unauthorize access');
    const data = await verify_jwt(token, process.env.USERJWTLOGIN);
    if (!data.status) throw new Error('unauthorize access');
    let user = await User.findByPk(data.data.id, {
      attributes: ['unique_id', 'email', 'last_name', 'business_name'],
    });
    if (!user) throw new Error('User No found');
    const newData = { unique_id: user.toJSON().unique_id, socketId };
    sockectsList[token] = newData;
    return newData;
  } catch (error) {
    throw new Error(error.message);
  }
};
const Getconnected = async (token, socketId) => {
  try {
    const data =
      !sockectsList[token] && sockectsList[token]?.socketId != socketId
        ? await auth_middle_ware(token, socketId)
        : sockectsList[token];
    // console.log(data);
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};
