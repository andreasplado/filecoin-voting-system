
export interface Proposal {
  id: number;
  title: string;
  description: string;
  voteCount: number;
  creator: string;
  deadline: number;
  active: boolean;
}

export interface VoteRecord {
  voter: string;
  proposalId: number;
  timestamp: number;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  CREATE_PROPOSAL = 'CREATE_PROPOSAL',
  VOTE_HISTORY = 'VOTE_HISTORY',
  AI_ANALYSIS = 'AI_ANALYSIS',
  DEPLOY_GUIDE = 'DEPLOY_GUIDE'
}
