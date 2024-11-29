// const cloudinary = require('cloudinary').v2;
// const { CloudinaryStorage } = require('multer-storage-cloudinary');

// cloudinary.config({ 
//     cloud_name: process.env.CLOUD_NAME, 
//     api_key: process.env.CLOUD_API_KEY, 
//     api_secret: process.env.CLOUD_API_SECRET
// });

// const storage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//       params: {
//         folder: 'justPost1',
//         allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'avi', 'mov'],
//     },
// });

// module.exports = {
//     cloudinary,
//     storage
// }

// const cloudinary = require('cloudinary').v2;
// const { CloudinaryStorage } = require('multer-storage-cloudinary');

// cloudinary.config({
//     cloud_name: process.env.CLOUD_NAME,
//     api_key: process.env.CLOUD_API_KEY,
//     api_secret: process.env.CLOUD_API_SECRET
// });

// const storage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params: async (req, file) => {
//         let folder = 'JustPost';
//         let allowedFormats = ['jpg', 'jpeg', 'png', 'gif'];

//         if (file.fieldname === 'post[video]') {
//             folder = 'JustPost/videos';
//             allowedFormats = ['mp4', 'avi', 'mov'];
//         }

//         return {
//             folder: folder,
//             allowedFormats: allowedFormats,
//             resource_type: file.fieldname === 'post[video]' ? 'video' : 'auto'
//         };
//     }
// });

// module.exports = { cloudinary, storage };
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.CLOUD_API_KEY,
        api_secret: process.env.CLOUD_API_SECRET
    });

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: file.fieldname === 'post[video]' ? 'JustPost/videos' : 'JustPost',
            resource_type: file.fieldname === 'post[video]' ? 'video' : 'auto',
            // Increase timeout and file size limit for videos
            timeout: 600000, // 10 minutes
        };
    }
});

module.exports = { cloudinary, storage };