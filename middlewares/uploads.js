const crypto = require('crypto');

const videoUpload = (req, res, next) => {
  if (!req.files || !req.files.video) {
    return res.status(400).json({ error: 'No video file provided' });
  }

  const video = req.files.video;

  // Check video file extension
  const allowedExtensions = ['mp4', 'mov', 'avi'];
  const fileExtension = video.name.split('.').pop().toLowerCase();

  if (!allowedExtensions.includes(fileExtension)) {
    return res.status(400).json({ error: 'Invalid video file format' });
  }

  // Generate a unique filename for the video
  const fileName = `${crypto.randomBytes(20).toString('hex')}.${fileExtension}`;
  const videoPath = `videos/${fileName}`;

  // Move the video file to the uploads folder
  video.mv(videoPath, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to upload video' });
    }

    req.body.videoPath = videoPath;
    next();
  });
};


const videoNotRequiredUpload = (req, res, next) => {
  if (!req.files || !req.files.video) {
    return next();
  }

  const video = req.files.video;

  // Check video file extension
  const allowedExtensions = ['mp4', 'mov', 'avi'];
  const fileExtension = video.name.split('.').pop().toLowerCase();

  if (!allowedExtensions.includes(fileExtension)) {
    return res.status(400).json({ error: 'Invalid video file format' });
  }

  // Generate a unique filename for the video
  const fileName = `${crypto.randomBytes(20).toString('hex')}.${fileExtension}`;
  const videoPath = `videos/${fileName}`;

  // Move the video file to the uploads folder
  video.mv(videoPath, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to upload video' });
    }

    req.body.videoPath = videoPath;
    next();
  });
};

const fileUpload = (req, res, next) => {
    if (!req.files || !req.files['files[]']) {
      return next();
    }

    
    const files = req.files['files[]'];
    let filesPath = [];
    if(Array.isArray(files)){
      filesPath = files.map((file) => {
        const fileExtension = file.name.split('.').pop().toLowerCase();
        // Generate a unique filename for the video
        const fileName = `${crypto.randomBytes(20).toString('hex')}.${fileExtension}`;
        const filePath = `documents/${fileName}`;
        return filePath;
      });
    } else {
        const fileExtension = files.name.split('.').pop().toLowerCase();
        // Generate a unique filename for the video
        const fileName = `${crypto.randomBytes(20).toString('hex')}.${fileExtension}`;
        const filePath = `documents/${fileName}`;
        filesPath = [filePath];
    }
    // filesPath = Array.isArray(files) ? files.map((file) => `documents/${crypto.randomBytes(20).toString('hex')}.${file.name.split('.').pop().toLowerCase()}`) : [`documents/${crypto.randomBytes(20).toString('hex')}.${file.name.split('.').pop().toLowerCase()}`];
    
    if (Array.isArray(files)) {
      let uploadCount = 0;
      
      files.forEach((file, index) => {
        file.mv(filesPath[index], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to upload file(s)' });
          }
  
          uploadCount++;
          
          if (uploadCount === files.length) {
            req.body.files = filesPath;
            next();
          }
        });
      });
    } else {
      files.mv(filesPath[0], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to upload file' });
        }
  
        req.body.files = filesPath;
        next();
      });
    }
  };
  

const imageUpload = (req, res, next) => {
  if (!req.files || !req.files.image) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  const image = req.files.image;

  // Check image file extension
  const allowedExtensions = ['jpg', 'jpeg', 'png'];
  const fileExtension = image.name.split('.').pop().toLowerCase();

  if (!allowedExtensions.includes(fileExtension)) {
    return res.status(400).json({ error: 'Invalid image file format' });
  }

  // Generate a unique filename for the image
  const fileName = `${crypto.randomBytes(20).toString('hex')}.${fileExtension}`;
  const imagePath = `images/${fileName}`;

  // Move the image file to the uploads folder
  image.mv(imagePath, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to upload image' });
    }

    req.body.imagePath = imagePath;
    next();
  });
};

const imageNotRequiredUpload = (req, res, next) => {
  if (!req.files || !req.files.image) {
    return next();
  }

  const image = req.files.image;

  // Check image file extension
  const allowedExtensions = ['jpg', 'jpeg', 'png'];
  const fileExtension = image.name.split('.').pop().toLowerCase();

  if (!allowedExtensions.includes(fileExtension)) {
    return res.status(400).json({ error: 'Invalid image file format' });
  }

  // Generate a unique filename for the image
  const fileName = `${crypto.randomBytes(20).toString('hex')}.${fileExtension}`;
  const imagePath = `images/${fileName}`;

  // Move the image file to the uploads folder
  image.mv(imagePath, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to upload image' });
    }

    req.body.imagePath = imagePath;
    next();
  });
};

const fileRequiredUpload = (req, res, next) => {
    if (!req.files || !req.files.file) {
        return res.status(400).json({ error: 'File is missing' });
    }

    const file = req.files.file;

    // Check file extension
    const allowedExtensions = ['rar', 'zip', '7z', 'pdf'];
    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
        return res.status(400).json({ error: 'Invalid file format' });
    }

    // Generate a unique filename for the file
    const fileName = `${crypto.randomBytes(20).toString('hex')}.${fileExtension}`;
    const filePath = `documents/${fileName}`;

    // Move the file to the desired location
    file.mv(filePath, (err) => {
        if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to upload file' });
        }
        req.body.filePath = filePath;
        next();
    });
};

const fileNotRequiredUpload = (req, res, next) => {
  if (!req.files || !req.files.file) {
      return next();
  }

  const file = req.files.file;

  // Check file extension
  const allowedExtensions = ['rar', 'zip', '7z', 'pdf'];
  const fileExtension = file.name.split('.').pop().toLowerCase();

  if (!allowedExtensions.includes(fileExtension)) {
      return res.status(400).json({ error: 'Invalid file format' });
  }

  // Generate a unique filename for the file
  const fileName = `${crypto.randomBytes(20).toString('hex')}.${fileExtension}`;
  const filePath = `documents/${fileName}`;

  // Move the file to the desired location
  file.mv(filePath, (err) => {
      if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to upload file' });
      }
      req.body.filePath = filePath;
      next();
  });
};

module.exports = {
    videoUpload,
    videoNotRequiredUpload,
    fileUpload,
    imageUpload,
    imageNotRequiredUpload,
    fileRequiredUpload,
    fileNotRequiredUpload
};