const Course = require('../models/Course');
const Part = require('../models/part');

// Create a new Part
const createPart = async (req, res) => {
    try {
        const courseId = req.params.course_id;
        const { title, order } = req.body;

        //Check if course exist
        const course = await Course.findById(courseId);
        if(!course){
          return res.status(404).json({ message: 'Course Not Found' });
        }
        const part = new Part({
            title,
            order,
            courseId
        });

        await part.save();

        return res.json({ part });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create Part' });
    }
};

const updatePart = async (req, res) => {
    try {
        const { title, order } = req.body;

        const part = await Part.findById(req.params.id);

        if (!part) {
            return res.status(404).json({ error: 'Part not found' });
        }

        part.title = title;
        part.order = order;

        await part.save();

        return res.json({ part });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update Part' });
    }
};

const deletePart = async (req, res) => {
    const partId = req.params.id; 

    try {
        const result = await Part.deleteOne({ _id: partId }).exec();
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Part not found' });
        }

        res.status(200).json({ message: 'Part deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete Part', details: err });
    }
};

const getPartSummary = async (req, res) => {
    try {
        const partId = req.params.id;

        const part = await Part.findById(partId)
        .populate({
            path: 'chapters',
            select: '-partId -createdAt -updatedAt',
        })
        .populate({
            path: 'quizz',
            select: '-partId -createdAt -updatedAt',
        })
        .select('-courseId -createdAt -updatedAt');

        if (!part) {
        return res.status(404).json({ message: 'Part not found' });
        }

        res.status(200).json({ part });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};



module.exports = {
    createPart,
    updatePart,
    deletePart,
    getPartSummary
};
