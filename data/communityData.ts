import { CommunityPost } from '../types';

export const communityPostsData: CommunityPost[] = [
  {
    id: 'post1',
    author: {
      id: 'user2',
      name: 'Sita Devi',
      avatarInitial: 'S',
    },
    timestamp: '2024-07-20T10:00:00Z',
    text: 'Harvested my first batch of organic tomatoes today! The tips from the crop recommendation page were very helpful.',
    imageUrl: 'https://images.unsplash.com/photo-1594282484662-8094a45f4264?q=80&w=1974&auto=format&fit=crop',
    likes: ['user1', 'user3'],
    comments: [
      {
        id: 'comment1',
        author: { id: 'user1', name: 'Ramesh Kumar' },
        text: 'Congratulations! They look delicious.',
        timestamp: '2024-07-20T10:05:00Z',
      },
      {
        id: 'comment2',
        author: { id: 'user3', name: 'Anonymous Farmer' },
        text: 'Great job! What fertilizer did you use?',
        timestamp: '2024-07-20T10:15:00Z',
      },
    ],
  },
  {
    id: 'post2',
    author: {
      id: 'user1',
      name: 'Ramesh Kumar',
      avatarInitial: 'R',
    },
    timestamp: '2024-07-19T18:30:00Z',
    text: 'Facing some issues with pests on my maize crop. Can anyone identify this and suggest a solution?',
    imageUrl: 'https://images.unsplash.com/photo-1627894002029-57e3c14f4b93?q=80&w=2070&auto=format&fit=crop',
    likes: ['user2'],
    comments: [],
  },
  {
    id: 'post3',
    author: {
      id: 'user3',
      name: 'Anonymous Farmer',
      avatarInitial: 'A',
    },
    timestamp: '2024-07-18T12:45:00Z',
    text: 'Market prices for wheat are up in my district. Thinking of selling my stock this week.',
    likes: [],
    comments: [],
  },
];
