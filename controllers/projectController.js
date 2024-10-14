const Project = require('../models/project'); 
const Course = require('../models/Course');
const Student = require('../models/Student');
const TopicCompleted = require('../models/TopicCompleted');

// Controller for Projects
const createProject = async function (req, res) {
    try {
        const courseId = req.params.course_id;
        const { title, description, videoPath, files } = req.body;
        const notices = req.body['notices[]'];

        // Check if courseId exists
        const course = await Course.findById(courseId);
        if (!course) {
        return res.status(404).json({ message: 'Course not found' });
        }
        // Check if a project already exists for this course
        const existingProject = await Project.findOne({ courseId });
        if (existingProject) {
          return res.status(400).json({ message: 'A project already exists for this course' });
        }
        
        const project = new Project({
        title,
        description,
        videoPath,
        notices,
        files,
        courseId
        });
        const createdProject = await project.save();
        res.status(201).json(createdProject);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateProject = async function (req, res) {
  try {
    const projectId = req.params.id;
    const { title, description, videoPath, files } = req.body;
    const notices = req.body['notices[]'];

    // Retrieve the project by its ID
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Update the project attributes
    project.title = title;
    project.description = description;
    if(videoPath){
      project.videoPath = videoPath;
    }
    project.notices = notices;
    if(files){
      project.files = files;
    }

    // Save the updated project
    const updatedProject = await project.save();

    res.json(updatedProject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const getProjectById = async function (req, res) {
  try {
    const projectId = req.params.id;
    const project = await Project.findById(projectId).select('-projectUploaded');
    if (project) {
      res.json(project);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const teacherGetProjectById = async function (req, res) {
  try {
    const projectId = req.params.id;
    const project = await Project.findById(projectId);
    if (project) {
      res.json(project);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const studentGetProjectById = async function (req, res) {
  try {
    const projectId = req.params.id;
    const studentId = req.student._id;
    const project = await Project.findById(projectId);
    if (project) {
      const filteredProjectUploaded = project.projectUploaded.filter(upload => String(upload.studentId) === studentId);
      const filteredProject = project.toObject();
      filteredProject.projectUploaded = filteredProjectUploaded;
      res.json(filteredProject);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteProject = async function (req, res) {
  try {
    const projectId = req.params.id;
    const deletedProject = await Project.findByIdAndDelete(projectId);
    if (deletedProject) {
      res.json({ message: 'Project deleted successfully' });
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const uploadProject = async (req, res) => {
  try {
    const studentId = req.student._id;
    const { filePath } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!filePath) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const existingUpload = project.projectUploaded.find(
      (upload) => upload.studentId.toString() === studentId.toString()
    );

    if (existingUpload) {
      return res
        .status(409)
        .json({ message: "Project already uploaded by this student" });
    }

    // Check if the project is completed
    const isProjectCompleted = await TopicCompleted.exists({
      studentId: studentId,
      topicId: project._id,
      topicType: "Project",
    });

    if (isProjectCompleted) {
      return res
        .status(409)
        .json({ message: "You have already completed this project" });
    }

    const projectUpload = {
      studentId: studentId,
      file: filePath,
    };

    project.projectUploaded.push(projectUpload);
    await project.save();

    return res.status(201).json({ message: "Project uploaded successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


const removeProjectUpload = async (req, res) => {
  try {
    const studentId = req.student._id;
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const projectUploadId = req.params.project_id;
    const projectUploadIndex = project.projectUploaded.findIndex(upload => upload._id == projectUploadId);

    if (projectUploadIndex === -1) {
      return res.status(404).json({ message: "Project upload not found" });
    }

    const projectUpload = project.projectUploaded[projectUploadIndex];

    if (projectUpload.studentId.toString() !== studentId.toString()) {
      return res.status(403).json({ message: "You are not authorized to delete this project upload" });
    }

    project.projectUploaded.splice(projectUploadIndex, 1);
    await project.save();

    return res.status(200).json({ message: "Project upload deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const approveProject = async (req, res) => {
  const uploadedProjectId = req.params.project_upload_id;

  try {
    // Find the project associated with the uploaded project id
    const project = await Project.findOne({ 'projectUploaded._id': uploadedProjectId });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const studentId = project.projectUploaded.find(upload => upload._id.equals(uploadedProjectId)).studentId;

    // Create a new topicCompleted document
    const topicCompleted = new TopicCompleted({
      studentId,
      topicId: project._id,
      topicType: 'Project'
    });

    await topicCompleted.save();

    // Remove the uploaded project from projectUploaded array
    project.projectUploaded = project.projectUploaded.filter(upload => !upload._id.equals(uploadedProjectId));
    await project.save();

    res.json({ message: 'Project marked as completed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark project as completed', details: err });
  }
};

// Mark a project as not completed
const markProjectAsNotCompleted = async (req, res) => {
  const studentId = req.student._id;
  const projectId = req.params.id;
  
  try {
      const project = await Project.findById(projectId);
  
      if (!project) {
      return res.status(404).json({ error: 'Project not found' });
      }
  
      // Check if the project has been marked as completed before
      const topicCompleted = await TopicCompleted.findOne({ studentId, topicId: projectId, topicType: 'Project' });
  
      if (!topicCompleted) {
      return res.status(400).json({ error: 'Project has not been marked as completed' });
      }
  
      // Delete the corresponding topicCompleted document
      await TopicCompleted.findOneAndDelete({ studentId, topicId: projectId, topicType: 'Project' });
  
      res.json({ message: 'Project marked as not completed' });
  } catch (err) {
      res.status(500).json({ error: 'Failed to mark project as not completed', details: err });
  }
};

const rejectProject = async (req, res) => {
  const uploadedProjectId = req.params.project_upload_id;

  try {
    // Find the project associated with the uploaded project id
    const project = await Project.findOne({ 'projectUploaded._id': uploadedProjectId });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Remove the uploaded project from the projectUploaded array
    project.projectUploaded = project.projectUploaded.filter(upload => !upload._id.equals(uploadedProjectId));
    await project.save();

    res.json({ message: 'Project rejected and removed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject project', details: err });
  }
};


module.exports = {
  createProject,
  updateProject,
  getProjectById,
  deleteProject,
  uploadProject,
  removeProjectUpload,
  studentGetProjectById,
  teacherGetProjectById,
  approveProject,
  markProjectAsNotCompleted,
  rejectProject
};
