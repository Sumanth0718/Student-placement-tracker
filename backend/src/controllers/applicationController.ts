import { Response } from 'express';
import Application from '../models/Application';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

// @desc    Create a new placement application
// @route   POST /api/applications
// @access  Private
export const createApplication = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { companyName, role, ctc, applicationDate, status, notes } = req.body;

    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    // Input validations
    if (!companyName || !role || !ctc || !applicationDate || !status) {
      res.status(400).json({ message: 'Please provide all required fields (companyName, role, ctc, applicationDate, status)' });
      return;
    }

    const validStatuses = ['Applied', 'OA Scheduled', 'OA Completed', 'Interview', 'Offer', 'Rejected'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    const application = await Application.create({
      userId: req.user._id,
      companyName,
      role,
      ctc,
      applicationDate: new Date(applicationDate),
      status,
      notes,
    });

    res.status(201).json(application);
  } catch (error) {
    console.error('Create Application Error:', error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Get all placement applications of the logged-in user
// @route   GET /api/applications
// @access  Private
export const getApplications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    // Sort by applicationDate descending, then createdAt descending
    const applications = await Application.find({ userId: req.user._id })
      .sort({ applicationDate: -1, createdAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error('Get Applications Error:', error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Get a single placement application by ID
// @route   GET /api/applications/:id
// @access  Private
export const getApplicationById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      res.status(404).json({ message: 'Application not found' });
      return;
    }

    // Verify ownership
    if (application.userId.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'Not authorized to view this application' });
      return;
    }

    res.json(application);
  } catch (error) {
    console.error('Get Application By ID Error:', error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Update a placement application
// @route   PUT /api/applications/:id
// @access  Private
export const updateApplication = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { companyName, role, ctc, applicationDate, status, notes } = req.body;

    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      res.status(404).json({ message: 'Application not found' });
      return;
    }

    // Verify ownership
    if (application.userId.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'Not authorized to modify this application' });
      return;
    }

    // Validate if status is being updated
    if (status) {
      const validStatuses = ['Applied', 'OA Scheduled', 'OA Completed', 'Interview', 'Offer', 'Rejected'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        return;
      }
      application.status = status;
    }

    if (companyName) application.companyName = companyName;
    if (role) application.role = role;
    if (ctc) application.ctc = ctc;
    if (applicationDate) application.applicationDate = new Date(applicationDate);
    if (notes !== undefined) application.notes = notes;

    const updatedApplication = await application.save();
    res.json(updatedApplication);
  } catch (error) {
    console.error('Update Application Error:', error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Delete a placement application
// @route   DELETE /api/applications/:id
// @access  Private
export const deleteApplication = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      res.status(404).json({ message: 'Application not found' });
      return;
    }

    // Verify ownership
    if (application.userId.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'Not authorized to delete this application' });
      return;
    }

    await application.deleteOne();
    res.json({ message: 'Application removed successfully' });
  } catch (error) {
    console.error('Delete Application Error:', error);
    res.status(500).json({ message: (error as Error).message });
  }
};
