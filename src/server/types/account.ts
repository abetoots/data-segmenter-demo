export interface AccountProfileList {
  id: string;
  accountId: string;
  name: string;
  type: "suppression" | "subscribe";
}

export type ProfileEngineSequence = {
  id: string;
  engineId: string;
  engineName: string;
  order: number;
  startTime: Date | string;
  triggeringEventId: string | string[];
  //'completed' when profiles underwent the whole sequence
  //'success' when they met the success criteria
  status: "ongoing" | "completed" | "success";
  removedAtOrder: number;
};

export interface AccountProfile {
  id: string;
  accountId: string;
  partition: number;
  email: string;
  lifetimeValue: number;
  lists: AccountProfileList["id"][];
  engines: ProfileEngineSequence[];
  customerCreatedAt: Date | string;
  profileCreatedAt: Date | string;
  totalTransactions: number;
  totalEmailsDelivered: number;
  firstname: string;
  lastname: string;
  tags: string[];
  originalSource: string;
}

export type Event = {
  event: string;
  customer?: {
    [key: string]: any;
  };
  [key: string]: any;
};

export type AccountEvent = Event & {
  id: string;
  status: "new" | "processed";
  timestamp: Date | string;
  accountId: string;
  profile: {
    id: string;
    email: string;
  };
  processedBy: string[];
  [key: string]: any;
};

export type AccountProfileWithEvents = AccountProfile & {
  events: AccountEvent[];
};
