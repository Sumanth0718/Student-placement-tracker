import User from '../models/User';
import Application from '../models/Application';

export const seedDemoData = async (): Promise<void> => {
  try {
    // Clear existing demo data if any
    await User.deleteMany({ email: 'demo@university.edu' });

    // Create demo user
    const demoUser = await User.create({
      name: 'Demo Student',
      email: 'demo@university.edu',
      password: 'password123',
      role: 'student',
    });

    console.log(`[SEED] Demo user created: ${demoUser.email} (password: password123)`);

    // Create demo applications
    const demoApps = [
      {
        userId: demoUser._id,
        companyName: 'Google',
        role: 'Software Engineer Intern',
        ctc: '15 LPA',
        applicationDate: new Date('2026-06-12'),
        status: 'Interview',
        notes: 'Technical rounds scheduled for next week. Reviewing algorithms and system design basics.',
      },
      {
        userId: demoUser._id,
        companyName: 'Microsoft',
        role: 'Cloud Solution Architect',
        ctc: '18 LPA',
        applicationDate: new Date('2026-06-10'),
        status: 'Offer',
        notes: 'Received verbal offer. Waiting for official written letter and onboarding dates.',
      },
      {
        userId: demoUser._id,
        companyName: 'Stripe',
        role: 'Backend Engineer',
        ctc: '24 LPA',
        applicationDate: new Date('2026-06-14'),
        status: 'OA Completed',
        notes: 'Completed coding round. 3 out of 3 test cases passed successfully.',
      },
      {
        userId: demoUser._id,
        companyName: 'Netflix',
        role: 'Security Specialist',
        ctc: '22 LPA',
        applicationDate: new Date('2026-06-15'),
        status: 'Applied',
        notes: 'Applied online with a referral from an alumnus.',
      },
      {
        userId: demoUser._id,
        companyName: 'Apple',
        role: 'Hardware Interface Engineer',
        ctc: '16 LPA',
        applicationDate: new Date('2026-06-08'),
        status: 'Rejected',
        notes: 'Resume screen rejected. Will reapply after updating projects.',
      },
    ];

    await Application.deleteMany({ userId: demoUser._id });
    await Application.insertMany(demoApps);
    console.log('[SEED] Demo placement applications seeded successfully!');
  } catch (error) {
    console.error('[SEED] Error seeding demo data:', error);
  }
};
