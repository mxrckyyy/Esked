// Demonstration schedule data used by the "Load sample" action.
// Subjects are shaped like createSubject output but without ids; the reducer
// assigns stable ids when they are added.

export const SAMPLE_SUBJECTS = [
  {
    name: 'Mathematics',
    color: '#3b82f6',
    notes: 'Calculus and linear algebra',
    meetings: [
      {
        days: ['Mon', 'Wed', 'Fri'],
        start: '08:00',
        end: '09:30',
        room: 'Room 201',
        instructor: 'Dr. Smith',
        notes: '',
      },
    ],
  },
  {
    name: 'Physics',
    color: '#ef4444',
    notes: 'Lab included',
    meetings: [
      {
        days: ['Tue', 'Thu'],
        start: '10:00',
        end: '11:30',
        room: 'Lab 3',
        instructor: 'Prof. Lee',
        notes: '',
      },
    ],
  },
  {
    name: 'English',
    color: '#10b981',
    notes: '',
    meetings: [
      {
        days: ['Mon'],
        start: '13:00',
        end: '14:00',
        room: 'Room 105',
        instructor: '',
        notes: 'Essay due Friday',
      },
    ],
  },
  {
    name: 'Computer Science',
    color: '#8b5cf6',
    notes: 'Programming lab',
    meetings: [
      {
        days: ['Wed'],
        start: '15:00',
        end: '16:30',
        room: 'Lab 1',
        instructor: 'Ms. Garcia',
        notes: '',
      },
      {
        days: ['Fri'],
        start: '09:00',
        end: '10:30',
        room: 'Lab 1',
        instructor: 'Ms. Garcia',
        notes: '',
      },
    ],
  },
  {
    name: 'Physical Education',
    color: '#f59e0b',
    notes: '',
    meetings: [
      {
        days: ['Tue'],
        start: '07:00',
        end: '08:00',
        room: 'Gym',
        instructor: '',
        notes: '',
      },
    ],
  },
]